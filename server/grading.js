import { isAudioId } from './speakingAudio.js';
import { getAllQuestions, matchAnswers } from '../src/data/testData.js';
import * as listening from '../src/data/listeningQuestions.js';
import * as reading from '../src/data/readingQuestions.js';
import * as writing from '../src/data/writingQuestions.js';
import * as speaking from '../src/data/conversationQuestions.js';

const labels = { listening:'การฟัง', speaking:'การพูด', reading:'การอ่าน', writing:'การเขียน' };
const tagged = (items, type, category, extra={}) => items.map(q=>({...q,type,category,section:labels[category],...extra}));
const questions = {
  full_test:getAllQuestions().map(q=>({...q,category:q.section.includes('ส่วนที่ 1')?'listening':q.section.includes('ส่วนที่ 2')?'speaking':q.section.includes('ส่วนที่ 3')?'reading':'writing'})),
  listening:[...tagged(['vocabQ','announcementQ','storyQ','vocab4Q','proverbQ','annColdQ','adQ','lastQ'].flatMap(k=>listening[k]),'mcq','listening'),...tagged(listening.tfQ,'tf','listening')],
  conversation:tagged([...speaking.introQ,...speaking.situQ,...speaking.tongueQ],'speaking','speaking'),
  reading:[...tagged(['sectionAQ','sectionBQ','sectionCQ','sectionDQ','sectionEQ'].flatMap(k=>reading[k]),'mcq','reading'),...tagged(reading.tfQ,'tf','reading',{isReadingTf:true}),...tagged(reading.matchData,'match','reading')],
  writing:[...tagged(['spellQ','fillQ','spellingQ','rearrangeQ'].flatMap(k=>writing[k]),'text','writing'),...tagged([...writing.sectionEQ,...writing.sectionFQ],'mcq','writing')]
};
const cleanSpeech = s=>s.replace(/[\s.\-?!]/g,'');
const tfLabel = (q,v)=>q.isReadingTf?(v==='fact'?'ข้อเท็จจริง':'ข้อคิดเห็น'):(v?'จริง':'เท็จ');
export function summarizeResults(details, maxScore=details.length) {
  const breakdown={};
  for(const item of details){
    const category=item.category;
    breakdown[category] ??= {score:0,max:0,label:labels[category],pending:0};
    breakdown[category].max++;
    if(item.is_correct===true)breakdown[category].score++;
    if(item.is_correct===null)breakdown[category].pending++;
  }
  const score=details.filter(d=>d.is_correct===true).length;
  const pending_count=details.filter(d=>d.is_correct===null).length;
  return {score,maxScore,breakdown,detailed_results:details,pending_count,passed:pending_count===0 && score/maxScore>=0.7};
}
export function gradeSubmission({skill,level=1,responses}) {
  const set=questions[skill];
  if(!set || level!==1 || !Array.isArray(responses) || responses.length>set.length)throw new Error('ข้อมูลข้อสอบไม่ถูกต้อง');
  const values=new Map(), audioIds=new Map();
  for(const response of responses){
    if(!response || !Number.isInteger(response.id) || !set.some(q=>q.id===response.id) || values.has(response.id) || typeof response.value!=='string' || response.value.length>3000)throw new Error('คำตอบไม่ถูกต้องหรือซ้ำกัน');
    if(response.audioId!==undefined){
      if(!isAudioId(response.audioId)||set.find(q=>q.id===response.id).type!=='speaking')throw new Error('ข้อมูลเสียงไม่ถูกต้อง');
      audioIds.set(response.id,response.audioId);
    }
    values.set(response.id,response.value.trim());
  }
  const details=set.map(q=>{
    let value=values.get(q.id)||'';
    if(value==='(ไม่ได้ตอบ)' || value==='PASS_DUE_TO_UNSUPPORTED_BROWSER_OVERRIDE_123')value='';
    let correct='',is_correct=false;
    if(q.type==='mcq')correct=q.options.find(o=>o.correct)?.text||'';
    if(q.type==='tf')correct=tfLabel(q,q.correct);
    if(q.type==='match')correct=(skill==='reading'?reading.matchAnswers:matchAnswers)[q.id]||'';
    if(q.type==='text')correct=q.answer||q.word||'';
    if(q.type==='speaking')correct=q.text||'';
    if(value){
      if(q.isEssay || (q.type==='speaking' && !correct))is_correct=null;
      else is_correct=q.type==='speaking'?cleanSpeech(value)===cleanSpeech(correct):value===correct;
    }
    if(audioIds.has(q.id))is_correct=null;
    return {...(audioIds.has(q.id)?{audio_id:audioIds.get(q.id)}:{}),id:q.id,section:q.section,category:q.category,type:q.type,question:q.question||q.statement||q.prompt||q.script||q.text||q.word||q.verse||`ข้อ ${q.id}`,user_answer:value,correct_answer:correct||'ให้เจ้าหน้าที่ตรวจตามเกณฑ์',is_correct};
  });
  return summarizeResults(details);
}
