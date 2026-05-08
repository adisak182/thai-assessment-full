import { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Volume2, CheckCircle, XCircle, ArrowRight, Play, RefreshCw, Headphones } from 'lucide-react';
import { useUser } from '../context/UserContext';

const l2Questions = {
  vocab: [
    {
      q: 'ข้อ 1: จงเลือกคำศัพท์ที่ถูกต้องตรงกับเสียงที่ได้ยิน',
      audio: '/audio/l2_listen_q1.mp3',
      options: [
        { text: 'กงสน', isCorrect: false },
        { text: 'กงสุล', isCorrect: true },
        { text: 'กงสุน', isCorrect: false },
        { text: 'กงศุล', isCorrect: false }
      ]
    },
    {
      q: 'ข้อ 2: จงเลือกคำศัพท์ที่ถูกต้องตรงกับเสียงที่ได้ยิน',
      audio: '/audio/l2_listen_q2.mp3',
      options: [
        { text: 'วาทศิลป์', isCorrect: true },
        { text: 'วาทสิน', isCorrect: false },
        { text: 'วาทศิล', isCorrect: false },
        { text: 'วาทสินป์', isCorrect: false }
      ]
    }
  ],
  idiom: [
    {
      q: 'ข้อ 3: จงเลือกความหมายของสำนวนที่ได้ยิน',
      audio: '/audio/l2_listen_q3.mp3',
      options: [
        { text: 'เลือกทำสิ่งที่ง่ายที่สุด', isCorrect: false },
        { text: 'ทำงานอย่างตั้งใจและรอบคอบ', isCorrect: false },
        { text: 'ทำสิ่งใดสิ่งหนึ่งเพียงอย่างเดียว', isCorrect: false },
        { text: 'ทำหลายอย่างพร้อมกันจนไม่สำเร็จสักอย่าง', isCorrect: true }
      ]
    },
    {
      q: 'ข้อ 4: จงเลือกความหมายของสำนวนที่ได้ยิน',
      audio: '/audio/l2_listen_q4.mp3',
      options: [
        { text: 'รีบทำเมื่อมีโอกาสดี', isCorrect: true },
        { text: 'ทำงานอย่างไม่เร่งรีบ', isCorrect: false },
        { text: 'ทำงานตามลำดับขั้นตอน', isCorrect: false },
        { text: 'รอเวลาที่เหมาะสมก่อนลงมือทำ', isCorrect: false }
      ]
    },
    {
      q: 'ข้อ 5: จงเลือกความหมายของสำนวนที่ได้ยิน',
      audio: '/audio/l2_listen_q5.mp3',
      options: [
        { text: 'ทำงานอย่างมีความสุข', isCorrect: false },
        { text: 'ทำงานด้วยความรวดเร็ว', isCorrect: false },
        { text: 'ช่วยเหลือผู้อื่นอย่างเต็มที่', isCorrect: false },
        { text: 'ไม่ช่วยแล้วยังขัดขวางผู้อื่น', isCorrect: true }
      ]
    }
  ],
  article_mcq: [
    {
      q: 'ข้อ 6: เด็กที่ติดจอจะส่งผลเสียกี่ด้าน',
      options: [
        { text: '2 ด้าน', isCorrect: false },
        { text: '3 ด้าน', isCorrect: false },
        { text: '4 ด้าน', isCorrect: true },
        { text: '5 ด้าน', isCorrect: false }
      ]
    },
    {
      q: 'ข้อ 7: ข้อใดส่งผลกระทบด้านการสื่อสาร',
      options: [
        { text: 'พูดช้า พูดไม่ชัด', isCorrect: true },
        { text: 'หงุดหงิดง่าย', isCorrect: false },
        { text: 'เหนื่อยง่าย', isCorrect: false },
        { text: 'ก้าวร้าว', isCorrect: false }
      ]
    },
    {
      q: 'ข้อ 8: การจ้องจอนานส่งผลเสียอย่างไร',
      options: [
        { text: 'ไอ', isCorrect: false },
        { text: 'หูตึง', isCorrect: false },
        { text: 'ปวดหัว', isCorrect: false },
        { text: 'สายตาสั้น', isCorrect: true }
      ]
    },
    {
      q: 'ข้อ 9: เด็กติดจอจะมีอารมณ์แบบใด',
      options: [
        { text: 'ใจเย็น', isCorrect: false },
        { text: 'ร่าเริง', isCorrect: false },
        { text: 'กล้าหาญ', isCorrect: false },
        { text: 'หงุดหงิดง่าย', isCorrect: true }
      ]
    },
    {
      q: 'ข้อ 10: เด็กอายุ 2 – 5 ปี ควรใช้จอกี่ชั่วโมงต่อวัน',
      options: [
        { text: '1 ชม.', isCorrect: true },
        { text: '2 ชม.', isCorrect: false },
        { text: '3 ชม.', isCorrect: false },
        { text: '5 ชม.', isCorrect: false }
      ]
    }
  ],
  article_tf: [
    {
      q: 'ข้อ 11: การใช้สื่อไม่มีผลเสียต่อสุขภาพ',
      options: [
        { text: '✅ ถูก', isCorrect: false },
        { text: '❌ ผิด', isCorrect: true }
      ]
    },
    {
      q: 'ข้อ 12: เด็กที่ติดจอสามารถควบคุมอารมณ์ได้',
      options: [
        { text: '✅ ถูก', isCorrect: false },
        { text: '❌ ผิด', isCorrect: true }
      ]
    },
    {
      q: 'ข้อ 13: การใช้สื่อต้องมีผู้ปกครองควบคุมดูแลอย่างใกล้ชิด',
      options: [
        { text: '✅ ถูก', isCorrect: true },
        { text: '❌ ผิด', isCorrect: false }
      ]
    },
    {
      q: 'ข้อ 14: การใช้จอมากเกินไปส่งผลเสียต่อพัฒนาการด้านต่างๆ',
      options: [
        { text: '✅ ถูก', isCorrect: true },
        { text: '❌ ผิด', isCorrect: false }
      ]
    },
    {
      q: 'ข้อ 15: ผู้ปกครองควรเลือกโปรแกรมหรือแอปพลิเคชันที่เหมาะสมกับวัย',
      options: [
        { text: '✅ ถูก', isCorrect: true },
        { text: '❌ ผิด', isCorrect: false }
      ]
    }
  ]
};

