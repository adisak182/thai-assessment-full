import test from 'node:test';
import assert from 'node:assert/strict';
import { createSpeechSession, requestMicrophoneAccess, isMicrophoneReleasing, subscribeMicrophoneRelease } from '../src/utils/speechRecognition.js';

function setup(Recognition=FakeRecognition) {
 const states=[],errors=[],results=[];
 const session=createSpeechSession(Recognition,{onState:s=>states.push(s),onError:e=>errors.push(e),onResult:r=>results.push(r)});
 return {session,states,errors,results};
}
class FakeRecognition {
 constructor(){FakeRecognition.last=this;}
 start(){this.starts=(this.starts||0)+1;}
 stop(){this.stopped=true;}
 abort(){this.aborted=true;this.onend?.();}
}
test('speech start shows pending immediately and cannot start twice',()=>{
 const {session,states}=setup();session.start();session.start();
 assert.deepEqual(states,['starting']);assert.equal(FakeRecognition.last.starts,1);
 FakeRecognition.last.onstart();FakeRecognition.last.onaudiostart();assert.equal(states.at(-1),'listening');session.cancel();
});
test('speech startup timeout releases microphone and explains recovery',t=>{
 t.mock.timers.enable({apis:['setTimeout']});
 const {session,states,errors}=setup();session.start();const mic=FakeRecognition.last;
 t.mock.timers.tick(20000);
 assert.equal(states.at(-1),'idle');assert.match(errors[0],/Chrome/);assert.equal(mic.aborted,true);assert.equal(mic.onresult,null);
});
test('final transcript arrives after stop and is stored once',()=>{
 const {session,states,results}=setup();session.start();const mic=FakeRecognition.last;mic.onstart();mic.onaudiostart();session.stop();
 assert.equal(mic.stopped,true);assert.equal(states.at(-1),'processing');
 mic.onresult({resultIndex:0,results:[Object.assign([{transcript:' คำตอบทดสอบ '}],{isFinal:true})]});mic.onend();
 assert.deepEqual(results,['คำตอบทดสอบ']);assert.equal(states.at(-1),'idle');
});
test('switching questions cancels pending audio and ignores late callbacks',()=>{
 const {session,results}=setup();session.start();const mic=FakeRecognition.last;const late=mic.onresult;session.cancel();
 late({resultIndex:0,results:[Object.assign([{transcript:'late answer'}],{isFinal:true})]});
 assert.deepEqual(results,[]);assert.equal(mic.aborted,true);
});
test('permission, missing mic, network and no speech errors are actionable',()=>{
 for(const [error,match] of [['not-allowed',/อนุญาต/],['audio-capture',/ไมโครโฟน/],['network',/อินเทอร์เน็ต/],['no-speech',/ไม่ได้ยิน/]]){
  const {session,states,errors}=setup();session.start();FakeRecognition.last.onerror({error});
  assert.equal(states.at(-1),'idle');assert.match(errors[0],match);
 }
});
test('unsupported browsers and synchronous start failure return to idle',()=>{
 const missing=setup(null);missing.session.start();assert.match(missing.errors[0],/Chrome/);assert.equal(missing.states.at(-1),'idle');
 const blocked=setup(class extends FakeRecognition {start(){throw Object.assign(new Error(),{name:'NotAllowedError'});}});
 blocked.session.start();assert.match(blocked.errors[0],/อนุญาต/);assert.equal(blocked.states.at(-1),'idle');
});
test('ending without a transcript never invents a completed answer',()=>{
 const {session,results,errors}=setup();session.start();FakeRecognition.last.onstart();FakeRecognition.last.onaudiostart();FakeRecognition.last.onend();
 assert.deepEqual(results,[]);assert.match(errors[0],/ไม่ได้ยิน/);
});

