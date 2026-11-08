import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import mongoose from 'mongoose';
import User from './models/User.js';
import SpeakingAudio from './models/SpeakingAudio.js';
import Scores from './models/ScoreHistory.js';
const base=process.env.TEST_API_BASE||'http://localhost:3002';
const prefix='codex_audio_'+crypto.randomUUID(),created=[];
const data=await fs.readFile(process.argv[2]);
await mongoose.connect(process.env.MONGO_URI,{autoIndex:false});
async function request(path,token,{body,method='GET',status=200,headers={}}={}){
 const response=await fetch(base+path,{method,headers:{...(token?{Authorization:`Bearer ${token}`}:{'Content-Type':'application/json'}),...headers},body});
 assert.equal(response.status,status,`${method} ${path}: ${await response.clone().text().then(t=>response.ok?'ok':t)}`);return response;
}
async function json(path,token,body,status=200,method='POST'){
 return (await request(path,token,{method,body:JSON.stringify(body),headers:{'Content-Type':'application/json'},status})).json();
}
try{
 const a=await json('/auth/register',null,{username:prefix+'_a',password:crypto.randomUUID(),name:'ตัวอย่าง ทดสอบเสียง'},201);created.push(a.user.id);
 const b=await json('/auth/register',null,{username:prefix+'_b',password:crypto.randomUUID(),name:'ตัวอย่าง ผู้ตรวจเสียง'},201);created.push(b.user.id);
 const clipId=crypto.randomUUID(),submissionId=crypto.randomUUID();
 const path=`/users/speaking-audio/${clipId}?`+new URLSearchParams({submissionId,skill:'conversation',questionId:29});
 await request(path,null,{method:'POST',body:data,headers:{'Content-Type':'audio/mp4'},status:401});
 await request(path,a.token,{method:'POST',body:Buffer.from('invalid'),headers:{'Content-Type':'audio/mp4'},status:400});
 await request(path,a.token,{method:'POST',body:Buffer.alloc(2*1024*1024+1),headers:{'Content-Type':'audio/mp4'},status:413});
 await request(path,a.token,{method:'POST',body:data,headers:{'Content-Type':'audio/mp4'},status:201});
 await request(path,a.token,{method:'POST',body:data,headers:{'Content-Type':'audio/mp4'}});
 assert.equal(await SpeakingAudio.countDocuments({_id:clipId}),1);
 const fetched=await request('/users/speaking-audio/'+clipId,a.token);assert.equal(fetched.headers.get('cache-control'),'private, no-store');assert.deepEqual(Buffer.from(await fetched.arrayBuffer()),data);
 await request('/users/speaking-audio/'+clipId,b.token,{status:404});
 const range=await request('/users/speaking-audio/'+clipId,a.token,{status:206,headers:{Range:'bytes=0-31'}});assert.equal((await range.arrayBuffer()).byteLength,32);
 await request('/users/speaking-audio/'+clipId,a.token,{status:416,headers:{Range:'bytes=99999999-'}});
 const exam={skill:'conversation',submissionId,responses:[{id:29,value:'',audioId:clipId}]};
 await json('/users/score',b.token,exam,400);
 await json('/users/score',a.token,{...exam,responses:[{id:30,value:'',audioId:clipId}]},400);
 const graded=await json('/users/score',a.token,exam);assert.equal(graded.pending_count,1);assert.equal(graded.score,0);assert.equal((await SpeakingAudio.findById(clipId)).expires_at,undefined);
 await request(path,a.token,{method:'POST',body:data,headers:{'Content-Type':'audio/mp4'},status:409});
 await User.updateOne({_id:b.user.id},{$set:{role:'admin'}});
 await request('/users/speaking-audio/'+clipId,b.token);
 const attempt=await Scores.findOne({user_id:a.user.id,submission_id:submissionId});
 await json('/admin/attempts/'+attempt.id+'/review',a.token,{questionId:29,correct:true},403,'PUT');
 const reviewed=await json('/admin/attempts/'+attempt.id+'/review',b.token,{questionId:29,correct:true},200,'PUT');assert.equal(reviewed.score,1);assert.equal(reviewed.pending_count,0);
 await User.updateOne({_id:b.user.id},{$set:{role:'user'}});
 await request('/users/speaking-audio/'+clipId,b.token,{status:404});
 console.log('Recorded audio integration passed: upload, retry, bounds, private playback, ranges, ownership, submission binding and manual review');
}finally{
 for(const id of created){
  const own=await User.findOne({_id:id,username:{$in:[prefix+'_a',prefix+'_b']}});
  if(!own)continue;
  await SpeakingAudio.deleteMany({user_id:own._id});await Scores.deleteMany({user_id:own._id});
  for(const name of ['levelprogresses','surveyresponses'])await mongoose.connection.db.collection(name).deleteMany({user_id:own._id});
  await User.deleteOne({_id:own._id,username:own.username});
 }
 await mongoose.disconnect();
}
