import test from 'node:test';
import assert from 'node:assert/strict';
import { createAudioRecording } from '../src/utils/audioRecording.js';
class Recorder {
 static isTypeSupported(type){return type==='audio/mp4';}
 constructor(stream,options){Recorder.last=this;this.mimeType=options.mimeType;this.state='inactive';}
 start(){this.state='recording';}
 stop(){this.state='inactive';this.ondataavailable?.({data:new Blob(['recording'])});this.onstop?.();}
}
function setup(media){
 let stopped=0;const states=[],errors=[];
 const session=createAudioRecording(media||{getUserMedia:async()=>({getTracks:()=>[{stop:()=>stopped++}]})},Recorder,{onState:s=>states.push(s),onError:e=>errors.push(e)});
 return {session,states,errors,stopped:()=>stopped};
}
test('recording uses supported MP4 and releases hardware on stop',async()=>{
 const a=setup();await a.session.start();assert.equal(Recorder.last.mimeType,'audio/mp4');
 assert.equal(a.states.at(-1),'recording');const blob=await a.session.stop();assert.equal(blob.type,'audio/mp4');assert.equal(a.stopped(),1);
});
test('cancelled permissions stop late streams without recording another question',async()=>{
 let resolve,stopped=0;const a=setup({getUserMedia:()=>new Promise(r=>resolve=r)});const started=a.session.start();
 a.session.cancel();resolve({getTracks:()=>[{stop:()=>stopped++}]});await started;assert.equal(stopped,1);assert.equal(a.states.includes('recording'),false);
});
test('permission denial returns a usable idle state',async()=>{
 const a=setup({getUserMedia:async()=>{throw Object.assign(new Error(),{name:'NotAllowedError'});}});
 await a.session.start();assert.equal(a.states.at(-1),'idle');assert.match(a.errors[0],/อนุญาต/);assert.equal(await a.session.stop(),null);
});
test('recording automatically stops at 90 seconds and returns the same completed clip',async t=>{
 t.mock.timers.enable({apis:['setTimeout']});const a=setup();await a.session.start();t.mock.timers.tick(90000);
 assert.equal(a.states.at(-1),'ready');assert.ok(await a.session.stop());assert.equal(a.stopped(),1);
});
test('permission that never settles and a recorder missing stop cannot lock controls',async t=>{
 t.mock.timers.enable({apis:['setTimeout']});const a=setup({getUserMedia:()=>new Promise(()=>{})});a.session.start();
 t.mock.timers.tick(20000);assert.equal(a.states.at(-1),'idle');assert.ok(a.errors.length);
 const b=setup();await b.session.start();Recorder.last.stop=()=>{};const pending=b.session.stop();t.mock.timers.tick(10000);
 assert.equal(await pending,null);assert.equal(b.stopped(),1);assert.equal(b.states.at(-1),'idle');
});

test('oversized recorded chunks stop capture and never create a submitted answer',async()=>{
 const a=setup();await a.session.start();Recorder.last.ondataavailable({data:new Blob([new Uint8Array(2*1024*1024+1)])});
 assert.equal(await a.session.stop(),null);assert.equal(a.stopped(),1);assert.match(a.errors[0],/ใหญ่/);
});
test('missing recording APIs and recorder errors release without a fake answer',async()=>{
 const errors=[];const missing=createAudioRecording(null,null,{onState:()=>{},onError:e=>errors.push(e)});await missing.start();assert.ok(errors.length);assert.equal(await missing.stop(),null);
 const a=setup();await a.session.start();Recorder.last.onerror();assert.equal(await a.session.stop(),null);assert.equal(a.stopped(),1);assert.equal(a.states.at(-1),'idle');
});
