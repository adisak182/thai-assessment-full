import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Trophy, BookOpen, MessageCircle, Volume2, PenTool, Edit3, User as UserIcon, CheckCircle, Clock, ArrowRight, Eye, Award, Filter, Sparkles } from 'lucide-react';
import ScoreDetailModal from '../components/ScoreDetailModal';

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
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [historyFilter, setHistoryFilter] = useState('all'); // 'all' | 'passed' | 'notPassed'
  const [historySort, setHistorySort] = useState('latest'); // 'latest' | 'highest'

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

  // History statistics & sorting
  const totalAttempts = history.length;
  const bestAttemptScore = history.reduce((max, h) => Math.max(max, h.score || 0), 0);
  const avgScore = totalAttempts > 0 
    ? Math.round(history.reduce((acc, h) => acc + (h.score || 0), 0) / totalAttempts) 
    : 0;
  const passedAttemptsCount = history.filter(h => Math.round((h.score / (h.max_score || 100)) * 100) >= 70).length;

  const filteredHistory = useMemo(() => {
    return [...history].filter(h => {
      const hp = Math.round((h.score / (h.max_score || 100)) * 100);
      if (historyFilter === 'passed') return hp >= 70;
      if (historyFilter === 'notPassed') return hp < 70;
      return true;
    }).sort((a, b) => {
      if (historySort === 'highest') return (b.score || 0) - (a.score || 0);
      return new Date(b.taken_at) - new Date(a.taken_at);
    });
  }, [history, historyFilter, historySort]);

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-primary-dark)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={22} /> ประวัติการทำแบบทดสอบ
            </h3>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              ดูผลคะแนนย้อนหลัง คะแนนแยก 4 ทักษะ และตรวจคำตอบ 100 ข้อแบบละเอียด
            </p>
          </div>

          {/* Quick Filters */}
          {history.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', background: 'rgba(0,0,0,0.04)', padding: '4px', borderRadius: '12px', gap: '4px' }}>
                <button
                  onClick={() => setHistoryFilter('all')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: historyFilter === 'all' ? 'white' : 'transparent',
                    color: historyFilter === 'all' ? 'var(--color-primary-dark)' : 'var(--text-muted)',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    boxShadow: historyFilter === 'all' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  ทั้งหมด ({history.length})
                </button>
                <button
                  onClick={() => setHistoryFilter('passed')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: historyFilter === 'passed' ? '#d1fae5' : 'transparent',
                    color: historyFilter === 'passed' ? '#059669' : 'var(--text-muted)',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  ผ่าน ({passedAttemptsCount})
                </button>
                <button
                  onClick={() => setHistoryFilter('notPassed')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: historyFilter === 'notPassed' ? '#fee2e2' : 'transparent',
                    color: historyFilter === 'notPassed' ? '#dc2626' : 'var(--text-muted)',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  ไม่ผ่าน ({history.length - passedAttemptsCount})
                </button>
              </div>

              <select
                value={historySort}
                onChange={e => setHistorySort(e.target.value)}
                style={{
                  padding: '7px 12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(0,0,0,0.1)',
                  background: 'white',
                  fontSize: '0.85rem',
                  color: '#475569',
                  fontWeight: '600',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="latest">เรียงตามล่าสุด</option>
                <option value="highest">เรียงตามคะแนนสูงสุด</option>
              </select>
            </div>
          )}
        </div>

        {/* History Summary Statistics */}
        {history.length > 0 && (
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '12px',
              marginBottom: '24px'
            }}
          >
            <div style={{ background: 'rgba(255,255,255,0.7)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>จำนวนครั้งที่สอบ</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--color-primary-dark)', marginTop: '2px' }}>
                {totalAttempts} <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)' }}>ครั้ง</span>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.7)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>คะแนนสูงสุด</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#10b981', marginTop: '2px' }}>
                {bestAttemptScore} <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)' }}>/ 100</span>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.7)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>คะแนนเฉลี่ย</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#6366f1', marginTop: '2px' }}>
                {avgScore} <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)' }}>/ 100</span>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.7)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>สอบผ่านเกณฑ์ (≥70%)</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: passedAttemptsCount > 0 ? '#10b981' : '#f43f5e', marginTop: '2px' }}>
                {passedAttemptsCount} <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)' }}>ครั้ง</span>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>กำลังโหลด...</p>
        ) : history.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>ยังไม่มีประวัติ — เริ่มทำข้อสอบเพื่อสะสมคะแนนครับ!</p>
        ) : filteredHistory.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>ไม่พบรายการตามตัวกรองที่เลือก</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredHistory.map((h, i) => {
              const info = SKILL_CONFIG.find(s => s.key === h.skill) || { 
                label: h.skill === 'full_test' ? 'แบบทดสอบรวม 100 ข้อ' : `ทักษะ${h.skill}`, 
                color: '#8b5cf6', 
                icon: <BookOpen size={20} />, 
                bg: 'linear-gradient(135deg,#8b5cf6,#6d28d9)' 
              };
              const hp = Math.round((h.score / (h.max_score || 100)) * 100);
              const passed = hp >= 70;
              let evalText = 'ปรับปรุง';
              let evalColor = '#dc2626';
              let evalBg = '#fee2e2';
              if (hp >= 80) { evalText = 'ดีมาก'; evalColor = '#059669'; evalBg = '#d1fae5'; }
              else if (hp >= 60) { evalText = 'ดี'; evalColor = '#2563eb'; evalBg = '#dbeafe'; }
              else if (hp >= 50) { evalText = 'พอใช้'; evalColor = '#d97706'; evalBg = '#fef3c7'; }

              const hasBreakdownData = h.breakdown && Object.keys(h.breakdown).length > 0;

              return (
                <div 
                  key={i} 
                  className="glass-card"
                  onClick={() => setSelectedAttempt(h)}
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '12px', 
                    padding: '18px 22px', 
                    background: 'rgba(255,255,255,0.85)', 
                    borderRadius: '16px', 
                    border: '1px solid rgba(0,0,0,0.06)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.06)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: info.bg, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 3px 10px rgba(139,92,246,0.25)' }}>
                        {info.icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: 'var(--color-primary-dark)', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {info.label}
                          <span 
                            style={{ 
                              fontSize: '0.72rem', 
                              padding: '2px 8px', 
                              borderRadius: '10px', 
                              background: passed ? '#d1fae5' : '#fee2e2', 
                              color: passed ? '#059669' : '#dc2626',
                              fontWeight: '700'
                            }}
                          >
                            {passed ? 'ผ่าน' : 'ไม่ผ่าน'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={13} /> {formatDate(h.taken_at)}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.35rem', fontWeight: '800', color: passed ? '#10b981' : '#ef4444', lineHeight: 1 }}>
                          {h.score} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>/ {h.max_score}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'flex-end', marginTop: '4px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>{hp}%</span>
                          <span style={{ fontSize: '0.72rem', padding: '1px 6px', borderRadius: '6px', background: evalBg, color: evalColor, fontWeight: '700' }}>
                            {evalText}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAttempt(h);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 16px',
                          borderRadius: '12px',
                          border: 'none',
                          background: 'rgba(139, 92, 246, 0.1)',
                          color: 'var(--color-primary)',
                          fontWeight: '700',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                      >
                        <Eye size={15} /> ดูผลละเอียด
                      </button>
                    </div>
                  </div>

                  {/* 4-Skills mini chips if available */}
                  {hasBreakdownData && (
                    <div 
                      style={{ 
                        display: 'flex', 
                        gap: '8px', 
                        flexWrap: 'wrap', 
                        paddingTop: '10px', 
                        borderTop: '1px dashed rgba(0,0,0,0.06)',
                        fontSize: '0.8rem'
                      }}
                    >
                      {Object.entries(h.breakdown).map(([k, b]) => (
                        <div 
                          key={k}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'rgba(0,0,0,0.03)',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            color: '#475569'
                          }}
                        >
                          <span style={{ fontWeight: '600' }}>{b.label}:</span>
                          <span style={{ fontWeight: '700', color: 'var(--color-primary)' }}>{b.score}/{b.max}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DETAILED SCORE MODAL */}
      {selectedAttempt && (
        <ScoreDetailModal
          attempt={selectedAttempt}
          user={user}
          onClose={() => setSelectedAttempt(null)}
        />
      )}
    </div>
  );
}