test('a pending permission request can be cancelled and retried',()=>{
 const first=setup();first.session.start();const old=FakeRecognition.last;first.session.stop();
 assert.equal(first.states.at(-1),'idle');assert.equal(old.aborted,true);assert.deepEqual(first.errors,[]);
 const retry=setup();retry.session.start();FakeRecognition.last.onstart();FakeRecognition.last.onaudiostart();assert.equal(retry.states.at(-1),'listening');retry.session.cancel();
});
test('stopping cannot leave the processing button stuck indefinitely',t=>{
 t.mock.timers.enable({apis:['setTimeout']});const {session,states,errors}=setup();
 session.start();FakeRecognition.last.onstart();FakeRecognition.last.onaudiostart();session.stop();t.mock.timers.tick(10000);
 assert.equal(states.at(-1),'idle');assert.match(errors[0],/ไม่ได้ยิน/);
});

test('recognizer service start alone must not claim microphone capture has started',t=>{
 t.mock.timers.enable({apis:['setTimeout']});const {session,states,errors}=setup();session.start();FakeRecognition.last.onstart();
 assert.equal(states.at(-1),'starting');t.mock.timers.tick(20000);assert.equal(states.at(-1),'idle');assert.match(errors[0],/ระบบยังไม่เริ่ม/);
});
test('hardware permission check releases all tracks before speech recognition',async()=>{
 let stopped=0,ready=0;const errors=[];
 requestMicrophoneAccess({getUserMedia:async options=>{assert.deepEqual(options,{audio:true});return {getTracks:()=>[{stop:()=>stopped++}]};}},{onReady:()=>ready++,onError:e=>errors.push(e)});
 await new Promise(resolve=>setImmediate(resolve));assert.equal(stopped,1);assert.equal(ready,1);assert.deepEqual(errors,[]);
});
test('cancelled permission checks release late streams without updating another question',async()=>{
 let resolve,stopped=0,ready=0;
 const operation=requestMicrophoneAccess({getUserMedia:()=>new Promise(r=>resolve=r)},{onReady:()=>ready++,onError:()=>{throw new Error('Unexpected error');}});
 operation.cancel();resolve({getTracks:()=>[{stop:()=>stopped++}]});await new Promise(r=>setImmediate(r));
 assert.equal(stopped,1);assert.equal(ready,0);
});
test('hardware denial and busy microphone show distinct errors',async()=>{
 for(const [name,expected] of [['NotAllowedError',/อนุญาต/],['NotFoundError',/ไม่พบ/],['NotReadableError',/แอปอื่น/]]){
  const errors=[];requestMicrophoneAccess({getUserMedia:async()=>{throw Object.assign(new Error(),{name});}},{onReady:()=>{throw new Error('Unexpected success');},onError:e=>errors.push(e)});
  await new Promise(r=>setImmediate(r));assert.match(errors[0],expected);
 }
});
test('final transcript retains preceding finalized segments',()=>{
 const {session,results}=setup();session.start();const mic=FakeRecognition.last;mic.onstart();mic.onaudiostart();
 const segment=text=>Object.assign([{transcript:text}],{isFinal:true});
 mic.onresult({resultIndex:0,results:[segment('สวัสดี')]});mic.onresult({resultIndex:1,results:[segment('สวัสดี'),segment('ครับ')]});
 assert.equal(results.at(-1),'สวัสดี ครับ');session.cancel();
});

test('all 15 speaking questions have valid matching prompt files in both sets',async()=>{
 const full=await import('../src/data/testData.js');const practice=await import('../src/data/conversationQuestions.js');
 const {stat}=await import('node:fs/promises');
 const questions=[...practice.introQ,...practice.situQ,...practice.tongueQ];
 const combined=[...full.introQ,...full.situQ,...full.tongueQ];
 assert.equal(questions.length,15);assert.deepEqual(questions.map(q=>q.id),Array.from({length:15},(_,i)=>26+i));
 for(const q of questions){
  assert.equal(combined.find(item=>item.id===q.id).audio,q.audio);
  assert.ok((await stat(new URL('../public'+q.audio,import.meta.url))).size>1000);
 }
});
test('starting a microphone pauses all mounted question audio',async()=>{
 const {registerPromptAudio,unregisterPromptAudio,pausePromptAudio}=await import('../src/utils/promptAudio.js');
 let pauses=0;const a={pause:()=>pauses++},b={pause:()=>pauses++};
 registerPromptAudio(a);registerPromptAudio(b);pausePromptAudio();assert.equal(pauses,2);
 unregisterPromptAudio(a);unregisterPromptAudio(b);pausePromptAudio();assert.equal(pauses,2);
});
test('an unavailable hardware API fails after the caller has received its cancel handle',async()=>{
 const events=[];const operation=requestMicrophoneAccess(null,{onReady:()=>events.push('ready'),onError:()=>events.push('error')});
 assert.equal(typeof operation.cancel,'function');assert.deepEqual(events,[]);await new Promise(r=>setImmediate(r));assert.deepEqual(events,['error']);
});

