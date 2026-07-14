import { useState, useRef, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, Volume2, Play, Mic, MicOff, CheckCircle, ArrowRight, Trophy, XCircle, RefreshCw } from 'lucide-react';
import { useUser } from '../context/UserContext';
import confetti from 'canvas-confetti';
import ExamTimer from '../components/ExamTimer';

// ===== QUESTION DATA =====

// Section A: Personal intro (ข้อ 26-30) – open-ended speaking
const introQ = [
  { id: 26, audio: '/audio/spk_q26.mp3', question: '"สวัสดีค่ะ คุณชื่ออะไรคะ"', hint: 'บอกชื่อ-นามสกุล และชื่อเล่นอย่างเป็นทางการ' },
  { id: 27, audio: '/audio/spk_q27.mp3', question: '"คุณเป็นคนที่ไหนคะ (บ้านเกิดอยู่ที่ไหน)"', hint: 'บอกชื่อจังหวัด หรืออำเภอที่ตนเองเติบโตมา' },
  { id: 28, audio: '/audio/spk_q28.mp3', question: '"คุณเรียนจบระดับไหน และจบจากที่ไหนมาคะ"', hint: 'ระบุระดับการศึกษาล่าสุด หรือสถานศึกษาที่จบมา' },
  { id: 29, audio: '/audio/spk_q29.mp3', question: '"ตอนนี้คุณทำงานอะไร หรือทำอาชีพอะไรอยู่คะ"', hint: 'บอกตำแหน่งงาน หน่วยงาน หรือลักษณะงานที่ทำ' },
  { id: 30, audio: '/audio/spk_q30.mp3', question: '"เวลาว่างคุณชอบทำกิจกรรมอะไรมากที่สุดคะ"', hint: 'อธิบายสิ่งที่ชอบทำ พร้อมให้เหตุผลสั้น ๆ ได้' },
];

// Section B: Situational conversations (ข้อ 31-35)
const situQ = [
  { id: 31, audio: '/audio/spk_q31.mp3', situation: 'ซื้อของในร้าน', prompt: 'แม่ค้า: "ลูกค้าต้องการซื้ออะไรคะ"', hint: 'ตอบด้วยชื่อสินค้าที่ต้องการซื้อ' },
  { id: 32, audio: '/audio/spk_q32.mp3', situation: 'หลงทาง', prompt: 'ป้าอ้อย: "ขอโทษค่ะ ช่วยบอกทางไปโรงพยาบาลได้ไหมคะ"', hint: 'ตอบด้วยการบอกทาง เช่น เลี้ยวซ้าย ตรงไป' },
  { id: 33, audio: '/audio/spk_q33.mp3', situation: 'ไปพบหมอที่โรงพยาบาล', prompt: 'หมอ: "วันนี้คนไข้มีอาการอย่างไรคะ"', hint: 'บอกอาการที่รู้สึก เช่น ปวดหัว มีไข้ เป็นต้น' },
  { id: 34, audio: '/audio/spk_q34.mp3', situation: 'ชวนเพื่อนไปทำกิจกรรมจิตอาสา', prompt: 'เพื่อน: "เราต้องเตรียมอุปกรณ์อะไรบ้างในการทำกิจกรรมจิตอาสา"', hint: 'บอกวัสดุอุปกรณ์ในการทำความสะอาด เช่น ไม้กวาด ถุงขยะ' },
  { id: 35, audio: '/audio/spk_q35.mp3', situation: 'นัดเพื่อนทำการบ้าน', prompt: 'เพื่อน: "พรุ่งนี้เรานัดทำการบ้านที่ไหนดี"', hint: 'บอกสถานที่ เช่น ห้องสมุด บ้าน ร้านกาแฟ' },
];

