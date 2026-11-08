import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import {getAllQuestions} from '../src/data/testData.js';
dotenv.config();
const username='codex_check_'+crypto.randomUUID();
const adminName=username+'_admin';
const dbReady=await mongoose.connect(process.env.MONGO_URI,{autoIndex:false});
const db=dbReady.connection.db;
async function check(path,token,body,status=200,method=body?'POST':'GET') {
 const response=await fetch('http://localhost:3001'+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})});
 assert.equal(response.status,status,path);console.log(method+' '+path+' '+status);return response.json();
}
try{
 await check('/survey',null,null,401);
 const u=await check('/auth/register',null,{username,password:username,name:username,role:'admin'},201);
 const id=new mongoose.Types.ObjectId(u.user.id);const token=u.token;
 assert.equal(u.user.role,'user');
 await check('/survey',token,null,403);
 await check('/auth/login',null,{username,password:username});
 const profile=await check('/users/me',token);assert.equal(profile.password,undefined);
 assert.equal(profile.is_literacy_learner,false);
 for(const value of [true,false]){
  const started=await check('/auth/start',null,{name:username,is_literacy_learner:value});
  assert.equal(started.user.id,u.user.id);assert.equal(started.user.is_literacy_learner,value);
  assert.equal((await db.collection('users').findOne({_id:id})).is_literacy_learner,value);
  assert.equal((await check('/users/me',token)).is_literacy_learner,value);
 }
 await check('/auth/start',null,{name:username,is_literacy_learner:'false'},400);

 await check('/users/score',token,{skill:'full_test',score:9999,maxScore:100},400);
 const objective=getAllQuestions().filter(q=>q.type==='mcq').map(q=>({id:q.id,value:q.options.find(o=>o.correct).text}));
 const submissionId=crypto.randomUUID();
 const first=await check('/users/score',token,{skill:'full_test',responses:objective,submissionId,score:9999});
 assert.equal(first.score,objective.length);
 await check('/users/score',token,{skill:'full_test',responses:[],submissionId});
 assert.equal(await db.collection('scorehistories').countDocuments({user_id:id}),1,'retry must not create another attempt');
 await check('/users/score',token,{skill:'full_test',responses:[],submissionId:crypto.randomUUID()});
 const best=await check('/users/scores',token);assert.equal(best.scores.find(s=>s.skill==='full_test').score,objective.length);
 const pending=await check('/users/score',token,{skill:'full_test',responses:[{id:97,value:'abcdef'}],submissionId:crypto.randomUUID()});
 assert.equal(pending.score,0);assert.equal(pending.pending_count,1);
 const attempt=await db.collection('scorehistories').findOne({user_id:id,pending_count:1});
 const a=await check('/auth/register',null,{username:adminName,password:adminName,name:adminName},201);
 const aid=new mongoose.Types.ObjectId(a.user.id);await db.collection('users').updateOne({_id:aid},{$set:{role:'admin'}});
 const at=jwt.sign({userId:a.user.id,role:'admin'},process.env.JWT_SECRET||'dev_secret',{expiresIn:'5m'});
 const list=await check('/admin/users',at);assert.equal(list.find(item=>item.id===u.user.id).full_test_pending,1);
 const adminLearner=list.find(item=>item.id===u.user.id);assert.equal(adminLearner.full_test_attempts,3);assert.equal(adminLearner.full_test_pending_questions,1);assert.ok(adminLearner.full_test_last_at);assert.equal(adminLearner.full_test_completed,true);assert.equal(adminLearner.full_test_score,objective.length);
 await check('/admin/attempts/'+attempt._id+'/review',token,{questionId:97,correct:true},403,'PUT');
 const reviewed=await check('/admin/attempts/'+attempt._id+'/review',at,{questionId:97,correct:true},200,'PUT');
 assert.equal(reviewed.score,1);assert.equal(reviewed.pending_count,0);
 await check('/admin/attempts/'+attempt._id+'/review',at,{questionId:97,correct:false},409,'PUT');
 await check('/survey',token,{design_1:4,suggestions:username},201);
 await check('/survey',at);
 await db.collection('users').updateOne({_id:aid},{$set:{role:'user'}});
 await check('/survey',at,null,403);await check('/admin/users',at,null,403);
 await db.collection('users').deleteOne({_id:aid,username:adminName});
 await check('/admin/users',at,null,401);
 for(const skill of ['listening','reading','writing','conversation'])await check('/users/score',token,{skill,responses:[],submissionId:crypto.randomUUID()});
 await check('/users/history',token);await check('/users/ranking',token);
 console.log('All MongoDB regression integration checks passed');
}finally{
 for(const name of [username,adminName]){
  const u=await db.collection('users').findOne({username:name});
  if(u){for(const c of ['scorehistories','levelprogresses','surveyresponses'])await db.collection(c).deleteMany({user_id:u._id});await db.collection('users').deleteOne({_id:u._id,username:name});}
 }
 await mongoose.disconnect();console.log('Only temporary test records were removed');
}
