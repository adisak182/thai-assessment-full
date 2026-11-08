import QuestionNumbers from '../components/QuestionNumbers';
import QuestionNavigation from '../components/QuestionNavigation';
import ResultModal from '../components/ResultModal';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PenTool, Trophy, XCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { useUser } from '../context/UserContext';
import ExamTimer from '../components/ExamTimer';
import { safeUUID } from '../utils/uuid';

import { spellQ, fillQ, WORD_BANK, spellingQ, rearrangeQ, sectionEQ, PASSAGE_F, sectionFQ } from '../data/writingQuestions.js';

const SectionHeader = ({ num, title, sub }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', marginTop: '16px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>{num}</div>
      <div><h3 style={{ margin: 0, color: 'var(--color-primary-dark)', fontSize: '1.1rem' }}>{title}</h3>{sub && <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1.1rem' }}>{sub}</p>}</div>
    </div>
  );

const questionOrder = [...spellQ,...fillQ,...spellingQ,...rearrangeQ,...sectionEQ,...sectionFQ].sort((a,b)=>a.id-b.id);

export default function WritingTest() {
  const { recordScore } = useUser();
  const navigate = useNavigate();
  const [currentIndex,setCurrentIndex]=useState(0);
  const currentQuestionId=questionOrder[currentIndex].id;

  const [spellInputs, setSpellInputs] = useState({});       // { qId: typedText }
  const [fillSel, setFillSel] = useState({});               // { qId: selectedWord }
  const [spellingSel, setSpellingSel] = useState({});       // { qId: typedText }
  const [rearrangeSel, setRearrangeSel] = useState({});     // { qId: typedAnswer }
  const [mcqSel, setMcqSel] = useState({});                 // { qId: { correct, idx } }
  const [showResult, setShowResult] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError,setSubmitError]=useState('');
  const [savedResult,setSavedResult]=useState(null);
  const [submissionId,setSubmissionId]=useState(()=>safeUUID());

  const totalQ = 30;
  const answeredCount =
    Object.keys(spellInputs).length + Object.keys(fillSel).length +
    Object.keys(spellingSel).length + Object.keys(rearrangeSel).length +
    Object.keys(mcqSel).length;
  const progress = Math.round((answeredCount / totalQ) * 100);



  const handleSubmit=async()=>{
    if(submitting || showResult)return;
    setSubmitting(true);setSubmitError('');
    const responses=[...spellQ.map(q=>({id:q.id,value:spellInputs[q.id] || ''})),...fillQ.map(q=>({id:q.id,value:fillSel[q.id] || ''})),...spellingQ.map(q=>({id:q.id,value:spellingSel[q.id] || ''})),...rearrangeQ.map(q=>({id:q.id,value:rearrangeSel[q.id] || ''})),...[...sectionEQ,...sectionFQ].map(q=>({id:q.id,value:q.options?.[mcqSel[q.id]?.idx]?.text || ''}))];
    try{const result=await recordScore({level:1,skill:'writing',responses,submissionId});setSavedResult(result);setShowResult(true);}
    catch(error){setSubmitError(error.message || 'บันทึกไม่สำเร็จ คำตอบยังอยู่ กรุณาลองใหม่');}
    finally{setSubmitting(false);}
  };

  const inputStyle = { width: '100%', padding: '14px 20px', borderRadius: '10px', border: '2px solid rgba(0,0,0,0.1)', outline: 'none', fontSize: '1.1rem', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s' };



  const renderMCQCard = ({ q, color = '#f59e0b' }) => (
    <div key={q.id} style={{ marginBottom: '16px' }}>
      <p style={{ fontWeight: '600', color: 'var(--color-primary-dark)', marginBottom: '12px' }}>{q.question}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {q.options.map((opt, i) => (
          <button key={i} onClick={() => setMcqSel(prev => ({ ...prev, [q.id]: { correct: opt.correct, idx: i } }))} className="option-btn"
            style={{ padding: '14px 20px', borderRadius: '10px', border: `2px solid ${mcqSel[q.id]?.idx === i ? color : 'rgba(0,0,0,0.08)'}`, background: mcqSel[q.id]?.idx === i ? `${color}18` : 'white', color: '#374151', textAlign: 'left', cursor: 'pointer', fontWeight: mcqSel[q.id]?.idx === i ? '600' : '400', transition: 'all 0.2s', fontFamily: 'inherit', fontSize: '1.1rem' }}>
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
      {showResult && <ResultModal pendingCount={savedResult?.pending_count || 0} score={savedResult?.score ?? 0} total={totalQ} onClose={() => navigate('/skills')} onRetry={() => { setSpellInputs({}); setFillSel({}); setSpellingSel({}); setRearrangeSel({}); setMcqSel({}); setShowResult(false); setCurrentIndex(0); setSubmissionId(safeUUID()); setTimerKey(k => k + 1); }} />}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <Link to="/skills" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: '500', marginBottom: '8px', display: 'block' }}>← กลับหน้าเลือกทักษะ</Link>
          <h1 style={{ margin: 0, color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <PenTool size={28} color="#d97706" /> ทักษะการเขียน (30 ข้อ)
          </h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '4px' }}>ตอบแล้ว {answeredCount} / {totalQ}</div>
          <div style={{ height: '8px', width: '150px', borderRadius: '999px', background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,#f59e0b,#d97706)', borderRadius: '999px', transition: 'width 0.3s' }} />
          </div>
        </div>
      </div>

      {/* Timer: 30 ข้อ × 30 วินาที = 900 วินาที */}
      <QuestionNumbers index={currentIndex} answered={questionOrder.map(q => mcqSel[q.id] !== undefined || [spellInputs[q.id], fillSel[q.id], spellingSel[q.id], rearrangeSel[q.id]].some(value => typeof value === 'string' && value.trim() !== ''))} onChange={setCurrentIndex} disabled={submitting || showResult} />
      <h2 data-current-question tabIndex={-1} aria-live="polite" className="question-step" style={{fontSize:'1.15rem',margin:'16px 0'}}>ข้อที่ {currentIndex + 1} / {totalQ}</h2>
      <ExamTimer key={timerKey} totalSeconds={900} onTimeUp={handleSubmit} isActive={!submitting && !showResult} />

      {/* Section A: Spell from image */}
      {spellQ.some(q=>q.id===currentQuestionId) && (
        <section data-question-id={currentQuestionId}>
      <SectionHeader num="A" title="เขียนคำศัพท์จากภาพที่กำหนดให้ (ข้อ 71-72)" sub="พิมพ์คำที่ถูกต้องตามภาพ" />
      <div className="glass-panel practice-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {spellQ.filter(q=>q.id===currentQuestionId).map(q => (
          <div key={q.id}>
            {q.image && <img src={q.image} alt="" style={{ width: '220px', borderRadius: '12px', margin: '0 auto 16px auto', display: 'block' }} />}
            <p style={{ fontWeight: '600', color: 'var(--color-primary-dark)', marginBottom: '8px' }}>ข้อ {q.id}. {q.hint}</p>
            <input type="text" value={spellInputs[q.id] || ''} onChange={e => setSpellInputs(prev => ({ ...prev, [q.id]: e.target.value }))}
              placeholder="พิมพ์คำตอบที่นี่..." style={{ ...inputStyle, maxWidth: '300px', borderColor: spellInputs[q.id] ? (spellInputs[q.id].trim() === q.word ? '#10b981' : '#f59e0b') : 'rgba(0,0,0,0.1)' }} />
          </div>
        ))}
      </div>

      {/* Section B: Fill in the blank */}
        </section>
      )}

      {fillQ.some(q=>q.id===currentQuestionId) && (
        <section data-question-id={currentQuestionId}>
      <SectionHeader num="B" title="เติมคำในช่องว่างให้สมบูรณ์ (ข้อ 73-75)" sub="เลือกคำจากคลังคำด้านล่างมาเติมให้ถูกต้อง" />
      <div className="glass-panel practice-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px', padding: '12px', background: 'rgba(245,158,11,0.06)', borderRadius: '10px' }}>
          <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: '600', width: '100%', marginBottom: '4px' }}>คลังคำ:</span>
          {WORD_BANK.map(w => (
            <span key={w} style={{ padding: '4px 14px', borderRadius: '20px', background: 'white', border: '1.5px solid rgba(245,158,11,0.3)', color: '#92400e', fontWeight: '600', fontSize: '1.1rem' }}>{w}</span>
          ))}
        </div>
        {fillQ.filter(q=>q.id===currentQuestionId).map(q => (
          <div key={q.id} style={{ marginBottom: '20px' }}>
            <p style={{ fontWeight: '600', color: 'var(--color-primary-dark)', marginBottom: '12px' }}>ข้อ {q.id}. {q.sentence.replace('_______', '[ _______ ]')}</p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {WORD_BANK.map(w => (
                <button key={w} onClick={() => setFillSel(prev => ({ ...prev, [q.id]: w }))} className="option-btn"
                  style={{ padding: '10px 22px', borderRadius: '20px', border: `2px solid ${fillSel[q.id] === w ? '#f59e0b' : 'rgba(0,0,0,0.1)'}`, background: fillSel[q.id] === w ? 'rgba(245,158,11,0.12)' : 'white', color: fillSel[q.id] === w ? '#92400e' : '#6b7280', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                  {w}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Section C: Spelling */}
        </section>
      )}

      {spellingQ.some(q=>q.id===currentQuestionId) && (
        <section data-question-id={currentQuestionId}>
      <SectionHeader num="C" title="เขียนคำจากคำอ่านที่กำหนดให้ (ข้อ 76-80)" sub="พิมพ์การสะกดที่ถูกต้อง" />
      <div className="glass-panel practice-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {spellingQ.filter(q=>q.id===currentQuestionId).map(q => (
          <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: '600', color: 'var(--color-primary-dark)', minWidth: '180px' }}>ข้อ {q.id}. อ่านว่า "{q.reading}"</span>
            <input type="text" value={spellingSel[q.id] || ''} onChange={e => setSpellingSel(prev => ({ ...prev, [q.id]: e.target.value }))}
              placeholder="พิมพ์การสะกดที่ถูกต้อง..." style={{ ...inputStyle, maxWidth: '250px', flex: 1 }} />
          </div>
        ))}
      </div>

      {/* Section D: Rearrange */}
        </section>
      )}

      {rearrangeQ.some(q=>q.id===currentQuestionId) && (
        <section data-question-id={currentQuestionId}>
      <SectionHeader num="D" title="เรียงคำให้เป็นประโยคที่สมบูรณ์ (ข้อ 81-85)" sub="นำคำที่กำหนดให้มาเรียงให้เป็นประโยคที่ถูกต้อง" />
      <div className="glass-panel practice-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {rearrangeQ.filter(q=>q.id===currentQuestionId).map(q => (
          <div key={q.id}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <span style={{ fontWeight: '600', color: 'var(--color-primary-dark)' }}>ข้อ {q.id}. คำที่มี:</span>
              {q.words.map((w, i) => (
                <span key={i} style={{ padding: '3px 12px', borderRadius: '6px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#92400e', fontWeight: '600', fontSize: '1.1rem' }}>{w}</span>
              ))}
            </div>
            <input type="text" value={rearrangeSel[q.id] || ''} onChange={e => setRearrangeSel(prev => ({ ...prev, [q.id]: e.target.value }))}
              placeholder="พิมพ์ประโยคที่เรียงถูกต้อง..." style={inputStyle} />
          </div>
        ))}
      </div>

      {/* Section E: MCQ Spelling/Grammar */}
        </section>
      )}

      {sectionEQ.some(q=>q.id===currentQuestionId) && (
        <section data-question-id={currentQuestionId}>
      <SectionHeader num="E" title="การสะกดและไวยากรณ์ (ข้อ 86-90)" sub="เลือกคำตอบที่ถูกต้อง 1 ข้อ" />
      <div className="glass-panel practice-panel" style={{ padding: '24px' }}>
        {sectionEQ.filter(q=>q.id===currentQuestionId).map(q => renderMCQCard({q}))}
      </div>

      {/* Section F: Passage MCQ */}
        </section>
      )}

      {sectionFQ.some(q=>q.id===currentQuestionId) && (
        <section data-question-id={currentQuestionId}>
      <SectionHeader num="F" title="อ่านบทความแล้วตอบคำถาม (ข้อ 91-100)" sub="เลือกคำตอบที่ถูกต้องจากบทความ" />
      <div className="glass-panel practice-panel" style={{ padding: '20px', marginBottom: '16px', background: 'rgba(245,158,11,0.04)', borderLeft: '4px solid #f59e0b' }}>
        <p style={{ margin: 0, color: 'var(--color-primary-dark)', lineHeight: '1.9', fontSize: '1.1rem' }}>{PASSAGE_F}</p>
      </div>
      <div className="glass-panel practice-panel" style={{ padding: '24px' }}>
        {sectionFQ.filter(q=>q.id===currentQuestionId).map(q => renderMCQCard({q}))}
      </div>

        </section>
      )}

      <QuestionNavigation index={currentIndex} total={totalQ} onChange={setCurrentIndex} onSubmit={handleSubmit} disabled={submitting || showResult} />

    </div>
  );
}
