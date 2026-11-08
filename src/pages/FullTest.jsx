import MicButton from '../components/MicButton';
import QuestionNumbers from '../components/QuestionNumbers';
import QuestionNavigation from '../components/QuestionNavigation';
import ModalPortal from '../components/ModalPortal';
import AudioBtn from '../components/AudioButton';
import { clearExamStorage } from '../utils/examStorage';
import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { CheckCircle } from 'lucide-react';
import ExamTimer from '../components/ExamTimer';
import ResultModal from '../components/ResultModal';
import SurveyModal from '../components/SurveyModal';
import { useSessionStorage } from '../hooks/useSessionStorage';

import {
  vocabQ, announcementQ, storyQ, vocab4Q, proverbQ, listenTfQ, annColdQ, adQ, lastQ, STORY_AUDIO, STORY_IMG, ARTICLE_AUDIO, ANN_COLD_AUDIO, AD_AUDIO,
  introQ, situQ, tongueQ,
  sectionAQ, sectionBQ, readTfQ, sectionCQ, sectionDQ, readSectionEQ, ARTICLE_A, ARTICLE_B, ARTICLE_C, POEM, matchData,
  spellQ, fillQ, WORD_BANK, spellingQ, rearrangeQ, writeSectionEQ, rearrangePart5Q, essayQ
} from '../data/testData';

