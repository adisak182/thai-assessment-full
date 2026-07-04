import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PenTool, Trophy, XCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { useUser } from '../context/UserContext';
import confetti from 'canvas-confetti';

// ===== QUESTION DATA =====

// Section A: Spell from image/audio (ข้อ 71-72) - type answer
const spellQ = [
  { id: 71, word: 'บรรทุก', hint: 'คำที่หมายถึง การใส่ของขึ้นบนพาหนะ', image: '/images/story_donkey_merchant_1777621288896.png', audio: '/audio/vocab_bantuk.mp3' },
  { id: 72, word: 'ละลาย', hint: 'คำที่หมายถึง ของแข็งที่กลายเป็นของเหลวเมื่อถูกความร้อน', image: null, audio: '/audio/vocab_lalai.mp3' },
];

// Section B: Fill in the blank (ข้อ 73-75)
const fillQ = [
  { id: 73, sentence: 'เมื่อเกลือถูกน้ำ เกลือจะ _______ ไปกับน้ำ', answer: 'ละลาย', choices: ['แข็งตัว', 'ละลาย', 'อุบาย', 'ของขวัญ', 'อุ้ม', 'แบก'] },
  { id: 74, sentence: 'พ่อค้าต้องการแก้เผ็ดลา จึงใช้ _______ หลอกล่อ', answer: 'อุบาย', choices: ['แข็งตัว', 'ละลาย', 'อุบาย', 'ของขวัญ', 'อุ้ม', 'แบก'] },
  { id: 75, sentence: 'เมื่อนุ่นถูกน้ำ นุ่นจะ _______ น้ำไว้จนหนักอึ้ง', answer: 'แบก', choices: ['แข็งตัว', 'ละลาย', 'อุบาย', 'ของขวัญ', 'อุ้ม', 'แบก'] },
];
const WORD_BANK = ['แข็งตัว', 'ละลาย', 'อุบาย', 'ของขวัญ', 'อุ้ม', 'แบก'];

// Section C: Write correct spelling (ข้อ 76-80)
const spellingQ = [
  { id: 76, reading: 'พัด-ตา-คาน', answer: 'ภัตตาคาร' },
  { id: 77, reading: 'พง-สา-วะ-ดาน', answer: 'พงศาวดาร' },
  { id: 78, reading: 'สัน-นิ-ถาน', answer: 'สันนิษฐาน' },
  { id: 79, reading: 'ชี-วะ-ประ-หวัด', answer: 'ชีวประวัติ' },
  { id: 80, reading: 'โพ-ชะ-นา-การ', answer: 'โภชนาการ' },
];

// Section D: Rearrange words (ข้อ 81-85)
const rearrangeQ = [
  { id: 81, words: ['มี', 'เชื้อโรค', 'น้ำฝน', 'ปะปน'], answer: 'น้ำฝนมีเชื้อโรคปะปน' },
  { id: 82, words: ['การกิน', 'ที่', 'โรคท้องเสีย', 'อาหาร', 'ปนเปื้อน', 'เกิดจาก'], answer: 'โรคท้องเสียเกิดจากการกินอาหารที่ปนเปื้อน' },
  { id: 83, words: ['เข้าสู่', 'เชื้อโรค', 'ทางแผล', 'สามารถ', 'ร่างกาย'], answer: 'เชื้อโรคสามารถเข้าสู่ร่างกายทางแผล' },
  { id: 84, words: ['ไข้เลือดออก', 'พาหะ', 'เป็น', 'นำโรค', 'ยุงลาย'], answer: 'ยุงลายเป็นพาหะนำโรคไข้เลือดออก' },
  { id: 85, words: ['แหล่ง', 'ของ', 'น้ำขัง', 'เป็น', 'สะสม', 'เชื้อโรค'], answer: 'น้ำขังเป็นแหล่งสะสมของเชื้อโรค' },
];

