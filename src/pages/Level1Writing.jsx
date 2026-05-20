import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Volume2, CheckCircle, XCircle, ArrowRight, RefreshCw, PenTool } from 'lucide-react';
import { useUser } from '../context/UserContext';

const writingData = {
  1: [
    {
      id: 1,
      type: 'flashcard',
      image: '/images/writing_q1.png',
      audio: '/audio/writing_q1.mp3',
      instruction: 'คำชี้แจง : ให้ผู้เรียนดูภาพและฟังเสียงคำศัพท์ แล้วเลือกคำที่สะกดได้ถูกต้อง',
      q: 'ข้อใดสะกดถูกต้อง ?',
      options: [
        { text: 'บรรทุก', isCorrect: true },
        { text: 'บันทึก', isCorrect: false }
      ]
    },
    {
      id: 2,
      type: 'flashcard',
      image: '/images/writing_q2.png',
      audio: '/audio/writing_q2.mp3',
      instruction: 'คำชี้แจง : ให้ผู้เรียนดูภาพและฟังเสียงคำศัพท์ แล้วเลือกคำที่สะกดได้ถูกต้อง',
      q: 'ข้อใดสะกดถูกต้อง ?',
      options: [
        { text: 'ละลาย', isCorrect: true },
        { text: 'ระราย', isCorrect: false }
      ]
    },
    {
      id: 3,
      type: 'fill-in',
      instruction: 'คำชี้แจง : ให้ผู้เรียนเลือกคำที่กำหนดให้มาเติมในช่องว่างเพื่อให้ประโยคสมบูรณ์และมีความหมายถูกต้อง',
      q: '“ เมื่อเกลือถูกน้ำ เกลือจะ............ ไปกับน้ำ ”',
      options: [
        { text: 'ละลาย', isCorrect: true },
        { text: 'แข็งตัว', isCorrect: false }
      ]
    },
    {
      id: 4,
      type: 'fill-in',
      instruction: 'คำชี้แจง : ให้ผู้เรียนเลือกคำที่กำหนดให้มาเติมในช่องว่างเพื่อให้ประโยคสมบูรณ์และมีความหมายถูกต้อง',
      q: '“ พ่อค้าต้องการแก้เผ็ดลา จึงใช้............. หลอกล่อ ”',
      options: [
        { text: 'อุบาย', isCorrect: true },
        { text: 'ของขวัญ', isCorrect: false }
      ]
    },
    {
      id: 5,
      type: 'fill-in',
      instruction: 'คำชี้แจง : ให้ผู้เรียนเลือกคำที่กำหนดให้มาเติมในช่องว่างเพื่อให้ประโยคสมบูรณ์และมีความหมายถูกต้อง',
      q: '“เมื่อนุ่นถูกน้ำ นุ่นจะ.................. น้ำไว้จนหนักอึ้ง”',
      options: [
        { text: 'อุ้ม', isCorrect: true },
        { text: 'แบก', isCorrect: false }
      ]
    }
  ]
};

export default function Level1Writing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recordScore } = useUser();
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState('quiz'); // 'quiz', 'result'
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [phase, currentIdx]);

  const questions = writingData[id] || writingData[1];
  const currentQ = questions[currentIdx];

  const playAudio = () => {
    stopAudio();
    setIsPlaying(true);
    const audio = new Audio(currentQ.audio);
    audioRef.current = audio;
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
    audio.play().catch(() => setIsPlaying(false));
  };

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
      recordScore({ level: parseInt(id), skill: 'writing', score, maxScore: questions.length });
    }
  }, [phase, scoreSubmitted, questions.length, id, score, recordScore]);

  if (phase === 'result') {

    return (
      <div className="animate-fade-in px-4 py-8 max-w-2xl mx-auto text-center">
        <div className="glass-panel" style={{ padding: '48px', marginTop: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', marginBottom: '24px' }}>
            <CheckCircle size={40} />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--color-primary-dark)' }}>ทำแบบทดสอบการเขียนสำเร็จ!</h2>
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
    <div className="animate-fade-in px-4 py-8 max-w-2xl mx-auto">
      <Link to={`/level/${id}`} style={{ color: 'var(--color-primary)', fontWeight: '500', marginBottom: '24px', display: 'inline-block', textDecoration: 'none' }}>
        &larr; กลับไปหน้าระดับ {id}
      </Link>

      <div className="glass-panel" style={{ padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--color-primary-light)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PenTool size={24} />
            </div>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary-dark)', margin: 0 }}>ทักษะการเขียน (เกมแฟลชการ์ด)</h2>
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>ข้อที่ {currentIdx + 1} / {questions.length}</div>
        </div>
        
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', textAlign: 'center' }}>
          {currentQ.instruction}
        </p>

        {currentQ.type === 'flashcard' && (
          <>
            {/* Flashcard Image */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <div style={{ width: '280px', height: '280px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', border: '4px solid white', background: 'white' }}>
                <img src={currentQ.image} alt="Flashcard" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>

            {/* Audio Button */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
              <button 
                onClick={playAudio} 
                disabled={isPlaying}
                className="btn-primary" 
                style={{ borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', boxShadow: '0 4px 14px rgba(168, 85, 247, 0.4)' }}
              >
                <Volume2 size={24} /> {isPlaying ? 'กำลังเล่นเสียง...' : 'ฟังเสียงคำศัพท์'}
              </button>
            </div>
          </>
        )}

        <h3 style={{ fontSize: '1.5rem', marginBottom: '32px', color: 'var(--text-main)', textAlign: 'center', lineHeight: '1.5' }}>
          {currentQ.q}
        </h3>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {currentQ.options.map((option, index) => {
            const isSelected = selectedOption === option;
            let btnStyle = { 
              padding: '20px', 
              fontSize: '1.25rem', 
              borderRadius: '16px',
              border: '2px solid transparent',
              background: 'rgba(255,255,255,0.8)',
              color: 'var(--text-main)',
              transition: 'all 0.2s',
              cursor: showResult ? 'default' : 'pointer',
              textAlign: 'center',
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

            return (
              <button 
                key={index} 
                onClick={() => handleSelect(option)}
                disabled={showResult}
                style={btnStyle}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                  {showResult && option.isCorrect && <CheckCircle size={24} color="#10b981" />}
                  {showResult && isSelected && !option.isCorrect && <XCircle size={24} color="#ef4444" />}
                  <span>{index === 0 ? 'ก. ' : 'ข. '} {option.text}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        {showResult && (
          <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', animation: 'fadeIn 0.3s' }}>
            <button onClick={handleNext} className="btn-primary" style={{ padding: '12px 32px', fontSize: '1.1rem', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {currentIdx < questions.length - 1 ? 'ข้อถัดไป' : 'ดูผลคะแนน'} <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