class DelayedEndRecognition extends FakeRecognition {
 abort(){this.aborted=true;this.abortCalls=(this.abortCalls||0)+1;}
}
test('question 29 releases the engine before question 30 may start',()=>{
 const q29=setup(DelayedEndRecognition);q29.session.start();const old=FakeRecognition.last;
 old.onstart();old.onaudiostart();old.onresult({results:[Object.assign([{transcript:'ทำงานที่โรงเรียน'}],{isFinal:true})]});
 q29.session.cancel();assert.equal(isMicrophoneReleasing(),true);
 const q30=setup();q30.session.start();assert.equal(FakeRecognition.last,old,'must not open a second engine during abort');assert.match(q30.errors[0],/ข้อก่อนหน้า/);
 old.onend();assert.equal(isMicrophoneReleasing(),false);
 const retry=setup();retry.session.start();assert.notEqual(FakeRecognition.last,old);FakeRecognition.last.onaudiostart();assert.equal(retry.states.at(-1),'listening');retry.session.cancel();
 assert.deepEqual(q29.results,['ทำงานที่โรงเรียน']);
});
test('normal end and later question cleanup never abort an already ended engine',()=>{
 const {session}=setup();session.start();const mic=FakeRecognition.last;
 mic.onresult({results:[Object.assign([{transcript:'คำตอบ'}],{isFinal:true})]});mic.onend();session.cancel();
 assert.equal(mic.aborted,undefined);assert.equal(isMicrophoneReleasing(),false);
});
test('repeated cleanup keeps the end listener and aborts only once',()=>{
 const changes=[];const unsubscribe=subscribeMicrophoneRelease(()=>changes.push(isMicrophoneReleasing()));
 const {session}=setup(DelayedEndRecognition);session.start();const mic=FakeRecognition.last;session.cancel();const end=mic.onend;session.cancel();
 assert.equal(mic.abortCalls,1);assert.equal(mic.onend,end);end();assert.deepEqual(changes,[true,false]);unsubscribe();
});
test('an engine that never ends cannot lock the next question forever',t=>{
 t.mock.timers.enable({apis:['setTimeout']});const {session}=setup(DelayedEndRecognition);session.start();session.cancel();
 assert.equal(isMicrophoneReleasing(),true);t.mock.timers.tick(3000);assert.equal(isMicrophoneReleasing(),false);
 const retry=setup();retry.session.start();FakeRecognition.last.onaudiostart();assert.equal(retry.states.at(-1),'listening');retry.session.cancel();
});
test('a late end from an old question cannot unlock another closing engine',()=>{
 const first=setup(DelayedEndRecognition);first.session.start();const a=FakeRecognition.last;first.session.cancel();const lateEnd=a.onend;lateEnd();
 const second=setup(DelayedEndRecognition);second.session.start();const b=FakeRecognition.last;second.session.cancel();lateEnd();
 assert.equal(isMicrophoneReleasing(),true);b.onend();assert.equal(isMicrophoneReleasing(),false);
});

