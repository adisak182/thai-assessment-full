import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function QuizModule() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateScore } = useUser();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const levelQuestions = {
    1: [
      { q: 'พยัญชนะไทยมีทั้งหมดกี่ตัว?', options: ['42', '44', '46', '48'], answer: 1 },
      { q: 'ข้อใดคือสระเสียงผสม?', options: ['สระเอีย', 'สระอะ', 'สระอา', 'สระอิ'], answer: 0 },
      { q: 'คำว่า "เรียน" ผสมด้วยสระใด?', options: ['สระเอีย', 'สระอี', 'สระเอ', 'สระเ-ะ'], answer: 0 }
    ],
    2: [
      { q: 'คำใดเขียนถูกต้อง?', options: ['สีสรร', 'สีสัน', 'สีสรรค์', 'สีสันต์'], answer: 1 },
      { q: 'ข้อใดเป็นประโยคคำถาม?', options: ['ฉันไปตลาด', 'พ่อไปไหน', 'แม่ทำกับข้าว', 'น้องนอนหลับ'], answer: 1 },
      { q: 'ผู้ชายที่ทำงานรักษาคนไข้เรียกว่าอะไร?', options: ['คุณครู', 'ตำรวจ', 'ทหาร', 'หมอ/แพทย์'], answer: 3 }
    ],
    3: [
      { q: 'คำว่า "วิกฤต" มีความหมายตรงกับข้อใด?', options: ['รุ่งเรือง', 'อันตราย/ฉุกเฉิน', 'ก้าวหน้า', 'สงบสุข'], answer: 1 },
      { q: 'การเขียนจดหมายราชการต้องใช้ภาษาระดับใด?', options: ['ทางการ', 'กึ่งทางการ', 'ไม่เป็นทางการ', 'กันเอง'], answer: 0 },
      { q: 'ข้อใดไม่ใช่ส่วนหนึ่งของบทความวิจารณ์?', options: ['บทนำ', 'คำนำผู้อ่าน', 'เนื้อหา', 'บทสรุป'], answer: 1 }
    ]
  };

  const questions = levelQuestions[id] || levelQuestions[1];

  const handleAnswer = (index) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);

    const isCorrect = index === questions[currentQuestion].answer;
    if (isCorrect) setScore(s => s + 20);

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(c => c + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
      } else {
        setShowResult(true);
        updateScore('quiz', score + (isCorrect ? 20 : 0));
      }
    }, 1500);
  };

  if (showResult) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', padding: '60px 20px' }}>
        <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center', maxWidth: '500px', width: '100%' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🏆</div>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--color-primary-dark)', marginBottom: '16px' }}>สรุปผลแบบทดสอบ</h2>
          <p style={{ fontSize: '1.25rem', marginBottom: '40px', color: 'var(--text-muted)' }}>คะแนนที่คุณทำได้: {score} / {questions.length * 20}</p>
          <button onClick={() => navigate(`/level/${id}`)} className="btn-primary" style={{ width: '100%' }}>เยื่ยมมาก กลับไปหน้าเมนู</button>
        </div>
      </div>
    );
  }

  const q = questions[currentQuestion];

  return (
    <div className="animate-fade-in" style={{ padding: '32px 16px', maxWidth: '800px', margin: '0 auto' }}>
      <Link to={`/level/${id}`} style={{ color: 'var(--color-primary)', fontWeight: '500', marginBottom: '24px', display: 'inline-block', textDecoration: 'none' }}>
        &larr; ออกจากแบบทดสอบ
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary-dark)' }}>แบบทดสอบ Level {id}</h2>
        <div style={{ background: 'var(--bg-glass)', padding: '6px 16px', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
          ข้อ {currentQuestion + 1} / {questions.length}
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '40px' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '32px', lineHeight: '1.6', color: 'var(--text-main)' }}>{q.q}</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {q.options.map((opt, idx) => {
            let btnBg = 'var(--bg-glass)';
            let btnColor = 'var(--text-main)';
            let borderColor = 'transparent';

            if (isAnswered) {
              if (idx === q.answer) {
                btnBg = '#d1fae5';
                btnColor = '#047857';
                borderColor = '#10b981';
              } else if (idx === selectedAnswer) {
                btnBg = '#fee2e2';
                btnColor = '#b91c1c';
                borderColor = '#ef4444';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={isAnswered}
                style={{
                  padding: '24px 20px',
                  borderRadius: '16px',
                  background: btnBg,
                  color: btnColor,
                  border: `2px solid ${borderColor}`,
                  fontSize: '1.1rem',
                  fontFamily: 'Kanit, sans-serif',
                  textAlign: 'left',
                  cursor: isAnswered ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: 'var(--shadow-card)',
                  transform: (!isAnswered && hoveredIndex === idx) ? 'scale(1.02) translateY(-2px)' : 'none'
                }}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <span style={{ fontWeight: 'bold', marginRight: '16px', opacity: 0.7 }}>{String.fromCharCode(65 + idx)}.</span> {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
