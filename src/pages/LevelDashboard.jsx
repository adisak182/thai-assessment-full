import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BookOpen, Volume2, MessageCircle, Award, PenTool, ArrowRight, CheckCircle, XCircle, Trophy, Star } from 'lucide-react';
import { useUser } from '../context/UserContext';
import confetti from 'canvas-confetti';

// ==================== LEVEL 3 COMPLETION MODAL ====================
function Level3CompletionModal({ scores, onClose }) {
  const containerRef = useRef(null);
  const maxScore = 50;
  const passScore = 35;
  const total = scores.totalScore;
  const pct = Math.round((total / maxScore) * 100);
  const passed = total >= passScore;

  const fire = useCallback(() => {
    const colors = ['#a855f7', '#7c3aed', '#fbbf24', '#10b981', '#3b82f6', '#f43f5e'];

    const shoot = (angle, spread) => {
      confetti({
        particleCount: 80,
        angle,
        spread,
        origin: { y: 0.6 },
        colors,
        scalar: 1.2,
        zIndex: 9999,
      });
    };

    shoot(60, 55);
    shoot(120, 55);
    setTimeout(() => shoot(80, 70), 250);
    setTimeout(() => shoot(100, 70), 250);
    setTimeout(() => {
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 }, colors, scalar: 1.5, zIndex: 9999 });
    }, 500);
  }, []);

  useEffect(() => {
    if (passed) {
      fire();
      const t1 = setTimeout(fire, 1200);
      const t2 = setTimeout(fire, 2500);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [passed, fire]);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 9000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div ref={containerRef} className="animate-fade-in" style={{
        background: 'white', borderRadius: '24px', padding: '48px 40px', maxWidth: '520px', width: '100%',
        textAlign: 'center', boxShadow: '0 24px 60px rgba(0,0,0,0.3)', position: 'relative'
      }}>
        {/* Badge */}
        <div style={{
          width: '100px', height: '100px', borderRadius: '50%', margin: '0 auto 28px',
          background: passed
            ? 'linear-gradient(135deg, #10b981, #059669)'
            : 'linear-gradient(135deg, #ef4444, #dc2626)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
          boxShadow: passed ? '0 8px 24px rgba(16,185,129,0.4)' : '0 8px 24px rgba(239,68,68,0.4)'
        }}>
          {passed ? <Trophy size={48} /> : <XCircle size={48} />}
        </div>

        <h2 style={{ fontSize: '2.2rem', fontWeight: 'bold', color: passed ? '#059669' : '#dc2626', marginBottom: '8px' }}>
          {passed ? '🎉 ยอดเยี่ยม! คุณผ่านแล้ว!' : '❌ ยังไม่ผ่านเกณฑ์'}
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '32px', fontSize: '1rem' }}>
          {passed
            ? 'คุณทำสำเร็จครบทุกระดับแล้ว! ขอแสดงความยินดีด้วยครับ'
            : 'ไม่ต้องท้อนะครับ ลองทำใหม่อีกครั้งได้เลย!'}
        </p>

        {/* Score */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '28px', flexWrap: 'wrap' }}>
          <div style={{ padding: '16px 28px', background: 'rgba(168,85,247,0.08)', borderRadius: '16px', border: '2px solid rgba(168,85,247,0.2)' }}>
            <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '6px' }}>คะแนนรวม</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-primary)', lineHeight: 1 }}>{total}</div>
            <div style={{ fontSize: '0.9rem', color: '#9ca3af' }}>จาก {maxScore}</div>
          </div>
          <div style={{ padding: '16px 28px', background: passed ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', borderRadius: '16px', border: `2px solid ${passed ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
            <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '6px' }}>ร้อยละ</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: passed ? '#059669' : '#dc2626', lineHeight: 1 }}>{pct}%</div>
            <div style={{ fontSize: '0.9rem', color: '#9ca3af' }}>เกณฑ์ {Math.round((passScore / maxScore) * 100)}%</div>
          </div>
        </div>

        {/* Skill breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '32px' }}>
          {[
            { label: '🎧 การฟัง', score: scores.listening, max: 15 },
            { label: '💬 การพูด', score: scores.conversation, max: 5 },
            { label: '📖 การอ่าน', score: scores.reading, max: 15 },
            { label: '✍️ การเขียน', score: scores.writing, max: 15 },
          ].map(s => (
            <div key={s.label} style={{ background: '#f9fafb', borderRadius: '12px', padding: '12px 16px', textAlign: 'left' }}>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '4px' }}>{s.label}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>
                {s.score} <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 'normal' }}>/ {s.max}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '12px 28px', borderRadius: '30px', fontSize: '1rem' }}>
            ปิด
          </button>
          <button onClick={() => { fire(); }} className="btn-primary" style={{ padding: '12px 28px', borderRadius: '30px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Star size={18} /> ยิงพลุอีกครั้ง!
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== LEVEL PASSED BANNER ====================
function LevelPassedBanner({ level, nextLevel, onGoNext, onDismiss }) {
  const fire = useCallback(() => {
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.55 }, scalar: 1.3,
      colors: ['#a855f7', '#7c3aed', '#fbbf24', '#10b981', '#3b82f6'], zIndex: 9999 });
  }, []);

  useEffect(() => { fire(); }, [fire]);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div className="animate-fade-in" style={{
        background: 'white', borderRadius: '24px', padding: '48px 40px', maxWidth: '460px', width: '100%',
        textAlign: 'center', boxShadow: '0 24px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          width: '90px', height: '90px', borderRadius: '50%', margin: '0 auto 24px',
          background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
          boxShadow: '0 8px 24px rgba(168,85,247,0.4)'
        }}>
          <CheckCircle size={44} />
        </div>

        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#7c3aed', marginBottom: '12px' }}>
          🎉 ผ่าน Level {level} แล้ว!
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '32px', fontSize: '1.05rem', lineHeight: '1.6' }}>
          ยอดเยี่ยมมาก! คุณทำได้สำเร็จครับ<br />
          พร้อมไป <strong>Level {nextLevel}</strong> กันเลยไหม?
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={onDismiss} className="btn-secondary" style={{ padding: '12px 24px', borderRadius: '30px' }}>
            อยู่ที่นี่ก่อน
          </button>
          <button onClick={onGoNext} className="btn-primary" style={{ padding: '12px 28px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem' }}>
            ไป Level {nextLevel} <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN LEVEL DASHBOARD ====================
export default function LevelDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, fetchScores } = useUser();

  const [scores, setScores] = useState({ listening: 0, conversation: 0, reading: 0, writing: 0, totalScore: 0 });
  const [showPassedBanner, setShowPassedBanner] = useState(false);
  const [showL3Completion, setShowL3Completion] = useState(false);
  const [prevTotalScore, setPrevTotalScore] = useState(null);

  const levelNum = parseInt(id);

  const LEVEL_CONFIG = {
    1: { max: 30, pass: 21, readingMax: 5, writingMax: 5 },
    2: { max: 40, pass: 28, readingMax: 10, writingMax: 10 },
    3: { max: 50, pass: 35, readingMax: 15, writingMax: 15 },
  };
  const config = LEVEL_CONFIG[levelNum] || LEVEL_CONFIG[1];
  const nextLevel = levelNum + 1;

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      const allScores = await fetchScores();
      const levelData = allScores[id] || {};

      const listening    = levelData.listening?.score    || 0;
      const conversation = levelData.conversation?.score || 0;
      const reading      = levelData.reading?.score      || 0;
      const writing      = levelData.writing?.score      || 0;
      const totalScore   = listening + conversation + reading + writing;

      const allDone = levelData.listening && levelData.conversation && levelData.reading && levelData.writing;
      const passed = totalScore >= config.pass;

      setScores({ listening, conversation, reading, writing, totalScore });

      // Only trigger modal if this is a new completion (score changed)
      if (allDone && passed && prevTotalScore !== null && totalScore !== prevTotalScore) {
        if (levelNum === 3) {
          setShowL3Completion(true);
        } else {
          setShowPassedBanner(true);
        }
      }

      setPrevTotalScore(totalScore);
    };
    loadData();
  }, [id, user]);

  const handleGoNextLevel = () => {
    setShowPassedBanner(false);
    navigate(`/level/${nextLevel}`);
  };

  const modules = [];

  if (id === '1') {
    modules.push({ title: 'ทักษะการฟัง', path: 'listening', icon: <Volume2 size={32} />, desc: 'ทดสอบการฟังคำศัพท์ นิทาน และประกาศ', bg: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' });
    modules.push({ title: 'ทักษะการพูด (สนทนาโต้ตอบ)', path: 'conversation', icon: <MessageCircle size={32} />, desc: 'ฝึกการสนทนาโต้ตอบกับระบบ 5 สถานการณ์', bg: 'linear-gradient(135deg, #3b82f6, #2563eb)' });
    modules.push({ title: 'ทักษะการอ่าน (จับใจความ)', path: 'reading', icon: <BookOpen size={32} />, desc: 'อ่านบทความและตอบคำถามเพื่อประยุกต์ใช้ในสถานการณ์ต่างๆ', bg: 'linear-gradient(135deg, #10b981, #059669)' });
    modules.push({ title: 'ทักษะการเขียน (เกมแฟลชการ์ด)', path: 'writing', icon: <PenTool size={32} />, desc: 'ดูภาพและฟังเสียงคำศัพท์ แล้วเลือกคำที่สะกดถูกต้อง', bg: 'linear-gradient(135deg, #f59e0b, #d97706)' });
  }

  if (id === '2') {
    modules.push({ title: 'ทักษะการฟัง', path: 'listening', icon: <Volume2 size={32} />, desc: 'ทดสอบการฟังคำศัพท์ สำนวน และบทความ', bg: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' });
    modules.push({ title: 'ทักษะการพูด (สนทนาโต้ตอบ)', path: 'conversation', icon: <MessageCircle size={32} />, desc: 'ฝึกการสนทนาโต้ตอบกับระบบ 5 สถานการณ์', bg: 'linear-gradient(135deg, #3b82f6, #2563eb)' });
    modules.push({ title: 'ทักษะการอ่าน (จับใจความ)', path: 'reading', icon: <BookOpen size={32} />, desc: 'อ่านบทความ "6 โรค ที่มากับหน้าฝน" และตอบคำถาม 10 ข้อ', bg: 'linear-gradient(135deg, #10b981, #059669)' });
    modules.push({ title: 'ทักษะการเขียน', path: 'writing', icon: <PenTool size={32} />, desc: 'เขียนคำศัพท์ตามคำอ่าน และเรียงคำเป็นประโยค', bg: 'linear-gradient(135deg, #f59e0b, #d97706)' });
  }

  if (id === '3') {
    modules.push({ title: 'ทักษะการฟัง', path: 'listening', icon: <Volume2 size={32} />, desc: 'ทดสอบการฟังข่าว ประกาศ โฆษณา และวิเคราะห์สาร', bg: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' });
    modules.push({ title: 'ทักษะการพูด (สนทนาโต้ตอบ)', path: 'conversation', icon: <MessageCircle size={32} />, desc: 'ฝึกการสนทนาโต้ตอบในสถานการณ์สัมภาษณ์งานและการแก้ปัญหา', bg: 'linear-gradient(135deg, #3b82f6, #2563eb)' });
    modules.push({ title: 'ทักษะการอ่าน (จับใจความ)', path: 'reading', icon: <BookOpen size={32} />, desc: 'อ่านบทความสังคมสูงวัย วิเคราะห์ระดับภาษา และโคลงสี่สุภาพ', bg: 'linear-gradient(135deg, #10b981, #059669)' });
    modules.push({ title: 'ทักษะการเขียน (การใช้ภาษา)', path: 'writing', icon: <PenTool size={32} />, desc: 'เรียงคำศัพท์ยาก เรียงประโยค และการเขียนตอบคำถาม', bg: 'linear-gradient(135deg, #f59e0b, #d97706)' });
  }

  const passed = scores.totalScore >= config.pass;
  const pct = config.max > 0 ? Math.round((scores.totalScore / config.max) * 100) : 0;

  return (
    <div className="animate-fade-in px-4 py-8">
      {/* Modals */}
      {showPassedBanner && (
        <LevelPassedBanner
          level={levelNum}
          nextLevel={nextLevel}
          onGoNext={handleGoNextLevel}
          onDismiss={() => setShowPassedBanner(false)}
        />
      )}
      {showL3Completion && (
        <Level3CompletionModal
          scores={scores}
          onClose={() => setShowL3Completion(false)}
        />
      )}

      <Link to="/levels" style={{ color: 'var(--color-primary)', fontWeight: '500', marginBottom: '24px', display: 'inline-block', textDecoration: 'none' }}>
        ← กลับไปหน้าระดับทั้งหมด
      </Link>

      <div className="glass-panel" style={{ padding: '32px', marginBottom: '32px', marginTop: '16px' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '8px', color: 'var(--color-primary-dark)' }}>Level {id} Dashboard</h2>
        <p style={{ color: 'var(--text-muted)' }}>เลือกแบบฝึกหัดหรือเนื้อหาการเรียนรู้ที่คุณต้องการ</p>

        {/* Score summary */}
        <div style={{ marginTop: '24px', padding: '24px', background: 'rgba(255,255,255,0.5)', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} /> สรุปคะแนนรวม Level {id}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            {[
              { label: '🎧 การฟัง', score: scores.listening, max: 15, color: '#8b5cf6' },
              { label: '💬 การพูด', score: scores.conversation, max: 5, color: '#3b82f6' },
              { label: '📖 การอ่าน', score: scores.reading, max: config.readingMax, color: '#10b981' },
              { label: '✍️ การเขียน', score: scores.writing, max: config.writingMax, color: '#f59e0b' },
            ].map(s => (
              <div key={s.label} style={{ background: 'white', padding: '16px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{s.label}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: s.color }}>{s.score}/{s.max}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: passed ? '#ecfdf5' : '#fef2f2', borderRadius: '12px', border: `2px solid ${passed ? '#10b981' : '#ef4444'}`, flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: passed ? '#059669' : '#dc2626' }}>
                คะแนนรวม: {scores.totalScore} / {config.max} ({pct}%)
              </span>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                เกณฑ์ผ่าน {config.pass} คะแนน ({Math.round((config.pass / config.max) * 100)}%)
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ padding: '8px 16px', background: passed ? '#10b981' : '#ef4444', color: 'white', borderRadius: '20px', fontWeight: 'bold', display: 'inline-block' }}>
                {passed
                  ? (levelNum === 3 ? '🏅 ผ่านครบทุกระดับ!' : `🎉 สอบผ่าน! ปลดล็อก Level ${nextLevel}`)
                  : '❌ ยังไม่ผ่านเกณฑ์'}
              </span>
              {passed && levelNum < 3 && (
                <button onClick={() => navigate(`/level/${nextLevel}`)} className="btn-primary" style={{ padding: '8px 20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem' }}>
                  ไป Level {nextLevel} <ArrowRight size={16} />
                </button>
              )}
              {levelNum === 3 && (
                <button onClick={() => setShowL3Completion(true)} className="btn-primary" style={{ padding: '8px 20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem' }}>
                  <Trophy size={16} /> ดูสรุปผล
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Module cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {modules.map(mod => (
          <Link key={mod.path} to={`/level/${id}/${mod.path}`} style={{ textDecoration: 'none' }}>
            <div className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: mod.bg, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                {mod.icon}
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--color-primary-dark)' }}>{mod.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{mod.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
