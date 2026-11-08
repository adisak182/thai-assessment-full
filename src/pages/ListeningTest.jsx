import QuestionNumbers from '../components/QuestionNumbers';
import QuestionNavigation from '../components/QuestionNavigation';
import AudioBtn from '../components/AudioButton';
import ResultModal from '../components/ResultModal';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Volume2, CheckCircle, XCircle, ArrowRight, Trophy, RefreshCw, Headphones, Play } from 'lucide-react';
import { useUser } from '../context/UserContext';
import ExamTimer from '../components/ExamTimer';
import { safeUUID } from '../utils/uuid';

import { vocabQ, announcementQ, STORY_AUDIO, STORY_IMG, storyQ, vocab4Q, proverbQ, ARTICLE_AUDIO, tfQ, ANN_COLD_AUDIO, annColdQ, AD_AUDIO, adQ, lastQ } from '../data/listeningQuestions.js';


const SectionHeader = ({ num, title, icon }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', marginTop: '16px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>{num}</div>
      <div>
        <h3 style={{ margin: 0, color: 'var(--color-primary-dark)', fontSize: '1.1rem' }}>{title}</h3>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1.1rem' }}>{icon}</p>
      </div>
    </div>
  );

const questionOrder = [...vocabQ,...announcementQ,...storyQ,...vocab4Q,...proverbQ,...tfQ,...annColdQ,...adQ,...lastQ].sort((a,b)=>a.id-b.id);