// Section C: Tongue twisters (ข้อ 36-40) – repeat aloud
const tongueQ = [
  { id: 36, audio: '/audio/tongue_1.mp3', text: 'ชามเขียวคว่ำเช้า ชามขาวคว่ำค่ำ' },
  { id: 37, audio: '/audio/tongue_2.mp3', text: 'สำลีขายหวย สำรวยขายสี สำลีเล่นหวย สำรวยเล่นสี' },
  { id: 38, audio: '/audio/tongue_3.mp3', text: 'ยายกินลำไย น้ำลายยายไหลย้อย' },
  { id: 39, audio: '/audio/tongue_4.mp3', text: 'เช้าฟาดผัดฟัก เย็นฟาดฟักผัด' },
  { id: 40, audio: '/audio/tongue_5.mp3', text: 'กินมันติดเหงือก กินเผือกติดฟัน' },
];

function AudioBtn({ src, label = 'ฟังคำถาม' }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const play = () => {
    if (!ref.current) { ref.current = new Audio(src); ref.current.onended = () => setPlaying(false); }
    if (playing) { ref.current.pause(); ref.current.currentTime = 0; setPlaying(false); }
    else { ref.current.src = src; ref.current.play().catch(() => {}); setPlaying(true); }
  };
  useEffect(() => () => ref.current?.pause(), []);
  return (
    <button onClick={play} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px', borderRadius: '30px', border: 'none', background: playing ? 'var(--color-primary)' : 'rgba(59,130,246,0.12)', color: playing ? 'white' : '#2563eb', fontWeight: '600', cursor: 'pointer', fontSize: '1.1rem', transition: 'all 0.2s', fontFamily: 'inherit' }}>
      {playing ? <Volume2 size={18} /> : <Play size={18} />} {playing ? 'กำลังเล่น...' : label}
    </button>
  );
}

