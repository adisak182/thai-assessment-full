import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Volume2, Play, Trophy, XCircle, ArrowRight, RefreshCw, Mic } from 'lucide-react';
import confetti from 'canvas-confetti';
import ExamTimer from '../components/ExamTimer';

import {
  vocabQ, announcementQ, storyQ, vocab4Q, proverbQ, listenTfQ, annColdQ, adQ, lastQ, STORY_AUDIO, STORY_IMG, ARTICLE_AUDIO, ANN_COLD_AUDIO, AD_AUDIO,
  introQ, situQ, tongueQ,
  sectionAQ, sectionBQ, readTfQ, sectionCQ, sectionDQ, readSectionEQ, ARTICLE_A, ARTICLE_B, ARTICLE_C, POEM, matchData, matchAnswers,
  spellQ, fillQ, WORD_BANK, spellingQ, rearrangeQ, writeSectionEQ, sectionFQ, PASSAGE_F
} from '../data/testData';

// Reusable Audio Button
function AudioBtn({ src, label = 'ฟังเสียง' }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const play = () => {
    if (!ref.current) {
      ref.current = new Audio(src);
      ref.current.onended = () => setPlaying(false);
    }
    if (playing) { ref.current.pause(); ref.current.currentTime = 0; setPlaying(false); }
    else { ref.current.src = src; ref.current.play().catch(() => {}); setPlaying(true); }
  };
  useEffect(() => () => ref.current?.pause(), []);
  return (
    <button onClick={play} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px 32px', borderRadius: '30px', border: '2px solid var(--color-primary)', background: playing ? 'var(--color-primary)' : 'white', color: playing ? 'white' : 'var(--color-primary)', fontWeight: '700', cursor: 'pointer', fontSize: '1.25rem', width: '100%', maxWidth: '300px', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(91, 33, 182, 0.15)' }}>
      {playing ? <Volume2 size={18} /> : <Play size={18} />} {playing ? 'กำลังเล่น...' : label}
    </button>
  );
}

function MicBtn() {
  const [recording, setRecording] = useState(false);
  return (
    <button onClick={() => setRecording(!recording)} className="option-btn" style={{ padding: '14px 20px', borderRadius: '12px', border: `2px solid ${recording ? '#ef4444' : 'rgba(0,0,0,0.08)'}`, background: recording ? '#fef2f2' : 'white', color: recording ? '#ef4444' : '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: '600', transition: 'all 0.2s', width: '100%' }}>
      <Mic size={20} className={recording ? "pulse-anim" : ""} /> {recording ? 'กำลังบันทึก (กดเพื่อหยุด)' : 'กดเพื่อตอบ (บันทึกเสียง)'}
    </button>
  );
}

function SectionHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: '24px', marginTop: '40px', paddingBottom: '12px', borderBottom: '2px solid rgba(139, 92, 246, 0.2)' }}>
      <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--color-primary)', margin: 0 }}>{title}</h3>
      {sub && <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '1.1rem' }}>{sub}</p>}
    </div>
  );
}

