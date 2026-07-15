import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Volume2, CheckCircle, XCircle, ArrowRight, Trophy, RefreshCw, Headphones, Play } from 'lucide-react';
import { useUser } from '../context/UserContext';
import confetti from 'canvas-confetti';
import ExamTimer from '../components/ExamTimer';

// ===== QUESTION DATA =====
// Section A: Vocab flashcards (ข้อ 1-3) - 2 options
const vocabQ = [
  { id: 1, word: 'สร้อย', audio: '/audio/vocab_1.mp3', image: '/images/vocab_1_necklace_1777619701174.png',
    question: 'ข้อ 1. คำว่า "สร้อย" อ่านอย่างไร ?',
    options: [{ text: 'ก. สะ-ร้อย', correct: false }, { text: 'ข. ส้อย', correct: true }] },
  { id: 2, word: 'ปลอดภัย', audio: '/audio/vocab_2.mp3', image: '/images/vocab_2_safety_1777619714847.png',
    question: 'ข้อ 2. คำว่า "ปลอดภัย" อ่านอย่างไร ?',
    options: [{ text: 'ก. ปลอด-พัย', correct: true }, { text: 'ข. ปะ-ลอด-พัย', correct: false }] },
  { id: 3, word: 'ภูมิปัญญา', audio: '/audio/vocab_3.mp3', image: '/images/vocab_4_wisdom_1777619757158.png',
    question: 'ข้อ 3. คำว่า "ภูมิปัญญา" อ่านอย่างไร ?',
    options: [{ text: 'ก. พู-มิ-ปัน-ยา', correct: false }, { text: 'ข. พูม-ปัน-ยา', correct: true }] },
];

// Section B: Short announcements (ข้อ 4-6) - 2 options
const announcementQ = [
  { id: 4, audio: '/audio/announce_1.mp3',
    script: '"ประกาศ... ห้ามลงเล่นน้ำในบริเวณนี้เนื่องจากน้ำลึกและไหลเชี่ยว"',
    question: 'ข้อ 4. ข้อใดเป็นคำเตือนจากประกาศนี้ ?',
    options: [{ text: 'ก. ห้ามว่ายน้ำ', correct: true }, { text: 'ข. ห้ามตกปลา', correct: false }] },
  { id: 5, audio: '/audio/announce_2.mp3',
    script: '"โปรดทิ้งขยะลงถังให้ถูกประเภท"',
    question: 'ข้อ 5. ข้อใดที่ท่านควรพึงปฏิบัติ ?',
    options: [{ text: 'ก. ทิ้งขยะรวมกัน', correct: false }, { text: 'ข. แยกขยะก่อนทิ้ง', correct: true }] },
  { id: 6, audio: '/audio/announce_3.mp3',
    script: '"เมื่อทำข้อสอบเสร็จแล้ว ให้วางกระดาษคำตอบบนโต๊ะแล้วเดินออกจากห้องเงียบ ๆ"',
    question: 'ข้อ 6. ข้อใดไม่ควรปฏิบัติ ?',
    options: [{ text: 'ก. เดินออกจากห้องเบา ๆ', correct: false }, { text: 'ข. ตะโกนบอกเพื่อนว่าทำเสร็จแล้ว', correct: true }] },
];

// Section C: Story questions (ข้อ 7-9)
const STORY_AUDIO = '/audio/story_donkey_merchant_new.m4a';
const STORY_IMG = '/images/story_donkey_merchant_1777621288896.png';
const storyQ = [
  { id: 7, question: 'ข้อ 7. พ่อค้าบรรทุกสิ่งใดไว้บนหลังลาในครั้งแรก ?',
    options: [{ text: 'ก. กระสอบเกลือ', correct: true }, { text: 'ข. กระสอบนุ่น', correct: false }] },
  { id: 8, question: 'ข้อ 8. เพราะเหตุใดลาจึงรู้สึกว่าของเบาลง หลังจากตกน้ำครั้งแรก ?',
    options: [{ text: 'ก. พ่อค้าช่วยยกของออก', correct: false }, { text: 'ข. เกลือละลายไปกับน้ำ', correct: true }] },
  { id: 9, question: 'ข้อ 9. ข้อคิดจากนิทานเรื่องนี้ตรงกับข้อใด ?',
    options: [
      { text: 'ก. ความเจ้าเล่ห์เพื่อเลี่ยงงานหนัก มักนำมาซึ่งความลำบากที่มากกว่าเดิม', correct: true },
      { text: 'ข. ความพยายามอยู่ที่ไหน ความสำเร็จอยู่ที่นั่น', correct: false }
    ] },
];

