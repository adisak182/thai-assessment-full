import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Trophy, BookOpen, MessageCircle, Volume2, PenTool, Edit3, User as UserIcon, CheckCircle, Clock, ArrowRight, Eye, XCircle } from 'lucide-react';

const SKILL_CONFIG = [
  { key: 'full_test', label: 'แบบทดสอบรวม 100 ข้อ', icon: <BookOpen size={24} />, color: '#8b5cf6', bg: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', path: '/skills', max: 100 },
];
const TOTAL_MAX = 100;

function formatDate(isoStr) {
  return new Date(isoStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function ScoreBar({ pct, color }) {
  return (
    <div style={{ background: 'rgba(0,0,0,0.06)', borderRadius: '999px', height: '10px', overflow: 'hidden', marginTop: '8px' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '999px', transition: 'width 0.8s ease' }} />
    </div>
  );
}

export default function Dashboard() {
  const { user, fetchScores, fetchHistory } = useUser();
  const [skillScores, setSkillScores] = useState({});
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedAttemptId, setExpandedAttemptId] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const raw = await fetchScores() || {};
        // Support both old level-based and new flat format
        let flat = {};
        if (raw.flat) {
          flat = raw.flat;
        } else if (raw['1'] || raw['2'] || raw['3']) {
          // Old format: merge best score across levels
          for (const sk of ['listening', 'conversation', 'reading', 'writing', 'full_test']) {
            let best = null;
            for (let lv = 1; lv <= 3; lv++) {
              const s = raw[lv]?.[sk];
              if (s && (best === null || s.score > best.score)) best = s;
            }
            if (best) flat[sk] = best;
          }
        } else {
          flat = raw;
        }
        setSkillScores(flat);
        setHistory(await fetchHistory() || []);
      } catch (e) { /* ignore */ }
      setLoading(false);
    };
    load();
  }, [user]);

  if (!user) return null;

  const grandTotal = SKILL_CONFIG.reduce((s, sk) => s + (skillScores[sk.key]?.score || 0), 0);
  const pct = Math.round((grandTotal / TOTAL_MAX) * 100);
  const completedCount = SKILL_CONFIG.filter(sk => skillScores[sk.key] !== undefined).length;

  let grade = 'ปรับปรุง'; let gradeColor = '#ef4444';
  if (pct >= 80) { grade = 'ดีมาก'; gradeColor = '#10b981'; }
  else if (pct >= 60) { grade = 'ดี'; gradeColor = '#10b981'; }
  else if (pct >= 50) { grade = 'พอใช้'; gradeColor = '#f59e0b'; }

  const isPassed = pct >= 70;
  const passStatus = isPassed ? 'ผ่าน' : 'ไม่ผ่าน';
  const passColor = isPassed ? '#10b981' : '#ef4444';

  return (
    <div className="animate-fade-in delay-100" style={{ padding: '32px 16px', maxWidth: '960px', margin: '0 auto' }}>

      {/* Profile Header */}
      <div className="glass-panel" style={{ padding: '40px', marginBottom: '32px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--color-primary-light),var(--color-primary))', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', border: '4px solid white', boxShadow: 'var(--shadow-card)' }}>
            {user.avatar ? <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UserIcon size={50} />}
          </div>
          <div>
            <h2 style={{ fontSize: '1.9rem', marginBottom: '8px', color: 'var(--color-primary-dark)' }}>{user.name || 'ไม่ระบุชื่อ'}</h2>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
              {user.age && <span style={{ background: 'var(--bg-glass)', padding: '4px 12px', borderRadius: '16px', fontSize: '0.9rem', color: 'var(--color-primary-dark)' }}>อายุ <b>{user.age}</b> ปี</span>}
              {user.address && <span style={{ background: 'var(--bg-glass)', padding: '4px 12px', borderRadius: '16px', fontSize: '0.9rem', color: 'var(--color-primary-dark)' }}>📍 {user.address}</span>}
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link to="/profile" className="btn-secondary" style={{ padding: '8px 18px', fontSize: '0.9rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Edit3 size={15} /> แก้ไขข้อมูล
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" style={{ padding: '8px 18px', fontSize: '0.9rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fef2f2', color: '#ef4444', border: '1.5px solid #ef4444', borderRadius: '12px', fontWeight: '600' }}>
                  <UserIcon size={15} /> ผู้ดูแลระบบ
                </Link>
              )}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', background: 'var(--bg-glass)', padding: '28px 36px', borderRadius: '24px', minWidth: '180px' }}>
          <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '4px' }}>คะแนนรวม</div>
          <div style={{ fontSize: '3.2rem', fontWeight: 'bold', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', lineHeight: 1 }}>
            <Trophy size={36} /> {grandTotal}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '6px' }}>จาก {TOTAL_MAX} คะแนน ({pct}%)</div>
        </div>
      </div>

      {/* Overall summary */}
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '28px' }}>
        <h3 style={{ fontSize: '1.4rem', color: 'var(--color-primary-dark)', marginBottom: '24px', textAlign: 'center' }}>ผลการประเมินภาพรวม (100 ข้อ)</h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', marginBottom: '28px' }}>
          <div style={{ textAlign: 'center', padding: '20px 32px', background: 'var(--bg-glass)', borderRadius: '16px' }}>
            <div style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '4px' }}>ร้อยละ</div>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{pct}%</div>
          </div>
          <div style={{ textAlign: 'center', padding: '20px 32px', background: 'var(--bg-glass)', borderRadius: '16px', border: `2px solid ${gradeColor}` }}>
            <div style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '4px' }}>ระดับ</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: gradeColor }}>{grade}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '20px 32px', background: 'var(--bg-glass)', borderRadius: '16px', border: `2px solid ${passColor}` }}>
            <div style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '4px' }}>ผลประเมิน</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: passColor }}>{passStatus}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '20px 32px', background: 'var(--bg-glass)', borderRadius: '16px' }}>
            <div style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '4px' }}>ทำแล้ว</div>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>{completedCount}/1</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ชุดข้อสอบ</div>
          </div>
        </div>

        {/* Overall progress bar */}
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-primary-dark)', marginBottom: '6px' }}>
            <span>ความคืบหน้ารวม</span><span>{grandTotal} / {TOTAL_MAX}</span>
          </div>
          <ScoreBar pct={pct} color="linear-gradient(90deg,var(--color-primary-light),var(--color-primary))" />
        </div>
      </div>

      {/* Per-skill breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {SKILL_CONFIG.map(sk => {
          const s = skillScores[sk.key];
          const score = s?.score ?? null;
          const skPct = score !== null ? Math.round((score / sk.max) * 100) : 0;
          const isDone = score !== null;
          return (
            <div key={sk.key} className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: sk.bg, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 12px ${sk.color}40` }}>
                  {sk.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: 'var(--color-primary-dark)' }}>{sk.label}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>เต็ม {sk.max} คะแนน</div>
                </div>
                {isDone && <CheckCircle size={20} color="#10b981" />}
              </div>
              {isDone ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-primary-dark)', marginBottom: '4px' }}>
                    <span>คะแนน</span><span>{score} / {sk.max} ({skPct}%)</span>
                  </div>
                  <ScoreBar pct={skPct} color={sk.bg} />
                  <Link to={sk.path} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '12px', fontSize: '0.82rem', color: sk.color, textDecoration: 'none', fontWeight: '600' }}>
                    ทำใหม่ <ArrowRight size={14} />
                  </Link>
                </>
              ) : (
                <Link to={sk.path} style={{ display: 'block', textAlign: 'center', padding: '10px', background: sk.bg, color: 'white', borderRadius: '10px', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem', marginTop: '8px' }}>
                  เริ่มทำแบบทดสอบ →
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* History */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '1.3rem', color: 'var(--color-primary-dark)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Clock size={20} /> ประวัติการทำแบบทดสอบ
        </h3>
        {loading ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>กำลังโหลด...</p>
        ) : history.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>ยังไม่มีประวัติ — เริ่มทำข้อสอบเพื่อสะสมคะแนนครับ!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {history.map((h, i) => {
              const info = SKILL_CONFIG.find(s => s.key === h.skill) || { label: h.skill, color: '#6b7280', icon: <BookOpen size={18} />, bg: '#6b7280' };
              const hp = Math.round((h.score / h.max_score) * 100);
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '14px 18px', background: 'rgba(255,255,255,0.6)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: info.bg, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {info.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: 'var(--color-primary-dark)', fontSize: '0.9rem' }}>{info.label}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{formatDate(h.taken_at)}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '1rem', fontWeight: 'bold', color: hp >= 60 ? '#10b981' : '#ef4444' }}>{h.score}/{h.max_score}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{hp}%</div>
                    </div>
                  </div>

                  {h.detailed_results && h.detailed_results.length > 0 && (
                    <div style={{ marginTop: '4px' }}>
                      <button 
                        onClick={() => setExpandedAttemptId(expandedAttemptId === h._id ? null : h._id)}
                        style={{ background: 'white', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center' }}
                      >
                        <Eye size={16} /> {expandedAttemptId === h._id ? 'ซ่อนรายละเอียดคำตอบ' : 'ดูรายละเอียดคำตอบ'}
                      </button>
                      
                      {expandedAttemptId === h._id && (
                        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto', padding: '8px', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          {h.detailed_results.map((r, rIdx) => (
                            <div key={rIdx} style={{ padding: '12px', borderBottom: rIdx < h.detailed_results.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                <div style={{ marginTop: '2px' }}>
                                  {r.is_correct ? <CheckCircle size={18} color="#10b981" /> : <XCircle size={18} color="#f43f5e" />}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>{r.section}</div>
                                  <div style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: '500', marginBottom: '8px' }}>{r.question}</div>
                                  <div style={{ fontSize: '0.85rem', display: 'grid', gap: '4px' }}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                      <span style={{ color: '#64748b', width: '80px' }}>คำตอบของคุณ:</span>
                                      <span style={{ color: r.is_correct ? '#10b981' : '#f43f5e', fontWeight: '600' }}>{r.user_answer || '-'}</span>
                                    </div>
                                    {!r.is_correct && (
                                      <div style={{ display: 'flex', gap: '8px' }}>
                                        <span style={{ color: '#64748b', width: '80px' }}>เฉลย:</span>
                                        <span style={{ color: '#10b981', fontWeight: '600' }}>{r.correct_answer || '-'}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
