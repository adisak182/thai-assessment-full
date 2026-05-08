import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PenTool, CheckCircle, XCircle, ArrowRight, RefreshCw, Send } from 'lucide-react';
import { useUser } from '../context/UserContext';

// --- Part 1: Word Club Data ---
const wordClubQuestions = [
  { 
    qNum: 36, 
    word: 'โลกาภิวัตน์', 
    blocks: ['โ', 'ล', 'ก', 'า', 'ภิ', 'วั', 'ต', 'น์'], 
    meaning: 'การแพร่กระจายไปทั่วโลก การที่ประชาคมโลกไม่ว่าจะอยู่ ณ จุดใด สามารถรับรู้ สัมพันธ์ หรือรับผลกระทบจากสิ่งที่เกิด' 
  },
  { 
    qNum: 37, 
    word: 'ประดิดประดอย', 
    blocks: ['ป', 'ระ', 'ดิ', 'ด', 'ป', 'ระ', 'ด', 'อ', 'ย'], 
    meaning: 'บรรจงทำให้งดงามและละเอียดลออยิ่งขึ้น' 
  },
  { 
    qNum: 38, 
    word: 'เกษียณอายุ', 
    blocks: ['เ', 'ก', 'ษี', 'ย', 'ณ', 'อ', 'า', 'ยุ'], 
    meaning: 'สิ้นไป ใช้เกี่ยวกับการกำหนดอายุของการทำงาน' 
  },
  { 
    qNum: 39, 
    word: 'เลือดกบปาก', 
    blocks: ['เ', 'ลื', 'อ', 'ด', 'ก', 'บ', 'ป', 'า', 'ก'], 
    meaning: 'มีเลือดออกเต็มปาก' 
  },
  { 
    qNum: 40, 
    word: 'อเนกประสงค์', 
    blocks: ['อ', 'เ', 'น', 'ก', 'ป', 'ระ', 'ส', 'ง', 'ค์'], 
    meaning: 'ใช้ประโยชน์ได้หลายอย่างแล้วแต่ความต้องการ' 
  }
];

// --- Part 2: Sentence Arrangement Data ---
const arrangementQuestions = [
  {
    qNum: 41,
    words: ['อามีน', 'และ', 'มุนี', 'กิน', 'ข้าวเหนียว', 'ไก่ย่าง'],
    correctOrder: ['อามีน', 'และ', 'มุนี', 'กิน', 'ข้าวเหนียว', 'ไก่ย่าง'],
    correctSentence: 'อามีนและมุนีกินข้าวเหนียวไก่ย่าง'
  },
  {
    qNum: 42,
    words: ['อาหมัด', 'พ่อของมีนา', 'ชอบ', 'กิน', 'ข้าวยำ', 'มาก', 'จึง', 'ขาย', 'ข้าวยำ'],
    correctOrder: ['อาหมัด', 'พ่อของมีนา', 'ชอบ', 'กิน', 'ข้าวยำ', 'มาก', 'จึง', 'ขาย', 'ข้าวยำ'],
    correctSentence: 'อาหมัดพ่อของมีนาชอบกินข้าวยำมากจึงขายข้าวยำ'
  },
  {
    qNum: 43,
    words: ['ใคร ๆ', 'ก็', 'ต้อง', 'ช่วยตัวเอง', 'มิฉะนั้น', 'ก็', 'สอบไม่ผ่าน'],
    correctOrder: ['ใคร ๆ', 'ก็', 'ต้อง', 'ช่วยตัวเอง', 'มิฉะนั้น', 'ก็', 'สอบไม่ผ่าน'],
    correctSentence: 'ใคร ๆก็ต้องช่วยตัวเองมิฉะนั้นก็สอบไม่ผ่าน'
  },
  {
    qNum: 44,
    words: ['เด็ก', 'จิตอาสา', 'ได้รับ', 'รางวัล', 'เพราะ', 'เป็น', 'คนดี', 'ของสังคม'],
    correctOrder: ['เด็ก', 'จิตอาสา', 'ได้รับ', 'รางวัล', 'เพราะ', 'เป็น', 'คนดี', 'ของสังคม'],
    correctSentence: 'เด็กจิตอาสาได้รับรางวัลเพราะเป็นคนดีของสังคม'
  },
  {
    qNum: 45,
    words: ['ฉัน', 'และ', 'เพื่อน', 'ไป', 'สมัคร', 'เรียน', 'ที่', 'ศูนย์ส่งเสริมการเรียนรู้ระดับอำเภอ'],
    correctOrder: ['ฉัน', 'และ', 'เพื่อน', 'ไป', 'สมัคร', 'เรียน', 'ที่', 'ศูนย์ส่งเสริมการเรียนรู้ระดับอำเภอ'],
    correctSentence: 'ฉันและเพื่อนไปสมัครเรียนที่ศูนย์ส่งเสริมการเรียนรู้ระดับอำเภอ'
  },
  {
    qNum: 46,
    words: ['ถึง', 'เขา', 'จะ', 'แก่', 'แต่', 'ฉัน', 'ก็', 'รัก'],
    correctOrder: ['ถึง', 'เขา', 'จะ', 'แก่', 'แต่', 'ฉัน', 'ก็', 'รัก'],
    correctSentence: 'ถึงเขาจะแก่แต่ฉันก็รัก'
  }
];

