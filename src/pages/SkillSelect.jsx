import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Volume2, MessageCircle, BookOpen, PenTool, CheckCircle, Trophy, Star } from 'lucide-react';
import { useUser } from '../context/UserContext';

const SKILLS = [
  {
    key: 'listening',
    title: 'ทักษะการฟัง',
    subtitle: '25 ข้อ',
    desc: 'ฟังคำศัพท์ ประกาศ นิทาน สำนวน และบทความ แล้วตอบคำถาม',
    icon: <Volume2 size={36} />,
    path: '/test/listening',
    bg: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    shadow: 'rgba(139,92,246,0.35)',
    max: 25,
  },
  {
    key: 'conversation',
    title: 'ทักษะการพูด',
    subtitle: '15 ข้อ',
    desc: 'สนทนาโต้ตอบ บอกข้อมูลส่วนตัว และฝึกอ่านประโยคลิ้นพันกัน',
    icon: <MessageCircle size={36} />,
    path: '/test/speaking',
    bg: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    shadow: 'rgba(59,130,246,0.35)',
    max: 15,
  },
  {
    key: 'reading',
    title: 'ทักษะการอ่าน',
    subtitle: '30 ข้อ',
    desc: 'อ่านจับใจความ บทความวิชาการ วิเคราะห์ภาษา และคำประพันธ์',
    icon: <BookOpen size={36} />,
    path: '/test/reading',
    bg: 'linear-gradient(135deg, #10b981, #059669)',
    shadow: 'rgba(16,185,129,0.35)',
    max: 30,
  },
  {
    key: 'writing',
    title: 'ทักษะการเขียน',
    subtitle: '30 ข้อ',
    desc: 'เขียนคำศัพท์ เติมคำในช่องว่าง เรียงประโยค และตอบคำถาม',
    icon: <PenTool size={36} />,
    path: '/test/writing',
    bg: 'linear-gradient(135deg, #f59e0b, #d97706)',
    shadow: 'rgba(245,158,11,0.35)',
    max: 30,
  },
];

export default function SkillSelect() {
  const { user, fetchScores } = useUser();
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const raw = await fetchScores();
        // flat format: { listening: {score,max}, conversation: ..., reading: ..., writing: ... }
        const flat = raw?.flat || raw || {};
        setScores(flat);
      } catch (e) { /* ignore */ }
      setLoading(false);
    };
    load();
  }, [user]);

  const totalScore = SKILLS.reduce((s, sk) => s + (scores[sk.key]?.score || 0), 0);
  const totalMax = 100;
  const totalPct = Math.round((totalScore / totalMax) * 100);
  const completedCount = SKILLS.filter(sk => scores[sk.key]?.score !== undefined && scores[sk.key]?.score !== null).length;

  return (
    <div className="animate-fade-in" style={{ padding: '24px 0' }}>

      {/* Header Panel */}
      <div className="glass-panel" style={{ padding: '40px', marginBottom: '32px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 24px rgba(168,85,247,0.35)' }}>
            <Trophy size={40} />
          </div>
        </div>
        <h1 style={{ fontSize: '2rem', color: 'var(--color-primary-dark)', marginBottom: '8px' }}>แบบประเมินภาษาไทย</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '28px', fontSize: '1.05rem' }}>100 ข้อ เรียงตามทักษะ เลือกทำทีละทักษะได้เลยครับ</p>

        {/* Overall progress */}
        {!loading && (
          <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: '600', color: 'var(--color-primary-dark)' }}>
              <span>ความคืบหน้ารวม</span>
              <span>{totalScore} / {totalMax} คะแนน ({totalPct}%)</span>
            </div>
            <div style={{ height: '12px', borderRadius: '999px', background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <div style={{ width: `${totalPct}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-primary-light), var(--color-primary))', borderRadius: '999px', transition: 'width 0.8s ease' }} />
            </div>
            <div style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              ทำไปแล้ว {completedCount} จาก 4 ทักษะ
              {completedCount === 4 && <span style={{ color: '#10b981', marginLeft: '8px', fontWeight: '600' }}>✅ ครบทุกทักษะแล้ว!</span>}
            </div>
          </div>
        )}
      </div>

      {/* Skill Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {SKILLS.map((skill) => {
          const skScore = scores[skill.key];
          const isDone = skScore?.score !== undefined && skScore?.score !== null;
          const pct = isDone ? Math.round((skScore.score / skill.max) * 100) : 0;

          return (
            <Link key={skill.key} to={skill.path} style={{ textDecoration: 'none' }}>
              <div className="glass-card" style={{ padding: '32px', height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden' }}>
                {isDone && (
                  <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                    <CheckCircle size={24} color="#10b981" />
                  </div>
                )}

                {/* Icon */}
                <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: skill.bg, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', boxShadow: `0 6px 16px ${skill.shadow}` }}>
                  {skill.icon}
                </div>

                {/* Title */}
                <h3 style={{ fontSize: '1.3rem', color: 'var(--color-primary-dark)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {skill.title}
                  <span style={{ fontSize: '0.8rem', background: 'rgba(168,85,247,0.1)', color: 'var(--color-primary)', padding: '2px 10px', borderRadius: '20px', fontWeight: '600' }}>
                    {skill.subtitle}
                  </span>
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.6', flex: 1 }}>{skill.desc}</p>

                {/* Score bar */}
                {isDone ? (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--color-primary-dark)', fontWeight: '600' }}>
                      <span>คะแนนที่ได้</span>
                      <span>{skScore.score} / {skill.max} ({pct}%)</span>
                    </div>
                    <div style={{ height: '8px', borderRadius: '999px', background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: skill.bg, borderRadius: '999px' }} />
                    </div>
                    <div style={{ marginTop: '12px', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <Star size={14} /> ทำแล้ว — คลิกเพื่อทำใหม่
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: 'auto', padding: '12px', background: skill.bg, borderRadius: '12px', color: 'white', textAlign: 'center', fontWeight: '600', fontSize: '0.95rem', boxShadow: `0 4px 12px ${skill.shadow}` }}>
                    เริ่มทำแบบทดสอบ →
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