// Section D: 4-option vocab (ข้อ 10-11)
const vocab4Q = [
  { id: 10, audio: '/audio/vocab_4.mp3', word: '"กงสุล"',
    question: 'ข้อ 10. คำศัพท์ที่ฟังตรงกับข้อใด ?',
    options: [
      { text: 'ก. กงสน', correct: false }, { text: 'ข. กงสุล', correct: true },
      { text: 'ค. กงสุน', correct: false }, { text: 'ง. กงศุล', correct: false }
    ] },
  { id: 11, audio: '/audio/vocab_5.mp3', word: '"วาทศิลป์"',
    question: 'ข้อ 11. คำศัพท์ที่ฟังตรงกับข้อใด ?',
    options: [
      { text: 'ก. วาทศิลป์', correct: true }, { text: 'ข. วาทสิน', correct: false },
      { text: 'ค. วาทศิล', correct: false }, { text: 'ง. วาทสินป์', correct: false }
    ] },
];

// Section E: Proverbs (ข้อ 12-14)
const proverbQ = [
  { id: 12, audio: '/audio/announce_4.mp3', saying: '"จับปลาสองมือ"',
    question: 'ข้อ 12. สำนวนนี้มีความหมายตรงกับข้อใด ?',
    options: [
      { text: 'ก. เลือกทำสิ่งที่ง่ายที่สุด', correct: false },
      { text: 'ข. ทำงานอย่างตั้งใจและรอบคอบ', correct: false },
      { text: 'ค. ทำสิ่งใดสิ่งหนึ่งเพียงอย่างเดียว', correct: false },
      { text: 'ง. ทำหลายอย่างพร้อมกันจนไม่สำเร็จสักอย่าง', correct: true }
    ] },
  { id: 13, audio: '/audio/announce_5.mp3', saying: '"น้ำขึ้นให้รีบตัก"',
    question: 'ข้อ 13. สำนวนนี้มีความหมายตรงกับข้อใด ?',
    options: [
      { text: 'ก. รีบทำเมื่อมีโอกาสดี', correct: true },
      { text: 'ข. ทำงานอย่างไม่เร่งรีบ', correct: false },
      { text: 'ค. ทำงานตามลำดับขั้นตอน', correct: false },
      { text: 'ง. รอเวลาที่เหมาะสมก่อนลงมือทำ', correct: false }
    ] },
  { id: 14, audio: '/audio/story_1.mp3', saying: '"มือไม่พาย เอาเท้าราน้ำ"',
    question: 'ข้อ 14. สำนวนนี้มีความหมายตรงกับข้อใด ?',
    options: [
      { text: 'ก. ทำงานอย่างมีความสุข', correct: false },
      { text: 'ข. ทำงานด้วยความรวดเร็ว', correct: false },
      { text: 'ค. ช่วยเหลือผู้อื่นอย่างเต็มที่', correct: false },
      { text: 'ง. ไม่ช่วยแล้วยังขัดขวางผู้อื่น', correct: true }
    ] },
];

// Section F: Article T/F (ข้อ 15-19) - true/false
const ARTICLE_AUDIO = '/audio/record6_new.m4a';
const tfQ = [
  { id: 15, statement: 'ข้อ 15. การใช้สื่อไม่มีผลเสียต่อสุขภาพ', correct: false },
  { id: 16, statement: 'ข้อ 16. เด็กที่ติดจอสามารถควบคุมอารมณ์ได้', correct: false },
  { id: 17, statement: 'ข้อ 17. การใช้สื่อต้องมีผู้ปกครองควบคุมดูแลอย่างใกล้ชิด', correct: true },
  { id: 18, statement: 'ข้อ 18. การใช้จอมากเกินไปส่งผลเสียต่อพัฒนาการด้านต่างๆ', correct: true },
  { id: 19, statement: 'ข้อ 19. ผู้ปกครองควรเลือกโปรแกรมหรือแอปพลิเคชันที่เหมาะสมกับวัย', correct: true },
];

