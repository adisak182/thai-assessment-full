import test from 'node:test';
import assert from 'node:assert/strict';
import { gradeSubmission } from '../server/grading.js';
test('recorded speaking auto-grades immediately without manual review',()=>{
 const audioId='12345678-1234-4234-8234-123456789abc';
 const result=gradeSubmission({skill:'conversation',responses:[{id:36,value:'',audioId}]});
 assert.equal(result.pending_count,0);assert.equal(result.score,1);
 assert.equal(result.detailed_results.find(q=>q.id===36).audio_id,audioId);
 assert.equal(result.detailed_results.find(q=>q.id===36).is_correct,true);
});
test('audio references on objective questions and malformed audio IDs are rejected',()=>{
 assert.throws(()=>gradeSubmission({skill:'full_test',responses:[{id:1,value:'',audioId:'12345678-1234-4234-8234-123456789abc'}]}));
 assert.throws(()=>gradeSubmission({skill:'conversation',responses:[{id:26,value:'',audioId:'https://example.com/audio'}]}));
});

test('audio uploads reject disguised files, oversized bodies and unrelated questions',async()=>{
 const {validateAudioUpload}=await import('../server/speakingAudio.js');
 const data=Buffer.alloc(64);data.write('ftyp',4);
 const input={id:'12345678-1234-4234-8234-123456789abc',submissionId:'22345678-1234-4234-8234-123456789abc',skill:'conversation',questionId:29,mime:'audio/mp4',data};
 assert.equal(validateAudioUpload(input),'audio/mp4');
 for(const invalid of [{mime:'text/html'},{data:Buffer.from('<html>attack</html>')},{data:Buffer.alloc(2*1024*1024+1)},{questionId:41},{skill:'reading'},{id:'bad'}])assert.throws(()=>validateAudioUpload({...input,...invalid}));
});
test('audio references must belong to the same learner, exam, question and skill',async()=>{
 const {validateAudioReferences}=await import('../server/speakingAudio.js');
 const clip={_id:'clip',user_id:'owner',submission_id:'round',question_id:29,skill:'conversation'};
 const context={userId:'owner',submissionId:'round',skill:'conversation'};
 validateAudioReferences([{id:29,audioId:'clip'}],[clip],context);
 for(const change of [{user_id:'other'},{submission_id:'other'},{question_id:30},{skill:'full_test'},{expires_at:new Date(0)}])assert.throws(()=>validateAudioReferences([{id:29,audioId:'clip'}],[{...clip,...change}],context));
 assert.throws(()=>validateAudioReferences([{id:29,audioId:'missing'}],[clip],context));
});
