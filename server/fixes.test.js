import test from 'node:test';
import assert from 'node:assert/strict';
import User from './models/User.js';
import ScoreHistory from './models/ScoreHistory.js';
import SurveyResponse from './models/SurveyResponse.js';
import users from './routes/users.js';
import admin from './routes/admin.js';
import jwt from 'jsonwebtoken';
const response = () => ({ code:200, status(code){this.code=code;return this}, json(body){this.body=body;return this} });
test('raw scores cannot be submitted without answers',async()=>{
 const original=[ScoreHistory.create,ScoreHistory.aggregate];
 ScoreHistory.create=async v=>v;ScoreHistory.aggregate=async()=>[];
 try{const res=response();await users.stack.find(l=>l.route?.path==='/score').route.stack.at(-1).handle({userId:'507f1f77bcf86cd799439011',body:{skill:'full_test',score:9999,maxScore:100}},res);assert.equal(res.code,400);}finally{[ScoreHistory.create,ScoreHistory.aggregate]=original;}
});
test('a demoted administrator cannot use an old admin token',async()=>{
 const original=User.findById;User.findById=()=>({select:async()=>({role:'user'})});
 try{const res=response();const token=jwt.sign({userId:'507f1f77bcf86cd799439011',role:'admin'},process.env.JWT_SECRET||'dev_secret');await admin.stack.find(l=>l.route?.path==='/users').route.stack[0].handle({headers:{authorization:'Bearer '+token}},res,()=>{res.code=299});assert.equal(res.code,403);}finally{User.findById=original;}
});
test('server grading ignores claimed points and auto-grades answered essays',async()=>{
 const {gradeSubmission}=await import('./grading.js');
 const result=gradeSubmission({skill:'full_test',level:1,score:9999,responses:[{id:97,value:'abcdef'}]});
 assert.equal(result.score,1);assert.equal(result.maxScore,100);assert.equal(result.pending_count,0);
 assert.equal(result.detailed_results.find(r=>r.id===97).is_correct,true);
});
test('unsupported speech never earns automatic points',async()=>{
 const {gradeSubmission}=await import('./grading.js');const result=gradeSubmission({skill:'full_test',responses:[{id:36,value:'PASS_DUE_TO_UNSUPPORTED_BROWSER_OVERRIDE_123'}]});assert.equal(result.score,0);
});
test('reading fact answers have correct history labels',async()=>{
 const {gradeSubmission}=await import('./grading.js');const result=gradeSubmission({skill:'full_test',responses:[{id:51,value:'ข้อเท็จจริง'}]});const item=result.detailed_results.find(r=>r.id===51);assert.equal(item.correct_answer,'ข้อเท็จจริง');assert.equal(item.is_correct,true);
});
test('duplicate and unknown question IDs and invalid values are rejected',async()=>{
 const {gradeSubmission}=await import('./grading.js');
 for(const responses of [[{id:999,value:'x'}],[{id:1,value:'x'},{id:1,value:'y'}],[{id:1,value:{}}]])assert.throws(()=>gradeSubmission({skill:'full_test',responses}));
});
test('all practice question sets are graded independently',async()=>{
 const {gradeSubmission}=await import('./grading.js');for(const [skill,count] of [['listening',25],['conversation',15],['reading',30],['writing',30]]){const r=gradeSubmission({skill,responses:[]});assert.equal(r.maxScore,count);assert.equal(r.score,0);}
});
test('deadline uses wall time and expires after background pauses',async()=>{
 const {remainingSeconds}=await import('../src/utils/examClock.js');assert.equal(remainingSeconds(10000,1000),9);assert.equal(remainingSeconds(10000,10001),0);
});

test('exam storage is isolated by user and clearing one account preserves another',async()=>{
 const {examStorageKey,clearExamStorage}=await import('../src/utils/examStorage.js');
 const entries=new Map([[examStorageKey('A','fulltest_answers'),'A'],[examStorageKey('B','fulltest_answers'),'B'],[examStorageKey('A','fulltest_timer')+'_deadline','10000']]);
 globalThis.sessionStorage={removeItem:key=>entries.delete(key)};
 try{clearExamStorage('A',['fulltest_answers','fulltest_timer']);assert.equal(entries.has(examStorageKey('A','fulltest_answers')),false);assert.equal(entries.get(examStorageKey('B','fulltest_answers')),'B');assert.equal(entries.has(examStorageKey('A','fulltest_timer')+'_deadline'),false);}
 finally{delete globalThis.sessionStorage;}
});
test('correct choices are graded on the server and blank essays receive no points',async()=>{
 const {gradeSubmission}=await import('./grading.js');const {getAllQuestions}=await import('../src/data/testData.js');
 const responses=getAllQuestions().filter(q=>q.type==='mcq').map(q=>({id:q.id,value:q.options.find(o=>o.correct).text}));
 const result=gradeSubmission({skill:'full_test',responses,score:0});assert.equal(result.score,responses.length);assert.equal(result.pending_count,0);
 const speaking=gradeSubmission({skill:'full_test',responses:[{id:26,value:'คำตอบสำหรับตรวจอัตโนมัติ'}]});assert.equal(speaking.score,1);assert.equal(speaking.pending_count,0);
});

test('old reading history shows fact/opinion labels without rewriting stored records',async()=>{
 const {historyLabels}=await import('../src/utils/historyLabels.js');
 const old={id:51,type:'tf',section:'ส่วนที่ 3: การอ่าน',user_answer:'จริง',correct_answer:'เท็จ',is_correct:true};
 const result=historyLabels(old);assert.equal(result.correct_answer,'ข้อเท็จจริง');assert.equal(result.user_answer,'ข้อเท็จจริง');assert.equal(old.correct_answer,'เท็จ');
 assert.equal(historyLabels({...old,id:53}).correct_answer,'ข้อคิดเห็น');
});

