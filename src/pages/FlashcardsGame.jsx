import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function FlashcardsGame() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateScore } = useUser();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const levelWords = {
    1: [
      { th: 'โรงเรียน', en: 'School' },
      { th: 'กระเป๋า', en: 'Bag' },
      { th: 'หนังสือ', en: 'Book' },
      { th: 'ดิสอ', en: 'Pencil' },
      { th: 'ครู', en: 'Teacher' }
    ],
    2: [
      { th: 'พยาบาล', en: 'Nurse' },
      { th: 'ตลาด', en: 'Market' },
      { th: 'สถานีรถไฟ', en: 'Train Station' },
      { th: 'โรงพยาบาล', en: 'Hospital' },
      { th: 'ตำรวจ', en: 'Police' }
    ],
    3: [
      { th: 'เทคโนโลยี', en: 'Technology' },
      { th: 'สาธารณสุข', en: 'Public Health' },
      { th: 'รัฐธรรมนูญ', en: 'Constitution' },
      { th: 'นวัตกรรม', en: 'Innovation' },
      { th: 'เศรษฐกิจรษฐกิจ', en: 'Economy' }
    ]
  };

  const words = levelWords[id] || levelWords[1];

  const handleNext = (knew) => {
    const currentScoreAddition = knew ? 10 : 0;
    if (knew) setScore(s => s + currentScoreAddition);
    
    setIsFlipped(false);
    
    setTimeout(() => {
      if (currentIndex < words.length - 1) {
        setCurrentIndex(c => c + 1);
      } else {
        setIsFinished(true);
        // Add final total score increment to context
        updateScore('flashcards', score + currentScoreAddition);
      }
    }, 200);
  };

  const finishGame = () => {
    navigate(`/level/${id}`);
  };

  if (isFinished) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', padding: '60px 20px' }}>
        <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center', maxWidth: '500px', width: '100%' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎉</div>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--color-primary-dark)', marginBottom: '16px' }}>จบเกม!</h2>
          <p style={{ fontSize: '1.25rem', marginBottom: '40px', color: 'var(--text-muted)' }}>คุณได้คะแนน {score} / {words.length * 10}</p>
          <button onClick={finishGame} className="btn-primary" style={{ width: '100%' }}>เยื่ยมมาก กลับไปหน้าเมนู</button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '32px 16px', maxWidth: '600px', margin: '0 auto' }}>
      <Link to={`/level/${id}`} style={{ color: 'var(--color-primary)', fontWeight: '500', marginBottom: '24px', display: 'inline-block', textDecoration: 'none' }}>
        &larr; ออกจากเกมแฟลชการ์ด
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary-dark)' }}>แฟลชการ์ดคำศัพท์ Level {id}</h2>
        <div style={{ background: 'var(--bg-glass)', padding: '6px 16px', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
          {currentIndex + 1} / {words.length}
        </div>
      </div>

      <div 
        style={{ 
          height: '400px', 
          perspective: '1000px', 
          marginBottom: '40px', 
          cursor: 'pointer' 
        }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div 
          style={{ 
            width: '100%', 
            height: '100%', 
            transition: 'transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)', 
            transformStyle: 'preserve-3d', 
            position: 'relative',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* Front */}
          <div className="glass-card" style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <h1 style={{ fontSize: '4rem', color: 'var(--color-primary)', fontWeight: 'bold' }}>{words[currentIndex].th}</h1>
            <div style={{ position: 'absolute', bottom: '24px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>แตะบัตรเพื่อพลิกดูคำแปล</div>
          </div>
          {/* Back */}
          <div className="glass-card" style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <h1 style={{ fontSize: '3rem', color: 'white', fontWeight: 'bold' }}>{words[currentIndex].en}</h1>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px' }}>
        <button 
          onClick={() => handleNext(false)} 
          style={{ flex: 1, padding: '16px', borderRadius: '30px', border: 'none', background: '#fecaca', color: '#b91c1c', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.2)' }}
          onMouseOver={e=>e.target.style.transform='scale(1.02)'}
          onMouseOut={e=>e.target.style.transform='scale(1)'}
        >
          ลืมคำนี้
        </button>
        <button 
          onClick={() => handleNext(true)} 
          style={{ flex: 1, padding: '16px', borderRadius: '30px', border: 'none', background: '#d1fae5', color: '#047857', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.2)' }}
          onMouseOver={e=>e.target.style.transform='scale(1.02)'}
          onMouseOut={e=>e.target.style.transform='scale(1)'}
        >
          จำได้แล้ว
        </button>
      </div>
    </div>
  );
}
