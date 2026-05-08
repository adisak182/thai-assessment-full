import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PenTool, CheckCircle, XCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { useUser } from '../context/UserContext';

// --- Part 1: Spelling Data ---
const spellingQuestions = [
  { phonetic: 'พัด - ตา - คาน', answer: 'ภัตตาคาร', qNum: 31 },
  { phonetic: 'พง - สา - วะ - ดาน', answer: 'พงศาวดาร', qNum: 32 },
  { phonetic: 'สัน - นิ - ถาน', answer: 'สันนิษฐาน', qNum: 33 },
  { phonetic: 'ชี - วะ - ประ - หวัด', answer: 'ชีวประวัติ', qNum: 34 },
  { phonetic: 'โพ - ชะ - นา - การ', answer: 'โภชนาการ', qNum: 35 },
];

// --- Part 2: Sentence Arrangement Data ---
const arrangementQuestions = [
  {
    qNum: 36,
    words: ['มี', 'เชื้อโรค', 'น้ำฝน', 'ปะปน'],
    correctOrder: ['น้ำฝน', 'มี', 'เชื้อโรค', 'ปะปน'],
    correctSentence: 'น้ำฝนมีเชื้อโรคปะปน'
  },
  {
    qNum: 37,
    words: ['การกิน', 'ที่', 'โรคท้องเสีย', 'อาหาร', 'ปนเปื้อน', 'เกิดจาก'],
    correctOrder: ['โรคท้องเสีย', 'เกิดจาก', 'การกิน', 'อาหาร', 'ที่', 'ปนเปื้อน'],
    correctSentence: 'โรคท้องเสียเกิดจากการกินอาหารที่ปนเปื้อน'
  },
  {
    qNum: 38,
    words: ['เข้าสู่', 'เชื้อโรค', 'ทางแผล', 'สามารถ', 'ร่างกาย'],
    correctOrder: ['เชื้อโรค', 'สามารถ', 'เข้าสู่', 'ร่างกาย', 'ทางแผล'],
    correctSentence: 'เชื้อโรคสามารถเข้าสู่ร่างกายทางแผล'
  },
  {
    qNum: 39,
    words: ['ไข้เลือดออก', 'พาหะ', 'เป็น', 'นำโรค', 'ยุงลาย'],
    correctOrder: ['ยุงลาย', 'เป็น', 'พาหะ', 'นำโรค', 'ไข้เลือดออก'],
    correctSentence: 'ยุงลายเป็นพาหะนำโรคไข้เลือดออก'
  },
  {
    qNum: 40,
    words: ['แหล่ง', 'ของ', 'น้ำขัง', 'เป็น', 'สะสม', 'เชื้อโรค'],
    correctOrder: ['น้ำขัง', 'เป็น', 'แหล่ง', 'สะสม', 'ของ', 'เชื้อโรค'],
    correctSentence: 'น้ำขังเป็นแหล่งสะสมของเชื้อโรค'
  }
];