export default function FullTest() {
  const navigate = useNavigate();
  const { user, recordScore, submitSurvey } = useUser();
  const [answers, setAnswers] = useSessionStorage('fulltest_answers', {});
  const [selIdx, setSelIdx] = useSessionStorage('fulltest_selIdx', {});
  const [tfAnswers, setTfAnswers] = useSessionStorage('fulltest_tfAnswers', {});
  const [matchSel, setMatchSel] = useSessionStorage('fulltest_matchSel', {});
  const [textAnswers, setTextAnswers] = useSessionStorage('fulltest_textAnswers', {});
  const [speechAnswers, setSpeechAnswers] = useSessionStorage('fulltest_speechAnswers', {});
  const [usedWords, setUsedWords] = useSessionStorage('fulltest_usedWords', {});
  const [completedAudios, setCompletedAudios] = useSessionStorage('fulltest_completedAudios', {});

  const [currentIndex, setCurrentIndex] = useSessionStorage('fulltest_currentIndex', 0);
  const [savedResult,setSavedResult]=useSessionStorage('fulltest_savedResult',null);
  const [submissionId]=useSessionStorage('fulltest_submissionId',crypto.randomUUID());
  const [submitError,setSubmitError]=useState('');
  const [timeExpired,setTimeExpired]=useState(false);
  const [surveySubmitting,setSurveySubmitting]=useState(false);
  const [showSurvey, setShowSurvey] = useState(Boolean(savedResult));
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [breakdownScore, setBreakdownScore] = useState(savedResult?.breakdown || null);
  const [submitting, setSubmitting] = useState(false);
  const [finalScore, setFinalScore] = useState(savedResult?.score ?? null);



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
  const answeredCount = allQ.filter(isQuestionAnswered).length;

  const pickMcq = (qId, optCorrect, idx) => {
    setAnswers(prev => ({ ...prev, [qId]: optCorrect }));
    setSelIdx(prev => ({ ...prev, [qId]: idx }));
  };

  const progressKeys=['fulltest_answers','fulltest_selIdx','fulltest_tfAnswers','fulltest_matchSel','fulltest_textAnswers','fulltest_speechAnswers','fulltest_usedWords','fulltest_currentIndex','fulltest_timer','fulltest_completedAudios'];
  const handleSubmit=async()=>{
    if(submitting || savedResult)return;
    setSubmitting(true);setSubmitError('');
    const responses=allQ.map(q=>{
      let value='';
      if(q.type==='mcq')value=q.options?.[selIdx[q.id]]?.text || '';
      if(q.type==='tf'){
        const v=tfAnswers[q.id];
        if(v!==undefined)value=q.isReadingTf?(v==='fact'?'ข้อเท็จจริง':'ข้อคิดเห็น'):(v?'จริง':'เท็จ');
      }
      if(q.type==='match')value=matchSel[q.id] || '';
      if(q.type==='text')value=textAnswers[q.id] || '';
      if(q.type==='speaking')value=speechAnswers[q.id] || '';
      return {id:q.id,value};
    });
    try{
      const result=await recordScore({level:1,skill:'full_test',responses,submissionId});
      setSavedResult(result);setFinalScore(result.score);setBreakdownScore(result.breakdown);setShowSurvey(true);
      clearExamStorage(user.id || user._id,progressKeys);
    }catch(error){setSubmitError(error.message || 'บันทึกคะแนนไม่สำเร็จ คำตอบยังอยู่ กรุณาลองใหม่');}
    finally{setSubmitting(false);}
  };
  const handleSurveySubmit=async surveyData=>{
    if(surveySubmitting)return;
    setSurveySubmitting(true);setSubmitError('');
    try{await submitSurvey(surveyData);setShowSurvey(false);}
    catch(error){setSubmitError(error.message || 'ส่งแบบประเมินไม่สำเร็จ กรุณาลองใหม่');}
    finally{setSurveySubmitting(false);}
  };
  const reset=()=>{
    clearExamStorage(user.id || user._id,[...progressKeys,'fulltest_savedResult','fulltest_submissionId']);
    window.location.reload();
  };

  const curQ = allQ[currentIndex];


  // Render current question content based on type
  const renderQuestion = () => {
    if (!curQ) return null;

    const requiresAudioFirst = curQ.contextAudio && curQ.section.startsWith('ส่วนที่ 1');
    const audioCompleted = curQ.contextAudio ? completedAudios[curQ.contextAudio] : false;

    return (
      <div className="glass-panel exam-question-card" style={{ padding: '32px', borderRadius: '24px', background: 'white', minHeight: '450px', display: 'flex', flexDirection: 'column' }}>

        <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary)', marginBottom: '20px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '10px' }}>{curQ.section}</h3>

        {/* SHARED CONTEXT */}
        {curQ.contextDesc && <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '1.1rem', textAlign: requiresAudioFirst && !audioCompleted ? 'center' : 'left' }}>{curQ.contextDesc}</p>}
        {curQ.contextImage && <img src={curQ.contextImage} alt="" style={{ width: '100%', maxWidth: '280px', borderRadius: '12px', margin: '0 auto 20px auto', display: 'block' }} />}
        {curQ.contextAudio && (
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
            <AudioBtn
              key={`context-${curQ.id}`}
              src={curQ.contextAudio}
              label={requiresAudioFirst ? "ฟังเสียงให้จบ" : "ฟังเสียงประกอบ"}
              onComplete={() => {
                setCompletedAudios(prev => ({ ...prev, [curQ.contextAudio]: true }));
              }}
              showSeek={curQ.contextAudio === STORY_AUDIO || curQ.contextAudio === ARTICLE_AUDIO}
            />
          </div>
        )}

        {requiresAudioFirst && !audioCompleted && (
          <div className="animate-fade-in" style={{ textAlign: 'center', marginTop: 'auto', marginBottom: 'auto', padding: '24px', background: '#fef3c7', color: '#d97706', borderRadius: '16px', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 4px 12px rgba(217, 119, 6, 0.1)' }}>
            🎧 กรุณาฟังเสียงให้จบก่อน แล้วข้อสอบจะแสดงขึ้นมาโดยอัตโนมัติ
          </div>
        )}

        {(!requiresAudioFirst || audioCompleted) && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
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
        {curQ.type === 'mcq' && (() => {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: 'auto', position: 'relative' }}>
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
          );
        })()}

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
            <MicButton
              key={curQ.id}
              onResult={(text) => setSpeechAnswers(prev => ({ ...prev, [curQ.id]: text }))}
              currentText={speechAnswers[curQ.id] || ''}
              expectedText={curQ.text || ''}
              disabled={timeExpired || submitting || Boolean(savedResult)}
              placeholder="พิมพ์คำตอบสำหรับข้อนี้..."
            />
          </div>
        )}

        {curQ.type === 'text' && !curQ.sentence && curQ.words && (
          <div style={{ marginTop: 'auto', display: 'flex', gap: '10px', flexDirection: 'column' }}>
            <div className="exam-answer-row" style={{ display: 'flex', gap: '10px' }}>
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
              style={{ width: '100%', padding: '16px 20px', borderRadius: '12px', border: '2px solid rgba(139,92,246,0.3)', fontSize: '1.2rem', fontFamily: 'inherit', outline: 'none', background: 'rgba(255,255,255,0.8)', resize: 'none' }}
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
        )}

      </div>
    );
  };

  return (
    <div className="exam-page animate-fade-in" style={{ maxWidth: '700px', margin: '0 auto', paddingTop: '32px', paddingBottom: '60px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {submitError && !showSurvey && <div role="alert" style={{padding:16,background:'#fef2f2',color:'#b91c1c',marginBottom:16}}>
        <p>{submitError} — คำตอบยังอยู่</p><button onClick={handleSubmit} disabled={submitting}>ลองส่งคะแนนอีกครั้ง</button>
      </div>}
      {/* HEADER & PROGRESS */}
      <div style={{ marginBottom: '24px' }}>
        <div className="exam-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary-dark)', margin: 0 }}>ข้อสอบ 100 ข้อ</h1>
          <div style={{ fontWeight: '600', color: 'var(--text-muted)', fontSize: '1.1rem' }}>ทำแล้ว {answeredCount} / {totalQ}</div>
        </div>

        {/* Survey Modal */}
        {showSurvey && <SurveyModal onSubmit={handleSurveySubmit} error={submitError} submitting={surveySubmitting} />}

        {/* Progress Bar */}
        <div style={{ height: '8px', background: 'rgba(0,0,0,0.06)', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{ width: `${(answeredCount / totalQ) * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-primary-light), var(--color-primary))', transition: 'width 0.3s' }} />
        </div>

      <QuestionNumbers index={currentIndex} answered={allQ.map(isQuestionAnswered)} onChange={setCurrentIndex} disabled={audioBusy || submitting || Boolean(savedResult) || timeExpired} />
        <div className="exam-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 data-current-question tabIndex={-1} aria-live="polite" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>ข้อที่ {currentIndex + 1} / {totalQ}</h2>
          <ExamTimer totalSeconds={1800} onTimeUp={()=>{setTimeExpired(true);handleSubmit();}} compact storageKey="fulltest_timer" isActive={!submitting && !savedResult} />
        </div>


      </div>

      {/* QUESTION RENDER */}
      <div style={{ marginBottom: '24px' }}>
<fieldset data-question-id={curQ?.id} disabled={timeExpired || submitting || Boolean(savedResult)} style={{border:0,padding:0,margin:0,minWidth:0}}>{renderQuestion()}</fieldset>
      </div>

      <QuestionNavigation index={currentIndex} total={totalQ} onChange={setCurrentIndex} onSubmit={()=>setShowConfirmModal(true)} disabled={audioBusy || timeExpired || submitting || Boolean(savedResult)} />
      {finalScore !== null && !showSurvey && (
        <ResultModal score={finalScore} total={totalQ} breakdown={breakdownScore} onClose={() => navigate('/dashboard')} pendingCount={savedResult?.pending_count || 0} onRetry={reset} />
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <ModalPortal label="ยืนยันการส่งคำตอบ" onClose={()=>setShowConfirmModal(false)}>
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="glass-panel modal-surface" style={{ background: 'white', width: '100%', maxWidth: '400px', padding: '32px', borderRadius: '24px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', background: '#d1fae5', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCircle size={32} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '12px' }}>ยืนยันการส่งคำตอบ</h2>
            <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '1.05rem', lineHeight: '1.5' }}>
              คุณทำข้อสอบไปแล้ว {answeredCount} จาก {totalQ} ข้อ<br/>
              ต้องการส่งข้อสอบเลยหรือไม่?
            </p>
            <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
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
        </ModalPortal>
      )}
    </div>
  );
}
