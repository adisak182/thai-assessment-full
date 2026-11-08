import { Buffer } from 'node:buffer';
export const isAudioId=value=>typeof value==='string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
export function validateAudioUpload({id,submissionId,skill,questionId,mime,data}) {
 if(!isAudioId(id)||!isAudioId(submissionId)||!['full_test','conversation'].includes(skill)||!Number.isInteger(questionId)||questionId<26||questionId>40)throw new Error('ข้อมูลเสียงไม่ถูกต้อง');
 mime=String(mime||'').split(';')[0].toLowerCase();
 if(!Buffer.isBuffer(data)||data.length<32||data.length>2*1024*1024)throw new Error('ไฟล์เสียงต้องมีขนาดไม่เกิน 2 MB');
 const valid=mime==='audio/mp4'?data.toString('ascii',4,8)==='ftyp'
  :mime==='audio/webm'?data.subarray(0,4).equals(Buffer.from([0x1a,0x45,0xdf,0xa3]))
  :mime==='audio/ogg'?data.toString('ascii',0,4)==='OggS':false;
 if(!valid)throw new Error('รูปแบบไฟล์เสียงไม่รองรับ');
 return mime;
}
export function validateAudioReferences(responses,clips,{userId,submissionId,skill}) {
 for(const answer of responses){
  if(!answer.audioId)continue;
  const clip=clips.find(c=>c._id===answer.audioId);
  if(!clip||String(clip.user_id)!==String(userId)||clip.submission_id!==submissionId||clip.skill!==skill||clip.question_id!==answer.id|| (clip.expires_at && new Date(clip.expires_at)<=new Date()))throw new Error('ไฟล์เสียงไม่ตรงกับผู้เรียน รอบสอบ หรือข้อสอบ กรุณาอัดเสียงใหม่');
 }
}
