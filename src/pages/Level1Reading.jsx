import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle, XCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { useUser } from '../context/UserContext';

const readingData = {
  1: {
    title: 'มารยาทการฟังและการดู',
    passage: "การฟังและการดูเป็นสิ่งสำคัญในชีวิตประจำวัน มารยาทที่ดีควรเริ่มจากการตั้งใจฟัง ไม่พูดแทรกขณะผู้อื่นกำลังพูด หากสงสัยควรจดบันทึกไว้ถามเมื่อผู้พูดพูดจบในที่สาธารณะ เช่น โรงภาพยนตร์หรือห้องสมุด เราไม่ควรส่งเสียงดังรบกวนผู้อื่น และไม่ควรแสดงกิริยาที่ไม่สุภาพ เช่น การโห่ร้อง หรือการใช้โทรศัพท์มือถือขณะร่วมกิจกรรม การมีมารยาทที่ดีจะช่วยให้เราได้รับความรู้และเป็นที่รักของคนรอบข้าง",
    questions: [
      {
        q: "21. มารยาทที่ดีควรเริ่มจากสิ่งใดเป็นอันดับแรก ?",
        image: "/images/reading_q21_attentive_1777621872053.png",
        options: [
          { text: "การตั้งใจฟัง", isCorrect: true },
          { text: "การพูดคุยกับเพื่อน", isCorrect: false }
        ]
      },
      {
        q: "22. ขณะที่ครูกำลังพูด ผู้เรียนควรทำอย่างไร ?",
        image: "/images/reading_q22_teacher_talking_1777621888122.png",
        options: [
          { text: "พูดแทรกทันที", isCorrect: false },
          { text: "ฟังอย่างสงบ", isCorrect: true }
        ]
      },
      {
        q: "23. หากผู้เรียนมีข้อสงสัยขณะฟัง ควรปฏิบัติอย่างไร ?",
        image: "/images/reading_q23_note_taking_1777621904278.png",
        options: [
          { text: "ยกมือถามแทรกทันที", isCorrect: false },
          { text: "จดบันทึกไว้ถามภายหลัง", isCorrect: true }
        ]
      },
      {
        q: "24. ขณะดูการแสดงบนเวที การกระทำใดถือว่า \"เสียมารยาท\" ?",
        image: "/images/reading_q24_theater_1777621922848.png",
        options: [
          { text: "การโห่ร้องเยาะเย้ย", isCorrect: true },
          { text: "การปรบมือเมื่อจบการแสดง", isCorrect: false }
        ]
      },
      {
        q: "25. การมีมารยาทในการฟังและการดู ส่งผลดีต่อผู้เรียนอย่างไร ?",
        image: "/images/reading_q25_good_manner_1777621940932.png",
        options: [
          { text: "ทำให้เป็นที่รักและได้รับความรู้", isCorrect: true },
          { text: "ทำให้เรียนจบเร็วขึ้น", isCorrect: false }
        ]
      }
    ]
  }
};

export default function Level1Reading() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recordScore } = useUser();
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState('quiz'); // 'quiz', 'result'

  const data = readingData[id] || readingData[1];
  const questions = data.questions;
  const currentQ = questions[currentIdx];

  const handleSelect = (option) => {
    if (showResult) return;
    setSelectedOption(option);
    setShowResult(true);
    if (option.isCorrect) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setPhase('result');
    }
  };

  const handleRetry = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setShowResult(false);
    setScore(0);
    setPhase('quiz');
  };

  useEffect(() => {
    if (phase === 'result' && !scoreSubmitted) {
      setScoreSubmitted(true);
      recordScore({ level: parseInt(id), skill: 'reading', score, maxScore: questions.length });
    }
  }, [phase, scoreSubmitted, questions.length, id, score, recordScore]);

  if (phase === 'result') {

    return (
      <div className="animate-fade-in px-4 py-8 max-w-2xl mx-auto text-center">
        <div className="glass-panel" style={{ padding: '48px', marginTop: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', marginBottom: '24px' }}>
            <CheckCircle size={40} />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--color-primary-dark)' }}>ทำแบบทดสอบการอ่านสำเร็จ!</h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '32px' }}>
            คุณได้คะแนนรวม <strong style={{ color: 'var(--color-primary)', fontSize: '1.5rem' }}>{score}</strong> คะแนน (จาก {questions.length} คะแนน)
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

  return (
    <div className="animate-fade-in px-4 py-8 max-w-4xl mx-auto">
      <Link to={`/level/${id}`} style={{ color: 'var(--color-primary)', fontWeight: '500', marginBottom: '24px', display: 'inline-block', textDecoration: 'none' }}>
        &larr; กลับไปหน้าระดับ {id}
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left Column: Passage */}
        <div className="glass-panel" style={{ padding: '32px', height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--color-primary-light)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={24} />
            </div>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary-dark)', margin: 0 }}>บทอ่าน</h2>
          </div>
          <div style={{ fontSize: '1.15rem', lineHeight: '1.8', color: 'var(--text-main)', padding: '24px', background: 'rgba(255,255,255,0.6)', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
            {data.passage}
          </div>
        </div>

        {/* Right Column: Questions */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.3rem', color: 'var(--color-primary-dark)', margin: 0 }}>ตอบคำถาม</h2>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>ข้อที่ {currentIdx + 1} / {questions.length}</div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', color: 'var(--text-main)', lineHeight: '1.5' }}>
              {currentQ.q}
            </h3>

            {currentQ.image && (
              <div style={{ marginBottom: '24px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.05)' }}>
                <img 
                  src={currentQ.image} 
                  alt="Question Illustration" 
                  style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '300px', objectFit: 'cover' }} 
                />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {currentQ.options.map((option, index) => {
                const isSelected = selectedOption === option;
                let btnStyle = { 
                  padding: '16px 20px', 
                  fontSize: '1.1rem', 
                  borderRadius: '12px',
                  border: '2px solid transparent',
                  background: 'rgba(255,255,255,0.6)',
                  color: 'var(--text-main)',
                  transition: 'all 0.2s',
                  cursor: showResult ? 'default' : 'pointer',
                  textAlign: 'left',
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
                    transform: 'translateX(4px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  };
                }

                return (
                  <button 
                    key={index} 
                    onClick={() => handleSelect(option)}
                    disabled={showResult}
                    style={btnStyle}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {showResult && option.isCorrect && <CheckCircle size={20} color="#10b981" style={{ flexShrink: 0 }} />}
                      {showResult && isSelected && !option.isCorrect && <XCircle size={20} color="#ef4444" style={{ flexShrink: 0 }} />}
                      {!showResult && <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid var(--color-primary-light)', flexShrink: 0 }} />}
                      <span>{index === 0 ? 'ก. ' : 'ข. '} {option.text}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {showResult && (
            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', animation: 'fadeIn 0.3s' }}>
              <button onClick={handleNext} className="btn-primary" style={{ padding: '10px 24px', fontSize: '1rem', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {currentIdx < questions.length - 1 ? 'ข้อถัดไป' : 'ดูผลคะแนน'} <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