// Section E: Reading/answer (ข้อ 86-90) — MCQ-based
const sectionEQ = [
  { id: 86, question: 'ข้อ 86. คำใดเขียนถูกต้อง ?', options: [{ text: 'ก. วิทยาศาสตต์', correct: false }, { text: 'ข. วิทยาศาสตร์', correct: true }, { text: 'ค. วิทยาสาสตร์', correct: false }, { text: 'ง. วิทยศาสตร์', correct: false }] },
  { id: 87, question: 'ข้อ 87. คำใดเขียนถูกต้องทุกคำ ?', options: [{ text: 'ก. เกษตกร, ประกาศ', correct: false }, { text: 'ข. เกษตรกร, ประกาศ', correct: true }, { text: 'ค. เกษตรกร, ประการ', correct: false }, { text: 'ง. เกษตกร, ประการ', correct: false }] },
  { id: 88, question: 'ข้อ 88. ประโยคใดเขียนถูกต้องตามหลักภาษาไทย ?', options: [{ text: 'ก. เขาไปตลาดซื้อปลาและผักมาทำอาหาร', correct: true }, { text: 'ข. เขาซื้อตลาดปลาและผักไปทำอาหาร', correct: false }, { text: 'ค. ตลาดเขาซื้อปลาและผักมาทำอาหาร', correct: false }, { text: 'ง. ปลาและผักเขาไปตลาดทำอาหารซื้อ', correct: false }] },
  { id: 89, question: 'ข้อ 89. ข้อใดใช้เครื่องหมายวรรคตอนถูกต้อง ?', options: [{ text: 'ก. เธอชอบกิน, ขนม, หวาน', correct: false }, { text: 'ข. สุดท้ายเขาก็ยอมแพ้ ด้วยความเหนื่อยล้า', correct: false }, { text: 'ค. "ไม่เป็นไร" เขากล่าว พร้อมยิ้มอ่อน', correct: true }, { text: 'ง. เธอถามว่า ทำไม เขาถึงมาสาย', correct: false }] },
  { id: 90, question: 'ข้อ 90. คำในข้อใดเป็นคำที่มาจากภาษาอังกฤษ ?', options: [{ text: 'ก. กล้วย', correct: false }, { text: 'ข. โทรทัศน์', correct: false }, { text: 'ค. คอมพิวเตอร์', correct: true }, { text: 'ง. ตลาด', correct: false }] },
];

