import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Volume2, ArrowRight, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useUser } from '../context/UserContext';


const vocabQuestions = [
  {
    id: 1,
    word: "สร้อย",
    question: "1. คำว่า “ สร้อย ” อ่านอย่างไร ?",
    image: "/images/vocab_1_necklace_1777619701174.png",
    options: [
      { text: "สะ-ร้อย", isCorrect: false },
      { text: "ส้อย", isCorrect: true }
    ]
  },
  {
    id: 2,
    word: "ปลอดภัย",
    question: "2. คำว่า “ ปลอดภัย ” อ่านอย่างไร ?",
    image: "/images/vocab_2_safety_1777619714847.png",
    options: [
      { text: "ปลอด - พัย", isCorrect: true },
      { text: "ปะ – ลอด – พัย", isCorrect: false }
    ]
  },
  {
    id: 3,
    word: "สำเร็จ",
    question: "3. คำว่า “ สำเร็จ ” อ่านอย่างไร ?",
    image: "/images/vocab_3_success_1777619736896.png",
    options: [
      { text: "สำ - เหร็ด", isCorrect: true },
      { text: "สำ - เร็ด", isCorrect: false }
    ]
  },
  {
    id: 4,
    word: "ภูมิปัญญา",
    question: "4. คำว่า “ ภูมิปัญญา ” อ่านอย่างไร ?",
    image: "/images/vocab_4_wisdom_1777619757158.png",
    options: [
      { text: "พู – มิ – ปัน - ยา", isCorrect: false },
      { text: "พูม – ปัน - ยา", isCorrect: true }
    ]
  },
  {
    id: 5,
    word: "มลภาวะ",
    question: "5. คำว่า “ มลภาวะ ” อ่านอย่างไร ?",
    image: "/images/vocab_5_pollution_1777619775273.png",
    options: [
      { text: "มน-ละ-พา-วะ", isCorrect: true },
      { text: "มล-พา-วะ", isCorrect: false }
    ]
  }
];

const STORY_IMAGE = '/images/story_donkey_merchant_1777621288896.png';

const storyQuestions = [
  {
    id: 1,
    question: "11. พ่อค้าบรรทุกสิ่งใดไว้บนหลังลาในครั้งแรก ?",
    image: STORY_IMAGE,
    options: [
      { text: "กระสอบเกลือ", isCorrect: true },
      { text: "กระสอบนุ่น", isCorrect: false }
    ]
  },
  {
    id: 2,
    question: "12. เพราะเหตุใดลาจึงรู้สึกว่าของเบาลง หลังจากตกน้ำครั้งแรก ?",
    image: STORY_IMAGE,
    options: [
      { text: "พ่อค้าช่วยยกของออก", isCorrect: false },
      { text: "เกลือละลายไปกับน้ำ", isCorrect: true }
    ]
  },
  {
    id: 3,
    question: "13. เมื่อ \"นุ่น\" ถูกน้ำจะมีลักษณะอย่างไร ?",
    image: STORY_IMAGE,
    options: [
      { text: "เบาลงกว่าเดิม", isCorrect: false },
      { text: "หนักขึ้นเพราะอมน้ำ", isCorrect: true }
    ]
  },
  {
    id: 4,
    question: "14. การแกล้งตกน้ำครั้งสุดท้ายของลาส่งผลอย่างไร ?",
    image: STORY_IMAGE,
    options: [
      { text: "ต้องแบกของหนักกว่าเดิม", isCorrect: true },
      { text: "พ่อค้าปล่อยให้ลอยคอในน้ำ", isCorrect: false }
    ]
  },
  {
    id: 5,
    question: "15. ข้อคิดจากนิทานเรื่องนี้ตรงกับข้อใด ?",
    image: STORY_IMAGE,
    options: [
      { text: "ความเจ้าเล่ห์เพื่อเลี่ยงงานหนัก มักนำมาซึ่งความลำบากที่มากกว่าเดิม", isCorrect: true },
      { text: "ความพยายามอยู่ที่ไหนความสำเร็จอยู่ที่นั่น", isCorrect: false }
    ]
  }
];