// Section G: Announcement MCQ (ข้อ 20-21)
const ANN_COLD_AUDIO = '/audio/l3_listen_announcement.mp3';
const annColdQ = [
  { id: 20, question: 'ข้อ 20. จุดประสงค์หลักของประกาศนี้คืออะไร ?',
    options: [
      { text: 'ก. รายงานสภาพอากาศประจำวัน', correct: false },
      { text: 'ข. เตือนให้เตรียมรับมือกับภัยหนาว', correct: true },
      { text: 'ค. แนะนำวิธีการปลูกพืชในฤดูหนาว', correct: false },
      { text: 'ง. ประชาสัมพันธ์โครงการช่วยเหลือเกษตรกร', correct: false }
    ] },
  { id: 21, question: 'ข้อ 21. กลุ่มเป้าหมายหลักของประกาศนี้คือใคร ?',
    options: [
      { text: 'ก. ปศุสัตว์จังหวัด', correct: false },
      { text: 'ข. พ่อค้าคนกลาง', correct: false },
      { text: 'ค. ผู้ที่อาศัยอยู่ในเมือง', correct: false },
      { text: 'ง. เกษตรกรและผู้เลี้ยงสัตว์', correct: true }
    ] },
];

// Section H: Ad questions (ข้อ 22-23)
const AD_AUDIO = '/audio/ad_new.m4a';
const adQ = [
  { id: 22, question: 'ข้อ 22. คำพูดในข้อใดมีลักษณะเป็น การโฆษณาเกินจริง ?',
    options: [
      { text: 'ก. จดจำแม่นยำเหมือนวัยหนุ่มสาว', correct: true },
      { text: 'ข. สั่งซื้อวันนี้ลดทันที 50%', correct: false },
      { text: 'ค. สารสกัดจากธรรมชาติ', correct: false },
      { text: 'ง. ผ่านการวิจัยมาแล้ว', correct: false }
    ] },
  { id: 23, question: 'ข้อ 23. หาก "สมชาย" จะตัดสินใจซื้อผลิตภัณฑ์นี้อย่างมีวิจารณญาณ ควรทำสิ่งใดเป็นอันดับแรก ?',
    options: [
      { text: 'ก. รีบสั่งซื้อทันทีเพราะลดราคาถึง 50%', correct: false },
      { text: 'ข. ลองซื้อมาทานดูก่อนเพราะเป็นสารสกัดจากธรรมชาติ', correct: false },
      { text: 'ค. สอบถามความเห็นจากเพื่อนในโซเชียลมีเดีย', correct: false },
      { text: 'ง. ตรวจสอบเลขทะเบียน อย. และงานวิจัยที่อ้างถึง', correct: true }
    ] },
];

// Section I: Polysemy & spelling (ข้อ 24-25)
const lastQ = [
  { id: 24, audio: '/audio/l3_listen_q14.mp3',
    script: '"เขาหัวเราะจน ขัน ที่ถืออยู่สั่นไปมา เพราะนึกถึงเรื่อง ขัน ที่เพื่อนเล่า"',
    question: 'ข้อ 24. คำว่า "ขัน" คำแรก มีความหมายตรงกับข้อใด ?',
    options: [
      { text: 'ก. ภาชนะตักน้ำ', correct: true },
      { text: 'ข. ตลกขบขัน', correct: false },
      { text: 'ค. การทำให้ตึง', correct: false },
      { text: 'ง. เสียงร้องของไก่', correct: false }
    ] },
  { id: 25, audio: '/audio/l3_listen_q15.mp3',
    script: '"ยายกินลำไย น้ำลายยายไหลย้อย"',
    question: 'ข้อ 25. คำที่อยู่ในมาตราตัวสะกด แม่เกย มีกี่คำ (ไม่นับคำซ้ำ) ?',
    options: [
      { text: 'ก. 1 คำ', correct: false },
      { text: 'ข. 2 คำ', correct: false },
      { text: 'ค. 3 คำ', correct: true },
      { text: 'ง. 4 คำ', correct: false }
    ] },
];

// ===== AUDIO BUTTON =====
function AudioBtn({ src }) {
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

  useEffect(() => () => { ref.current?.pause(); }, []);

  return (
    <button onClick={play} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px', borderRadius: '30px', border: 'none', background: playing ? 'var(--color-primary)' : 'rgba(168,85,247,0.12)', color: playing ? 'white' : 'var(--color-primary)', fontWeight: '600', cursor: 'pointer', fontSize: '1.1rem', transition: 'all 0.2s', fontFamily: 'inherit' }}>
      {playing ? <Volume2 size={18} /> : <Play size={18} />} {playing ? 'กำลังเล่น...' : 'ฟังเสียง'}
    </button>
  );
}