function ResultModal({ score, total, onClose, onRetry }) {
  const pct = Math.round((score / total) * 100);
  const passed = score >= 11;
  const fire = useCallback(() => confetti({ particleCount: 150, spread: 80, origin: { y: 0.55 }, colors: ['#3b82f6', '#2563eb', '#fbbf24'], zIndex: 9999 }), []);
  useEffect(() => { if (passed) { fire(); setTimeout(fire, 1000); } }, [passed, fire]);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div className="animate-fade-in" style={{ background: 'white', borderRadius: '24px', padding: '48px 40px', maxWidth: '480px', width: '100%', textAlign: 'center', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ width: '90px', height: '90px', borderRadius: '50%', margin: '0 auto 24px', background: passed ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#ef4444,#dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          {passed ? <Trophy size={44} /> : <XCircle size={44} />}
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: passed ? '#059669' : '#dc2626', marginBottom: '8px' }}>{passed ? '🎉 ยอดเยี่ยม!' : '❌ ยังไม่ผ่านเกณฑ์'}</h2>
        <p style={{ color: '#6b7280', marginBottom: '28px' }}>{passed ? 'คุณทำทักษะการพูดสำเร็จแล้วครับ!' : 'ลองทำใหม่ได้เลยนะครับ'}</p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '28px' }}>
          <div style={{ padding: '16px 28px', background: 'rgba(59,130,246,0.08)', borderRadius: '16px', border: '2px solid rgba(59,130,246,0.2)' }}>
            <div style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: '4px' }}>คะแนน</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2563eb', lineHeight: 1 }}>{score}</div>
            <div style={{ fontSize: '1.1rem', color: '#9ca3af' }}>จาก {total}</div>
          </div>
          <div style={{ padding: '16px 28px', background: passed ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', borderRadius: '16px', border: `2px solid ${passed ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
            <div style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: '4px' }}>ร้อยละ</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: passed ? '#059669' : '#dc2626', lineHeight: 1 }}>{pct}%</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={onRetry} className="btn-secondary" style={{ padding: '12px 24px', borderRadius: '30px' }}>ทำใหม่</button>
          <button onClick={onClose} className="btn-primary" style={{ padding: '12px 28px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ArrowRight size={18} /> ออก
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SpeakingTest() {
  const { recordScore } = useUser();
  const navigate = useNavigate();
  const [checked, setChecked] = useState({}); // { qId: true } = self-marked done
  const [showResult, setShowResult] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Speaking is self-assessed: each question checked = 1 point
  const totalQ = 15;
  const score = Object.values(checked).filter(Boolean).length;
  const answeredCount = Object.keys(checked).length;
  const progress = Math.round((answeredCount / totalQ) * 100);

  const handleSubmit = async () => {
    setSubmitting(true);
    try { await recordScore({ level: 1, skill: 'conversation', score, maxScore: totalQ }); } catch (e) {}
    setShowResult(true);
    setSubmitting(false);
  };

  const SectionHeader = ({ num, title, icon }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', marginTop: '40px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>{num}</div>
      <div><h3 style={{ margin: 0, color: 'var(--color-primary-dark)', fontSize: '1.1rem' }}>{title}</h3><p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1.1rem' }}>{icon}</p></div>
    </div>
  );

  const OpenEndedCard = ({ q, type = 'intro' }) => {
    const done = checked[q.id];
    return (
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '16px', borderLeft: done ? '4px solid #10b981' : '4px solid transparent', transition: 'all 0.3s' }}>
        {q.situation && <div style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(59,130,246,0.1)', borderRadius: '20px', color: '#2563eb', fontSize: '1.1rem', fontWeight: '600', marginBottom: '10px' }}>สถานการณ์: {q.situation}</div>}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap' }}>
          <AudioBtn src={q.audio} label="ฟังคำถาม" />
          <p style={{ margin: 0, fontWeight: '600', color: 'var(--color-primary-dark)', flex: 1, minWidth: '200px', lineHeight: '1.6' }}>
            ข้อ {q.id}. {q.question || q.prompt}
          </p>
        </div>
        <div style={{ padding: '10px 16px', background: 'rgba(0,0,0,0.03)', borderRadius: '8px', marginBottom: '16px' }}>
          <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>💡 แนวทางการตอบ: {q.hint}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px 16px', background: 'rgba(239,68,68,0.08)', borderRadius: '10px', color: '#dc2626', fontSize: '1.1rem', fontWeight: '500', flex: 1 }}>
            <Mic size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
            พูดตอบเข้าไมค์ด้วยตนเอง
          </div>
          <button onClick={() => setChecked(prev => ({ ...prev, [q.id]: !done }))}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', borderRadius: '10px', border: `2px solid ${done ? '#10b981' : 'rgba(0,0,0,0.12)'}`, background: done ? 'rgba(16,185,129,0.1)' : 'white', color: done ? '#059669' : '#6b7280', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
            <CheckCircle size={16} /> {done ? 'ตอบแล้ว' : 'ทำเครื่องหมาย'}
          </button>
        </div>
      </div>
    );
  };

  const TongueCard = ({ q }) => {
    const done = checked[q.id];
    return (
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '16px', borderLeft: done ? '4px solid #10b981' : '4px solid transparent', transition: 'all 0.3s' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
          <AudioBtn src={q.audio} label="ฟังต้นแบบ" />
          <p style={{ margin: 0, fontWeight: '600', color: 'var(--color-primary-dark)', fontSize: '1.15rem' }}>ข้อ {q.id}.</p>
        </div>
        <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(37,99,235,0.04))', borderRadius: '12px', border: '1px solid rgba(59,130,246,0.15)', marginBottom: '16px' }}>
          <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#1e3a8a', lineHeight: '1.8', textAlign: 'center' }}>{q.text}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px 16px', background: 'rgba(239,68,68,0.08)', borderRadius: '10px', color: '#dc2626', fontSize: '1.1rem', fontWeight: '500', flex: 1 }}>
            <Mic size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
            อ่านออกเสียงให้ถูกต้องและคล่องแคล่ว
          </div>
          <button onClick={() => setChecked(prev => ({ ...prev, [q.id]: !done }))}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', borderRadius: '10px', border: `2px solid ${done ? '#10b981' : 'rgba(0,0,0,0.12)'}`, background: done ? 'rgba(16,185,129,0.1)' : 'white', color: done ? '#059669' : '#6b7280', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
            <CheckCircle size={16} /> {done ? 'ทำแล้ว' : 'ทำเครื่องหมาย'}
          </button>
        </div>
      </div>
    );
  };

  const [timerKey, setTimerKey] = useState(0);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>
      {showResult && <ResultModal score={score} total={totalQ} onClose={() => navigate('/skills')} onRetry={() => { setChecked({}); setShowResult(false); setTimerKey(k => k + 1); }} />}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <Link to="/skills" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>← กลับหน้าเลือกทักษะ</Link>
          <h1 style={{ margin: 0, color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MessageCircle size={28} color="#2563eb" /> ทักษะการพูด (15 ข้อ)
          </h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '4px' }}>ทำแล้ว {answeredCount} / {totalQ}</div>
          <div style={{ height: '8px', width: '150px', borderRadius: '999px', background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,#3b82f6,#2563eb)', borderRadius: '999px', transition: 'width 0.3s' }} />
          </div>
        </div>
      </div>

      {/* Timer: 15 ข้อ × 30 วินาที = 450 วินาที */}
      <ExamTimer key={timerKey} totalSeconds={450} onTimeUp={handleSubmit} />

      <div className="glass-panel" style={{ padding: '20px', marginBottom: '32px', borderLeft: '4px solid #3b82f6', background: 'rgba(59,130,246,0.04)' }}>
        <strong style={{ color: 'var(--color-primary-dark)' }}>คำชี้แจง:</strong>
        <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>กดปุ่มฟังคำถาม พูดตอบออกเสียงด้วยตนเอง แล้วกดทำเครื่องหมายว่าทำแล้ว ผู้ประเมินจะให้คะแนนตามเกณฑ์การพูด</span>
      </div>

      <SectionHeader num="A" title="สนทนาโต้ตอบ — ข้อมูลส่วนตัว (ข้อ 26-30)" icon="บอกชื่อ บ้านเกิด การศึกษา อาชีพ และงานอดิเรก" />
      {introQ.map(q => <OpenEndedCard key={q.id} q={q} />)}

      <SectionHeader num="B" title="สนทนาโต้ตอบในสถานการณ์จำลอง (ข้อ 31-35)" icon="ตอบในบทบาทสมมติตามสถานการณ์ที่กำหนด" />
      {situQ.map(q => <OpenEndedCard key={q.id} q={q} type="situ" />)}

      <SectionHeader num="C" title="อ่านออกเสียงลิ้นพันกัน Tongue Twister (ข้อ 36-40)" icon="ฟังต้นแบบ แล้วอ่านออกเสียงตามให้ถูกต้องและคล่องแคล่ว" />
      {tongueQ.map(q => <TongueCard key={q.id} q={q} />)}

      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <button onClick={handleSubmit} disabled={submitting} className="btn-primary"
          style={{ padding: '16px 48px', fontSize: '1.1rem', borderRadius: '30px', display: 'inline-flex', alignItems: 'center', gap: '14px', background: 'linear-gradient(135deg,#3b82f6,#2563eb)', boxShadow: '0 8px 20px rgba(59,130,246,0.4)', opacity: submitting ? 0.7 : 1 }}>
          {submitting ? <><RefreshCw size={20} className="spin" /> บันทึก...</> : <><Trophy size={20} /> ส่งคำตอบและดูผล</>}
        </button>
        <p style={{ color: 'var(--text-muted)', marginTop: '12px', fontSize: '1.1rem' }}>ทำเครื่องหมายแล้ว {answeredCount} จาก {totalQ} ข้อ</p>
      </div>
    </div>
  );
}
