import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Volume2, Play, Trophy, XCircle, ArrowRight, RefreshCw, Mic, ChevronLeft, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import ExamTimer from '../components/ExamTimer';
import ResultModal from '../components/ResultModal';
import SurveyModal from '../components/SurveyModal';

import {
  vocabQ, announcementQ, storyQ, vocab4Q, proverbQ, listenTfQ, annColdQ, adQ, lastQ, STORY_AUDIO, STORY_IMG, ARTICLE_AUDIO, ANN_COLD_AUDIO, AD_AUDIO,
  introQ, situQ, tongueQ,
  sectionAQ, sectionBQ, readTfQ, sectionCQ, sectionDQ, readSectionEQ, ARTICLE_A, ARTICLE_B, ARTICLE_C, POEM, matchData, matchAnswers,
  spellQ, fillQ, WORD_BANK, spellingQ, rearrangeQ, writeSectionEQ, rearrangePart5Q, essayQ
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
    <button onClick={play} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '14px 28px', borderRadius: '30px', border: '2px solid var(--color-primary)', background: playing ? 'var(--color-primary)' : 'white', color: playing ? 'white' : 'var(--color-primary)', fontWeight: '700', cursor: 'pointer', fontSize: '1.1rem', width: '100%', maxWidth: '250px', transition: 'all 0.2s', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(91, 33, 182, 0.15)' }}>
      {playing ? <Volume2 size={18} /> : <Play size={18} />} {playing ? 'กำลังเล่น...' : label}
    </button>
  );
}