// Section F (ข้อ 91-100) – Short passage MCQ
const PASSAGE_F = `"สิ่งแวดล้อมทางธรรมชาติมีความสำคัญต่อการดำรงชีวิตของมนุษย์อย่างมาก ทั้งอากาศบริสุทธิ์ น้ำสะอาด และพื้นที่สีเขียวล้วนเป็นปัจจัยพื้นฐานที่ช่วยรักษาสุขภาพของเราได้ อย่างไรก็ตาม ในปัจจุบันสิ่งแวดล้อมกำลังถูกทำลายด้วยน้ำมือมนุษย์ ไม่ว่าจะเป็นมลพิษทางอากาศจากการเผาไหม้ น้ำเสียจากโรงงานอุตสาหกรรม หรือการตัดไม้ทำลายป่า ดังนั้น ทุกคนควรมีส่วนร่วมในการอนุรักษ์สิ่งแวดล้อม เพื่อให้โลกใบนี้ยังคงเป็นที่อยู่อาศัยที่ดีสำหรับคนรุ่นต่อไป"`;
const sectionFQ = [
  { id: 91, question: 'ข้อ 91. บทความนี้มีใจความสำคัญเกี่ยวกับอะไร ?', options: [{ text: 'ก. วิธีการทำอาหารเพื่อสุขภาพ', correct: false }, { text: 'ข. ความสำคัญของสิ่งแวดล้อมและการอนุรักษ์', correct: true }, { text: 'ค. การพัฒนาอุตสาหกรรมในประเทศ', correct: false }, { text: 'ง. ประโยชน์ของเทคโนโลยีสมัยใหม่', correct: false }] },
  { id: 92, question: 'ข้อ 92. ข้อใดไม่ได้กล่าวถึงในบทความ ?', options: [{ text: 'ก. มลพิษทางอากาศ', correct: false }, { text: 'ข. น้ำเสียจากโรงงาน', correct: false }, { text: 'ค. การตัดไม้ทำลายป่า', correct: false }, { text: 'ง. มลพิษทางเสียง', correct: true }] },
  { id: 93, question: 'ข้อ 93. คำว่า "ปัจจัยพื้นฐาน" ในบทความหมายถึงอะไร ?', options: [{ text: 'ก. สิ่งที่จำเป็นขั้นต้นสำหรับการดำรงชีวิต', correct: true }, { text: 'ข. สิ่งฟุ่มเฟือยที่ไม่จำเป็น', correct: false }, { text: 'ค. ปัจจัยทางเศรษฐกิจที่ซับซ้อน', correct: false }, { text: 'ง. ปัจจัยที่เกี่ยวข้องกับเทคโนโลยี', correct: false }] },
  { id: 94, question: 'ข้อ 94. ข้อใดคือเหตุผลที่ทุกคนควรอนุรักษ์สิ่งแวดล้อม ?', options: [{ text: 'ก. เพื่อให้โรงงานอุตสาหกรรมทำงานได้ดีขึ้น', correct: false }, { text: 'ข. เพื่อให้คนรุ่นต่อไปมีที่อยู่อาศัยที่ดี', correct: true }, { text: 'ค. เพื่อเพิ่มรายได้จากการท่องเที่ยว', correct: false }, { text: 'ง. เพื่อลดค่าใช้จ่ายในครัวเรือน', correct: false }] },
  { id: 95, question: 'ข้อ 95. ข้อใดสรุปใจความของบทความได้ถูกต้องที่สุด ?', options: [{ text: 'ก. โลกกำลังร้อนขึ้นเพราะมนุษย์ใช้รถยนต์มากเกินไป', correct: false }, { text: 'ข. สิ่งแวดล้อมสำคัญต่อมนุษย์แต่กำลังถูกทำลาย ทุกคนควรช่วยกันอนุรักษ์', correct: true }, { text: 'ค. อุตสาหกรรมเป็นสิ่งจำเป็นมากกว่าสิ่งแวดล้อม', correct: false }, { text: 'ง. อากาศบริสุทธิ์สำคัญกว่าน้ำสะอาด', correct: false }] },
  { id: 96, question: 'ข้อ 96. คำว่า "อนุรักษ์" ในบทความมีความหมายตรงกับข้อใด ?', options: [{ text: 'ก. ทำลาย', correct: false }, { text: 'ข. เพิกเฉย', correct: false }, { text: 'ค. ปกป้องรักษา', correct: true }, { text: 'ง. เปลี่ยนแปลง', correct: false }] },
  { id: 97, question: 'ข้อ 97. ข้อใดเป็น "ข้อเท็จจริง" จากบทความ ?', options: [{ text: 'ก. โรงงานอุตสาหกรรมทุกแห่งปล่อยน้ำเสีย', correct: false }, { text: 'ข. การตัดไม้ทำลายป่าเป็นสาเหตุหนึ่งที่ทำให้สิ่งแวดล้อมเสื่อมโทรม', correct: true }, { text: 'ค. มนุษย์ทุกคนไม่ใส่ใจสิ่งแวดล้อม', correct: false }, { text: 'ง. อากาศในเมืองบริสุทธิ์กว่าในป่า', correct: false }] },
  { id: 98, question: 'ข้อ 98. ผู้เขียนบทความมีทัศนคติต่อสิ่งแวดล้อมอย่างไร ?', options: [{ text: 'ก. เห็นว่าสิ่งแวดล้อมไม่สำคัญเท่าการพัฒนาเศรษฐกิจ', correct: false }, { text: 'ข. กังวลและต้องการให้ทุกคนร่วมมือกันดูแลรักษา', correct: true }, { text: 'ค. เชื่อว่าธรรมชาติสามารถฟื้นฟูตัวเองได้โดยไม่ต้องการความช่วยเหลือ', correct: false }, { text: 'ง. มองว่าปัญหาสิ่งแวดล้อมแก้ไขไม่ได้แล้ว', correct: false }] },
  { id: 99, question: 'ข้อ 99. หากต้องการอนุรักษ์สิ่งแวดล้อมในชีวิตประจำวัน ควรทำสิ่งใด ?', options: [{ text: 'ก. ใช้ถุงพลาสติกให้มากขึ้นเพื่อความสะดวก', correct: false }, { text: 'ข. ลดการใช้ไฟฟ้าและน้ำในที่ไม่จำเป็น', correct: true }, { text: 'ค. เผาขยะในบ้านแทนการทิ้งลงถัง', correct: false }, { text: 'ง. ตัดต้นไม้เก่าออกเพื่อปลูกใหม่ทดแทน', correct: false }] },
  { id: 100, question: 'ข้อ 100. คำใดมีความหมายใกล้เคียงกับคำว่า "บริสุทธิ์" มากที่สุด ?', options: [{ text: 'ก. สกปรก', correct: false }, { text: 'ข. สะอาด', correct: true }, { text: 'ค. หอม', correct: false }, { text: 'ง. ร้อน', correct: false }] },
];

