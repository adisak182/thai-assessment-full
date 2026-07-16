import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Volume2, Play, Trophy, XCircle, ArrowRight, RefreshCw, Mic, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
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
    else { 
      ref.current.src = src; 
      const p = ref.current.play();
      if (p !== undefined) p.catch(() => {});
      setPlaying(true); 
    }
  };
  useEffect(() => {
    return () => {
      if (ref.current) {
        ref.current.pause();
        ref.current.src = '';
      }
    };
  }, []);
  return (
    <button onClick={play} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '14px 28px', borderRadius: '30px', border: '2px solid var(--color-primary)', background: playing ? 'var(--color-primary)' : 'white', color: playing ? 'white' : 'var(--color-primary)', fontWeight: '700', cursor: 'pointer', fontSize: '1.1rem', width: '100%', maxWidth: '250px', transition: 'all 0.2s', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(91, 33, 182, 0.15)' }}>
      {playing ? <Volume2 size={18} /> : <Play size={18} />} {playing ? 'กำลังเล่น...' : label}
    </button>
  );
}

function MicBtn({ onResult, currentText }) {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState(false);

  const toggleListen = () => {
    if (recording) {
      setRecording(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("เบราว์เซอร์ของคุณไม่รองรับระบบแยกแยะเสียง กรุณาใช้ Chrome หรือ Edge (ระบบจะอนุโลมให้ข้ามข้อนี้ได้)");
      onResult("PASS_DUE_TO_UNSUPPORTED_BROWSER_OVERRIDE_123");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'th-TH';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setRecording(true);
      setError(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.onerror = (event) => {
      console.error(event.error);
      setError(true);
      setRecording(false);
    };

    recognition.onend = () => {
      setRecording(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
      setRecording(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
      <button onClick={toggleListen} 
        className="option-btn" style={{ padding: '14px 20px', borderRadius: '12px', border: `2px solid ${recording ? '#ef4444' : currentText ? '#10b981' : 'rgba(0,0,0,0.08)'}`, background: recording ? '#fef2f2' : currentText ? 'rgba(16,185,129,0.1)' : 'white', color: recording ? '#ef4444' : currentText ? '#059669' : '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: '600', transition: 'all 0.2s', width: '100%' }}>
        <Mic size={20} className={recording ? "pulse-anim" : ""} /> {recording ? 'กำลังฟังเสียง... (พูดได้เลย)' : currentText ? 'บันทึกเสียงแล้ว (กดเพื่อพูดใหม่)' : 'กดปุ่มแล้วเริ่มพูดได้เลย'}
      </button>
      {error && <div style={{ fontSize: '0.9rem', color: '#ef4444', textAlign: 'center' }}>ไม่สามารถใช้งานไมค์ได้ โปรดตรวจสอบการอนุญาตไมค์บนเบราว์เซอร์</div>}
      {currentText && currentText !== "PASS_DUE_TO_UNSUPPORTED_BROWSER_OVERRIDE_123" && (
        <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', color: '#334155', fontSize: '1.1rem', fontStyle: 'italic', borderLeft: '4px solid #10b981', alignSelf: 'flex-start', width: '100%' }}>
          " {currentText} "
        </div>
      )}
    </div>
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
  const [speechAnswers, setSpeechAnswers] = useState({});
  const [usedWords, setUsedWords] = useState({});

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [breakdownScore, setBreakdownScore] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [finalScore, setFinalScore] = useState(null);

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
  
  const isQuestionAnswered = useCallback((q) => {
    if (!q) return false;
    if (q.type === 'mcq') return answers[q.id] !== undefined;
    if (q.type === 'tf') return tfAnswers[q.id] !== undefined;
    if (q.type === 'match') return matchSel[q.id] !== undefined && matchSel[q.id] !== '';
    if (q.type === 'text') return typeof textAnswers[q.id] === 'string' && textAnswers[q.id].trim() !== '';
    if (q.type === 'speaking') return typeof speechAnswers[q.id] === 'string' && speechAnswers[q.id].trim() !== '';
    return false;
  }, [answers, tfAnswers, matchSel, textAnswers, speechAnswers]);

  // Count answered
  let answeredCount = Object.keys(answers).length 
    + Object.keys(tfAnswers).length 
    + Object.keys(matchSel).length 
    + Object.keys(textAnswers).filter(k => textAnswers[k]?.trim() !== '').length
    + Object.keys(speechAnswers).length;

  const pickMcq = (qId, optCorrect, idx) => {
    setAnswers(prev => ({ ...prev, [qId]: optCorrect }));
    setSelIdx(prev => ({ ...prev, [qId]: idx }));
  };

  const handleSpeechResult = (qId, text) => {
    setSpeechAnswers(prev => ({ ...prev, [qId]: text }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    
    const breakdown = {
      listening: { score: 0, max: 0, label: 'การฟัง' },
      speaking: { score: 0, max: 0, label: 'การพูด' },
      reading: { score: 0, max: 0, label: 'การอ่าน' },
      writing: { score: 0, max: 0, label: 'การเขียน' }
    };

    const getCategory = (sec) => {
      if (sec.includes('ส่วนที่ 1')) return 'listening';
      if (sec.includes('ส่วนที่ 2')) return 'speaking';
      if (sec.includes('ส่วนที่ 3')) return 'reading';
      if (sec.includes('ส่วนที่ 4') || sec.includes('ส่วนที่ 5')) return 'writing';
      return 'writing';
    };

    const detailed_results = [];

    allQ.forEach(q => {
      const cat = getCategory(q.section);
      let isCorrect = false;
      let userAnswer = '';
      let correctAnswer = '';

      if (q.type === 'mcq') {
        const selectedOpt = q.options?.find((o, idx) => selIdx[q.id] === idx);
        userAnswer = selectedOpt ? selectedOpt.text : '';
        const correctOpt = q.options?.find(o => o.correct);
        correctAnswer = correctOpt ? correctOpt.text : '';
        if (answers[q.id] === true) isCorrect = true;
      } else if (q.type === 'tf') {
        const v = tfAnswers[q.id];
        userAnswer = v === undefined ? '' : (v === 'fact' || v === true ? 'จริง' : 'เท็จ');
        correctAnswer = q.correct === true ? 'จริง' : 'เท็จ';
        if (v !== undefined) {
          if (q.isListeningTf && q.correct === (v === 'fact' || v === true)) isCorrect = true;
          if (q.isReadingTf && q.correct === v) isCorrect = true;
        }
      } else if (q.type === 'match') {
        userAnswer = matchSel[q.id] || '';
        correctAnswer = matchAnswers[q.id] || '';
        if (userAnswer === correctAnswer) isCorrect = true;
      } else if (q.type === 'text') {
        const val = (textAnswers[q.id] || '').trim();
        userAnswer = val;
        correctAnswer = q.answer || q.word || 'พิจารณาจากคำตอบ';
        if (q.answer && val === q.answer) isCorrect = true;
        else if (q.word && val === q.word) isCorrect = true;
        else if (!q.answer && !q.word && val.length > 5) isCorrect = true; // essay
      } else if (q.type === 'speaking') {
        const text = speechAnswers[q.id] || '';
        userAnswer = text;
        correctAnswer = q.text || (q.keywords ? q.keywords.join(', ') : 'พูดออกเสียงให้ถูกต้อง');
        if (text) {
          if (text === "PASS_DUE_TO_UNSUPPORTED_BROWSER_OVERRIDE_123") {
            isCorrect = true;
            userAnswer = 'เบราว์เซอร์ไม่รองรับ (อนุโลมให้ผ่าน)';
          } else if (q.text) {
            // Strict exact match for reading text (ignore spaces)
            const cleanSource = q.text.replace(/\s+/g, '');
            const cleanAnswer = text.replace(/\s+/g, '');
            if (cleanSource === cleanAnswer) isCorrect = true;
          } else if (q.keywords && q.keywords.length > 0) {
            if (q.keywords.some(kw => text.includes(kw))) isCorrect = true;
          } else {
            if (text.trim().length >= 3) isCorrect = true;
          }
        }
      }

      detailed_results.push({
        id: q.id,
        section: q.section,
        type: q.type,
        question: q.question || q.script || q.text || q.word || `ข้อ ${q.id}`,
        user_answer: userAnswer,
        correct_answer: correctAnswer,
        is_correct: isCorrect
      });

      breakdown[cat].max++;
      if (isCorrect) breakdown[cat].score++;
    });

    const score = breakdown.listening.score + breakdown.speaking.score + breakdown.reading.score + breakdown.writing.score;

    try { await recordScore({ level: 1, skill: 'full_test', score, maxScore: totalQ, breakdown, detailed_results }); } catch (e) {}
    setFinalScore(score);
    setBreakdownScore(breakdown);
    setSubmitting(false);
    setShowSurvey(true);
  };

  const handleSurveySubmit = async (surveyData) => {
    try { await submitSurvey(surveyData); } catch (e) { console.error('Survey error:', e); }
    setShowSurvey(false);
    setShowResult(true);
  };

  const reset = () => {
    setAnswers({}); setSelIdx({}); setTfAnswers({}); setMatchSel({}); setTextAnswers({}); setSpeechAnswers({}); setUsedWords({});
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
        {curQ.contextAudio && <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}><AudioBtn key={`context-${curQ.id}`} src={curQ.contextAudio} label="ฟังเสียงประกอบ" /></div>}
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
        {curQ.audio && <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}><AudioBtn key={`audio-${curQ.id}`} src={curQ.audio} label="ฟังคำถาม" /></div>}
        
        {/* TEXT PROMPTS */}
        {curQ.text && curQ.type === 'speaking' && <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--color-primary-dark)', textAlign: 'center', marginBottom: '20px' }}>"{curQ.text}"</p>}
        {curQ.prompt && <p style={{ fontWeight: '600', color: 'var(--color-primary-dark)', marginBottom: '14px', fontSize: '1.2rem' }}>{curQ.prompt}</p>}
        
        {/* MAIN QUESTION TEXT */}
        {curQ.question && <p style={{ fontWeight: 'bold', color: 'var(--color-primary-dark)', marginBottom: '20px', fontSize: '1.2rem' }}>{curQ.question}</p>}
        {curQ.statement && <p style={{ fontWeight: 'bold', color: 'var(--color-primary-dark)', marginBottom: '20px', fontSize: '1.2rem' }}>{curQ.statement}</p>}
        {curQ.verse && <p style={{ fontWeight: 'bold', color: '#1e3a8a', fontStyle: 'italic', marginBottom: '20px', fontSize: '1.2rem' }}>ข้อ {curQ.id}. "{curQ.verse}"</p>}
        {curQ.hint && curQ.type === 'text' && !curQ.isEssay && <p style={{ fontWeight: 'bold', color: 'var(--color-primary-dark)', marginBottom: '20px', fontSize: '1.2rem' }}>ข้อ {curQ.id}. คำศัพท์ที่หมายถึง: "{curQ.hint}"</p>}
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
            {curQ.words.map((w, i) => {
              const isUsed = usedWords[curQ.id]?.includes(i);
              return (
                <span 
                  key={i} 
                  draggable={!isUsed}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', w);
                    e.dataTransfer.setData('text/index', i.toString());
                  }}
                  onClick={() => {
                    if (!isUsed) {
                      setTextAnswers(prev => ({ ...prev, [curQ.id]: (prev[curQ.id] || '') + w }));
                      setUsedWords(prev => ({ ...prev, [curQ.id]: [...(prev[curQ.id] || []), i] }));
                    }
                  }}
                  style={{ 
                    padding: '8px 16px', background: isUsed ? '#f3f4f6' : 'white', borderRadius: '8px', 
                    color: isUsed ? '#9ca3af' : 'var(--color-primary-dark)', border: `2px solid ${isUsed ? 'transparent' : 'rgba(139,92,246,0.3)'}`,
                    cursor: isUsed ? 'default' : 'grab', userSelect: 'none', touchAction: 'manipulation',
                    boxShadow: isUsed ? 'none' : '0 2px 4px rgba(0,0,0,0.05)', opacity: isUsed ? 0.5 : 1
                  }}>
                  {w}
                </span>
              );
            })}
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
            {curQ.meaning && selIdx[curQ.id] !== undefined && (
              <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', color: '#166534', fontSize: '1.05rem', lineHeight: '1.6' }}>
                💡 <b>ความหมาย:</b> {curQ.meaning}
              </div>
            )}
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
            <MicBtn onResult={(txt) => handleSpeechResult(curQ.id, txt)} currentText={speechAnswers[curQ.id]} />
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
                  const idxStr = e.dataTransfer.getData('text/index');
                  if (data && idxStr) {
                    const idx = parseInt(idxStr);
                    if (!usedWords[curQ.id]?.includes(idx)) {
                      setTextAnswers(prev => ({ ...prev, [curQ.id]: (prev[curQ.id] || '') + data }));
                      setUsedWords(prev => ({ ...prev, [curQ.id]: [...(prev[curQ.id] || []), idx] }));
                    }
                  } else if (data) {
                    // Fallback if dropped from somewhere else
                    setTextAnswers(prev => ({ ...prev, [curQ.id]: (prev[curQ.id] || '') + data }));
                  }
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
                onClick={() => {
                  setTextAnswers(prev => ({ ...prev, [curQ.id]: '' }));
                  setUsedWords(prev => ({ ...prev, [curQ.id]: [] }));
                }} 
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
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>ข้อที่ {currentIndex + 1} / {totalQ}</div>
          <ExamTimer key={timerKey} totalSeconds={2100} onTimeUp={handleSubmit} compact />
        </div>
        
        {/* Navigation Grid */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '12px 8px', background: 'rgba(255,255,255,0.7)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}>
          {allQ.map((q, idx) => {
            const answered = isQuestionAnswered(q);
            const active = currentIndex === idx;
            return (
              <button 
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                title={answered ? `ข้อ ${idx+1} ตอบแล้ว` : `ข้อ ${idx+1} ยังไม่ได้ตอบ`}
                style={{
                  minWidth: '36px', height: '36px', borderRadius: '50%', 
                  background: active ? 'var(--color-primary)' : (answered ? '#10b981' : '#ef4444'),
                  color: 'white', border: 'none', fontWeight: 'bold', fontSize: '0.9rem',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: active ? '0 0 0 4px rgba(139,92,246,0.3)' : 'none',
                  transition: 'all 0.2s',
                  transform: active ? 'scale(1.15)' : 'scale(1)'
                }}
              >
                {idx + 1}
              </button>
            );
          })}
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
          <button onClick={() => setShowConfirmModal(true)} disabled={submitting} className="btn-primary"
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
        {finalScore !== null && !showSurvey && (
          <ResultModal score={finalScore} total={totalQ} breakdown={breakdownScore} onClose={() => navigate('/dashboard')} onRetry={() => window.location.reload()} />
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="glass-panel animate-scale-in" style={{ background: 'white', width: '100%', maxWidth: '400px', padding: '32px', borderRadius: '24px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', background: '#d1fae5', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCircle size={32} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '12px' }}>ยืนยันการส่งคำตอบ</h2>
            <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '1.05rem', lineHeight: '1.5' }}>
              คุณทำข้อสอบไปแล้ว {answeredCount} จาก {totalQ} ข้อ<br/>
              ต้องการส่งข้อสอบเลยหรือไม่?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={() => setShowConfirmModal(false)}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={e => e.target.style.background = '#f8fafc'}
                onMouseLeave={e => e.target.style.background = 'white'}
              >
                ยกเลิก
              </button>
              <button 
                onClick={() => {
                  setShowConfirmModal(false);
                  handleSubmit();
                }}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#10b981', color: 'white', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.target.style.transform = 'scale(1.05)'; e.target.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)' }}
                onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)' }}
              >
                ยืนยันส่งข้อสอบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