test('capture with no service progress stops and releases instead of listening forever',t=>{
 t.mock.timers.enable({apis:['setTimeout']});const {session,states,errors,results}=setup();
 session.start();const mic=FakeRecognition.last;mic.onaudiostart();
 t.mock.timers.tick(30000);assert.equal(states.at(-1),'processing');assert.equal(mic.stopped,true);
 t.mock.timers.tick(10000);assert.equal(states.at(-1),'idle');assert.match(errors[0],/ไม่ตอบกลับ/);assert.deepEqual(results,[]);
 const retry=setup();retry.session.start();assert.equal(retry.states.at(-1),'starting');retry.session.cancel();
});
test('final result without end still releases the engine and retains the answer',t=>{
 t.mock.timers.enable({apis:['setTimeout']});const {session,states,results,errors}=setup();
 session.start();const mic=FakeRecognition.last;mic.onaudiostart();session.stop();
 mic.onresult({results:[Object.assign([{transcript:'คำตอบที่ยืนยันแล้ว'}],{isFinal:true})]});
 t.mock.timers.tick(10000);assert.equal(states.at(-1),'idle');assert.deepEqual(results,['คำตอบที่ยืนยันแล้ว']);assert.deepEqual(errors,[]);
});
test('interim progress extends listening without saving an unconfirmed exam answer',t=>{
 t.mock.timers.enable({apis:['setTimeout']});const previews=[],states=[],results=[];
 const session=createSpeechSession(FakeRecognition,{onState:s=>states.push(s),onResult:r=>results.push(r),onPreview:r=>previews.push(r),onError:()=>{}});
 session.start();const mic=FakeRecognition.last;assert.equal(mic.interimResults,true);mic.onaudiostart();
 t.mock.timers.tick(25000);mic.onresult({results:[Object.assign([{transcript:'กำลังพูด'}],{isFinal:false})]});
 t.mock.timers.tick(10000);assert.equal(states.at(-1),'listening');assert.deepEqual(previews,['กำลังพูด']);assert.deepEqual(results,[]);
 session.cancel();
});
test('audio ending moves to bounded processing even without a service end event',t=>{
 t.mock.timers.enable({apis:['setTimeout']});const {session,states,errors}=setup();
 session.start();const mic=FakeRecognition.last;mic.onaudiostart();mic.onaudioend();assert.equal(states.at(-1),'processing');
 t.mock.timers.tick(10000);assert.equal(states.at(-1),'idle');assert.match(errors[0],/ไม่ตอบกลับ/);
});
test('late capture events cannot reset processing or extend its deadline',t=>{
 t.mock.timers.enable({apis:['setTimeout']});const {session,states}=setup();
 session.start();const mic=FakeRecognition.last;mic.onaudiostart();session.stop();t.mock.timers.tick(9000);
 mic.onaudiostart();mic.onresult({results:[Object.assign([{transcript:'ยังไม่ยืนยัน'}],{isFinal:false})]});
 assert.equal(states.at(-1),'processing');t.mock.timers.tick(1000);assert.equal(states.at(-1),'idle');
});

test('a final result without a manual stop also has a bounded end wait',t=>{
 t.mock.timers.enable({apis:['setTimeout']});const {session,states,results}=setup();session.start();const mic=FakeRecognition.last;
 mic.onaudiostart();mic.onresult({results:[Object.assign([{transcript:'คำตอบ'}],{isFinal:true})]});
 assert.equal(states.at(-1),'processing');t.mock.timers.tick(10000);assert.equal(states.at(-1),'idle');assert.deepEqual(results,['คำตอบ']);
});
test('interim-only speech is never saved or graded when the engine ends',()=>{
 const {session,results,errors}=setup();session.start();const mic=FakeRecognition.last;
 mic.onresult({results:[Object.assign([{transcript:'ข้อความชั่วคราว'}],{isFinal:false})]});mic.onend();
 assert.deepEqual(results,[]);assert.match(errors[0],/ไม่ได้ยิน/);
});
test('hardware permission that never settles times out without losing the cancel handle',t=>{
 t.mock.timers.enable({apis:['setTimeout']});const errors=[];
 const operation=requestMicrophoneAccess({getUserMedia:()=>new Promise(()=>{})},{onReady:()=>assert.fail('must not become ready'),onError:e=>errors.push(e)});
 t.mock.timers.tick(20000);assert.equal(errors.length,1);operation.cancel();t.mock.timers.tick(20000);assert.equal(errors.length,1);
});
