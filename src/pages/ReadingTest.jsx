import QuestionNumbers from '../components/QuestionNumbers';
import QuestionNavigation from '../components/QuestionNavigation';
import ResultModal from '../components/ResultModal';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Trophy, XCircle, ArrowRight, RefreshCw, CheckCircle } from 'lucide-react';
import { useUser } from '../context/UserContext';
import ExamTimer from '../components/ExamTimer';
import { useSessionStorage } from '../hooks/useSessionStorage';

import { ARTICLE_A, sectionAQ, ARTICLE_B, sectionBQ, tfQ, ARTICLE_C, sectionCQ, sectionDQ, POEM, matchData, sectionEQ } from '../data/readingQuestions.js';

const SectionHeader = ({ num, title, sub }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', marginTop: '16px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>{num}</div>
      <div><h3 style={{ margin: 0, color: 'var(--color-primary-dark)', fontSize: '1.1rem' }}>{title}</h3>{sub && <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1.1rem' }}>{sub}</p>}</div>
    </div>
  );

const questionOrder = [...sectionAQ,...sectionBQ,...tfQ,...sectionCQ,...sectionDQ,...matchData,...sectionEQ].sort((a,b)=>a.id-b.id);

export default function ReadingTest() {
  const { recordScore } = useUser();
  const navigate = useNavigate();
  const [currentIndex,setCurrentIndex]=useState(0);
  const currentQuestionId=questionOrder[currentIndex].id;
  const [answers, setAnswers] = useSessionStorage('readtest_answers', {});
  const [selIdx, setSelIdx] = useSessionStorage('readtest_selIdx', {});
  const [tfAnswers, setTfAnswers] = useSessionStorage('readtest_tfAnswers', {});
  const [matchSel, setMatchSel] = useSessionStorage('readtest_matchSel', {});
  const [showResult, setShowResult] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError,setSubmitError]=useState('');
  const [savedResult,setSavedResult]=useState(null);
  const [submissionId,setSubmissionId]=useState(()=>crypto.randomUUID());

  const totalQ = 30;
  const answeredMCQ = Object.keys(answers).length;
  const answeredTF = Object.keys(tfAnswers).length;
  const answeredMatch = Object.keys(matchSel).length;
  const answeredCount = answeredMCQ + answeredTF + answeredMatch;
  const progress = Math.round((answeredCount / totalQ) * 100);



  const pick = (qId, optCorrect, idx) => {
    setAnswers(prev => ({ ...prev, [qId]: optCorrect }));
    setSelIdx(prev => ({ ...prev, [qId]: idx }));
  };

  const handleSubmit=async()=>{
    if(submitting || showResult)return;
    setSubmitting(true);setSubmitError('');
    const responses=[...sectionAQ,...sectionBQ,...sectionCQ,...sectionDQ,...sectionEQ].map(q=>({id:q.id,value:q.options?.[selIdx[q.id]]?.text || ''})).concat(tfQ.map(q=>({id:q.id,value:tfAnswers[q.id]===undefined?'':tfAnswers[q.id]==='fact'?'ข้อเท็จจริง':'ข้อคิดเห็น'})),matchData.map(q=>({id:q.id,value:matchSel[q.id] || ''})));
    try{const result=await recordScore({level:1,skill:'reading',responses,submissionId});setSavedResult(result);setShowResult(true);}
    catch(error){setSubmitError(error.message || 'บันทึกไม่สำเร็จ คำตอบยังอยู่ กรุณาลองใหม่');}
    finally{setSubmitting(false);}
  };




  const renderMCQCard = ({ q }) => (
    <div key={q.id} style={{ marginBottom: '16px' }}>
      <p style={{ fontWeight: '600', color: 'var(--color-primary-dark)', marginBottom: '12px' }}>{q.question}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {q.options.map((opt, i) => (
          <button key={i} onClick={() => pick(q.id, opt.correct, i)} className="option-btn"
            style={{ padding: '14px 20px', borderRadius: '10px', border: `2px solid ${selIdx[q.id] === i ? '#10b981' : 'rgba(0,0,0,0.08)'}`, background: selIdx[q.id] === i ? 'rgba(16,185,129,0.1)' : 'white', color: '#374151', textAlign: 'left', cursor: 'pointer', fontWeight: selIdx[q.id] === i ? '600' : '400', transition: 'all 0.2s', fontFamily: 'inherit', fontSize: '1.1rem' }}>
            {opt.text}
          </button>
        ))}
      </div>
    </div>
  );

  const [timerKey, setTimerKey] = useState(0);

  return (
    <div className="page-content practice-page exam-page animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>
      {submitError && <div role="alert" style={{padding:16,background:'#fef2f2',color:'#b91c1c'}}><p>{submitError}</p><button onClick={handleSubmit} disabled={submitting}>ลองส่งอีกครั้ง</button></div>}
      {showResult && <ResultModal pendingCount={savedResult?.pending_count || 0} score={savedResult?.score ?? 0} total={totalQ} onClose={() => navigate('/skills')} onRetry={() => { setAnswers({}); setSelIdx({}); setTfAnswers({}); setMatchSel({}); setShowResult(false); setCurrentIndex(0); setSubmissionId(crypto.randomUUID()); setTimerKey(k => k + 1); }} />}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <Link to="/skills" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: '500', marginBottom: '8px', display: 'block' }}>← กลับหน้าเลือกทักษะ</Link>
          <h1 style={{ margin: 0, color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BookOpen size={28} color="#059669" /> ทักษะการอ่าน (30 ข้อ)
          </h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '4px' }}>ตอบแล้ว {answeredCount} / {totalQ}</div>
          <div style={{ height: '8px', width: '150px', borderRadius: '999px', background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,#10b981,#059669)', borderRadius: '999px', transition: 'width 0.3s' }} />
          </div>
        </div>
      </div>

      {/* Timer: 30 ข้อ × 30 วินาที = 900 วินาที */}
      <QuestionNumbers index={currentIndex} answered={questionOrder.map(q => answers[q.id] !== undefined || tfAnswers[q.id] !== undefined || Boolean(matchSel[q.id]))} onChange={setCurrentIndex} disabled={submitting || showResult} />
      <h2 data-current-question tabIndex={-1} aria-live="polite" className="question-step" style={{fontSize:'1.15rem',margin:'16px 0'}}>ข้อที่ {currentIndex + 1} / {totalQ}</h2>
      <ExamTimer key={timerKey} totalSeconds={900} onTimeUp={handleSubmit} isActive={!submitting && !showResult} storageKey="readtest_timer" />

      {/* Section A */}
      {sectionAQ.some(q=>q.id===currentQuestionId) && (
        <section data-question-id={currentQuestionId}>
      <SectionHeader num="A" title='มารยาทการฟังและการดู (ข้อ 41-45)' sub="อ่านบทความแล้วตอบคำถาม" />
      <div className="glass-panel practice-panel" style={{ padding: '20px', marginBottom: '20px', background: 'rgba(16,185,129,0.04)', borderLeft: '4px solid #10b981' }}>
        <p style={{ margin: 0, color: 'var(--color-primary-dark)', lineHeight: '1.9', fontSize: '1.1rem' }}>{ARTICLE_A}</p>
      </div>
      <div className="glass-panel practice-panel" style={{ padding: '24px' }}>
        {sectionAQ.filter(q=>q.id===currentQuestionId).map(q => renderMCQCard({q}))}
      </div>

      {/* Section B */}
        </section>
      )}

      {[...sectionBQ,...tfQ].some(q=>q.id===currentQuestionId) && (
        <section data-question-id={currentQuestionId}>
      <SectionHeader num="B" title='6 โรคที่มากับหน้าฝน (ข้อ 46-55)' sub="อ่านบทความ แล้วตอบ MCQ และแยกแยะข้อเท็จจริง/ข้อคิดเห็น" />
      <div className="glass-panel practice-panel" style={{ padding: '20px', marginBottom: '20px', background: 'rgba(16,185,129,0.04)', borderLeft: '4px solid #10b981' }}>
        <p style={{ margin: 0, color: 'var(--color-primary-dark)', lineHeight: '1.9', fontSize: '1.1rem' }}>{ARTICLE_B}</p>
      </div>
      <div className="glass-panel practice-panel" style={{ padding: '24px', marginBottom: '16px' }}>
        {sectionBQ.filter(q=>q.id===currentQuestionId).map(q => renderMCQCard({q}))}
      </div>
      {/* T/F */}
      <div className="glass-panel practice-panel" style={{ padding: '24px' }}>
        <p style={{ fontWeight: '600', color: 'var(--color-primary-dark)', marginBottom: '16px' }}>ให้พิจารณาว่าแต่ละข้อความเป็น "ข้อเท็จจริง" หรือ "ข้อคิดเห็น"</p>
        {tfQ.filter(q=>q.id===currentQuestionId).map(q => (
          <div key={q.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.06)', flexWrap: 'wrap' }}>
            <p style={{ margin: 0, color: 'var(--color-primary-dark)', fontSize: '1.1rem', flex: 1, minWidth: '200px' }}>{q.statement}</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              {[{ label: 'ข้อเท็จจริง', val: 'fact' }, { label: 'ข้อคิดเห็น', val: 'opinion' }].map(({ label, val }) => (
                <button key={val} onClick={() => setTfAnswers(prev => ({ ...prev, [q.id]: val }))} className="option-btn"
                  style={{ padding: '10px 18px', borderRadius: '20px', border: `2px solid ${tfAnswers[q.id] === val ? '#10b981' : 'rgba(0,0,0,0.1)'}`, background: tfAnswers[q.id] === val ? 'rgba(16,185,129,0.1)' : 'white', color: tfAnswers[q.id] === val ? '#059669' : '#6b7280', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1.1rem', transition: 'all 0.2s' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Section C */}
        </section>
      )}

      {sectionCQ.some(q=>q.id===currentQuestionId) && (
        <section data-question-id={currentQuestionId}>
      <SectionHeader num="C" title='สังคมสูงวัยกับเศรษฐกิจดิจิทัล (ข้อ 56-60)' sub="อ่านบทความเชิงวิเคราะห์แล้วตอบคำถาม" />
      <div className="glass-panel practice-panel" style={{ padding: '20px', marginBottom: '20px', background: 'rgba(16,185,129,0.04)', borderLeft: '4px solid #10b981' }}>
        <p style={{ margin: 0, color: 'var(--color-primary-dark)', lineHeight: '1.9', fontSize: '1.1rem' }}>{ARTICLE_C}</p>
      </div>
      <div className="glass-panel practice-panel" style={{ padding: '24px' }}>
        {sectionCQ.filter(q=>q.id===currentQuestionId).map(q => renderMCQCard({q}))}
      </div>

      {/* Section D */}
        </section>
      )}

      {sectionDQ.some(q=>q.id===currentQuestionId) && (
        <section data-question-id={currentQuestionId}>
      <SectionHeader num="D" title='ระดับภาษา (ข้อ 61-65)' sub="วิเคราะห์ระดับภาษาในแต่ละสถานการณ์" />
      <div className="glass-panel practice-panel" style={{ padding: '24px' }}>
        {sectionDQ.filter(q=>q.id===currentQuestionId).map(q => renderMCQCard({q}))}
      </div>

      {/* Section E: Poem matching + MCQ */}
        </section>
      )}

      {[...matchData,...sectionEQ].some(q=>q.id===currentQuestionId) && (
        <section data-question-id={currentQuestionId}>
      <SectionHeader num="E" title='คำประพันธ์สุภาษิตพระร่วง (ข้อ 66-70)' sub="จับคู่ความหมายและตอบคำถาม" />
      <div className="glass-panel practice-panel" style={{ padding: '24px', marginBottom: '16px', background: 'rgba(16,185,129,0.04)', borderLeft: '4px solid #10b981' }}>
        <pre style={{ fontFamily: 'Kanit, sans-serif', color: 'var(--color-primary-dark)', lineHeight: '2', margin: 0, fontSize: '1.1rem', whiteSpace: 'pre-wrap' }}>{POEM}</pre>
        <p style={{ margin: '8px 0 0', fontSize: '1.1rem', color: 'var(--text-muted)', textAlign: 'right' }}>— สุภาษิตพระร่วง</p>
      </div>
      <div className="glass-panel practice-panel" style={{ padding: '24px', marginBottom: '16px' }}>
        <p style={{ fontWeight: '600', color: 'var(--color-primary-dark)', marginBottom: '16px' }}>จับคู่คำประพันธ์ (ข้อ 66-69) ให้ตรงกับความหมาย:</p>
        {matchData.filter(q=>q.id===currentQuestionId).map(m => {
          const currentSel = matchSel[m.id];
          return (
            <div key={m.id} style={{ marginBottom: '20px' }}>
              <p style={{ fontWeight: '600', color: '#1e3a8a', fontStyle: 'italic', marginBottom: '10px' }}>ข้อ {m.id}. "{m.verse}"</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {matchData.map(opt => (
                  <button key={opt.id} onClick={() => setMatchSel(prev => ({ ...prev, [m.id]: opt.meaning }))} className="option-btn"
                    style={{ padding: '12px 18px', borderRadius: '10px', border: `2px solid ${currentSel === opt.meaning ? '#10b981' : 'rgba(0,0,0,0.08)'}`, background: currentSel === opt.meaning ? 'rgba(16,185,129,0.1)' : 'white', color: '#374151', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1.1rem', transition: 'all 0.2s' }}>
                    {opt.meaning}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="glass-panel practice-panel" style={{ padding: '24px' }}>
        {sectionEQ.filter(q=>q.id===currentQuestionId).map(q => renderMCQCard({q}))}
      </div>

        </section>
      )}

      <QuestionNavigation index={currentIndex} total={totalQ} onChange={setCurrentIndex} onSubmit={handleSubmit} disabled={submitting || showResult} />

    </div>
  );
}