function MicBtn({ onInteract, hasInteracted }) {
  const [recording, setRecording] = useState(false);
  return (
    <button onClick={() => {
      setRecording(!recording);
      if (!recording && onInteract) onInteract();
    }} 
    className="option-btn" style={{ padding: '14px 20px', borderRadius: '12px', border: `2px solid ${recording ? '#ef4444' : hasInteracted ? '#10b981' : 'rgba(0,0,0,0.08)'}`, background: recording ? '#fef2f2' : hasInteracted ? 'rgba(16,185,129,0.1)' : 'white', color: recording ? '#ef4444' : hasInteracted ? '#059669' : '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: '600', transition: 'all 0.2s', width: '100%' }}>
      <Mic size={20} className={recording ? "pulse-anim" : ""} /> {recording ? 'กำลังบันทึก (กดเพื่อหยุด)' : hasInteracted ? 'บันทึกสำเร็จ (กดอัดใหม่ได้)' : 'กดเพื่อตอบ (บันทึกเสียง)'}
    </button>
  );
}

export default function FullTest() {
  const navigate = useNavigate();
  const { recordScore, submitSurvey } = useUser();
  const [answers, setAnswers] = useState({});
  const [selIdx, setSelIdx] = useState({});
  const [tfAnswers, setTfAnswers] = useState({});
  const [matchSel, setMatchSel] = useState({});
  const [textAnswers, setTextAnswers] = useState({}); 
  const [speakingInteracted, setSpeakingInteracted] = useState({});

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [finalScore, setFinalScore] = useState(0);

  // Combine all questions into a flat list
  const allQ = useMemo(() => {
    let arr = [];
    const add = (items, type, section, extra = {}) => {
      items.forEach(q => arr.push({ ...q, type, section, ...extra }));
    };

    // Part 1
    add(vocabQ, 'mcq', 'ส่วนที่ 1: การฟัง (คำศัพท์)');
    add(announcementQ, 'mcq', 'ส่วนที่ 1: การฟัง (ประกาศ)');
    add(storyQ, 'mcq', 'ส่วนที่ 1: การฟัง (นิทาน)', { contextAudio: STORY_AUDIO, contextImage: STORY_IMG, contextDesc: 'นิทาน พ่อค้าเกลือกับลาขี้โกง' });
    add(vocab4Q, 'mcq', 'ส่วนที่ 1: การฟัง (คำศัพท์)');
    add(proverbQ, 'mcq', 'ส่วนที่ 1: การฟัง (สำนวน)');
    add(listenTfQ, 'tf', 'ส่วนที่ 1: การฟัง (เด็กติดจอ)', { contextAudio: ARTICLE_AUDIO, isListeningTf: true, contextDesc: 'พิจารณาว่าข้อความต่อไปนี้เป็น "จริง" หรือ "เท็จ"' });
    add(annColdQ, 'mcq', 'ส่วนที่ 1: การฟัง (ประกาศภัยหนาว)', { contextAudio: ANN_COLD_AUDIO });
    add(adQ, 'mcq', 'ส่วนที่ 1: การฟัง (โฆษณา)', { contextAudio: AD_AUDIO });
    add(lastQ, 'mcq', 'ส่วนที่ 1: การฟัง (ความหมายและการสะกดคำ)');

    // Part 2
    add(introQ, 'speaking', 'ส่วนที่ 2: การพูด (แนะนำตัว)');
    add(situQ, 'speaking', 'ส่วนที่ 2: การพูด (สถานการณ์จำลอง)');
    add(tongueQ, 'speaking', 'ส่วนที่ 2: การพูด (อ่านออกเสียง)');

    // Part 3
    add(sectionAQ, 'mcq', 'ส่วนที่ 3: การอ่าน (มารยาท)', { contextText: ARTICLE_A });
    add(sectionBQ, 'mcq', 'ส่วนที่ 3: การอ่าน (โรคหน้าฝน)', { contextText: ARTICLE_B });
    add(readTfQ, 'tf', 'ส่วนที่ 3: การอ่าน (แยกแยะข้อเท็จจริง/ข้อคิดเห็น)', { contextText: ARTICLE_B, isReadingTf: true });
    add(sectionCQ, 'mcq', 'ส่วนที่ 3: การอ่าน (สังคมสูงวัย)', { contextText: ARTICLE_C });
    add(sectionDQ, 'mcq', 'ส่วนที่ 3: การอ่าน (ระดับภาษา)');
    add(matchData, 'match', 'ส่วนที่ 3: การอ่าน (สุภาษิตพระร่วง)', { contextText: POEM, matchOptions: matchData });
    add(readSectionEQ, 'mcq', 'ส่วนที่ 3: การอ่าน (หลักภาษา)');

    // Part 4
    add(spellQ, 'text', 'ส่วนที่ 4: การเขียน (การสะกดคำ)');
    add(fillQ, 'text', 'ส่วนที่ 4: การเขียน (เติมคำในช่องว่าง)', { contextTags: WORD_BANK });
    add(spellingQ, 'text', 'ส่วนที่ 4: การเขียน (เขียนคำจากคำอ่าน)');
    add(rearrangeQ, 'text', 'ส่วนที่ 4: การเขียน (เรียงประโยค)');
    add(writeSectionEQ, 'mcq', 'ส่วนที่ 4: การเขียน (หลักภาษาไทย)');
    add(rearrangePart5Q, 'text', 'ส่วนที่ 5: การประยุกต์ใช้ภาษา (เรียงประโยค)');
    add(essayQ, 'text', 'ส่วนที่ 5: การประยุกต์ใช้ภาษา (ตอบคำถามพอสังเขป)');

    return arr;
  }, []);

  const totalQ = allQ.length;
  
  // Count answered
  let answeredCount = Object.keys(answers).length 
    + Object.keys(tfAnswers).length 
    + Object.keys(matchSel).length 
    + Object.keys(textAnswers).filter(k => textAnswers[k]?.trim() !== '').length
    + Object.keys(speakingInteracted).length;

  const pickMcq = (qId, optCorrect, idx) => {
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
    
    // MCQ
    Object.values(answers).forEach(v => { if (v === true) score++; });
    
    // T/F
    Object.entries(tfAnswers).forEach(([qId, val]) => {
      const qListen = listenTfQ.find(q => q.id === parseInt(qId));
      const qRead = readTfQ.find(q => q.id === parseInt(qId));
      if (qListen && qListen.correct === (val === 'fact' || val === true)) score++;
      if (qRead && qRead.correct === val) score++;
    });
    
    // Match
    Object.entries(matchSel).forEach(([qId, val]) => {
      if (matchAnswers[qId] === val) score++;
    });
    
    Object.entries(textAnswers).forEach(([qId, val]) => {
      const spell = spellingQ.find(q => q.id === parseInt(qId));
      const fill = fillQ.find(q => q.id === parseInt(qId));
      const rearrange = rearrangeQ.find(q => q.id === parseInt(qId));
      const rearrangePart5 = rearrangePart5Q.find(q => q.id === parseInt(qId));
      const essay = essayQ.find(q => q.id === parseInt(qId));
      const spellHint = spellQ.find(q => q.id === parseInt(qId));
      if (spell && val.trim() === spell.answer) score++;
      if (fill && val.trim() === fill.answer) score++;
      if (rearrange && val.trim() === rearrange.answer) score++;
      if (rearrangePart5 && val.trim() === rearrangePart5.answer) score++;
      if (essay && val.trim().length > 5) score++; 
      if (spellHint && val.trim() === spellHint.word) score++; 
    });
    
    // Speaking
    score += Object.keys(speakingInteracted).length;

    try { await recordScore({ level: 1, skill: 'full_test', score, maxScore: totalQ }); } catch (e) {}
    setFinalScore(score);
    setSubmitting(false);
    setShowSurvey(true);
  };

  const handleSurveySubmit = async (surveyData) => {
    try { await submitSurvey(surveyData); } catch (e) { console.error('Survey error:', e); }
    setShowSurvey(false);
    setShowResult(true);
  };

  const reset = () => {
    setAnswers({}); setSelIdx({}); setTfAnswers({}); setMatchSel({}); setTextAnswers({}); setSpeakingInteracted({});
    setCurrentIndex(0);
    setShowResult(false);
    setTimerKey(k => k + 1);
  };

  const curQ = allQ[currentIndex];

  const goNext = () => { if (currentIndex < totalQ - 1) setCurrentIndex(currentIndex + 1); };
  const goPrev = () => { if (currentIndex > 0) setCurrentIndex(currentIndex - 1); };

  // Render current question content based on type
  const renderQuestion = () => {
    if (!curQ) return null;

    return (
      <div className="glass-panel animate-fade-in" style={{ padding: '32px 24px', minHeight: '350px', display: 'flex', flexDirection: 'column' }}>
        
        <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary)', marginBottom: '20px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '10px' }}>{curQ.section}</h3>

        {/* SHARED CONTEXT */}
        {curQ.contextDesc && <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '1.1rem' }}>{curQ.contextDesc}</p>}
        {curQ.contextImage && <img src={curQ.contextImage} alt="" style={{ width: '100%', maxWidth: '280px', borderRadius: '12px', margin: '0 auto 20px auto', display: 'block' }} />}
        {curQ.contextAudio && <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}><AudioBtn src={curQ.contextAudio} label="ฟังเสียงประกอบ" /></div>}
        {curQ.contextText && (
           <div style={{ padding: '20px', marginBottom: '24px', background: 'rgba(16,185,129,0.04)', borderLeft: '4px solid #10b981', borderRadius: '0 12px 12px 0' }}>
             {curQ.type === 'match' ? (
               <pre style={{ fontFamily: 'inherit', color: 'var(--color-primary-dark)', lineHeight: '1.8', margin: 0, fontSize: '1.1rem', whiteSpace: 'pre-wrap' }}>{curQ.contextText}</pre>
             ) : (
               <p style={{ margin: 0, color: 'var(--color-primary-dark)', lineHeight: '1.8', fontSize: '1.1rem' }}>{curQ.contextText}</p>
             )}
           </div>
        )}
        {curQ.contextTags && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px', padding: '16px', background: 'rgba(16,185,129,0.05)', borderRadius: '12px' }}>
            <span style={{ fontWeight: '600', color: '#059669', marginRight: '8px', alignSelf: 'center' }}>กลุ่มคำ (ลากหรือแตะเพื่อตอบ):</span>
            {curQ.contextTags.map(w => (
              <span 
                key={w} 
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', w)}
                onClick={() => {
                  // For mobile/tablet users: clicking a word sets it to the current answer if it's a fill-in-the-blank question
                  if (curQ.sentence) {
                    setTextAnswers(prev => ({ ...prev, [curQ.id]: w }));
                  }
                }}
                style={{ 
                  padding: '8px 18px', background: 'white', borderRadius: '20px', 
                  border: '2px solid rgba(16,185,129,0.3)', color: '#059669', 
                  fontSize: '1.1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  cursor: 'grab', userSelect: 'none', touchAction: 'manipulation'
                }}>
                {w}
              </span>
            ))}
          </div>
        )}


        {/* SPECIFIC ITEM CONTEXT */}
        {curQ.script && <div style={{ padding: '14px 20px', background: 'rgba(168,85,247,0.06)', borderRadius: '10px', color: 'var(--color-primary-dark)', fontStyle: 'italic', marginBottom: '16px', lineHeight: '1.7', fontSize: '1.1rem' }}>{curQ.script}</div>}
        {curQ.saying && <div style={{ padding: '14px 20px', background: 'rgba(168,85,247,0.06)', borderRadius: '10px', color: 'var(--color-primary-dark)', fontWeight: '600', marginBottom: '16px', fontSize: '1.1rem' }}>สำนวน: {curQ.saying}</div>}
        {curQ.situation && <div style={{ padding: '10px 16px', background: 'rgba(59,130,246,0.1)', borderRadius: '10px', color: '#1e40af', fontWeight: '600', marginBottom: '16px', fontSize: '1.1rem' }}>สถานการณ์: {curQ.situation}</div>}
        {curQ.image && <img src={curQ.image} alt="" style={{ width: '100%', maxWidth: '240px', borderRadius: '12px', margin: '0 auto 20px auto', display: 'block' }} />}
        {curQ.audio && <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}><AudioBtn src={curQ.audio} label="ฟังคำถาม" /></div>}
        
        {/* TEXT PROMPTS */}
        {curQ.text && curQ.type === 'speaking' && <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--color-primary-dark)', textAlign: 'center', marginBottom: '20px' }}>"{curQ.text}"</p>}
        {curQ.prompt && <p style={{ fontWeight: '600', color: 'var(--color-primary-dark)', marginBottom: '14px', fontSize: '1.2rem' }}>{curQ.prompt}</p>}
        
        {/* MAIN QUESTION TEXT */}
        {curQ.question && <p style={{ fontWeight: 'bold', color: 'var(--color-primary-dark)', marginBottom: '20px', fontSize: '1.2rem' }}>{curQ.question}</p>}
        {curQ.statement && <p style={{ fontWeight: 'bold', color: 'var(--color-primary-dark)', marginBottom: '20px', fontSize: '1.2rem' }}>{curQ.statement}</p>}
        {curQ.verse && <p style={{ fontWeight: 'bold', color: '#1e3a8a', fontStyle: 'italic', marginBottom: '20px', fontSize: '1.2rem' }}>ข้อ {curQ.id}. "{curQ.verse}"</p>}
        {curQ.hint && curQ.type === 'text' && <p style={{ fontWeight: 'bold', color: 'var(--color-primary-dark)', marginBottom: '20px', fontSize: '1.2rem' }}>ข้อ {curQ.id}. คำศัพท์ที่หมายถึง: "{curQ.hint}"</p>}
        {curQ.sentence && (
          <p style={{ fontWeight: 'bold', color: 'var(--color-primary-dark)', marginBottom: '20px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <span>ข้อ {curQ.id}. {curQ.sentence.split('_______')[0]}</span>
            <span
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
              onDrop={(e) => {
                e.preventDefault();
                const data = e.dataTransfer.getData('text/plain');
                if (data) setTextAnswers(prev => ({ ...prev, [curQ.id]: data }));
              }}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                minWidth: '120px', height: '40px', padding: '0 16px',
                border: '2px dashed #10b981', borderRadius: '8px',
                background: textAnswers[curQ.id] ? 'rgba(16,185,129,0.1)' : 'rgba(0,0,0,0.02)',
                color: textAnswers[curQ.id] ? '#059669' : '#9ca3af',
                fontSize: textAnswers[curQ.id] ? '1.2rem' : '1rem'
              }}
            >
              {textAnswers[curQ.id] || 'ลากคำตอบมาวางที่นี่'}
            </span>
            <span>{curQ.sentence.split('_______')[1]}</span>
          </p>
        )}
        {curQ.reading && <p style={{ fontWeight: 'bold', color: 'var(--color-primary-dark)', marginBottom: '20px', fontSize: '1.2rem' }}>ข้อ {curQ.id}. {curQ.reading}</p>}
        {curQ.words && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px', fontSize: '1.2rem' }}>
            <span style={{ fontWeight: 'bold', color: 'var(--color-primary-dark)', alignSelf: 'center', marginRight: '8px' }}>ข้อ {curQ.id}. (ลากหรือแตะเพื่อเรียง)</span>
            {curQ.words.map((w, i) => (
              <span 
                key={i} 
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', w)}
                onClick={() => {
                  setTextAnswers(prev => ({ ...prev, [curQ.id]: (prev[curQ.id] || '') + w }));
                }}
                style={{ 
                  padding: '8px 16px', background: 'white', borderRadius: '8px', 
                  color: 'var(--color-primary-dark)', border: '2px solid rgba(139,92,246,0.3)',
                  cursor: 'grab', userSelect: 'none', touchAction: 'manipulation',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                {w}
              </span>
            ))}
          </div>
        )}

        {/* INPUTS / OPTIONS */}
        {curQ.type === 'mcq' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: 'auto' }}>
            {curQ.options.map((opt, i) => (
              <button key={i} onClick={() => pickMcq(curQ.id, opt.correct, i)} className="option-btn"
                style={{ padding: '16px 20px', borderRadius: '12px', border: `2px solid ${selIdx[curQ.id] === i ? '#10b981' : 'rgba(0,0,0,0.08)'}`, background: selIdx[curQ.id] === i ? 'rgba(16,185,129,0.1)' : 'white', color: '#374151', textAlign: 'left', cursor: 'pointer', fontWeight: selIdx[curQ.id] === i ? '600' : '400', transition: 'all 0.2s', fontFamily: 'inherit', fontSize: '1.1rem' }}>
                {opt.text}
              </button>
            ))}
          </div>
        )}

        {curQ.type === 'tf' && (
          <div style={{ display: 'flex', gap: '16px', marginTop: 'auto' }}>
            {[{ label: curQ.isReadingTf ? 'ข้อเท็จจริง' : 'จริง', val: curQ.isReadingTf ? 'fact' : true }, 
              { label: curQ.isReadingTf ? 'ข้อคิดเห็น' : 'เท็จ', val: curQ.isReadingTf ? 'opinion' : false }].map(({ label, val }) => (
              <button key={String(val)} onClick={() => setTfAnswers(prev => ({ ...prev, [curQ.id]: val }))} className="option-btn"
                style={{ flex: 1, padding: '16px 20px', borderRadius: '12px', border: `2px solid ${tfAnswers[curQ.id] === val ? '#10b981' : 'rgba(0,0,0,0.1)'}`, background: tfAnswers[curQ.id] === val ? 'rgba(16,185,129,0.1)' : 'white', color: tfAnswers[curQ.id] === val ? '#059669' : '#6b7280', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1.2rem', transition: 'all 0.2s' }}>
                {label}
              </button>
            ))}
          </div>
        )}

        {curQ.type === 'match' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: 'auto' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>เลือกความหมายที่ตรงกับคำประพันธ์:</p>
            {curQ.matchOptions.map(opt => (
              <button key={opt.id} onClick={() => setMatchSel(prev => ({ ...prev, [curQ.id]: opt.meaning }))} className="option-btn"
                style={{ padding: '14px 20px', borderRadius: '12px', border: `2px solid ${matchSel[curQ.id] === opt.meaning ? '#10b981' : 'rgba(0,0,0,0.08)'}`, background: matchSel[curQ.id] === opt.meaning ? 'rgba(16,185,129,0.1)' : 'white', color: '#374151', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1.1rem', transition: 'all 0.2s' }}>
                {opt.meaning}
              </button>
            ))}
          </div>
        )}

        {curQ.type === 'speaking' && (
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {curQ.hint && <div style={{ fontSize: '1.1rem', color: '#6b7280', background: '#f3f4f6', padding: '14px', borderRadius: '12px' }}>💡 แนวคำตอบ: {curQ.hint}</div>}
            <MicBtn onInteract={() => handleSpeak(curQ.id)} hasInteracted={speakingInteracted[curQ.id]} />
          </div>
        )}

        {curQ.type === 'text' && !curQ.sentence && curQ.words && (
          <div style={{ marginTop: 'auto', display: 'flex', gap: '10px', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div 
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
                onDrop={(e) => {
                  e.preventDefault();
                  const data = e.dataTransfer.getData('text/plain');
                  if (data) setTextAnswers(prev => ({ ...prev, [curQ.id]: (prev[curQ.id] || '') + data }));
                }}
                style={{ 
                  flex: 1, padding: '16px 20px', borderRadius: '12px', 
                  border: '2px dashed rgba(139,92,246,0.5)', 
                  background: textAnswers[curQ.id] ? 'rgba(139,92,246,0.05)' : 'rgba(0,0,0,0.02)', 
                  fontSize: '1.2rem', minHeight: '60px', display: 'flex', alignItems: 'center', 
                  color: textAnswers[curQ.id] ? 'var(--color-primary-dark)' : '#9ca3af' 
                }}
              >
                {textAnswers[curQ.id] || 'ลากคำมาวางเรียงกันที่นี่'}
              </div>
              <button 
                onClick={() => setTextAnswers(prev => ({ ...prev, [curQ.id]: '' }))} 
                style={{ padding: '0 20px', background: '#fef2f2', color: '#ef4444', border: '2px solid #fca5a5', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', minWidth: '100px' }}>
                ลบใหม่
              </button>
            </div>
            <p style={{ fontSize: '0.95rem', color: '#6b7280', margin: 0 }}>* หากเรียงผิด สามารถกดปุ่ม "ลบใหม่" ด้านขวาได้เลย</p>
          </div>
        )}

        {curQ.isEssay && (
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {curQ.hint && <div style={{ fontSize: '1rem', color: '#6b7280', background: '#f3f4f6', padding: '14px', borderRadius: '12px' }}>💡 {curQ.hint}</div>}
            <textarea 
              value={textAnswers[curQ.id] || ''} 
              onChange={e => setTextAnswers(prev => ({ ...prev, [curQ.id]: e.target.value }))}
              placeholder="พิมพ์คำตอบที่นี่..." 
              rows={4}
              style={{ width: '100%', padding: '16px 20px', borderRadius: '12px', border: '2px solid rgba(139,92,246,0.3)', fontSize: '1.2rem', fontFamily: 'inherit', outline: 'none', background: 'rgba(255,255,255,0.8)', resize: 'vertical' }} 
            />
          </div>
        )}

        {curQ.type === 'text' && !curQ.sentence && !curQ.words && !curQ.isEssay && (
          <div style={{ marginTop: 'auto' }}>
            <input type="text" value={textAnswers[curQ.id] || ''} onChange={e => setTextAnswers(prev => ({ ...prev, [curQ.id]: e.target.value }))}
              placeholder="พิมพ์คำตอบที่นี่..." style={{ width: '100%', padding: '16px 20px', borderRadius: '12px', border: '2px solid rgba(139,92,246,0.3)', fontSize: '1.2rem', fontFamily: 'inherit', outline: 'none', background: 'rgba(255,255,255,0.8)' }} />
          </div>
        )}

      </div>
    );
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '700px', margin: '0 auto', paddingBottom: '60px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* HEADER & PROGRESS */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary-dark)', margin: 0 }}>ข้อสอบ 100 ข้อ</h1>
          <div style={{ fontWeight: '600', color: 'var(--text-muted)', fontSize: '1.1rem' }}>ทำแล้ว {answeredCount} / {totalQ}</div>
        </div>
        
        {/* Survey Modal */}
        {showSurvey && <SurveyModal onSubmit={handleSurveySubmit} />}

        {/* Progress Bar */}
        <div style={{ height: '8px', background: 'rgba(0,0,0,0.06)', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{ width: `${(answeredCount / totalQ) * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-primary-light), var(--color-primary))', transition: 'width 0.3s' }} />
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>ข้อที่ {currentIndex + 1} / {totalQ}</div>
          <ExamTimer key={timerKey} totalSeconds={3000} onTimeUp={handleSubmit} compact />
        </div>
      </div>

      {/* QUESTION RENDER */}
      <div style={{ marginBottom: '24px' }}>
        {renderQuestion()}
      </div>

      {/* NAVIGATION BUTTONS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', gap: '16px' }}>
        <button onClick={goPrev} disabled={currentIndex === 0} className="btn-secondary"
          style={{ padding: '14px 24px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px', opacity: currentIndex === 0 ? 0.5 : 1, fontSize: '1.1rem' }}>
          <ChevronLeft size={20} /> ย้อนกลับ
        </button>

        {currentIndex === totalQ - 1 ? (
          <button onClick={handleSubmit} disabled={submitting} className="btn-primary"
            style={{ padding: '14px 32px', fontSize: '1.1rem', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '10px', background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 4px 14px rgba(16,185,129,0.3)', opacity: submitting ? 0.7 : 1 }}>
            {submitting ? <RefreshCw size={20} className="spin" /> : <Trophy size={20} />} 
            {submitting ? 'กำลังส่ง...' : 'ส่งคำตอบ'}
          </button>
        ) : (
          <button onClick={goNext} className="btn-primary"
            style={{ padding: '14px 32px', fontSize: '1.1rem', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(139,92,246,0.3)' }}>
            ถัดไป <ChevronRight size={20} />
          </button>
        )}
      </div>

      {showResult && <ResultModal score={finalScore} total={totalQ} onClose={() => navigate('/dashboard')} onRetry={reset} />}
    </div>
  );
}