const announceQuestions = [
  {
    id: 1,
    question: "6. สิ่งใดที่ผู้เรียนไม่ต้องเตรียมมา ?",
    image: "/images/announce_6_art_1777619799494.png",
    options: [
      { text: "ดินสอสี", isCorrect: false },
      { text: "ไม้บรรทัด", isCorrect: true }
    ]
  },
  {
    id: 2,
    question: "7. ข้อใดเป็นคำเตือนจากประกาศนี้ ?",
    image: "/images/announce_7_noswim_1777619815730.png",
    options: [
      { text: "ห้ามว่ายน้ำ", isCorrect: true },
      { text: "ห้ามตกปลา", isCorrect: false }
    ]
  },
  {
    id: 3,
    question: "8. จุดประสงค์ของประกาศนี้คืออะไร ?",
    image: "/images/announce_8_washhands_1777619833356.png",
    options: [
      { text: "เพื่อสุขอนามัยที่ดี", isCorrect: true },
      { text: "เพื่อให้มือมีกลิ่นหอม", isCorrect: false }
    ]
  },
  {
    id: 4,
    question: "9. จากเสียงที่ได้ยิน ท่านควรทำอย่างไร ?",
    image: "/images/announce_9_trash_1777619849481.png",
    options: [
      { text: "ทิ้งขยะรวมกัน", isCorrect: false },
      { text: "แยกขยะก่อนทิ้ง", isCorrect: true }
    ]
  },
  {
    id: 5,
    question: "10. ข้อใดไม่ควรปฏิบัติ ?",
    image: "/images/announce_10_exam_1777619867014.png",
    options: [
      { text: "เดินออกจากห้องเบา ๆ", isCorrect: false },
      { text: "ตะโกนบอกเพื่อนว่าทำเสร็จแล้ว", isCorrect: true }
    ]
  }
];

