import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import {
  Trophy, BookOpen, MessageCircle, Volume2,
  PenTool, Edit3, User as UserIcon, CheckCircle, XCircle, Clock
} from 'lucide-react';

const SKILL_INFO = {
  listening:    { label: 'ทักษะการฟัง',   color: '#8b5cf6', icon: <Volume2 size={28} /> },
  conversation: { label: 'ทักษะการพูด',   color: '#3b82f6', icon: <MessageCircle size={28} /> },
  reading:      { label: 'ทักษะการอ่าน',  color: '#10b981', icon: <BookOpen size={28} /> },
  writing:      { label: 'ทักษะการเขียน', color: '#f59e0b', icon: <PenTool size={28} /> },
};

const LEVEL_MAX = {
  1: { listening: 15, conversation: 5, reading: 5, writing: 5, total: 30, pass: 21 },
  2: { listening: 15, conversation: 5, reading: 10, writing: 10, total: 40, pass: 28 },
  3: { listening: 15, conversation: 5, reading: 15, writing: 15, total: 50, pass: 35 },
};

function formatDate(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function ScoreBar({ score, max, color }) {
  const pct = max > 0 ? Math.min(100, Math.round((score / max) * 100)) : 0;
  return (
    <div style={{ background: 'rgba(0,0,0,0.06)', borderRadius: '999px', height: '8px', overflow: 'hidden', marginTop: '6px' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '999px', transition: 'width 0.6s ease' }} />
    </div>
  );
}

export default function Dashboard() {
  const { user, fetchScores, fetchHistory, checkLevelPassed } = useUser();
  const [allScores, setAllScores] = useState({});
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      setAllScores(await fetchScores() || {});
      setHistory(await fetchHistory() || []);
    };
    loadData();
  }, [user]);

  if (!user) return null;

  // Compute grand total across all levels
  let grandTotal = 0;
  let grandMax = 0;
  for (let lv = 1; lv <= 3; lv++) {
    const ldata = allScores[lv] || {};
    const meta = LEVEL_MAX[lv];
    for (const skill of ['listening', 'conversation', 'reading', 'writing']) {
      grandTotal += ldata[skill]?.score || 0;
      grandMax += meta[skill];
    }
  }

  const pct = grandMax > 0 ? Math.round((grandTotal / grandMax) * 100) : 0;
  let status = 'ไม่ผ่าน';
  let statusColor = '#ef4444';
  let levelGrade = 'ปรับปรุง';

  if (pct >= 90) {
    status = 'ผ่าน';
    statusColor = '#10b981';
    levelGrade = 'ดีเยี่ยม';
  } else if (pct >= 80) {
    status = 'ผ่าน';
    statusColor = '#10b981';
    levelGrade = 'ดีมาก';
  } else if (pct >= 70) {
    status = 'ผ่าน';
    statusColor = '#10b981';
    levelGrade = 'ดี';
  }

  return (
    <div className="animate-fade-in delay-100" style={{ padding: '32px 16px', maxWidth: '1000px', margin: '0 auto' }}>

      {/* Profile Header */}
      <div className="glass-panel" style={{ padding: '40px', marginBottom: '32px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <div style={{ width: '110px', height: '110px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary))', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', border: '4px solid white', boxShadow: 'var(--shadow-card)' }}>
            {user.avatar
              ? <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <UserIcon size={56} />
            }
          </div>
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '8px', color: 'var(--color-primary-dark)' }}>
              {user.name || 'ไม่ระบุชื่อ'}
            </h2>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {user.age && <span style={{ background: 'var(--bg-glass)', padding: '4px 12px', borderRadius: '16px', fontSize: '0.9rem', color: 'var(--color-primary-dark)' }}>อายุ <b>{user.age}</b> ปี</span>}
              {user.gender && <span style={{ background: 'var(--bg-glass)', padding: '4px 12px', borderRadius: '16px', fontSize: '0.9rem', color: 'var(--color-primary-dark)' }}>เพศ<b>{user.gender}</b></span>}
              {user.address && <span style={{ background: 'var(--bg-glass)', padding: '4px 12px', borderRadius: '16px', fontSize: '0.9rem', color: 'var(--color-primary-dark)' }}>📍 {user.address}</span>}
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to="/profile" className="btn-secondary" style={{ padding: '8px 20px', fontSize: '0.9rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={16} /> จัดการข้อมูลส่วนตัว
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" style={{ padding: '8px 20px', fontSize: '0.9rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fef2f2', color: '#ef4444', border: '1.5px solid #ef4444', borderRadius: '12px', fontWeight: '600' }}>
                  <UserIcon size={16} /> หน้าผู้ดูแลระบบ
                </Link>
              )}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', background: 'var(--bg-glass)', padding: '28px 36px', borderRadius: '24px' }}>
          <div style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '6px' }}>คะแนนรวมทุก Level</div>
          <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', lineHeight: 1 }}>
            <Trophy size={40} /> {grandTotal}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '6px' }}>จาก {grandMax} คะแนน ({pct}%)</div>
        </div>
      </div>

      {/* Final Evaluation Banner */}
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '32px', background: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.9))' }}>
        <h3 style={{ fontSize: '1.5rem', color: 'var(--color-primary-dark)', marginBottom: '24px', textAlign: 'center' }}>
          ผลการประเมินภาพรวม (ทุกระดับ)
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          <div style={{ textAlign: 'center', padding: '24px', background: 'var(--bg-glass)', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '8px' }}>คะแนนรวมร้อยละ</div>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{pct}%</div>
            <div style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>({grandTotal} / {grandMax})</div>
          </div>
          <div style={{ textAlign: 'center', padding: '24px', background: 'var(--bg-glass)', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: `2px solid ${statusColor}` }}>
            <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '8px' }}>ระดับการประเมิน</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: statusColor }}>{levelGrade}</div>
            <div style={{ fontSize: '1.2rem', color: statusColor, fontWeight: '600', marginTop: '4px' }}>({status})</div>
          </div>
        </div>

        {/* Score Breakdown Table */}
        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.95rem', background: 'white' }}>
            <thead>
              <tr style={{ background: 'var(--color-primary)', color: 'white' }}>
                <th style={{ padding: '16px', borderRadius: '12px 0 0 0' }}>ทักษะ</th>
                <th style={{ padding: '16px' }}>พื้นฐาน (L1)</th>
                <th style={{ padding: '16px' }}>ปานกลาง (L2)</th>
                <th style={{ padding: '16px' }}>สูง (L3)</th>
                <th style={{ padding: '16px', borderRadius: '0 12px 0 0' }}>รวม/ทักษะ</th>
              </tr>
            </thead>
            <tbody>
              {['listening', 'conversation', 'reading', 'writing'].map((skill, idx) => {
                const s1 = allScores[1]?.[skill]?.score || 0;
                const s2 = allScores[2]?.[skill]?.score || 0;
                const s3 = allScores[3]?.[skill]?.score || 0;
                const totalSkill = s1 + s2 + s3;
                const maxSkill = LEVEL_MAX[1][skill] + LEVEL_MAX[2][skill] + LEVEL_MAX[3][skill];
                const info = SKILL_INFO[skill];
                return (
                  <tr key={skill} style={{ background: idx % 2 === 0 ? 'rgba(0,0,0,0.02)' : 'transparent', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <td style={{ padding: '14px', textAlign: 'left', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)' }}>
                      {info.label}
                    </td>
                    <td style={{ padding: '14px', color: 'var(--text-muted)' }}>{s1} / {LEVEL_MAX[1][skill]}</td>
                    <td style={{ padding: '14px', color: 'var(--text-muted)' }}>{s2} / {LEVEL_MAX[2][skill]}</td>
                    <td style={{ padding: '14px', color: 'var(--text-muted)' }}>{s3} / {LEVEL_MAX[3][skill]}</td>
                    <td style={{ padding: '14px', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>{totalSkill} / {maxSkill}</td>
                  </tr>
                );
              })}
              <tr style={{ background: 'rgba(168,85,247,0.1)', fontWeight: 'bold' }}>
                <td style={{ padding: '16px', textAlign: 'left', borderRadius: '0 0 0 12px', color: 'var(--color-primary-dark)' }}>รวม/ระดับ</td>
                <td style={{ padding: '16px' }}>{['listening','conversation','reading','writing'].reduce((acc, sk) => acc + (allScores[1]?.[sk]?.score || 0), 0)} / 30</td>
                <td style={{ padding: '16px' }}>{['listening','conversation','reading','writing'].reduce((acc, sk) => acc + (allScores[2]?.[sk]?.score || 0), 0)} / 40</td>
                <td style={{ padding: '16px' }}>{['listening','conversation','reading','writing'].reduce((acc, sk) => acc + (allScores[3]?.[sk]?.score || 0), 0)} / 50</td>
                <td style={{ padding: '16px', borderRadius: '0 0 12px 0', color: 'var(--color-primary-dark)', fontSize: '1.1rem' }}>{grandTotal} / 120</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Score by Level */}
      {[1, 2, 3].map(lv => {
        const ldata = allScores[lv] || {};
        const meta = LEVEL_MAX[lv];
        const levelTotal = ['listening','conversation','reading','writing'].reduce((s, sk) => s + (ldata[sk]?.score || 0), 0);
        const passed = checkLevelPassed(lv);
        const hasAny = Object.keys(ldata).length > 0;

        return (
          <div key={lv} className="glass-panel" style={{ padding: '32px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: passed ? 'linear-gradient(135deg,#10b981,#059669)' : hasAny ? 'linear-gradient(135deg,var(--color-primary-light),var(--color-primary))' : '#e5e7eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 'bold', flexShrink: 0 }}>
                  {lv}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--color-primary-dark)' }}>
                    Level {lv} — {['ระดับพื้นฐาน', 'ระดับกลาง', 'ระดับสูง'][lv - 1]}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    เกณฑ์ผ่าน: {meta.pass}/{meta.total} คะแนน
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: passed ? '#10b981' : '#6b7280' }}>
                  {levelTotal} / {meta.total}
                </span>
                {passed
                  ? <CheckCircle size={24} color="#10b981" />
                  : hasAny ? <XCircle size={24} color="#ef4444" /> : null
                }
              </div>
            </div>

            {!hasAny ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0', margin: 0 }}>
                ยังไม่มีคะแนนในระดับนี้
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                {['listening', 'conversation', 'reading', 'writing'].map(skill => {
                  const s = ldata[skill];
                  const maxS = meta[skill];
                  const info = SKILL_INFO[skill];
                  return (
                    <div key={skill} style={{ background: 'rgba(255,255,255,0.6)', padding: '18px 20px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: info.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {info.icon}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>{info.label}</div>
                      </div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>
                        {s ? s.score : '—'} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>/ {maxS}</span>
                      </div>
                      {s && <ScoreBar score={s.score} max={maxS} color={info.color} />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* History */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '1.4rem', color: 'var(--color-primary-dark)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Clock size={22} /> ประวัติการทำแบบทดสอบ (50 รายการล่าสุด)
        </h3>
        {history.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>
            ยังไม่มีประวัติการทำแบบทดสอบ — เริ่มทำข้อสอบเพื่อสะสมคะแนน!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {history.map((h, i) => {
              const info = SKILL_INFO[h.skill] || { label: h.skill, color: '#6b7280', icon: <BookOpen size={16} /> };
              const pct = Math.round((h.score / h.max_score) * 100);
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 20px', background: 'rgba(255,255,255,0.6)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: info.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {info.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: 'var(--color-primary-dark)', fontSize: '0.95rem' }}>
                      Level {h.level} — {info.label}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{formatDate(h.taken_at)}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: pct >= 60 ? '#10b981' : '#ef4444' }}>
                      {h.score}/{h.max_score}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{pct}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