// ---- PART 1: SPELLING COMPONENT ----
function SpellingSection({ onComplete }) {
  const [inputs, setInputs] = useState(Array(spellingQuestions.length).fill(''));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleChange = (idx, value) => {
    const updated = [...inputs];
    updated[idx] = value;
    setInputs(updated);
  };

  const handleSubmit = () => {
    let s = 0;
    inputs.forEach((val, idx) => {
      if (val.trim() === spellingQuestions[idx].answer) s++;
    });
    setScore(s);
    setSubmitted(true);
  };

  return (
    <div>
      <div style={{ background: 'rgba(168,85,247,0.08)', padding: '16px 24px', borderRadius: '12px', marginBottom: '24px', borderLeft: '4px solid var(--color-primary)' }}>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontWeight: '500' }}>
          📝 คำชี้แจง : ให้ผู้เรียนพิมพ์คำศัพท์ให้ถูกต้องตามคำอ่านที่กำหนด
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
        {spellingQuestions.map((q, idx) => {
          const isCorrect = submitted && inputs[idx].trim() === q.answer;
          const isWrong = submitted && inputs[idx].trim() !== q.answer;
          return (
            <div
              key={idx}
              style={{
                background: submitted ? (isCorrect ? 'rgba(16,185,129,0.07)' : 'rgba(239,68,68,0.07)') : 'rgba(255,255,255,0.7)',
                border: submitted ? (isCorrect ? '2px solid #10b981' : '2px solid #ef4444') : '2px solid transparent',
                borderRadius: '14px',
                padding: '20px 24px',
                display: 'grid',
                gridTemplateColumns: '2fr 3fr auto',
                gap: '16px',
                alignItems: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
            >
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>ข้อ {q.qNum} — คำอ่าน</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-primary-dark)', letterSpacing: '0.05em' }}>{q.phonetic}</div>
              </div>
              <div>
                <input
                  type="text"
                  value={inputs[idx]}
                  onChange={e => handleChange(idx, e.target.value)}
                  disabled={submitted}
                  placeholder="พิมพ์คำตอบที่นี่..."
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '1.1rem',
                    borderRadius: '10px',
                    border: '1.5px solid rgba(168,85,247,0.3)',
                    background: submitted ? 'rgba(0,0,0,0.03)' : 'white',
                    color: 'var(--text-main)',
                    outline: 'none',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                />
                {submitted && isWrong && (
                  <div style={{ marginTop: '6px', fontSize: '0.9rem', color: '#059669', fontWeight: '600' }}>
                    ✅ เฉลย: {q.answer}
                  </div>
                )}
              </div>
              <div style={{ fontSize: '1.5rem' }}>
                {submitted && (isCorrect ? <CheckCircle size={28} color="#10b981" /> : <XCircle size={28} color="#ef4444" />)}
              </div>
            </div>
          );
        })}
      </div>

      {!submitted ? (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={handleSubmit} className="btn-primary" style={{ padding: '14px 32px', fontSize: '1.1rem', borderRadius: '30px' }}>
            ตรวจคำตอบ <CheckCircle size={20} style={{ display: 'inline', marginLeft: '8px' }} />
          </button>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '24px', background: 'rgba(255,255,255,0.6)', borderRadius: '16px' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '24px', color: 'var(--text-muted)' }}>
            ส่วนที่ 1 เสร็จสิ้น! คะแนน: <strong style={{ color: 'var(--color-primary)', fontSize: '1.4rem' }}>{score}/{spellingQuestions.length}</strong>
          </p>
          <button onClick={() => onComplete(score)} className="btn-primary" style={{ padding: '12px 32px', borderRadius: '30px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            ไปทำส่วนที่ 2: เรียงประโยค <ArrowRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

// ---- PART 2: SENTENCE ARRANGEMENT COMPONENT ----
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function ArrangementSection({ onComplete }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);

  const [availablePool, setAvailablePool] = useState(() => shuffleArray(arrangementQuestions[0].words));
  const [selectedWords, setSelectedWords] = useState([]);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const q = arrangementQuestions[currentIdx];

  const handlePickWord = (word, poolIdx) => {
    if (checked) return;
    const newPool = availablePool.filter((_, i) => i !== poolIdx);
    setAvailablePool(newPool);
    setSelectedWords([...selectedWords, word]);
  };

  const handleRemoveWord = (word, selIdx) => {
    if (checked) return;
    const newSel = selectedWords.filter((_, i) => i !== selIdx);
    setSelectedWords(newSel);
    setAvailablePool([...availablePool, word]);
  };

  const handleCheck = () => {
    const formed = selectedWords.join('');
    const correct = q.correctSentence;
    const ok = formed === correct;
    setIsCorrect(ok);
    setChecked(true);
    if (ok) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentIdx < arrangementQuestions.length - 1) {
      const nextQ = arrangementQuestions[currentIdx + 1];
      setCurrentIdx(currentIdx + 1);
      setAvailablePool(shuffleArray(nextQ.words));
      setSelectedWords([]);
      setChecked(false);
      setIsCorrect(false);
    } else {
      onComplete(score + (isCorrect && !checked ? 1 : 0));
    }
  };

  const handleReset = () => {
    setAvailablePool(shuffleArray(q.words));
    setSelectedWords([]);
    setChecked(false);
    setIsCorrect(false);
  };

  return (
    <div>
      <div style={{ background: 'rgba(59,130,246,0.08)', padding: '16px 24px', borderRadius: '12px', marginBottom: '24px', borderLeft: '4px solid #3b82f6' }}>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontWeight: '500' }}>
          🔤 คำชี้แจง : ให้ผู้เรียนเรียงคำให้เป็นประโยคความรวมที่ถูกต้อง (กดเลือกคำตามลำดับ)
        </p>
      </div>

      <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.3rem', color: 'var(--color-primary-dark)', margin: 0 }}>
          ข้อ {q.qNum} ({currentIdx + 1}/{arrangementQuestions.length})
        </h3>
        <button onClick={handleReset} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem' }}>
          <RefreshCw size={16} /> เริ่มใหม่
        </button>
      </div>

      {/* Answer area */}
      <div style={{
        minHeight: '64px',
        border: checked ? (isCorrect ? '2px solid #10b981' : '2px solid #ef4444') : '2px dashed rgba(168,85,247,0.4)',
        borderRadius: '14px',
        padding: '12px 16px',
        marginBottom: '20px',
        background: checked ? (isCorrect ? 'rgba(16,185,129,0.07)' : 'rgba(239,68,68,0.07)') : 'rgba(255,255,255,0.5)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        alignItems: 'center',
        transition: 'all 0.3s'
      }}>
        {selectedWords.length === 0 && !checked && (
          <span style={{ color: 'rgba(0,0,0,0.3)', fontSize: '1rem' }}>กดคำด้านล่างเพื่อสร้างประโยค...</span>
        )}
        {selectedWords.map((word, i) => (
          <button
            key={i}
            onClick={() => handleRemoveWord(word, i)}
            disabled={checked}
            style={{
              padding: '8px 16px',
              borderRadius: '24px',
              background: checked ? (isCorrect ? '#10b981' : '#ef4444') : 'var(--color-primary)',
              color: 'white',
              border: 'none',
              fontSize: '1.1rem',
              cursor: checked ? 'default' : 'pointer',
              fontFamily: 'inherit',
              fontWeight: '600',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              transition: 'all 0.2s'
            }}
          >
            {word}
          </button>
        ))}
      </div>

      {/* Word pool */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', minHeight: '52px' }}>
        {availablePool.map((word, i) => (
          <button
            key={i}
            onClick={() => handlePickWord(word, i)}
            disabled={checked}
            style={{
              padding: '10px 20px',
              borderRadius: '24px',
              background: 'white',
              color: 'var(--color-primary-dark)',
              border: '2px solid rgba(168,85,247,0.3)',
              fontSize: '1.1rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: '600',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              transition: 'all 0.2s'
            }}
          >
            {word}
          </button>
        ))}
      </div>

      {checked && !isCorrect && (
        <div style={{ padding: '16px', background: 'rgba(16,185,129,0.08)', borderRadius: '12px', marginBottom: '20px', borderLeft: '4px solid #10b981' }}>
          <span style={{ fontWeight: '700', color: '#059669' }}>✅ เฉลย: </span>
          <span style={{ color: 'var(--text-main)', fontSize: '1.1rem' }}>{q.correctSentence}</span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        {!checked ? (
          <button
            onClick={handleCheck}
            disabled={selectedWords.length !== q.words.length}
            className="btn-primary"
            style={{ padding: '12px 32px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px', opacity: selectedWords.length !== q.words.length ? 0.5 : 1 }}
          >
            ตรวจคำตอบ <CheckCircle size={20} />
          </button>
        ) : (
          <button onClick={handleNext} className="btn-primary" style={{ padding: '12px 32px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {currentIdx < arrangementQuestions.length - 1 ? 'ข้อถัดไป' : 'ดูผลคะแนน'} <ArrowRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}

// ---- MAIN LEVEL 2 WRITING MODULE ----
export default function Level2Writing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recordScore } = useUser();

  const [phase, setPhase] = useState('intro'); // intro, spelling, arrangement, result
  const [spellingScore, setSpellingScore] = useState(0);
  const [arrangementScore, setArrangementScore] = useState(0);

  const handleSpellingComplete = (s) => {
    setSpellingScore(s);
    setPhase('arrangement');
  };

  const handleArrangementComplete = (s) => {
    const total = spellingScore + s;
    setArrangementScore(s);
    recordScore({ level: parseInt(id), skill: 'writing', score: total, maxScore: 10 });
    setPhase('result');
  };

  if (phase === 'intro') {
    return (
      <div className="animate-fade-in px-4 py-8 max-w-2xl mx-auto text-center">
        <Link to={`/level/${id}`} style={{ color: 'var(--color-primary)', fontWeight: '500', marginBottom: '24px', display: 'inline-block', textDecoration: 'none' }}>
          &larr; กลับไปหน้าระดับ {id}
        </Link>
        <div className="glass-panel" style={{ padding: '48px', marginTop: '16px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', marginBottom: '24px' }}>
            <PenTool size={40} />
          </div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '16px', color: 'var(--color-primary-dark)' }}>แบบทดสอบทักษะการเขียน Level 2</h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.8' }}>
            แบบทดสอบนี้แบ่งออกเป็น 2 ส่วน (รวม 10 ข้อ)
            <br />
            <strong>ส่วนที่ 1:</strong> พิมพ์คำศัพท์ให้ถูกต้องตามคำอ่าน (ข้อ 31-35)
            <br />
            <strong>ส่วนที่ 2:</strong> เรียงคำให้เป็นประโยคที่ถูกต้อง (ข้อ 36-40)
          </p>
          <button onClick={() => setPhase('spelling')} className="btn-primary" style={{ padding: '16px 32px', fontSize: '1.2rem', borderRadius: '30px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            เริ่มทำแบบทดสอบ <ArrowRight size={24} />
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'spelling') {
    return (
      <div className="animate-fade-in px-4 py-8 max-w-3xl mx-auto">
        <Link to={`/level/${id}`} style={{ color: 'var(--color-primary)', fontWeight: '500', marginBottom: '24px', display: 'inline-block', textDecoration: 'none' }}>
          &larr; ออกจากแบบทดสอบ
        </Link>
        <div className="glass-panel" style={{ padding: '40px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', color: 'var(--color-primary-dark)' }}>
            ✍️ ส่วนที่ 1: เขียนคำให้ถูกต้อง (ข้อ 31-35)
          </h2>
          <SpellingSection onComplete={handleSpellingComplete} />
        </div>
      </div>
    );
  }

  if (phase === 'arrangement') {
    return (
      <div className="animate-fade-in px-4 py-8 max-w-3xl mx-auto">
        <Link to={`/level/${id}`} style={{ color: 'var(--color-primary)', fontWeight: '500', marginBottom: '24px', display: 'inline-block', textDecoration: 'none' }}>
          &larr; ออกจากแบบทดสอบ
        </Link>
        <div className="glass-panel" style={{ padding: '40px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', color: 'var(--color-primary-dark)' }}>
            🔤 ส่วนที่ 2: เรียงคำเป็นประโยค (ข้อ 36-40)
          </h2>
          <ArrangementSection onComplete={handleArrangementComplete} />
        </div>
      </div>
    );
  }

  if (phase === 'result') {
    const total = spellingScore + arrangementScore;
    return (
      <div className="animate-fade-in px-4 py-8 max-w-2xl mx-auto text-center">
        <div className="glass-panel" style={{ padding: '48px', marginTop: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', marginBottom: '24px' }}>
            <CheckCircle size={40} />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--color-primary-dark)' }}>
            ทำแบบทดสอบทักษะการเขียน Level 2 สำเร็จ!
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.7)', borderRadius: '16px' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>ส่วนที่ 1 เขียนคำ</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{spellingScore} / 5</div>
            </div>
            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.7)', borderRadius: '16px' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>ส่วนที่ 2 เรียงประโยค</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>{arrangementScore} / 5</div>
            </div>
          </div>
          <p style={{ fontSize: '1.3rem', color: 'var(--text-muted)', marginBottom: '32px' }}>
            คะแนนรวม: <strong style={{ color: 'var(--color-primary)', fontSize: '1.8rem' }}>{total}</strong> คะแนน (จาก 10 คะแนน)
          </p>
          <button onClick={() => navigate(`/level/${id}`)} className="btn-primary" style={{ padding: '12px 32px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            กลับไปหน้าระดับ <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