async function runLiteracyAuth(path,body,existing=null){
 const {default:auth}=await import('./routes/auth.js');
 const {default:Progress}=await import('./models/LevelProgress.js');
 const original=[User.findOne,User.prototype.save,Progress.create];
 User.findOne=async()=>existing;User.prototype.save=async function(){return this;};Progress.create=async()=>({});
 try{const res=response();await auth.stack.find(l=>l.route?.path===path).route.stack.at(-1).handle({body},res);return res;}
 finally{[User.findOne,User.prototype.save,Progress.create]=original;}
}
test('legacy user documents default to non-literacy learners',()=>{
 const user=User.hydrate({_id:'507f1f77bcf86cd799439011',name:'Legacy',username:'legacy',role:'user'});
 assert.equal(user.toJSON().is_literacy_learner,false);
});
test('new users store the checked value and unchecked users default to false',async()=>{
 for(const value of [true,false,undefined]){
  const body={name:'Literacy Test',...(value===undefined?{}:{is_literacy_learner:value})};
  const res=await runLiteracyAuth('/start',body);
  assert.equal(res.code,200);assert.equal(res.body.user.is_literacy_learner,value===true);
 }
 const registered=await runLiteracyAuth('/register',{username:'literacy_test',password:'test-password',name:'Literacy Test',is_literacy_learner:true});
 assert.equal(registered.code,201);assert.equal(registered.body.user.is_literacy_learner,true);
});
test('existing users can explicitly check and uncheck the literacy status',async()=>{
 const user=new User({name:'Literacy Test',username:'literacy_existing',password:'test',role:'user'});
 for(const value of [true,false]){
  const res=await runLiteracyAuth('/start',{name:'Literacy Test',is_literacy_learner:value},user);
  assert.equal(res.code,200);assert.equal(res.body.user.is_literacy_learner,value);assert.equal(user.is_literacy_learner,value);
 }
});
test('literacy status rejects strings, numbers and null at the API boundary',async()=>{
 for(const path of ['/start','/register'])for(const value of ['false','true',0,1,null]){
  const res=await runLiteracyAuth(path,{name:'Literacy Test',username:'literacy_test',password:'test-password',is_literacy_learner:value});
  assert.equal(res.code,400);
 }
});
test('profile and admin user updates toggle literacy status and validate booleans',async()=>{
 const original=User.findByIdAndUpdate;
 let capturedUpdate=null;
 User.findByIdAndUpdate=(id,update)=>{capturedUpdate=update;return{select:async()=>({toJSON:()=>({id,name:update.name,is_literacy_learner:update.is_literacy_learner??false})})};};
 try{
  const profileHandler=users.stack.find(l=>l.route?.path==='/me'&&l.route.methods.put).route.stack.at(-1).handle;
  const adminHandler=admin.stack.find(l=>l.route?.path==='/users/:id'&&l.route.methods.put).route.stack.at(-1).handle;
  for(const [handler,reqBase] of [[profileHandler,{userId:'u1'}],[adminHandler,{params:{id:'u1'}}]]){
   for(const invalid of ['true','false',1,0,null]){
    const res=response();await handler({...reqBase,body:{name:'Test',is_literacy_learner:invalid}},res);
    assert.equal(res.code,400);
   }
   const omitRes=response();await handler({...reqBase,body:{name:'Test'}},omitRes);
   assert.equal(omitRes.code,200);assert.equal('is_literacy_learner' in capturedUpdate,false);
   const trueRes=response();await handler({...reqBase,body:{name:'Test',is_literacy_learner:true}},trueRes);
   assert.equal(trueRes.code,200);assert.equal(capturedUpdate.is_literacy_learner,true);
  }
 }finally{User.findByIdAndUpdate=original;}
});
test('admin history endpoint returns all exam records without a 300-row cap',async()=>{
 const original=[ScoreHistory.find,ScoreHistory.findById,SurveyResponse.find];
 const sampleRows=Array.from({length:350},(_,i)=>({_id:`h${i}`,user_id:{_id:'u1',name:'สมชาย',username:'u1'},level:1,skill:'full_test',score:80,max_score:100,taken_at:new Date()}));
 let limited=false,selected='';
 const historyChain={select(fields){selected=fields;return this;},populate(){return this;},sort(){return this;},limit(){limited=true;return this;},lean:async()=>sampleRows};
 ScoreHistory.find=()=>historyChain;
 SurveyResponse.find=()=>({select(){return this;},sort(){return this;},lean:async()=>[]});
 ScoreHistory.findById=async id=>({toJSON:()=>({id,detailed_results:[{id:1,is_correct:true}]})});
 try{
  const res=response();
  await admin.stack.find(l=>l.route?.path==='/history'&&l.route.methods.get).route.stack.at(-1).handle({},res);
  assert.equal(res.code,200);assert.equal(limited,false);assert.equal(selected,'-detailed_results');assert.equal(res.body.length,350);assert.equal(res.body[0].detailed_results,undefined);
  const detailRes=response();
  await admin.stack.find(l=>l.route?.path==='/attempts/:id'&&l.route.methods.get).route.stack.at(-1).handle({params:{id:'507f1f77bcf86cd799439011'}},detailRes);
  assert.equal(detailRes.code,200);assert.equal(detailRes.body.detailed_results.length,1);
 }finally{[ScoreHistory.find,ScoreHistory.findById,SurveyResponse.find]=original;}
});