function ResultModal({ score, total, onClose, onRetry }) {
  const pct = Math.round((score / total) * 100);
  const passed = pct >= 60;
  const fire = useCallback(() => confetti({ particleCount: 150, spread: 80, origin: { y: 0.55 }, scalar: 1.3, colors: ['#a855f7', '#7c3aed', '#fbbf24', '#10b981'], zIndex: 9999 }), []);
  useEffect(() => { if (passed) { fire(); setTimeout(fire, 1000); } }, [passed, fire]);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div className="animate-fade-in" style={{ background: 'white', borderRadius: '24px', padding: '48px 40px', maxWidth: '480px', width: '100%', textAlign: 'center', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ width: '90px', height: '90px', borderRadius: '50%', margin: '0 auto 24px', background: passed ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#ef4444,#dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          {passed ? <Trophy size={44} /> : <XCircle size={44} />}
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: passed ? '#059669' : '#dc2626', marginBottom: '8px' }}>{passed ? '🎉 ยอดเยี่ยม!' : '❌ ยังไม่ผ่านเกณฑ์'}</h2>
        <p style={{ color: '#6b7280', marginBottom: '28px' }}>{passed ? 'คุณทำแบบทดสอบ 100 ข้อเสร็จสมบูรณ์แล้ว!' : 'ลองทำใหม่อีกครั้งได้เลยนะครับ'}</p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '28px' }}>
          <div style={{ padding: '16px 28px', background: 'rgba(168,85,247,0.08)', borderRadius: '16px', border: '2px solid rgba(168,85,247,0.2)' }}>
            <div style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: '4px' }}>คะแนน</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-primary)', lineHeight: 1 }}>{score}</div>
            <div style={{ fontSize: '1.1rem', color: '#9ca3af' }}>จาก {total}</div>
          </div>
          <div style={{ padding: '16px 28px', background: passed ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', borderRadius: '16px', border: `2px solid ${passed ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
            <div style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: '4px' }}>ร้อยละ</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: passed ? '#059669' : '#dc2626', lineHeight: 1 }}>{pct}%</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={onRetry} className="btn-secondary" style={{ padding: '12px 24px', borderRadius: '30px' }}>ทำใหม่อีกครั้ง</button>
          <button onClick={onClose} className="btn-primary" style={{ padding: '12px 28px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ArrowRight size={18} /> ดูผลและออก
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FullTest() {
  const navigate = useNavigate();
  const { recordScore } = useUser();
  const [answers, setAnswers] = useState({});
  const [selIdx, setSelIdx] = useState({});
  const [tfAnswers, setTfAnswers] = useState({});
  const [matchSel, setMatchSel] = useState({});
  const [textAnswers, setTextAnswers] = useState({}); // For fill in the blank
  
  const [showResult, setShowResult] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [finalScore, setFinalScore] = useState(0);

  const totalQ = 100;
  
  // Count answered
  let answeredCount = Object.keys(answers).length;
  answeredCount += Object.keys(tfAnswers).length;
  answeredCount += Object.keys(matchSel).length;
  answeredCount += Object.keys(textAnswers).filter(k => textAnswers[k]?.trim() !== '').length;
  // Note: Speaking tasks (15) are just assumed answered if they interact or if we don't strictly grade them on client. 
  // For simplicity, let's just count them as automatically correct or require the user to interact.
  // Actually, Speaking tests in the original were auto-graded or graded by clicking mic.
  // We'll give automatic points for speaking if they click it, or we just give them the points.
  const [speakingInteracted, setSpeakingInteracted] = useState({});

  const pick = (qId, optCorrect, idx) => {
    setAnswers(prev => ({ ...prev, [qId]: optCorrect }));
    setSelIdx(prev => ({ ...prev, [qId]: idx }));
  };

  const handleSpeak = (qId) => {
    setSpeakingInteracted(prev => ({ ...prev, [qId]: true }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    let score = 0;
    Object.values(answers).forEach(v => { if (v === true) score++; });
    Object.entries(tfAnswers).forEach(([qId, val]) => {
      const qListen = listenTfQ.find(q => q.id === parseInt(qId));
      const qRead = readTfQ.find(q => q.id === parseInt(qId));
      if (qListen && qListen.correct === (val === 'fact' || val === true)) score++;
      if (qRead && qRead.correct === val) score++;
    });
    Object.entries(matchSel).forEach(([qId, val]) => {
      if (matchAnswers[qId] === val) score++;
    });
    // Check spelling/fill text answers
    Object.entries(textAnswers).forEach(([qId, val]) => {
      const spell = spellingQ.find(q => q.id === parseInt(qId));
      const fill = fillQ.find(q => q.id === parseInt(qId));
      const rearrange = rearrangeQ.find(q => q.id === parseInt(qId));
      if (spell && val.trim() === spell.answer) score++;
      if (fill && val.trim() === fill.answer) score++;
      if (rearrange && val.trim() === rearrange.answer) score++;
    });
    // Add speaking score
    score += Object.keys(speakingInteracted).length;

    try { await recordScore({ level: 1, skill: 'full_test', score, maxScore: totalQ }); } catch (e) {}
    setFinalScore(score);
    setShowResult(true);
    setSubmitting(false);
  };

  const reset = () => {
    setAnswers({}); setSelIdx({}); setTfAnswers({}); setMatchSel({}); setTextAnswers({}); setSpeakingInteracted({});
    setShowResult(false);
    setTimerKey(k => k + 1);
  };

  const MCQCard = ({ q }) => (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '16px' }}>
      {q.script && <div style={{ padding: '14px 20px', background: 'rgba(168,85,247,0.06)', borderRadius: '10px', color: 'var(--color-primary-dark)', fontStyle: 'italic', marginBottom: '12px', lineHeight: '1.7', fontSize: '1.1rem' }}>{q.script}</div>}
      {q.saying && <div style={{ padding: '14px 20px', background: 'rgba(168,85,247,0.06)', borderRadius: '10px', color: 'var(--color-primary-dark)', fontWeight: '600', marginBottom: '12px', fontSize: '1.1rem' }}>สำนวน: {q.saying}</div>}
      {q.image && <img src={q.image} alt="" style={{ width: '100%', maxWidth: '240px', borderRadius: '12px', margin: '0 auto 16px auto', display: 'block' }} />}
      {q.audio && <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}><AudioBtn src={q.audio} /></div>}
      <p style={{ fontWeight: '600', color: 'var(--color-primary-dark)', marginBottom: '14px' }}>{q.question}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {q.options.map((opt, i) => (
          <button key={i} onClick={() => pick(q.id, opt.correct, i)} className="option-btn"
            style={{ padding: '14px 20px', borderRadius: '10px', border: `2px solid ${selIdx[q.id] === i ? '#10b981' : 'rgba(0,0,0,0.08)'}`, background: selIdx[q.id] === i ? 'rgba(16,185,129,0.1)' : 'white', color: '#374151', textAlign: 'left', cursor: 'pointer', fontWeight: selIdx[q.id] === i ? '600' : '400', transition: 'all 0.2s', fontFamily: 'inherit', fontSize: '1.1rem' }}>
            {opt.text}
          </button>
        ))}
      </div>
    </div>
  );

  const SpeakingCard = ({ q }) => (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '16px' }}>
      {q.situation && <div style={{ padding: '10px 16px', background: 'rgba(59,130,246,0.1)', borderRadius: '10px', color: '#1e40af', fontWeight: '600', marginBottom: '12px', fontSize: '1.1rem' }}>สถานการณ์: {q.situation}</div>}
      {q.text && <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--color-primary-dark)', textAlign: 'center', marginBottom: '20px' }}>"{q.text}"</p>}
      {q.prompt && <p style={{ fontWeight: '600', color: 'var(--color-primary-dark)', marginBottom: '14px', fontSize: '1.2rem' }}>{q.prompt}</p>}
      {q.question && <p style={{ fontWeight: '600', color: 'var(--color-primary-dark)', marginBottom: '14px', fontSize: '1.2rem' }}>{q.question}</p>}
      
      {q.audio && <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}><AudioBtn src={q.audio} label="ฟัง" /></div>}
      {q.hint && <div style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: '16px', background: '#f3f4f6', padding: '12px', borderRadius: '10px' }}>💡 แนวคำตอบ: {q.hint}</div>}
      
      <div onClick={() => handleSpeak(q.id)}>
        <MicBtn />
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '60px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 'bold', color: 'var(--color-primary-dark)', margin: '0 0 8px' }}>แบบทดสอบรวม 100 ข้อ</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', margin: 0 }}>ทำรวดเดียวให้ครบ 100 ข้อ (เวลา 50 นาที)</p>
      </div>

      <ExamTimer key={timerKey} totalSeconds={3000} onTimeUp={handleSubmit} />

      {/* ================= PART 1: LISTENING ================= */}
      <h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary)', marginTop: '40px', borderBottom: '3px solid var(--color-primary)', paddingBottom: '10px' }}>ส่วนที่ 1: ทักษะการฟัง</h2>
      <SectionHeader title="มารยาทการฟังและการดู (ข้อ 1-3)" sub="ฟังคำศัพท์และเลือกคำอ่านให้ถูกต้อง" />
      {vocabQ.map(q => <MCQCard key={q.id} q={q} />)}
      
      <SectionHeader title="การฟังประกาศ (ข้อ 4-6)" sub="ฟังประกาศแล้วตอบคำถาม" />
      {announcementQ.map(q => <MCQCard key={q.id} q={q} />)}

      <SectionHeader title="นิทาน พ่อค้าเกลือกับลาขี้โกง (ข้อ 7-9)" sub="ฟังนิทานจนจบ แล้วตอบคำถาม" />
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', marginBottom: '20px', textAlign: 'center' }}>
          <img src={STORY_IMG} alt="นิทาน" style={{ width: '180px', borderRadius: '12px' }} />
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}><AudioBtn src={STORY_AUDIO} /></div>
          <p style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.8' }}>พ่อค้าคนหนึ่งมีลาไว้บรรทุกสิ่งของ วันหนึ่งเขาพาลาเดินทางไปซื้อเกลือในเมือง... ลาแกล้งตกน้ำเพื่อให้เกลือละลาย แต่เมื่อพ่อค้าเปลี่ยนมาบรรทุกนุ่นแทน ลาก็เป็นฝ่ายเดือดร้อนเอง</p>
        </div>
      </div>
      {storyQ.map(q => <MCQCard key={q.id} q={q} />)}

      <SectionHeader title="คำศัพท์และสำนวน (ข้อ 10-14)" sub="ฟังคำศัพท์/สำนวน แล้วตอบคำถาม" />
      {vocab4Q.map(q => <MCQCard key={q.id} q={q} />)}
      {proverbQ.map(q => <MCQCard key={q.id} q={q} />)}

      <SectionHeader title="บทความ เด็กเล็กติดจอมือถือ (ข้อ 15-19)" sub="ฟังบทความ แล้วเลือก จริง หรือ เท็จ" />
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '20px' }}><AudioBtn src={ARTICLE_AUDIO} /></div>
        <p style={{ fontWeight: '600', color: 'var(--color-primary-dark)', marginBottom: '16px' }}>ให้พิจารณาว่าแต่ละข้อความเป็น "จริง" หรือ "เท็จ"</p>
        {listenTfQ.map(q => (
          <div key={q.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.06)', flexWrap: 'wrap' }}>
            <p style={{ margin: 0, color: 'var(--color-primary-dark)', fontSize: '1.1rem', flex: 1, minWidth: '200px' }}>{q.statement}</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              {[{ label: 'จริง', val: true }, { label: 'เท็จ', val: false }].map(({ label, val }) => (
                <button key={String(val)} onClick={() => setTfAnswers(prev => ({ ...prev, [q.id]: val }))} className="option-btn"
                  style={{ padding: '10px 18px', borderRadius: '20px', border: `2px solid ${tfAnswers[q.id] === val ? '#10b981' : 'rgba(0,0,0,0.1)'}`, background: tfAnswers[q.id] === val ? 'rgba(16,185,129,0.1)' : 'white', color: tfAnswers[q.id] === val ? '#059669' : '#6b7280', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1.1rem', transition: 'all 0.2s' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <SectionHeader title="การฟังประกาศและโฆษณา (ข้อ 20-23)" sub="ฟังและตอบคำถาม" />
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '20px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}><AudioBtn src={ANN_COLD_AUDIO} /></div>
      </div>
      {annColdQ.map(q => <MCQCard key={q.id} q={q} />)}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '20px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}><AudioBtn src={AD_AUDIO} /></div>
      </div>
      {adQ.map(q => <MCQCard key={q.id} q={q} />)}

      <SectionHeader title="ความหมายและการสะกดคำ (ข้อ 24-25)" sub="ฟังประโยคแล้วตอบคำถาม" />
      {lastQ.map(q => <MCQCard key={q.id} q={q} />)}

      {/* ================= PART 2: SPEAKING ================= */}
      <h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary)', marginTop: '60px', borderBottom: '3px solid var(--color-primary)', paddingBottom: '10px' }}>ส่วนที่ 2: ทักษะการพูด</h2>
      
      <SectionHeader title="การแนะนำตัว (ข้อ 26-30)" sub="ตอบคำถามพื้นฐานเกี่ยวกับการแนะนำตัว" />
      {introQ.map(q => <SpeakingCard key={q.id} q={q} />)}
      
      <SectionHeader title="การสื่อสารในชีวิตประจำวัน (ข้อ 31-35)" sub="ตอบโต้ในสถานการณ์จำลอง" />
      {situQ.map(q => <SpeakingCard key={q.id} q={q} />)}
      
      <SectionHeader title="การออกเสียง (ข้อ 36-40)" sub="อ่านออกเสียงประโยคให้ชัดเจนและถูกต้อง" />
      {tongueQ.map(q => <SpeakingCard key={q.id} q={q} />)}


      {/* ================= PART 3: READING ================= */}
      <h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary)', marginTop: '60px', borderBottom: '3px solid var(--color-primary)', paddingBottom: '10px' }}>ส่วนที่ 3: ทักษะการอ่าน</h2>
      
      <SectionHeader title="มารยาทการฟังและการดู (ข้อ 41-45)" sub="อ่านบทความแล้วตอบคำถาม" />
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px', background: 'rgba(16,185,129,0.04)', borderLeft: '4px solid #10b981' }}>
        <p style={{ margin: 0, color: 'var(--color-primary-dark)', lineHeight: '1.9', fontSize: '1.1rem' }}>{ARTICLE_A}</p>
      </div>
      {sectionAQ.map(q => <MCQCard key={q.id} q={q} />)}

      <SectionHeader title="6 โรคที่มากับหน้าฝน (ข้อ 46-55)" sub="อ่านบทความ ตอบคำถาม และแยกแยะข้อเท็จจริง/ข้อคิดเห็น" />
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px', background: 'rgba(16,185,129,0.04)', borderLeft: '4px solid #10b981' }}>
        <p style={{ margin: 0, color: 'var(--color-primary-dark)', lineHeight: '1.9', fontSize: '1.1rem' }}>{ARTICLE_B}</p>
      </div>
      {sectionBQ.map(q => <MCQCard key={q.id} q={q} />)}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '20px' }}>
        <p style={{ fontWeight: '600', color: 'var(--color-primary-dark)', marginBottom: '16px' }}>ให้พิจารณาว่าแต่ละข้อความเป็น "ข้อเท็จจริง" หรือ "ข้อคิดเห็น"</p>
        {readTfQ.map(q => (
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

      <SectionHeader title="สังคมสูงวัยกับเศรษฐกิจดิจิทัล (ข้อ 56-60)" sub="อ่านบทความเชิงวิเคราะห์แล้วตอบคำถาม" />
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px', background: 'rgba(16,185,129,0.04)', borderLeft: '4px solid #10b981' }}>
        <p style={{ margin: 0, color: 'var(--color-primary-dark)', lineHeight: '1.9', fontSize: '1.1rem' }}>{ARTICLE_C}</p>
      </div>
      {sectionCQ.map(q => <MCQCard key={q.id} q={q} />)}

      <SectionHeader title="ระดับภาษา (ข้อ 61-65)" sub="วิเคราะห์ระดับภาษาในแต่ละสถานการณ์" />
      {sectionDQ.map(q => <MCQCard key={q.id} q={q} />)}

      <SectionHeader title="คำประพันธ์สุภาษิตพระร่วง (ข้อ 66-70)" sub="จับคู่ความหมายและตอบคำถาม" />
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '16px', background: 'rgba(16,185,129,0.04)', borderLeft: '4px solid #10b981' }}>
        <pre style={{ fontFamily: 'Kanit, sans-serif', color: 'var(--color-primary-dark)', lineHeight: '2', margin: 0, fontSize: '1.1rem', whiteSpace: 'pre-wrap' }}>{POEM}</pre>
        <p style={{ margin: '8px 0 0', fontSize: '1.1rem', color: 'var(--text-muted)', textAlign: 'right' }}>— สุภาษิตพระร่วง</p>
      </div>
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '16px' }}>
        <p style={{ fontWeight: '600', color: 'var(--color-primary-dark)', marginBottom: '16px' }}>จับคู่คำประพันธ์ (ข้อ 66-69) ให้ตรงกับความหมาย:</p>
        {matchData.map(m => {
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
      {readSectionEQ.map(q => <MCQCard key={q.id} q={q} />)}


      {/* ================= PART 4: WRITING ================= */}
      <h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary)', marginTop: '60px', borderBottom: '3px solid var(--color-primary)', paddingBottom: '10px' }}>ส่วนที่ 4: ทักษะการเขียน</h2>
      
      <SectionHeader title="การสะกดคำ (ข้อ 71-72)" sub="พิมพ์คำศัพท์ให้ถูกต้องตามความหมาย" />
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '20px' }}>
        {spellQ.map(q => (
          <div key={q.id} style={{ marginBottom: '24px' }}>
            <p style={{ fontWeight: '600', color: 'var(--color-primary-dark)', marginBottom: '12px' }}>ข้อ {q.id}. คำศัพท์ที่หมายถึง: "{q.hint}"</p>
            {q.image && <img src={q.image} alt="" style={{ width: '220px', borderRadius: '12px', margin: '0 auto 16px auto', display: 'block' }} />}
            <input type="text" value={textAnswers[q.id] || ''} onChange={e => setTextAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
              placeholder="พิมพ์คำตอบที่นี่..." style={{ width: '100%', padding: '14px 20px', borderRadius: '12px', border: '2px solid rgba(139,92,246,0.3)', fontSize: '1.1rem', fontFamily: 'inherit', outline: 'none' }} />
          </div>
        ))}
      </div>

      <SectionHeader title="เติมคำในช่องว่าง (ข้อ 73-75)" sub="เลือกคำจากกลุ่มคำที่กำหนดให้ ไปเติมในช่องว่าง" />
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px', padding: '16px', background: 'rgba(16,185,129,0.05)', borderRadius: '12px' }}>
          <span style={{ fontWeight: '600', color: '#059669', marginRight: '8px' }}>กลุ่มคำ:</span>
          {WORD_BANK.map(w => <span key={w} style={{ padding: '6px 14px', background: 'white', borderRadius: '20px', border: '1px solid rgba(16,185,129,0.2)', color: '#059669', fontSize: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>{w}</span>)}
        </div>
        {fillQ.map(q => (
          <div key={q.id} style={{ marginBottom: '24px' }}>
            <p style={{ fontWeight: '600', color: 'var(--color-primary-dark)', marginBottom: '12px' }}>ข้อ {q.id}. {q.sentence.replace('_______', '...')}</p>
            <input type="text" value={textAnswers[q.id] || ''} onChange={e => setTextAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
              placeholder="พิมพ์คำที่ต้องการเติม..." style={{ width: '100%', padding: '14px 20px', borderRadius: '12px', border: '2px solid rgba(139,92,246,0.3)', fontSize: '1.1rem', fontFamily: 'inherit', outline: 'none' }} />
          </div>
        ))}
      </div>

      <SectionHeader title="เขียนคำจากคำอ่าน (ข้อ 76-80)" sub="พิมพ์คำศัพท์ให้ถูกต้องตามคำอ่าน" />
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '20px' }}>
        {spellingQ.map(q => (
          <div key={q.id} style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <p style={{ fontWeight: '600', color: 'var(--color-primary-dark)', margin: 0, minWidth: '180px', fontSize: '1.1rem' }}>ข้อ {q.id}. {q.reading}</p>
            <input type="text" value={textAnswers[q.id] || ''} onChange={e => setTextAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
              placeholder="เขียนคำที่ถูกต้อง..." style={{ flex: 1, minWidth: '200px', padding: '12px 20px', borderRadius: '12px', border: '2px solid rgba(139,92,246,0.3)', fontSize: '1.1rem', fontFamily: 'inherit', outline: 'none' }} />
          </div>
        ))}
      </div>

      <SectionHeader title="เรียงประโยค (ข้อ 81-85)" sub="นำคำที่กำหนดให้มาเรียงเป็นประโยคที่สมบูรณ์" />
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '20px' }}>
        {rearrangeQ.map(q => (
          <div key={q.id} style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontWeight: '600', color: 'var(--color-primary-dark)' }}>ข้อ {q.id}.</span>
              {q.words.map((w, i) => <span key={i} style={{ padding: '4px 12px', background: 'rgba(0,0,0,0.04)', borderRadius: '6px', color: '#4b5563' }}>{w}</span>)}
            </div>
            <input type="text" value={textAnswers[q.id] || ''} onChange={e => setTextAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
              placeholder="พิมพ์ประโยคที่เรียงแล้ว..." style={{ width: '100%', padding: '14px 20px', borderRadius: '12px', border: '2px solid rgba(139,92,246,0.3)', fontSize: '1.1rem', fontFamily: 'inherit', outline: 'none' }} />
          </div>
        ))}
      </div>

      <SectionHeader title="หลักภาษาไทย (ข้อ 86-90)" sub="เลือกคำตอบที่ถูกต้องที่สุด" />
      {writeSectionEQ.map(q => <MCQCard key={q.id} q={q} />)}

      <SectionHeader title="การอ่านจับใจความ (ข้อ 91-100)" sub="อ่านบทความแล้วตอบคำถาม" />
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px', background: 'rgba(16,185,129,0.04)', borderLeft: '4px solid #10b981' }}>
        <p style={{ margin: 0, color: 'var(--color-primary-dark)', lineHeight: '1.9', fontSize: '1.1rem' }}>{PASSAGE_F}</p>
      </div>
      {sectionFQ.map(q => <MCQCard key={q.id} q={q} />)}


      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <button onClick={handleSubmit} disabled={submitting} className="btn-primary"
          style={{ padding: '16px 48px', fontSize: '1.2rem', borderRadius: '30px', display: 'inline-flex', alignItems: 'center', gap: '14px', background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 8px 20px rgba(16,185,129,0.4)', opacity: submitting ? 0.7 : 1 }}>
          {submitting ? <><RefreshCw size={20} className="spin" /> บันทึก...</> : <><Trophy size={20} /> ส่งคำตอบ 100 ข้อ</>}
        </button>
        <p style={{ color: 'var(--text-muted)', marginTop: '12px', fontSize: '1.1rem' }}>ตอบแล้ว {answeredCount} จาก {totalQ} ข้อ</p>
      </div>

      {showResult && <ResultModal score={finalScore} total={totalQ} onClose={() => navigate('/dashboard')} onRetry={reset} />}
    </div>
  );
}