function ResultModal({ score, total, onClose, onRetry }) {
  const pct = Math.round((score / total) * 100);
  const passed = score >= 21;
  const fire = useCallback(() => confetti({ particleCount: 150, spread: 80, origin: { y: 0.55 }, colors: ['#f59e0b', '#d97706', '#10b981'], zIndex: 9999 }), []);
  useEffect(() => { if (passed) { fire(); setTimeout(fire, 1000); } }, [passed, fire]);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div className="animate-fade-in" style={{ background: 'white', borderRadius: '24px', padding: '48px 40px', maxWidth: '480px', width: '100%', textAlign: 'center', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ width: '90px', height: '90px', borderRadius: '50%', margin: '0 auto 24px', background: passed ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#ef4444,#dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          {passed ? <Trophy size={44} /> : <XCircle size={44} />}
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: passed ? '#059669' : '#dc2626', marginBottom: '8px' }}>{passed ? '🎉 ยอดเยี่ยม!' : '❌ ยังไม่ผ่านเกณฑ์'}</h2>
        <p style={{ color: '#6b7280', marginBottom: '28px' }}>{passed ? 'คุณทำทักษะการเขียนได้ดีมากครับ!' : 'ลองทำใหม่อีกครั้งนะครับ'}</p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '28px' }}>
          <div style={{ padding: '16px 28px', background: 'rgba(245,158,11,0.08)', borderRadius: '16px', border: '2px solid rgba(245,158,11,0.2)' }}>
            <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '4px' }}>คะแนน</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#d97706', lineHeight: 1 }}>{score}</div>
            <div style={{ fontSize: '0.9rem', color: '#9ca3af' }}>จาก {total}</div>
          </div>
          <div style={{ padding: '16px 28px', background: passed ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', borderRadius: '16px', border: `2px solid ${passed ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
            <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '4px' }}>ร้อยละ</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: passed ? '#059669' : '#dc2626', lineHeight: 1 }}>{pct}%</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={onRetry} className="btn-secondary" style={{ padding: '12px 24px', borderRadius: '30px' }}>ทำใหม่</button>
          <button onClick={onClose} className="btn-primary" style={{ padding: '12px 28px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px' }}><ArrowRight size={18} /> ออก</button>
        </div>
      </div>
    </div>
  );
}