export default function Level1Listening() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recordScore } = useUser();
  
  // Phase: 'intro', 'vocab', 'story_intro', 'story', 'result'
  const [phase, setPhase] = useState('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [storyAudioIdx, setStoryAudioIdx] = useState(0);
  const [hasListenedToStory, setHasListenedToStory] = useState(false);
  
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  let currentQ = null;
  if (phase === 'vocab') currentQ = vocabQuestions[currentIdx];
  else if (phase === 'story') currentQ = storyQuestions[currentIdx];
  else if (phase === 'announce') currentQ = announceQuestions[currentIdx];

  const playAudio = () => {
    if (!currentQ || (phase !== 'vocab' && phase !== 'announce')) return;
    setIsPlaying(true);
    const prefix = phase === 'vocab' ? 'vocab' : 'announce';
    const audio = new Audio(`/audio/${prefix}_${currentQ.id}.mp3`);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
    audio.play().catch(() => setIsPlaying(false));
  };

  const playStory = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setStoryAudioIdx(1);
    playStoryChunk(1);
  };

  const playStoryChunk = (chunkId) => {
    if (chunkId > 5) {
      setIsPlaying(false);
      setHasListenedToStory(true);
      return;
    }
    const audio = new Audio(`/audio/story_${chunkId}.mp3`);
    audio.onended = () => {
      setStoryAudioIdx(chunkId + 1);
      playStoryChunk(chunkId + 1);
    };
    audio.onerror = () => setIsPlaying(false);
    audio.play().catch(() => setIsPlaying(false));
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

  const handleNext = () => {
    let questions = [];
    if (phase === 'vocab') questions = vocabQuestions;
    else if (phase === 'story') questions = storyQuestions;
    else if (phase === 'announce') questions = announceQuestions;

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      if (phase === 'vocab') {
        setPhase('announce_intro');
        setCurrentIdx(0);
        setSelectedOption(null);
        setShowResult(false);
      } else if (phase === 'announce') {
        setPhase('story_intro');
        setCurrentIdx(0);
        setSelectedOption(null);
        setShowResult(false);
      } else {
        setPhase('result');
      }
    }
  };

  const handleRetry = () => {
    setPhase('intro');
    setCurrentIdx(0);
    setSelectedOption(null);
    setShowResult(false);
    setScore(0);
  };

  if (phase === 'intro') {
    return (
      <div className="animate-fade-in px-4 py-8 max-w-2xl mx-auto text-center">
        <div className="glass-panel" style={{ padding: '48px', marginTop: '40px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--color-primary-dark)' }}>แบบทดสอบทักษะการฟัง</h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '32px' }}>
            แบบทดสอบนี้แบ่งออกเป็น 3 ส่วน ได้แก่ <br/>ส่วนที่ 1: การฟังคำศัพท์ (5 ข้อ)<br/>ส่วนที่ 2: การฟังประกาศ/คำสั่งสั้นๆ (5 ข้อ)<br/>ส่วนที่ 3: การฟังนิทาน (5 ข้อ)
          </p>
          <button onClick={() => setPhase('vocab')} className="btn-primary" style={{ padding: '12px 32px', fontSize: '1.2rem' }}>
            เริ่มทำแบบทดสอบ <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'announce_intro') {
    return (
      <div className="animate-fade-in px-4 py-8 max-w-2xl mx-auto text-center">
        <div className="glass-panel" style={{ padding: '48px', marginTop: '40px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--color-primary-dark)' }}>ส่วนที่ 2: การฟังประกาศและคำสั่ง</h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '32px' }}>
            ยอดเยี่ยมมาก! ต่อไปเป็นการฟังประกาศหรือคำสั่งสั้น ๆ ในแต่ละข้อ แล้วเลือกคำตอบที่ถูกต้อง
          </p>
          <button onClick={() => setPhase('announce')} className="btn-primary" style={{ padding: '12px 32px', fontSize: '1.2rem' }}>
            เข้าสู่ส่วนการฟังประกาศ <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'story_intro') {
    return (
      <div className="animate-fade-in px-4 py-8 max-w-2xl mx-auto text-center">
        <div className="glass-panel" style={{ padding: '48px', marginTop: '40px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--color-primary-dark)' }}>ส่วนที่ 3: การฟังนิทาน</h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '32px' }}>
            ส่วนสุดท้าย! เป็นการฟังนิทานเรื่อง "พ่อค้าเกลือกับลาขี้โกง" ให้ผู้เรียนตั้งใจฟังจนจบ แล้วตอบคำถาม 5 ข้อ
          </p>
          <button onClick={() => setPhase('story')} className="btn-primary" style={{ padding: '12px 32px', fontSize: '1.2rem' }}>
            เข้าสู่ส่วนการฟังนิทาน <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'result') {
    return (
      <div className="animate-fade-in px-4 py-8 max-w-2xl mx-auto text-center">
        <div className="glass-panel" style={{ padding: '48px', marginTop: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', marginBottom: '24px' }}>
            <CheckCircle size={40} />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--color-primary-dark)' }}>
            ทำแบบทดสอบทักษะการฟังสำเร็จ!
          </h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '32px' }}>
            คุณได้คะแนนส่วนนี้ <strong style={{ color: 'var(--color-primary)', fontSize: '1.5rem' }}>{score}</strong> คะแนน (จาก 15 คะแนน)
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button onClick={handleRetry} className="btn-secondary" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RefreshCw size={20} /> ลองใหม่อีกครั้ง
            </button>
            <button onClick={() => navigate(`/level/${id}`)} className="btn-primary" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              กลับไปหน้าระดับ <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isVocab = phase === 'vocab';
  const isStory = phase === 'story';
  const isAnnounce = phase === 'announce';
  
  let totalQuestions = 5;
  let sectionTitle = '';
  let sectionDesc = '';
  
  if (isVocab) {
    sectionTitle = 'ส่วนที่ 1: ทักษะการฟัง (คำศัพท์)';
    sectionDesc = 'คำชี้แจง : ให้ผู้เรียนกดปุ่ม “ ฟังคำศัพท์ ” แล้วตอบคำถาม โดยเลือก “คำอ่าน” ที่ถูกต้อง';
  } else if (isAnnounce) {
    sectionTitle = 'ส่วนที่ 2: การฟังประกาศ/คำสั่ง';
    sectionDesc = 'คำชี้แจง : ให้ผู้เรียนฟังเสียงประกาศหรือคำสั่งสั้น ๆ แล้วเลือกคำตอบที่ถูกต้อง';
  } else if (isStory) {
    sectionTitle = 'ส่วนที่ 3: ทักษะการฟัง (นิทาน)';
    sectionDesc = 'คำชี้แจง : ให้ผู้เรียนกดปุ่ม “ ฟังนิทาน ” จนจบ แล้วตอบคำถามจากเรื่องที่ได้ยิน';
  }

  return (
    <div className="animate-fade-in px-4 py-8 max-w-3xl mx-auto">
      <Link to={`/level/${id}`} style={{ color: 'var(--color-primary)', fontWeight: '500', marginBottom: '24px', display: 'inline-block', textDecoration: 'none' }}>
        &larr; กลับไปหน้าระดับ {id}
      </Link>

      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary-dark)', marginBottom: '8px' }}>
              {sectionTitle}
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              {sectionDesc}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '4px' }}>ข้อที่ {currentIdx + 1} / {totalQuestions}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>คะแนนรวม: {score}</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '40px 0' }}>
          {currentQ.image && (
            <div style={{ width: '280px', height: '280px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', border: '4px solid white', background: 'white', marginBottom: '24px' }}>
              <img src={currentQ.image} alt="Question Graphic" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          <button 
            onClick={isStory ? playStory : playAudio}
            disabled={isStory && isPlaying}
            className={`btn-primary ${isPlaying ? 'playing' : ''}`}
            style={{ 
              width: '140px', 
              height: '140px', 
              borderRadius: '50%', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '8px',
              fontSize: '1.1rem',
              background: isPlaying ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary))',
              boxShadow: isPlaying ? '0 0 20px rgba(59, 130, 246, 0.6)' : '0 8px 16px rgba(139, 92, 246, 0.3)',
              transition: 'all 0.3s ease',
              cursor: (isStory && isPlaying) ? 'not-allowed' : 'pointer'
            }}
          >
            <Volume2 size={40} />
            {isPlaying 
              ? (isStory ? 'กำลังเล่นนิทาน...' : 'กำลังฟัง...') 
              : (isVocab ? 'ฟังคำศัพท์' : isAnnounce ? 'ฟังเสียงประกาศ' : 'ฟังนิทานทั้งหมด')}
          </button>
        </div>

        {(isStory && !hasListenedToStory) ? (
          <div style={{ marginTop: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.2rem', padding: '24px', background: 'rgba(255,255,255,0.5)', borderRadius: '16px', border: '1px dashed rgba(0,0,0,0.1)' }}>
              กรุณากดปุ่มเพื่อฟังนิทานให้จบก่อน ระบบจึงจะแสดงชุดคำถามให้ตอบครับ
            </p>
          </div>
        ) : (
          <div style={{ marginTop: '32px' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '20px', textAlign: 'center', color: 'var(--text-main)' }}>
              {currentQ.question}
            </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {currentQ.options.map((option, index) => {
              const isSelected = selectedOption === option;
              let btnStyle = { 
                padding: '20px', 
                fontSize: '1.2rem', 
                borderRadius: '16px',
                border: '2px solid transparent',
                background: 'rgba(255,255,255,0.6)',
                color: 'var(--text-main)',
                transition: 'all 0.2s',
                cursor: showResult ? 'default' : 'pointer',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
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
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                };
              }

              return (
                <button 
                  key={index} 
                  onClick={() => handleSelect(option)}
                  disabled={showResult}
                  style={btnStyle}
                  className={!showResult ? 'hover-lift' : ''}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    {showResult && option.isCorrect && <CheckCircle size={20} color="#10b981" />}
                    {showResult && isSelected && !option.isCorrect && <XCircle size={20} color="#ef4444" />}
                    {index === 0 ? 'ก. ' : 'ข. '} {option.text}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        )}

        {showResult && (
          <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', animation: 'fadeIn 0.3s' }}>
            <button onClick={handleNext} className="btn-primary" style={{ padding: '12px 32px', fontSize: '1.1rem', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {currentIdx < totalQuestions - 1 ? 'ข้อถัดไป' : (!isAnnounce ? 'ส่วนถัดไป' : 'ดูผลคะแนนรวม')} <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