// ===== RESULTS MODAL =====
function ResultModal({ score, total, onClose, onRetry }) {
  const pct = Math.round((score / total) * 100);
  const passed = score >= 18;

  const fire = useCallback(() => {
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.55 }, scalar: 1.3,
      colors: ['#a855f7', '#7c3aed', '#fbbf24', '#10b981'], zIndex: 9999 });
  }, []);
  useEffect(() => { if (passed) { fire(); setTimeout(fire, 1000); } }, [passed, fire]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div className="animate-fade-in" style={{ background: 'white', borderRadius: '24px', padding: '48px 40px', maxWidth: '480px', width: '100%', textAlign: 'center', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ width: '90px', height: '90px', borderRadius: '50%', margin: '0 auto 24px', background: passed ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#ef4444,#dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: passed ? '0 8px 24px rgba(16,185,129,0.4)' : '0 8px 24px rgba(239,68,68,0.4)' }}>
          {passed ? <Trophy size={44} /> : <XCircle size={44} />}
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: passed ? '#059669' : '#dc2626', marginBottom: '8px' }}>
          {passed ? '🎉 ยอดเยี่ยม!' : '❌ ยังไม่ผ่านเกณฑ์'}
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '28px' }}>
          {passed ? 'คุณทำทักษะการฟังได้สำเร็จครับ!' : 'ลองทำใหม่อีกครั้งได้เลยนะครับ'}
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '28px' }}>
          <div style={{ padding: '16px 28px', background: 'rgba(168,85,247,0.08)', borderRadius: '16px', border: '2px solid rgba(168,85,247,0.2)' }}>
            <div style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: '4px' }}>คะแนนที่ได้</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-primary)', lineHeight: 1 }}>{score}</div>
            <div style={{ fontSize: '1.1rem', color: '#9ca3af' }}>จาก {total}</div>
          </div>
          <div style={{ padding: '16px 28px', background: passed ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', borderRadius: '16px', border: `2px solid ${passed ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
            <div style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: '4px' }}>ร้อยละ</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: passed ? '#059669' : '#dc2626', lineHeight: 1 }}>{pct}%</div>
            <div style={{ fontSize: '1.1rem', color: '#9ca3af' }}>เกณฑ์ 60%</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={onRetry} className="btn-secondary" style={{ padding: '12px 24px', borderRadius: '30px' }}>ทำใหม่อีกครั้ง</button>
          <button onClick={onClose} className="btn-primary" style={{ padding: '12px 28px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ArrowRight size={18} /> ดูผลและออก
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== MAIN COMPONENT =====
export default function ListeningTest() {
  const { recordScore } = useUser();
  const navigate = useNavigate();

  // answers map: { qId: true/false } (true = correct)
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tfAnswers, setTfAnswers] = useState({}); // { 15: true/false }

  const totalQ = 25;

  const allMCQ = [
    ...vocabQ.map(q => ({ ...q, type: 'mcq_2' })),
    ...announcementQ.map(q => ({ ...q, type: 'mcq_2' })),
    ...storyQ.map(q => ({ ...q, type: 'mcq_2' })),
    ...vocab4Q.map(q => ({ ...q, type: 'mcq_4' })),
    ...proverbQ.map(q => ({ ...q, type: 'mcq_4' })),
    ...annColdQ.map(q => ({ ...q, type: 'mcq_4' })),
    ...adQ.map(q => ({ ...q, type: 'mcq_4' })),
    ...lastQ.map(q => ({ ...q, type: 'mcq_4' })),
  ];

  const answeredCount = Object.keys(answers).length + Object.keys(tfAnswers).length;
  const progress = Math.round((answeredCount / totalQ) * 100);

  const calcScore = () => {
    let s = 0;
    Object.values(answers).forEach(v => { if (v) s++; });
    Object.entries(tfAnswers).forEach(([id, ans]) => {
      const q = tfQ.find(q => q.id === parseInt(id));
      if (q && ans === q.correct) s++;
    });
    return s;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const score = calcScore();
    try { await recordScore({ level: 1, skill: 'listening', score, maxScore: totalQ }); } catch (e) { /* ignore */ }
    setShowResult(true);
    setSubmitting(false);
  };

  const [timerKey, setTimerKey] = useState(0); // reset timer on retry

  const handleClose = () => navigate('/skills');
  const handleRetry = () => { setAnswers({}); setTfAnswers({}); setShowResult(false); setTimerKey(k => k + 1); };

  const SectionHeader = ({ num, title, icon }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', marginTop: '40px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>{num}</div>
      <div>
        <h3 style={{ margin: 0, color: 'var(--color-primary-dark)', fontSize: '1.1rem' }}>{title}</h3>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1.1rem' }}>{icon}</p>
      </div>
    </div>
  );

  const MCQCard = ({ q, type = 'mcq_2' }) => {
    const selected = answers[q.id];
    return (
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '16px' }}>
        {q.audio && <div style={{ marginBottom: '12px' }}><AudioBtn src={q.audio} label={q.word ? `ฟังคำ "${q.word}"` : 'ฟังเสียง'} /></div>}
        {q.script && <div style={{ padding: '14px 20px', background: 'rgba(168,85,247,0.06)', borderRadius: '10px', color: 'var(--color-primary-dark)', fontStyle: 'italic', marginBottom: '12px', lineHeight: '1.7', fontSize: '1.1rem' }}>{q.script}</div>}
        {q.saying && <div style={{ padding: '14px 20px', background: 'rgba(168,85,247,0.06)', borderRadius: '10px', color: 'var(--color-primary-dark)', fontWeight: '600', marginBottom: '12px', fontSize: '1.1rem' }}>สำนวน: {q.saying}</div>}
        {q.image && <img src={q.image} alt="" style={{ width: '100%', maxWidth: '240px', borderRadius: '12px', margin: '0 auto 16px auto', display: 'block' }} />}
        <p style={{ fontWeight: '600', color: 'var(--color-primary-dark)', marginBottom: '14px' }}>{q.question}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {q.options.map((opt, i) => {
            const isSelected = selected === i;
            return (
              <button key={i} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.correct }))} className="option-btn"
                style={{ padding: '14px 20px', borderRadius: '10px', border: `2px solid ${isSelected ? 'var(--color-primary)' : 'rgba(0,0,0,0.08)'}`, background: isSelected ? 'rgba(168,85,247,0.1)' : 'white', color: isSelected ? 'var(--color-primary-dark)' : '#374151', textAlign: 'left', cursor: 'pointer', fontWeight: isSelected ? '600' : '400', transition: 'all 0.2s', fontFamily: 'inherit', fontSize: '1.1rem' }}>
                {opt.text}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const TFCard = ({ q }) => {
    const ans = tfAnswers[q.id];
    return (
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <p style={{ margin: 0, color: 'var(--color-primary-dark)', fontWeight: '500', flex: 1, minWidth: '200px' }}>{q.statement}</p>
        <div style={{ display: 'flex', gap: '14px' }}>
          {[{ label: '✓ ถูก', val: true }, { label: '✗ ผิด', val: false }].map(({ label, val }) => (
            <button key={label} onClick={() => setTfAnswers(prev => ({ ...prev, [q.id]: val }))} className="option-btn"
              style={{ padding: '10px 22px', borderRadius: '30px', border: `2px solid ${ans === val ? (val ? '#10b981' : '#ef4444') : 'rgba(0,0,0,0.1)'}`, background: ans === val ? (val ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)') : 'white', color: ans === val ? (val ? '#059669' : '#dc2626') : '#6b7280', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}>
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>
      {showResult && <ResultModal score={calcScore()} total={totalQ} onClose={handleClose} onRetry={handleRetry} />}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <Link to="/skills" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>← กลับหน้าเลือกทักษะ</Link>
          <h1 style={{ margin: 0, color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Headphones size={28} color="var(--color-primary)" /> ทักษะการฟัง (25 ข้อ)
          </h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '4px' }}>ตอบแล้ว {answeredCount} / {totalQ}</div>
          <div style={{ height: '8px', width: '150px', borderRadius: '999px', background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,#8b5cf6,#6d28d9)', borderRadius: '999px', transition: 'width 0.3s' }} />
          </div>
        </div>
      </div>

      {/* Timer: 25 ข้อ × 30 วินาที = 750 วินาที */}
      <ExamTimer key={timerKey} totalSeconds={750} onTimeUp={handleSubmit} />

      {/* คำชี้แจง */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '32px', borderLeft: '4px solid var(--color-primary)', background: 'rgba(168,85,247,0.04)' }}>
        <strong style={{ color: 'var(--color-primary-dark)' }}>คำชี้แจง:</strong>
        <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>กดปุ่มลำโพงฟังเสียงก่อน แล้วเลือกคำตอบที่ถูกต้อง</span>
      </div>

      {/* Section A: Vocab Flashcards */}
      <SectionHeader num="A" title="เกมแฟลชการ์ดคำศัพท์ (ข้อ 1-3)" icon="กดปุ่มฟังคำศัพท์ แล้วเลือกคำอ่านที่ถูกต้อง" />
      {vocabQ.map(q => <MCQCard key={q.id} q={q} />)}

      {/* Section B: Short announcements */}
      <SectionHeader num="B" title="ฟังประกาศและคำสั่งสั้น ๆ (ข้อ 4-6)" icon="ฟังแล้วเลือกคำตอบที่ถูกต้อง" />
      {announcementQ.map(q => <MCQCard key={q.id} q={q} />)}

      {/* Section C: Story */}
      <SectionHeader num="C" title='นิทาน "พ่อค้าเกลือกับลาขี้โกง" (ข้อ 7-9)' icon="ฟังนิทานจนจบ แล้วตอบคำถาม" />
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', marginBottom: '20px', textAlign: 'center' }}>
          <img src={STORY_IMG} alt="นิทาน" style={{ width: '180px', borderRadius: '12px' }} />
          <div>
            <AudioBtn src={STORY_AUDIO} label="ฟังนิทาน" />
            <p style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.8' }}>
              พ่อค้าคนหนึ่งมีลาไว้บรรทุกสิ่งของ วันหนึ่งเขาพาลาเดินทางไปซื้อเกลือในเมือง... ลาแกล้งตกน้ำเพื่อให้เกลือละลาย แต่เมื่อพ่อค้าเปลี่ยนมาบรรทุกนุ่นแทน ลาก็เป็นฝ่ายเดือดร้อนเอง
            </p>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {storyQ.map(q => (
            <div key={q.id}>
              <p style={{ fontWeight: '600', color: 'var(--color-primary-dark)', marginBottom: '12px' }}>{q.question}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {q.options.map((opt, i) => {
                  const isSelected = answers[q.id] !== undefined && answers[q.id] === opt.correct && answers[`_sel_${q.id}`] === i;
                  return (
                    <button key={i}
                      onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.correct, [`_sel_${q.id}`]: i }))} className="option-btn"
                      style={{ padding: '14px 20px', borderRadius: '10px', border: `2px solid ${answers[`_sel_${q.id}`] === i ? 'var(--color-primary)' : 'rgba(0,0,0,0.08)'}`, background: answers[`_sel_${q.id}`] === i ? 'rgba(168,85,247,0.1)' : 'white', color: '#374151', textAlign: 'left', cursor: 'pointer', fontWeight: answers[`_sel_${q.id}`] === i ? '600' : '400', transition: 'all 0.2s', fontFamily: 'inherit', fontSize: '1.1rem' }}>
                      {opt.text}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section D: 4-option vocab */}
      <SectionHeader num="D" title="ฟังคำศัพท์และเลือกการสะกดที่ถูกต้อง (ข้อ 10-11)" icon="ฟังเสียงแล้วเลือก 1 ใน 4 ตัวเลือก" />
      {vocab4Q.map(q => <MCQCard key={q.id} q={q} />)}

      {/* Section E: Proverbs */}
      <SectionHeader num="E" title="ฟังสำนวนและเลือกความหมาย (ข้อ 12-14)" icon="ฟังสำนวนแล้วเลือกความหมายที่ถูกต้อง" />
      {proverbQ.map(q => <MCQCard key={q.id} q={q} />)}

      {/* Section F: Article T/F */}
      <SectionHeader num="F" title="ฟังบทความแล้วทำเครื่องหมายถูก/ผิด (ข้อ 15-19)" icon="ฟังบทความ แล้วตัดสินว่าแต่ละข้อความเป็น ถูก หรือ ผิด" />
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '16px' }}>
        <div style={{ marginBottom: '16px' }}>
          <AudioBtn src={ARTICLE_AUDIO} label="ฟังบทความ: เด็กเล็กติดจอมือถือ" />
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontStyle: 'italic', lineHeight: '1.7', marginBottom: '16px' }}>
          "หากปล่อยให้เด็กใกล้ชิดจอมือถือ แท็บเล็ตมากเกินไปโดยไม่กำหนดเวลา จะส่งผลเสียหลายด้าน ได้แก่ ด้านการสื่อสาร ร่างกาย อารมณ์ และพฤติกรรม..."
        </p>
        {tfQ.map(q => <TFCard key={q.id} q={q} />)}
      </div>

      {/* Section G: Cold announcement */}
      <SectionHeader num="G" title="ฟังประกาศแจ้งเตือนภัยหนาว (ข้อ 20-21)" icon="ฟังแล้วเลือกคำตอบ" />
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '16px' }}>
        <div style={{ marginBottom: '16px' }}>
          <AudioBtn src={ANN_COLD_AUDIO} label="ฟังประกาศ" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {annColdQ.map(q => (
            <div key={q.id}>
              <p style={{ fontWeight: '600', color: 'var(--color-primary-dark)', marginBottom: '12px' }}>{q.question}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {q.options.map((opt, i) => (
                  <button key={i}
                    onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.correct, [`_sel_${q.id}`]: i }))} className="option-btn"
                    style={{ padding: '14px 20px', borderRadius: '10px', border: `2px solid ${answers[`_sel_${q.id}`] === i ? 'var(--color-primary)' : 'rgba(0,0,0,0.08)'}`, background: answers[`_sel_${q.id}`] === i ? 'rgba(168,85,247,0.1)' : 'white', color: '#374151', textAlign: 'left', cursor: 'pointer', fontWeight: answers[`_sel_${q.id}`] === i ? '600' : '400', transition: 'all 0.2s', fontFamily: 'inherit', fontSize: '1.1rem' }}>
                    {opt.text}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section H: Ad */}
      <SectionHeader num="H" title="ฟังโฆษณาสินค้าและวิเคราะห์ (ข้อ 22-23)" icon="ฟังโฆษณาแล้วตอบคำถาม" />
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '16px' }}>
        <div style={{ marginBottom: '16px' }}>
          <AudioBtn src={AD_AUDIO} label="ฟังโฆษณา" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {adQ.map(q => (
            <div key={q.id}>
              <p style={{ fontWeight: '600', color: 'var(--color-primary-dark)', marginBottom: '12px' }}>{q.question}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {q.options.map((opt, i) => (
                  <button key={i}
                    onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.correct, [`_sel_${q.id}`]: i }))}
                    style={{ padding: '14px 20px', borderRadius: '10px', border: `2px solid ${answers[`_sel_${q.id}`] === i ? 'var(--color-primary)' : 'rgba(0,0,0,0.08)'}`, background: answers[`_sel_${q.id}`] === i ? 'rgba(168,85,247,0.1)' : 'white', color: '#374151', textAlign: 'left', cursor: 'pointer', fontWeight: answers[`_sel_${q.id}`] === i ? '600' : '400', transition: 'all 0.2s', fontFamily: 'inherit', fontSize: '1.1rem' }}>
                    {opt.text}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section I: Last 2 */}
      <SectionHeader num="I" title="วิเคราะห์ความหมายและมาตราตัวสะกด (ข้อ 24-25)" icon="ฟังเสียงแล้วตอบคำถาม" />
      {lastQ.map(q => <MCQCard key={q.id} q={q} />)}

      {/* Submit */}
      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <button onClick={handleSubmit} disabled={submitting} className="btn-primary"
          style={{ padding: '16px 48px', fontSize: '1.1rem', borderRadius: '30px', display: 'inline-flex', alignItems: 'center', gap: '14px', opacity: submitting ? 0.7 : 1 }}>
          {submitting ? <><RefreshCw size={20} className="spin" /> กำลังบันทึก...</> : <><Trophy size={20} /> ส่งคำตอบและดูผล</>}
        </button>
        <p style={{ color: 'var(--text-muted)', marginTop: '12px', fontSize: '1.1rem' }}>ตอบแล้ว {answeredCount} จาก {totalQ} ข้อ</p>
      </div>
    </div>
  );
}