const ARTICLE_AUDIO_PARTS = [
  '/audio/l2_listen_article_1.mp3',
  '/audio/l2_listen_article_2.mp3',
  '/audio/l2_listen_article_3.mp3',
  '/audio/l2_listen_article_4.mp3',
  '/audio/l2_listen_article_5.mp3',
  '/audio/l2_listen_article_6.mp3',
  '/audio/l2_listen_article_7.mp3',
  '/audio/l2_listen_article_8.mp3',
  '/audio/l2_listen_article_9.mp3'
];

export default function Level2Listening() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recordScore } = useUser();

  const [phase, setPhase] = useState('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [articlePartIndex, setArticlePartIndex] = useState(0);
  const [hasFinishedArticle, setHasFinishedArticle] = useState(false);
  const audioRef = useRef(null);

  // Play single audio (vocab/idiom)
  const playAudio = (audioPath) => {
    if (isPlaying) return;
    setIsPlaying(true);
    const audio = new Audio(audioPath);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
    audio.play().catch(() => setIsPlaying(false));
  };

  // Play article sequence
  const playArticleSequence = (startIndex = 0) => {
    if (isPlaying) return;
    setIsPlaying(true);
    setArticlePartIndex(startIndex);
    
    const playNext = (index) => {
      if (index >= ARTICLE_AUDIO_PARTS.length) {
        setIsPlaying(false);
        setHasFinishedArticle(true);
        return;
      }
      setArticlePartIndex(index);
      const audio = new Audio(ARTICLE_AUDIO_PARTS[index]);
      audioRef.current = audio;
      
      audio.onended = () => {
        playNext(index + 1);
      };
      audio.onerror = () => {
        setIsPlaying(false);
      };
      audio.play().catch(() => setIsPlaying(false));
    };

    playNext(startIndex);
  };

  useEffect(() => {
    if (phase === 'result' && !scoreSubmitted) {
      setScoreSubmitted(true);
      recordScore({ level: parseInt(id), skill: 'listening', score, maxScore: 15 });
    }
  }, [phase, scoreSubmitted, id, score, recordScore]);

  const handleSelect = (option) => {
    if (showResult) return;
    setSelectedOption(option);
    setShowResult(true);
    if (option.isCorrect) {
      setScore(s => s + 1);
    }
  };

  const handleNextVocab = () => {
    if (currentIdx < l2Questions.vocab.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setPhase('idiom_intro');
      setCurrentIdx(0);
      setSelectedOption(null);
      setShowResult(false);
    }
  };

  const handleNextIdiom = () => {
    if (currentIdx < l2Questions.idiom.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setPhase('article_intro');
      setCurrentIdx(0);
      setSelectedOption(null);
      setShowResult(false);
    }
  };

  const handleNextArticleMCQ = () => {
    if (currentIdx < l2Questions.article_mcq.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setPhase('article_tf_intro');
      setCurrentIdx(0);
      setSelectedOption(null);
      setShowResult(false);
    }
  };

  const handleNextArticleTF = () => {
    if (currentIdx < l2Questions.article_tf.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setPhase('result');
    }
  };

  const renderIntro = () => (
    <div className="animate-fade-in px-4 py-8 max-w-2xl mx-auto text-center">
      <Link to={`/level/${id}`} style={{ color: 'var(--color-primary)', fontWeight: '500', marginBottom: '24px', display: 'inline-block', textDecoration: 'none' }}>
        &larr; กลับไปหน้าระดับ {id}
      </Link>
      <div className="glass-panel" style={{ padding: '48px', marginTop: '16px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7, #7e22ce)', color: 'white', marginBottom: '24px' }}>
          <Headphones size={40} />
        </div>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '16px', color: 'var(--color-primary-dark)' }}>แบบทดสอบทักษะการฟัง Level 2</h2>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.6' }}>
          แบบทดสอบนี้แบ่งออกเป็น 4 ส่วน (รวม 15 ข้อ)
          <br/>ส่วนที่ 1: ฟังคำศัพท์สะกดคำ
          <br/>ส่วนที่ 2: ฟังสำนวนหาความหมาย
          <br/>ส่วนที่ 3: ตอบคำถามจากบทความ (ปรนัย)
          <br/>ส่วนที่ 4: ตอบคำถามจากบทความ (ถูก/ผิด)
        </p>
        <button onClick={() => setPhase('vocab')} className="btn-primary" style={{ padding: '16px 32px', fontSize: '1.2rem' }}>
          เริ่มทำแบบทดสอบ <ArrowRight size={24} style={{ marginLeft: '8px', display: 'inline' }} />
        </button>
      </div>
    </div>
  );

  const renderQuestionPhase = (currentList, handleNext, title, introText = "คำชี้แจง : ให้ผู้เรียนฟังเสียง แล้วเลือกคำตอบให้ถูกต้อง") => {
    const currentQ = currentList[currentIdx];
    return (
      <div className="animate-fade-in px-4 py-8 max-w-2xl mx-auto">
        <Link to={`/level/${id}`} style={{ color: 'var(--color-primary)', fontWeight: '500', marginBottom: '24px', display: 'inline-block', textDecoration: 'none' }}>
          &larr; ออกจากแบบทดสอบ
        </Link>
        <div className="glass-panel" style={{ padding: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary-dark)', margin: 0 }}>{title}</h2>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>ข้อที่ {currentIdx + 1} / {currentList.length}</div>
          </div>
          
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px', textAlign: 'center' }}>{introText}</p>

          {currentQ.audio && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
              <button 
                onClick={() => playAudio(currentQ.audio)} 
                disabled={isPlaying}
                className="btn-primary" 
                style={{ borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', boxShadow: '0 4px 14px rgba(168, 85, 247, 0.4)' }}
              >
                <Volume2 size={24} /> {isPlaying ? 'กำลังเล่นเสียง...' : 'ฟังเสียง'}
              </button>
            </div>
          )}

          <h3 style={{ fontSize: '1.3rem', marginBottom: '24px', color: 'var(--text-main)', textAlign: 'center', lineHeight: '1.5' }}>
            {currentQ.q}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {currentQ.options.map((option, index) => {
              const isSelected = selectedOption === option;
              let btnStyle = { 
                padding: '16px 20px', 
                fontSize: '1.1rem', 
                borderRadius: '16px',
                border: '2px solid transparent',
                background: 'rgba(255,255,255,0.8)',
                color: 'var(--text-main)',
                transition: 'all 0.2s',
                cursor: showResult ? 'default' : 'pointer',
                textAlign: 'left',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                fontWeight: '500'
              };

              if (showResult) {
                if (option.isCorrect) {
                  btnStyle.background = 'rgba(16, 185, 129, 0.1)';
                  btnStyle.border = '2px solid #10b981';
                  btnStyle.color = '#059669';
                } else if (isSelected && !option.isCorrect) {
                  btnStyle.background = 'rgba(239, 68, 68, 0.1)';
                  btnStyle.border = '2px solid #ef4444';
                  btnStyle.color = '#dc2626';
                }
              } else {
                btnStyle[':hover'] = {
                  background: 'white',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.1)'
                };
              }

              // Let's format the option prefix (ก, ข, ค, ง)
              const prefixMap = ['ก. ', 'ข. ', 'ค. ', 'ง. '];
              const prefix = (option.text.includes('✅') || option.text.includes('❌')) ? '' : prefixMap[index];

              return (
                <button 
                  key={index} 
                  onClick={() => handleSelect(option)}
                  disabled={showResult}
                  style={btnStyle}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {showResult && option.isCorrect && <CheckCircle size={24} color="#10b981" />}
                    {showResult && isSelected && !option.isCorrect && <XCircle size={24} color="#ef4444" />}
                    {!showResult && <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid var(--color-primary-light)' }} />}
                    <span>{prefix}{option.text}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {showResult && (
            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', animation: 'fadeIn 0.3s' }}>
              <button onClick={handleNext} className="btn-primary" style={{ padding: '12px 32px', fontSize: '1.1rem', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ดำเนินการต่อ <ArrowRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTransitionPhase = (title, subtitle, nextPhase) => (
    <div className="animate-fade-in px-4 py-8 max-w-2xl mx-auto text-center">
      <div className="glass-panel" style={{ padding: '48px', marginTop: '16px' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--color-primary-dark)' }}>{title}</h2>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '32px' }}>{subtitle}</p>
        <button onClick={() => setPhase(nextPhase)} className="btn-primary" style={{ padding: '12px 32px', fontSize: '1.2rem' }}>
          เริ่มทำส่วนต่อไป <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );

  const renderArticleIntro = () => (
    <div className="animate-fade-in px-4 py-8 max-w-3xl mx-auto">
      <div className="glass-panel" style={{ padding: '48px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', marginBottom: '24px' }}>
          <Volume2 size={40} />
        </div>
        <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--color-primary-dark)' }}>ส่วนที่ 3 และ 4: ฟังบทความ</h2>
        <div style={{ background: 'rgba(255,255,255,0.7)', padding: '24px', borderRadius: '16px', marginBottom: '32px', textAlign: 'left', lineHeight: '1.8', color: 'var(--text-main)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <p><strong>คำชี้แจง:</strong> ให้ผู้เรียนฟังบทความเรื่อง "เด็กเล็กติดจอมือถือ แท็บเล็ต เสี่ยงพัฒนาการช้า" ให้จบก่อน จึงจะสามารถทำข้อสอบปรนัย (ข้อ 6-10) และถูก/ผิด (ข้อ 11-15) ได้</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <button 
            onClick={() => {
              if (isPlaying && audioRef.current) {
                audioRef.current.pause();
                setIsPlaying(false);
              } else {
                playArticleSequence(articlePartIndex >= ARTICLE_AUDIO_PARTS.length ? 0 : articlePartIndex);
              }
            }} 
            className={isPlaying ? "btn-secondary" : "btn-primary"}
            style={{ padding: '16px 32px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '30px' }}
          >
            {isPlaying ? <><RefreshCw size={24} className="spin" /> กำลังเล่นส่วนที่ {articlePartIndex + 1}/{ARTICLE_AUDIO_PARTS.length}</> : <><Play size={24} /> ฟังบทความ</>}
          </button>

          {hasFinishedArticle && (
            <div style={{ animation: 'fadeIn 0.5s' }}>
              <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontWeight: 'bold' }}>
                <CheckCircle size={20} /> ฟังบทความจบแล้ว!
              </div>
              <button 
                onClick={() => setPhase('article_mcq')} 
                className="btn-primary" 
                style={{ padding: '12px 32px', fontSize: '1.2rem', borderRadius: '30px' }}
              >
                ไปทำข้อสอบ <ArrowRight size={20} style={{ display: 'inline', marginLeft: '8px' }} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (phase === 'intro') return renderIntro();
  if (phase === 'vocab') return renderQuestionPhase(l2Questions.vocab, handleNextVocab, 'ส่วนที่ 1: การสะกดคำ', 'คำชี้แจง : ให้ผู้เรียนฟังเสียง แล้วเลือกคำตอบให้ถูกต้อง');
  if (phase === 'idiom_intro') return renderTransitionPhase('ส่วนที่ 2: ความหมายของสำนวน', 'คำชี้แจง: ให้ผู้เรียนฟังคำจากไฟล์เสียง แล้วเลือกความหมายให้ถูกต้อง', 'idiom');
  if (phase === 'idiom') return renderQuestionPhase(l2Questions.idiom, handleNextIdiom, 'ส่วนที่ 2: ความหมายของสำนวน', 'คำชี้แจง : ให้ผู้เรียนฟังสำนวน แล้วเลือกความหมายให้ถูกต้อง');
  if (phase === 'article_intro') return renderArticleIntro();
  if (phase === 'article_mcq') return renderQuestionPhase(l2Questions.article_mcq, handleNextArticleMCQ, 'ส่วนที่ 3: ตอบคำถามจากบทความ', 'คำชี้แจง : ให้ผู้เรียนตอบคำถามจากบทความที่ฟังให้ถูกต้อง');
  if (phase === 'article_tf_intro') return renderTransitionPhase('ส่วนที่ 4: ทำเครื่องหมายถูกผิด', 'คำชี้แจง: วิเคราะห์ข้อความต่อไปนี้ว่า ตรงกับบทความหรือไม่', 'article_tf');
  if (phase === 'article_tf') return renderQuestionPhase(l2Questions.article_tf, handleNextArticleTF, 'ส่วนที่ 4: ทำเครื่องหมายถูกผิด', 'คำชี้แจง : ให้ผู้เรียนพิจารณาข้อความว่า ถูก หรือ ผิด ตามบทความที่ได้ฟัง');

  if (phase === 'result') {
    return (
      <div className="animate-fade-in px-4 py-8 max-w-2xl mx-auto text-center">
        <div className="glass-panel" style={{ padding: '48px', marginTop: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', marginBottom: '24px' }}>
            <CheckCircle size={40} />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--color-primary-dark)' }}>
            ทำแบบทดสอบทักษะการฟัง Level 2 สำเร็จ!
          </h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '32px' }}>
            คุณได้คะแนนส่วนนี้ <strong style={{ color: 'var(--color-primary)', fontSize: '1.5rem' }}>{score}</strong> คะแนน (จาก 15 คะแนน)
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button onClick={() => navigate(`/level/${id}`)} className="btn-primary" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              กลับไปหน้าระดับ <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