// --- Part 3: Free Text Data ---
const freeTextQuestions = [
  {
    qNum: 47,
    q: 'หากต้องการชวนเพื่อนไปออกกำลังกายด้วยกันในวันหยุด เราจะใช้ประโยคชักชวนอย่างไร',
    guideline: 'ไปวิ่งที่สวนกันไหม เห็นช่วงนี้บ่นว่าเครียด ๆ ไปออกกำลังกายจะได้สดชื่นขึ้นนะ'
  },
  {
    qNum: 48,
    q: 'หากเพื่อนยืมเงินแล้วลืมคืน เราจะใช้ประโยคพูดอย่างไรเพื่อ ทวงถามแบบรักษาน้ำใจ',
    guideline: '"ขอโทษนะเพื่อน พอดีเราจำเป็นต้องใช้เงินก้อนที่ยืมไป ไม่แน่ใจว่าสะดวกคืนตอนไหนเหรอ?" (มีการเกริ่นนำ + บอกเหตุผล + ถามความสะดวก)'
  },
  {
    qNum: 49,
    q: 'เมื่อได้รับข้อความแชร์ต่อมาว่า "ดื่มน้ำมะนาวรักษาโรคมะเร็งได้ 100%" สิ่งแรกที่เราควรทำคืออะไร',
    guideline: 'ตรวจสอบแหล่งที่มาของข้อมูลจากหน่วยงานสาธารณสุขที่เชื่อถือได้ก่อนแชร์ต่อ (ระบุการตรวจสอบแหล่งที่มา/หน่วยงานที่เชื่อถือได้)'
  },
  {
    qNum: 50,
    q: 'ถ้ามีเบอร์แปลกโทรมาบอกว่า "คุณคือผู้โชคดีได้รับรางวัล" เราจะใช้ประโยคปฏิเสธอย่างไรให้จบการสนทนาไวที่สุด',
    guideline: '"ไม่สนใจครับ/ค่ะ รบกวนอย่าติดต่อมาอีก ขอบคุณครับ" แล้ววางสายทันที (ตัดบทชัดเจน + สุภาพแต่เด็ดขาด + ไม่ให้ข้อมูลส่วนตัว)'
  }
];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---- PART 1: WORD CLUB COMPONENT ----
function WordClubSection({ onComplete }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  
  const q = wordClubQuestions[currentIdx];
  const [availableBlocks, setAvailableBlocks] = useState(() => shuffleArray(q.blocks.map((b, i) => ({ id: i, char: b }))));
  const [selectedBlocks, setSelectedBlocks] = useState([]);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handlePickBlock = (block) => {
    if (checked) return;
    setAvailableBlocks(availableBlocks.filter(b => b.id !== block.id));
    setSelectedBlocks([...selectedBlocks, block]);
  };

  const handleRemoveBlock = (block) => {
    if (checked) return;
    setSelectedBlocks(selectedBlocks.filter(b => b.id !== block.id));
    setAvailableBlocks([...availableBlocks, block]);
  };

  const handleCheck = () => {
    const formed = selectedBlocks.map(b => b.char).join('');
    const ok = formed === q.word;
    setIsCorrect(ok);
    setChecked(true);
    if (ok) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentIdx < wordClubQuestions.length - 1) {
      const nextQ = wordClubQuestions[currentIdx + 1];
      setCurrentIdx(currentIdx + 1);
      setAvailableBlocks(shuffleArray(nextQ.blocks.map((b, i) => ({ id: i, char: b }))));
      setSelectedBlocks([]);
      setChecked(false);
      setIsCorrect(false);
    } else {
      onComplete(score + (isCorrect && !checked ? 1 : 0));
    }
  };

  const handleReset = () => {
    setAvailableBlocks(shuffleArray(q.blocks.map((b, i) => ({ id: i, char: b }))));
    setSelectedBlocks([]);
    setChecked(false);
    setIsCorrect(false);
  };

  return (
    <div>
      <div style={{ background: 'rgba(168,85,247,0.08)', padding: '16px 24px', borderRadius: '12px', marginBottom: '24px', borderLeft: '4px solid var(--color-primary)' }}>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontWeight: '500' }}>
          🧩 คำชี้แจง : ให้ผู้เล่นกดพยัญชนะ/สระทีละตัว เพื่อเรียงการสะกดคำให้ถูกต้อง
        </p>
      </div>

      <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.3rem', color: 'var(--color-primary-dark)', margin: 0 }}>
          ข้อ {q.qNum} ({currentIdx + 1}/{wordClubQuestions.length})
        </h3>
        <button onClick={handleReset} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem' }}>
          <RefreshCw size={16} /> เริ่มใหม่
        </button>
      </div>

      {/* Answer Area */}
      <div style={{
        minHeight: '80px',
        border: checked ? (isCorrect ? '2px solid #10b981' : '2px solid #ef4444') : '2px dashed rgba(168,85,247,0.4)',
        borderRadius: '14px',
        padding: '16px',
        marginBottom: '20px',
        background: checked ? (isCorrect ? 'rgba(16,185,129,0.07)' : 'rgba(239,68,68,0.07)') : 'rgba(255,255,255,0.5)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s'
      }}>
        {selectedBlocks.length === 0 && !checked && (
          <span style={{ color: 'rgba(0,0,0,0.3)', fontSize: '1.1rem' }}>คลิกตัวอักษรด้านล่างมาเรียงที่นี่...</span>
        )}
        {selectedBlocks.map((block) => (
          <button
            key={block.id}
            onClick={() => handleRemoveBlock(block)}
            disabled={checked}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: checked ? (isCorrect ? '#10b981' : '#ef4444') : 'var(--color-primary)',
              color: 'white',
              border: 'none',
              fontSize: '1.5rem',
              cursor: checked ? 'default' : 'pointer',
              fontWeight: '600',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              transition: 'all 0.2s',
              minWidth: '50px'
            }}
          >
            {block.char}
          </button>
        ))}
      </div>

      {/* Word Pool Area */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: '32px', minHeight: '60px' }}>
        {availableBlocks.map((block) => (
          <button
            key={block.id}
            onClick={() => handlePickBlock(block)}
            disabled={checked}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: 'white',
              color: 'var(--color-primary-dark)',
              border: '2px solid rgba(168,85,247,0.3)',
              fontSize: '1.5rem',
              cursor: 'pointer',
              fontWeight: '600',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              transition: 'all 0.2s',
              minWidth: '50px'
            }}
          >
            {block.char}
          </button>
        ))}
      </div>

      {/* Hint Area */}
      <div style={{ padding: '16px', background: 'rgba(255,255,255,0.8)', borderRadius: '12px', marginBottom: '24px', border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center' }}>
        <span style={{ fontWeight: '600', color: 'var(--color-primary-dark)', display: 'block', marginBottom: '8px' }}>💡 คำใบ้ (ความหมาย)</span>
        <span style={{ color: 'var(--text-main)', fontSize: '1.1rem' }}>{q.meaning}</span>
      </div>

      {checked && !isCorrect && (
        <div style={{ padding: '16px', background: 'rgba(16,185,129,0.08)', borderRadius: '12px', marginBottom: '20px', borderLeft: '4px solid #10b981', textAlign: 'center' }}>
          <span style={{ fontWeight: '700', color: '#059669' }}>✅ เฉลย: </span>
          <span style={{ color: 'var(--text-main)', fontSize: '1.3rem', fontWeight: 'bold' }}>{q.word}</span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        {!checked ? (
          <button
            onClick={handleCheck}
            disabled={selectedBlocks.length !== q.blocks.length}
            className="btn-primary"
            style={{ padding: '12px 32px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px', opacity: selectedBlocks.length !== q.blocks.length ? 0.5 : 1 }}
          >
            ตรวจคำตอบ <CheckCircle size={20} />
          </button>
        ) : (
          <button onClick={handleNext} className="btn-primary" style={{ padding: '12px 32px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {currentIdx < wordClubQuestions.length - 1 ? 'ข้อถัดไป' : 'ไปส่วนที่ 2'} <ArrowRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}

// ---- PART 2: SENTENCE ARRANGEMENT COMPONENT ----
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
    // In part 2 we accept spaces or no spaces
    const formed = selectedWords.join('').replace(/\s/g, '');
    const correct = q.correctSentence.replace(/\s/g, '');
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
          🔤 คำชี้แจง : ให้ผู้เรียนเรียงคำให้เป็นประโยคที่สมบูรณ์ (ดึงคำมาเรียงให้เป็นประโยค)
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
              background: checked ? (isCorrect ? '#10b981' : '#ef4444') : '#3b82f6',
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
              color: '#1e3a8a',
              border: '2px solid rgba(59,130,246,0.3)',
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
            style={{ padding: '12px 32px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px', opacity: selectedWords.length !== q.words.length ? 0.5 : 1, background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}
          >
            ตรวจคำตอบ <CheckCircle size={20} />
          </button>
        ) : (
          <button onClick={handleNext} className="btn-primary" style={{ padding: '12px 32px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
            {currentIdx < arrangementQuestions.length - 1 ? 'ข้อถัดไป' : 'ไปส่วนที่ 3'} <ArrowRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}

// ---- PART 3: FREE TEXT COMPONENT ----
function FreeTextSection({ onComplete }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const q = freeTextQuestions[currentIdx];

  const handleSubmit = () => {
    if (!input.trim()) return;
    setSubmitted(true);
    setScore(s => s + 1); // Free text generally awards point for participation in this demo
  };

  const handleNext = () => {
    if (currentIdx < freeTextQuestions.length - 1) {
      setCurrentIdx(c => c + 1);
      setInput('');
      setSubmitted(false);
    } else {
      onComplete(score + (!submitted && input.trim() ? 1 : 0));
    }
  };

  return (
    <div>
      <div style={{ background: 'rgba(16,185,129,0.08)', padding: '16px 24px', borderRadius: '12px', marginBottom: '24px', borderLeft: '4px solid #10b981' }}>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontWeight: '500' }}>
          💬 คำชี้แจง : ให้ผู้เรียนตอบคำถามพอสังเขป
        </p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.3rem', color: 'var(--color-primary-dark)', margin: 0, marginBottom: '16px', lineHeight: '1.6' }}>
          ข้อ {q.qNum} ({currentIdx + 1}/{freeTextQuestions.length}): {q.q}
        </h3>
        
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={submitted}
          placeholder="พิมพ์คำตอบของคุณที่นี่..."
          style={{
            width: '100%',
            height: '120px',
            padding: '16px',
            fontSize: '1.1rem',
            borderRadius: '12px',
            border: '2px solid rgba(16,185,129,0.3)',
            outline: 'none',
            fontFamily: 'inherit',
            resize: 'none',
            background: submitted ? 'rgba(0,0,0,0.02)' : 'white'
          }}
        />
      </div>

      {submitted && (
        <div className="animate-fade-in" style={{ padding: '20px', background: 'rgba(255,255,255,0.8)', borderRadius: '12px', marginBottom: '24px', border: '1px solid rgba(16,185,129,0.2)' }}>
          <span style={{ fontWeight: '700', color: '#059669', display: 'block', marginBottom: '8px' }}>💡 แนวการตอบ: </span>
          <span style={{ color: 'var(--text-main)', fontSize: '1.1rem', lineHeight: '1.6' }}>{q.guideline}</span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="btn-primary"
            style={{ padding: '12px 32px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px', opacity: !input.trim() ? 0.5 : 1, background: 'linear-gradient(135deg, #10b981, #059669)' }}
          >
            ส่งคำตอบ <Send size={20} />
          </button>
        ) : (
          <button onClick={handleNext} className="btn-primary" style={{ padding: '12px 32px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            {currentIdx < freeTextQuestions.length - 1 ? 'ข้อถัดไป' : 'ดูผลคะแนนรวม'} <ArrowRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}

// ---- MAIN LEVEL 3 WRITING MODULE ----
export default function Level3Writing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recordScore } = useUser();

  const [phase, setPhase] = useState('intro'); // intro, wordclub, arrangement, freetext, result
  const [wordClubScore, setWordClubScore] = useState(0);
  const [arrangementScore, setArrangementScore] = useState(0);
  const [freeTextScore, setFreeTextScore] = useState(0);

  const handleWordClubComplete = (s) => {
    setWordClubScore(s);
    setPhase('arrangement');
  };

  const handleArrangementComplete = (s) => {
    setArrangementScore(s);
    setPhase('freetext');
  };

  const handleFreeTextComplete = (s) => {
    const total = wordClubScore + arrangementScore + s;
    setFreeTextScore(s);
    recordScore({ level: parseInt(id), skill: 'writing', score: total, maxScore: 15 });
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
          <h2 style={{ fontSize: '2.5rem', marginBottom: '16px', color: 'var(--color-primary-dark)' }}>แบบทดสอบทักษะการเขียน Level 3</h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.8' }}>
            แบบทดสอบนี้แบ่งออกเป็น 3 ส่วน (รวม 15 ข้อ)
            <br />
            <strong>ส่วนที่ 1:</strong> เกม Word Club เรียงตัวอักษรเป็นคำ (ข้อ 36-40)
            <br />
            <strong>ส่วนที่ 2:</strong> เรียงคำเป็นประโยคที่สมบูรณ์ (ข้อ 41-46)
            <br />
            <strong>ส่วนที่ 3:</strong> ตอบคำถามพอสังเขป (ข้อ 47-50)
          </p>
          <button onClick={() => setPhase('wordclub')} className="btn-primary" style={{ padding: '16px 32px', fontSize: '1.2rem', borderRadius: '30px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            เริ่มทำแบบทดสอบ <ArrowRight size={24} />
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'wordclub') {
    return (
      <div className="animate-fade-in px-4 py-8 max-w-3xl mx-auto">
        <Link to={`/level/${id}`} style={{ color: 'var(--color-primary)', fontWeight: '500', marginBottom: '24px', display: 'inline-block', textDecoration: 'none' }}>
          &larr; ออกจากแบบทดสอบ
        </Link>
        <div className="glass-panel" style={{ padding: '40px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', color: 'var(--color-primary-dark)' }}>
            🧩 ส่วนที่ 1: เกม Word Club เรียงคำ (ข้อ 36-40)
          </h2>
          <WordClubSection onComplete={handleWordClubComplete} />
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
          <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', color: '#2563eb' }}>
            🔤 ส่วนที่ 2: เรียงคำเป็นประโยค (ข้อ 41-46)
          </h2>
          <ArrangementSection onComplete={handleArrangementComplete} />
        </div>
      </div>
    );
  }

  if (phase === 'freetext') {
    return (
      <div className="animate-fade-in px-4 py-8 max-w-3xl mx-auto">
        <Link to={`/level/${id}`} style={{ color: 'var(--color-primary)', fontWeight: '500', marginBottom: '24px', display: 'inline-block', textDecoration: 'none' }}>
          &larr; ออกจากแบบทดสอบ
        </Link>
        <div className="glass-panel" style={{ padding: '40px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', color: '#059669' }}>
            💬 ส่วนที่ 3: ตอบคำถามพอสังเขป (ข้อ 47-50)
          </h2>
          <FreeTextSection onComplete={handleFreeTextComplete} />
        </div>
      </div>
    );
  }

  if (phase === 'result') {
    const total = wordClubScore + arrangementScore + freeTextScore;
    return (
      <div className="animate-fade-in px-4 py-8 max-w-2xl mx-auto text-center">
        <div className="glass-panel" style={{ padding: '48px', marginTop: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', marginBottom: '24px' }}>
            <CheckCircle size={40} />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--color-primary-dark)' }}>
            ทำแบบทดสอบทักษะการเขียน Level 3 สำเร็จ!
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '32px' }}>
            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.7)', borderRadius: '16px' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>ส่วนที่ 1 Word Club</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{wordClubScore} / 5</div>
            </div>
            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.7)', borderRadius: '16px' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>ส่วนที่ 2 เรียงประโยค</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>{arrangementScore} / 6</div>
            </div>
            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.7)', borderRadius: '16px' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>ส่วนที่ 3 ตอบคำถาม</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{freeTextScore} / 4</div>
            </div>
          </div>
          <p style={{ fontSize: '1.3rem', color: 'var(--text-muted)', marginBottom: '32px' }}>
            คะแนนรวม: <strong style={{ color: 'var(--color-primary)', fontSize: '1.8rem' }}>{total}</strong> คะแนน (จาก 15 คะแนน)
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
