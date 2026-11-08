import { readTfQ } from '../data/testData.js';
export function historyLabels(result) {
  const question=result.type==='tf' && result.section?.includes('การอ่าน') && readTfQ.find(q=>q.id===result.id);
  if(!question)return result;
  return {...result,user_answer:result.user_answer==='จริง'?'ข้อเท็จจริง':result.user_answer==='เท็จ'?'ข้อคิดเห็น':result.user_answer,correct_answer:question.correct==='fact'?'ข้อเท็จจริง':'ข้อคิดเห็น'};
}