export default function ListeningTest() {
  const { recordScore } = useUser();
  const navigate = useNavigate();
  const [currentIndex,setCurrentIndex]=useState(0);
  const currentQuestionId=questionOrder[currentIndex].id;

  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError,setSubmitError]=useState('');
  const [savedResult,setSavedResult]=useState(null);
  const [submissionId,setSubmissionId]=useState(()=>safeUUID());
  const [tfAnswers, setTfAnswers] = useState({}); // { 15: true/false }
  const [completedAudios, setCompletedAudios] = useState({});

  const totalQ = 25;



  const answeredCount = Object.keys(answers).filter(k=>!k.startsWith('_sel_')).length + Object.keys(tfAnswers).length;
  const progress = Math.round((answeredCount / totalQ) * 100);



  const handleSubmit=async()=>{
    if(submitting || showResult)return;
    setSubmitting(true);setSubmitError('');
    const responses=[...vocabQ,...announcementQ,...storyQ,...vocab4Q,...proverbQ,...annColdQ,...adQ,...lastQ].map(q=>({id:q.id,value:q.options?.[answers[`_sel_${q.id}`]]?.text || ''})).concat(tfQ.map(q=>({id:q.id,value:tfAnswers[q.id]===undefined?'':tfAnswers[q.id]?'จริง':'เท็จ'})));
    try{const result=await recordScore({level:1,skill:'listening',responses,submissionId});setSavedResult(result);setShowResult(true);}
    catch(error){setSubmitError(error.message || 'บันทึกไม่สำเร็จ คำตอบยังอยู่ กรุณาลองใหม่');}
    finally{setSubmitting(false);}
  };


  const [timerKey, setTimerKey] = useState(0); // reset timer on retry

  const handleClose = () => navigate('/skills');
  const handleRetry = () => { setAnswers({}); setTfAnswers({}); setShowResult(false); setCurrentIndex(0); setSubmissionId(safeUUID()); setTimerKey(k => k + 1); };



  const renderMCQCard = ({ q }) => {
    return (
      <div key={q.id} className="glass-panel practice-panel" style={{ padding: '24px', marginBottom: '16px' }}>
        {q.script && <div style={{ padding: '14px 20px', background: 'rgba(168,85,247,0.06)', borderRadius: '10px', color: 'var(--color-primary-dark)', fontStyle: 'italic', marginBottom: '12px', lineHeight: '1.7', fontSize: '1.1rem' }}>{q.script}</div>}
        {q.saying && <div style={{ padding: '14px 20px', background: 'rgba(168,85,247,0.06)', borderRadius: '10px', color: 'var(--color-primary-dark)', fontWeight: '600', marginBottom: '12px', fontSize: '1.1rem' }}>สำนวน: {q.saying}</div>}
        {q.image && <img src={q.image} alt="" style={{ width: '100%', maxWidth: '240px', borderRadius: '12px', margin: '0 auto 16px auto', display: 'block' }} />}
        {q.audio && <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}><AudioBtn src={q.audio} /></div>}
        <p style={{ fontWeight: '600', color: 'var(--color-primary-dark)', marginBottom: '14px' }}>{q.question}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {q.options.map((opt, i) => {
            const isSelected=answers[`_sel_${q.id}`]===i;
            return (
              <button key={i} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.correct, [`_sel_${q.id}`]: i }))} className="option-btn"
                style={{ padding: '14px 20px', borderRadius: '10px', border: `2px solid ${isSelected ? 'var(--color-primary)' : 'rgba(0,0,0,0.08)'}`, background: isSelected ? 'rgba(168,85,247,0.1)' : 'white', color: isSelected ? 'var(--color-primary-dark)' : '#374151', textAlign: 'left', cursor: 'pointer', fontWeight: isSelected ? '600' : '400', transition: 'all 0.2s', fontFamily: 'inherit', fontSize: '1.1rem' }}>
                {opt.text}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTFCard = ({ q }) => {
    const ans = tfAnswers[q.id];
    return (
      <div key={q.id} className="glass-panel practice-panel" style={{ padding: '20px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <p style={{ margin: 0, color: 'var(--color-primary-dark)', fontWeight: '500', flex: 1, minWidth: '200px' }}>{q.statement}</p>
        <div style={{ display: 'flex', gap: '14px' }}>
          {[{ label: '✓ ถูก', val: true }, { label: '✗ ผิด', val: false }].map(({ label, val }) => (
            <button key={label} onClick={() => setTfAnswers(prev => ({ ...prev, [q.id]: val }))} className="option-btn"
              style={{ padding: '10px 22px', borderRadius: '30px', border: `2px solid ${ans === val ? (val ? '#10b981' : '#ef4444') : 'rgba(0,0,0,0.1)'}`, background: ans === val ? (val ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)') : 'white', color: ans === val ? (val ? '#059669' : '#dc2626') : '#6b7280', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}>
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="page-content practice-page exam-page animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>
      {submitError && <div role="alert" style={{padding:16,background:'#fef2f2',color:'#b91c1c'}}><p>{submitError}</p><button onClick={handleSubmit} disabled={submitting}>ลองส่งอีกครั้ง</button></div>}
      {showResult && <ResultModal pendingCount={savedResult?.pending_count || 0} score={savedResult?.score ?? 0} total={totalQ} onClose={handleClose} onRetry={handleRetry} />}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <Link to="/skills" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>← กลับหน้าเลือกทักษะ</Link>
          <h1 style={{ margin: 0, color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Headphones size={28} color="var(--color-primary)" /> ทักษะการฟัง (25 ข้อ)
          </h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '4px' }}>ตอบแล้ว {answeredCount} / {totalQ}</div>
          <div style={{ height: '8px', width: '150px', borderRadius: '999px', background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,#8b5cf6,#6d28d9)', borderRadius: '999px', transition: 'width 0.3s' }} />
          </div>
        </div>
      </div>

      {/* Timer: 25 ข้อ × 30 วินาที = 750 วินาที */}
      <QuestionNumbers index={currentIndex} answered={questionOrder.map(q => answers[q.id] !== undefined || tfAnswers[q.id] !== undefined)} onChange={setCurrentIndex} disabled={submitting || showResult} />
      <h2 data-current-question tabIndex={-1} aria-live="polite" className="question-step" style={{fontSize:'1.15rem',margin:'16px 0'}}>ข้อที่ {currentIndex + 1} / {totalQ}</h2>
      <ExamTimer key={timerKey} totalSeconds={750} onTimeUp={handleSubmit} isActive={!submitting && !showResult} />

      {/* คำชี้แจง */}
      <div className="glass-panel practice-panel" style={{ padding: '20px', marginBottom: '32px', borderLeft: '4px solid var(--color-primary)', background: 'rgba(168,85,247,0.04)' }}>
        <strong style={{ color: 'var(--color-primary-dark)' }}>คำชี้แจง:</strong>
        <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>กดปุ่มลำโพงฟังเสียงก่อน แล้วเลือกคำตอบที่ถูกต้อง</span>
      </div>

      {/* Section A: Vocab Flashcards */}
      {vocabQ.some(q=>q.id===currentQuestionId) && (
        <section data-question-id={currentQuestionId}>
      <SectionHeader num="A" title="เกมแฟลชการ์ดคำศัพท์ (ข้อ 1-3)" icon="กดปุ่มฟังคำศัพท์ แล้วเลือกคำอ่านที่ถูกต้อง" />
      {vocabQ.filter(q=>q.id===currentQuestionId).map(q => renderMCQCard({q}))}

      {/* Section B: Short announcements */}
        </section>
      )}

      {announcementQ.some(q=>q.id===currentQuestionId) && (
        <section data-question-id={currentQuestionId}>
      <SectionHeader num="B" title="ฟังประกาศและคำสั่งสั้น ๆ (ข้อ 4-6)" icon="ฟังแล้วเลือกคำตอบที่ถูกต้อง" />
      {announcementQ.filter(q=>q.id===currentQuestionId).map(q => renderMCQCard({q}))}

        </section>
      )}

      {storyQ.some(q=>q.id===currentQuestionId) && (
        <section data-question-id={currentQuestionId}>
      <SectionHeader num="C" title='นิทาน "พ่อค้าเกลือกับลาขี้โกง" (ข้อ 7-9)' icon="ฟังนิทานจนจบ แล้วตอบคำถาม" />
      <div className="glass-panel practice-panel" style={{ padding: '24px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', marginBottom: '20px', textAlign: 'center' }}>
          <img src={STORY_IMG} alt="นิทาน" style={{ width: '180px', borderRadius: '12px' }} />
          <div style={{ width: '100%', maxWidth: '400px', display: 'flex', justifyContent: 'center' }}>
            <AudioBtn src={STORY_AUDIO} label="ฟังนิทานให้จบ" onComplete={() => setCompletedAudios(prev => ({ ...prev, [STORY_AUDIO]: true }))} showSeek={true} />
          </div>
        </div>
        
        {!completedAudios[STORY_AUDIO] && (
          <div className="animate-fade-in" style={{ textAlign: 'center', padding: '24px', background: '#fef3c7', color: '#d97706', borderRadius: '16px', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 4px 12px rgba(217, 119, 6, 0.1)' }}>
            🎧 กรุณาฟังนิทานให้จบก่อน แล้วข้อสอบจะแสดงขึ้นมาโดยอัตโนมัติ
          </div>
        )}

        {completedAudios[STORY_AUDIO] && (
          <div className="animate-fade-in" style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {storyQ.filter(q=>q.id===currentQuestionId).map(q => (
              <div key={q.id}>
                <p style={{ fontWeight: '600', color: 'var(--color-primary-dark)', marginBottom: '12px' }}>{q.question}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {q.options.map((opt, i) => {

                    return (
                      <button key={i}
                        onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.correct, [`_sel_${q.id}`]: i }))} className="option-btn"
                        style={{ padding: '14px 20px', borderRadius: '10px', border: `2px solid ${answers[`_sel_${q.id}`] === i ? 'var(--color-primary)' : 'rgba(0,0,0,0.08)'}`, background: answers[`_sel_${q.id}`] === i ? 'rgba(168,85,247,0.1)' : 'white', color: '#374151', textAlign: 'left', cursor: 'pointer', fontWeight: answers[`_sel_${q.id}`] === i ? '600' : '400', transition: 'all 0.2s', fontFamily: 'inherit', fontSize: '1.1rem' }}>
                        {opt.text}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section D: 4-option vocab */}
        </section>
      )}

      {vocab4Q.some(q=>q.id===currentQuestionId) && (
        <section data-question-id={currentQuestionId}>
      <SectionHeader num="D" title="ฟังคำศัพท์และเลือกการสะกดที่ถูกต้อง (ข้อ 10-11)" icon="ฟังเสียงแล้วเลือก 1 ใน 4 ตัวเลือก" />
      {vocab4Q.filter(q=>q.id===currentQuestionId).map(q => renderMCQCard({q}))}

      {/* Section E: Proverbs */}
        </section>
      )}

      {proverbQ.some(q=>q.id===currentQuestionId) && (
        <section data-question-id={currentQuestionId}>
      <SectionHeader num="E" title="ฟังสำนวนและเลือกความหมาย (ข้อ 12-14)" icon="ฟังสำนวนแล้วเลือกความหมายที่ถูกต้อง" />
      {proverbQ.filter(q=>q.id===currentQuestionId).map(q => renderMCQCard({q}))}

      {/* Section F: Article T/F */}
        </section>
      )}

      {tfQ.some(q=>q.id===currentQuestionId) && (
        <section data-question-id={currentQuestionId}>
      <SectionHeader num="F" title="ฟังบทความแล้วทำเครื่องหมายถูก/ผิด (ข้อ 15-19)" icon="ฟังบทความ แล้วตัดสินว่าแต่ละข้อความเป็น ถูก หรือ ผิด" />
      <div className="glass-panel practice-panel" style={{ padding: '24px', marginBottom: '16px' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center', maxWidth: '400px', margin: '0 auto 16px' }}>
          <AudioBtn src={ARTICLE_AUDIO} label="ฟังบทความให้จบ" onComplete={() => setCompletedAudios(prev => ({ ...prev, [ARTICLE_AUDIO]: true }))} showSeek={true} />
        </div>
        
        {!completedAudios[ARTICLE_AUDIO] && (
          <div className="animate-fade-in" style={{ textAlign: 'center', padding: '24px', background: '#fef3c7', color: '#d97706', borderRadius: '16px', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 4px 12px rgba(217, 119, 6, 0.1)' }}>
            🎧 กรุณาฟังบทความให้จบก่อน แล้วข้อสอบจะแสดงขึ้นมาโดยอัตโนมัติ
          </div>
        )}

        {completedAudios[ARTICLE_AUDIO] && (
          <div className="animate-fade-in" style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '16px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontStyle: 'italic', lineHeight: '1.7', marginBottom: '16px', textAlign: 'center' }}>
              "หากปล่อยให้เด็กใกล้ชิดจอมือถือ แท็บเล็ตมากเกินไปโดยไม่กำหนดเวลา จะส่งผลเสียหลายด้าน ได้แก่ ด้านการสื่อสาร ร่างกาย อารมณ์ และพฤติกรรม..."
            </p>
            {tfQ.filter(q=>q.id===currentQuestionId).map(q => renderTFCard({q}))}
          </div>
        )}
      </div>

      {/* Section G: Cold announcement */}
        </section>
      )}

      {annColdQ.some(q=>q.id===currentQuestionId) && (
        <section data-question-id={currentQuestionId}>
      <SectionHeader num="G" title="ฟังประกาศแจ้งเตือนภัยหนาว (ข้อ 20-21)" icon="ฟังแล้วเลือกคำตอบ" />
      <div className="glass-panel practice-panel" style={{ padding: '24px', marginBottom: '16px' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
          <AudioBtn src={ANN_COLD_AUDIO} label="ฟังประกาศให้จบ" onComplete={() => setCompletedAudios(prev => ({ ...prev, [ANN_COLD_AUDIO]: true }))} />
        </div>
        
        {!completedAudios[ANN_COLD_AUDIO] && (
          <div className="animate-fade-in" style={{ textAlign: 'center', padding: '24px', background: '#fef3c7', color: '#d97706', borderRadius: '16px', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 4px 12px rgba(217, 119, 6, 0.1)' }}>
            🎧 กรุณาฟังประกาศให้จบก่อน แล้วข้อสอบจะแสดงขึ้นมาโดยอัตโนมัติ
          </div>
        )}

        {completedAudios[ANN_COLD_AUDIO] && (
          <div className="animate-fade-in" style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {annColdQ.filter(q=>q.id===currentQuestionId).map(q => (
              <div key={q.id}>
                <p style={{ fontWeight: '600', color: 'var(--color-primary-dark)', marginBottom: '12px' }}>{q.question}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {q.options.map((opt, i) => (
                    <button key={i}
                      onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.correct, [`_sel_${q.id}`]: i }))} className="option-btn"
                      style={{ padding: '14px 20px', borderRadius: '10px', border: `2px solid ${answers[`_sel_${q.id}`] === i ? 'var(--color-primary)' : 'rgba(0,0,0,0.08)'}`, background: answers[`_sel_${q.id}`] === i ? 'rgba(168,85,247,0.1)' : 'white', color: '#374151', textAlign: 'left', cursor: 'pointer', fontWeight: answers[`_sel_${q.id}`] === i ? '600' : '400', transition: 'all 0.2s', fontFamily: 'inherit', fontSize: '1.1rem' }}>
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section H: Ad */}
        </section>
      )}

      {adQ.some(q=>q.id===currentQuestionId) && (
        <section data-question-id={currentQuestionId}>
      <SectionHeader num="H" title="ฟังโฆษณาสินค้าและวิเคราะห์ (ข้อ 22-23)" icon="ฟังโฆษณาแล้วตอบคำถาม" />
      <div className="glass-panel practice-panel" style={{ padding: '24px', marginBottom: '16px' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
          <AudioBtn src={AD_AUDIO} label="ฟังโฆษณาให้จบ" onComplete={() => setCompletedAudios(prev => ({ ...prev, [AD_AUDIO]: true }))} />
        </div>
        
        {!completedAudios[AD_AUDIO] && (
          <div className="animate-fade-in" style={{ textAlign: 'center', padding: '24px', background: '#fef3c7', color: '#d97706', borderRadius: '16px', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 4px 12px rgba(217, 119, 6, 0.1)' }}>
            🎧 กรุณาฟังโฆษณาให้จบก่อน แล้วข้อสอบจะแสดงขึ้นมาโดยอัตโนมัติ
          </div>
        )}

        {completedAudios[AD_AUDIO] && (
          <div className="animate-fade-in" style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {adQ.filter(q=>q.id===currentQuestionId).map(q => (
              <div key={q.id}>
                <p style={{ fontWeight: '600', color: 'var(--color-primary-dark)', marginBottom: '12px' }}>{q.question}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {q.options.map((opt, i) => (
                    <button key={i}
                      onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.correct, [`_sel_${q.id}`]: i }))}
                      style={{ padding: '14px 20px', borderRadius: '10px', border: `2px solid ${answers[`_sel_${q.id}`] === i ? 'var(--color-primary)' : 'rgba(0,0,0,0.08)'}`, background: answers[`_sel_${q.id}`] === i ? 'rgba(168,85,247,0.1)' : 'white', color: '#374151', textAlign: 'left', cursor: 'pointer', fontWeight: answers[`_sel_${q.id}`] === i ? '600' : '400', transition: 'all 0.2s', fontFamily: 'inherit', fontSize: '1.1rem' }}>
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section I: Last 2 */}
        </section>
      )}

      {lastQ.some(q=>q.id===currentQuestionId) && (
        <section data-question-id={currentQuestionId}>
      <SectionHeader num="I" title="วิเคราะห์ความหมายและมาตราตัวสะกด (ข้อ 24-25)" icon="ฟังเสียงแล้วตอบคำถาม" />
      {lastQ.filter(q=>q.id===currentQuestionId).map(q => renderMCQCard({q}))}

      {/* Submit */}
        </section>
      )}

      <QuestionNavigation index={currentIndex} total={totalQ} onChange={setCurrentIndex} onSubmit={handleSubmit} disabled={submitting || showResult} />

    </div>
  );
}