export default function WritingTest() {
  const { recordScore } = useUser();
  const navigate = useNavigate();

  const [spellInputs, setSpellInputs] = useState({});       // { qId: typedText }
  const [fillSel, setFillSel] = useState({});               // { qId: selectedWord }
  const [spellingSel, setSpellingSel] = useState({});       // { qId: typedText }
  const [rearrangeSel, setRearrangeSel] = useState({});     // { qId: typedAnswer }
  const [mcqSel, setMcqSel] = useState({});                 // { qId: { correct, idx } }
  const [showResult, setShowResult] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const totalQ = 30;
  const answeredCount =
    Object.keys(spellInputs).length + Object.keys(fillSel).length +
    Object.keys(spellingSel).length + Object.keys(rearrangeSel).length +
    Object.keys(mcqSel).length;
  const progress = Math.round((answeredCount / totalQ) * 100);

  const calcScore = () => {
    let s = 0;
    spellQ.forEach(q => { if ((spellInputs[q.id] || '').trim() === q.word) s++; });
    fillQ.forEach(q => { if (fillSel[q.id] === q.answer) s++; });
    spellingQ.forEach(q => { if ((spellingSel[q.id] || '').trim() === q.answer) s++; });
    rearrangeQ.forEach(q => { if ((rearrangeSel[q.id] || '').trim() === q.answer) s++; });
    [...sectionEQ, ...sectionFQ].forEach(q => { if (mcqSel[q.id]?.correct) s++; });
    return s;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const score = calcScore();
    try { await recordScore({ level: 1, skill: 'writing', score, maxScore: totalQ }); } catch (e) {}
    setShowResult(true);
    setSubmitting(false);
  };

  const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: '10px', border: '2px solid rgba(0,0,0,0.1)', outline: 'none', fontSize: '1rem', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s' };

  const SectionHeader = ({ num, title, sub }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', marginTop: '40px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>{num}</div>
      <div><h3 style={{ margin: 0, color: 'var(--color-primary-dark)', fontSize: '1.1rem' }}>{title}</h3>{sub && <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{sub}</p>}</div>
    </div>
  );

  const MCQCard = ({ q, color = '#f59e0b' }) => (
    <div style={{ marginBottom: '16px' }}>
      <p style={{ fontWeight: '600', color: 'var(--color-primary-dark)', marginBottom: '12px' }}>{q.question}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {q.options.map((opt, i) => (
          <button key={i} onClick={() => setMcqSel(prev => ({ ...prev, [q.id]: { correct: opt.correct, idx: i } }))}
            style={{ padding: '12px 16px', borderRadius: '10px', border: `2px solid ${mcqSel[q.id]?.idx === i ? color : 'rgba(0,0,0,0.08)'}`, background: mcqSel[q.id]?.idx === i ? `${color}18` : 'white', color: '#374151', textAlign: 'left', cursor: 'pointer', fontWeight: mcqSel[q.id]?.idx === i ? '600' : '400', transition: 'all 0.2s', fontFamily: 'inherit', fontSize: '0.95rem' }}>
            {opt.text}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>
      {showResult && <ResultModal score={calcScore()} total={totalQ} onClose={() => navigate('/skills')} onRetry={() => { setSpellInputs({}); setFillSel({}); setSpellingSel({}); setRearrangeSel({}); setMcqSel({}); setShowResult(false); }} />}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <Link to="/skills" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: '500', marginBottom: '8px', display: 'block' }}>← กลับหน้าเลือกทักษะ</Link>
          <h1 style={{ margin: 0, color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <PenTool size={28} color="#d97706" /> ทักษะการเขียน (30 ข้อ)
          </h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>ตอบแล้ว {answeredCount} / {totalQ}</div>
          <div style={{ height: '8px', width: '150px', borderRadius: '999px', background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,#f59e0b,#d97706)', borderRadius: '999px', transition: 'width 0.3s' }} />
          </div>
        </div>
      </div>

      {/* Section A: Spell from image */}
      <SectionHeader num="A" title="เขียนคำศัพท์จากภาพที่กำหนดให้ (ข้อ 71-72)" sub="พิมพ์คำที่ถูกต้องตามภาพ" />
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {spellQ.map(q => (
          <div key={q.id}>
            {q.image && <img src={q.image} alt="" style={{ width: '180px', borderRadius: '12px', marginBottom: '12px', display: 'block' }} />}
            <p style={{ fontWeight: '600', color: 'var(--color-primary-dark)', marginBottom: '8px' }}>ข้อ {q.id}. {q.hint}</p>
            <input type="text" value={spellInputs[q.id] || ''} onChange={e => setSpellInputs(prev => ({ ...prev, [q.id]: e.target.value }))}
              placeholder="พิมพ์คำตอบที่นี่..." style={{ ...inputStyle, maxWidth: '300px', borderColor: spellInputs[q.id] ? (spellInputs[q.id].trim() === q.word ? '#10b981' : '#f59e0b') : 'rgba(0,0,0,0.1)' }} />
          </div>
        ))}
      </div>

      {/* Section B: Fill in the blank */}
      <SectionHeader num="B" title="เติมคำในช่องว่างให้สมบูรณ์ (ข้อ 73-75)" sub="เลือกคำจากคลังคำด้านล่างมาเติมให้ถูกต้อง" />
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px', padding: '12px', background: 'rgba(245,158,11,0.06)', borderRadius: '10px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', width: '100%', marginBottom: '4px' }}>คลังคำ:</span>
          {WORD_BANK.map(w => (
            <span key={w} style={{ padding: '4px 14px', borderRadius: '20px', background: 'white', border: '1.5px solid rgba(245,158,11,0.3)', color: '#92400e', fontWeight: '600', fontSize: '0.9rem' }}>{w}</span>
          ))}
        </div>
        {fillQ.map(q => (
          <div key={q.id} style={{ marginBottom: '20px' }}>
            <p style={{ fontWeight: '600', color: 'var(--color-primary-dark)', marginBottom: '12px' }}>ข้อ {q.id}. {q.sentence.replace('_______', '[ _______ ]')}</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {WORD_BANK.map(w => (
                <button key={w} onClick={() => setFillSel(prev => ({ ...prev, [q.id]: w }))}
                  style={{ padding: '8px 18px', borderRadius: '20px', border: `2px solid ${fillSel[q.id] === w ? '#f59e0b' : 'rgba(0,0,0,0.1)'}`, background: fillSel[q.id] === w ? 'rgba(245,158,11,0.12)' : 'white', color: fillSel[q.id] === w ? '#92400e' : '#6b7280', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                  {w}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Section C: Spelling */}
      <SectionHeader num="C" title="เขียนคำจากคำอ่านที่กำหนดให้ (ข้อ 76-80)" sub="พิมพ์การสะกดที่ถูกต้อง" />
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {spellingQ.map(q => (
          <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: '600', color: 'var(--color-primary-dark)', minWidth: '180px' }}>ข้อ {q.id}. อ่านว่า "{q.reading}"</span>
            <input type="text" value={spellingSel[q.id] || ''} onChange={e => setSpellingSel(prev => ({ ...prev, [q.id]: e.target.value }))}
              placeholder="พิมพ์การสะกดที่ถูกต้อง..." style={{ ...inputStyle, maxWidth: '250px', flex: 1 }} />
          </div>
        ))}
      </div>

      {/* Section D: Rearrange */}
      <SectionHeader num="D" title="เรียงคำให้เป็นประโยคที่สมบูรณ์ (ข้อ 81-85)" sub="นำคำที่กำหนดให้มาเรียงให้เป็นประโยคที่ถูกต้อง" />
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {rearrangeQ.map(q => (
          <div key={q.id}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <span style={{ fontWeight: '600', color: 'var(--color-primary-dark)' }}>ข้อ {q.id}. คำที่มี:</span>
              {q.words.map((w, i) => (
                <span key={i} style={{ padding: '3px 12px', borderRadius: '6px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#92400e', fontWeight: '600', fontSize: '0.9rem' }}>{w}</span>
              ))}
            </div>
            <input type="text" value={rearrangeSel[q.id] || ''} onChange={e => setRearrangeSel(prev => ({ ...prev, [q.id]: e.target.value }))}
              placeholder="พิมพ์ประโยคที่เรียงถูกต้อง..." style={inputStyle} />
          </div>
        ))}
      </div>

      {/* Section E: MCQ Spelling/Grammar */}
      <SectionHeader num="E" title="การสะกดและไวยากรณ์ (ข้อ 86-90)" sub="เลือกคำตอบที่ถูกต้อง 1 ข้อ" />
      <div className="glass-panel" style={{ padding: '24px' }}>
        {sectionEQ.map(q => <MCQCard key={q.id} q={q} />)}
      </div>

      {/* Section F: Passage MCQ */}
      <SectionHeader num="F" title="อ่านบทความแล้วตอบคำถาม (ข้อ 91-100)" sub="เลือกคำตอบที่ถูกต้องจากบทความ" />
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '16px', background: 'rgba(245,158,11,0.04)', borderLeft: '4px solid #f59e0b' }}>
        <p style={{ margin: 0, color: 'var(--color-primary-dark)', lineHeight: '1.9', fontSize: '0.95rem' }}>{PASSAGE_F}</p>
      </div>
      <div className="glass-panel" style={{ padding: '24px' }}>
        {sectionFQ.map(q => <MCQCard key={q.id} q={q} />)}
      </div>

      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <button onClick={handleSubmit} disabled={submitting} className="btn-primary"
          style={{ padding: '16px 48px', fontSize: '1.1rem', borderRadius: '30px', display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: '0 8px 20px rgba(245,158,11,0.4)', opacity: submitting ? 0.7 : 1 }}>
          {submitting ? <><RefreshCw size={20} className="spin" /> บันทึก...</> : <><Trophy size={20} /> ส่งคำตอบและดูผล</>}
        </button>
        <p style={{ color: 'var(--text-muted)', marginTop: '12px', fontSize: '0.9rem' }}>ตอบแล้ว {answeredCount} จาก {totalQ} ข้อ</p>
      </div>
    </div>
  );
}
