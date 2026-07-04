import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { Trophy, Medal, Award, Crown } from 'lucide-react';

export default function Ranking() {
  const { user, fetchRanking } = useUser();
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRanking = async () => {
      try {
        const data = await fetchRanking();
        setRanking(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadRanking();
  }, []);

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return <Crown size={28} color="#eab308" />; // Gold
      case 1: return <Medal size={28} color="#94a3b8" />; // Silver
      case 2: return <Award size={28} color="#b45309" />; // Bronze
      default: return <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>{index + 1}</span>;
    }
  };

  const getRankStyle = (index) => {
    switch (index) {
      case 0: return { background: 'linear-gradient(135deg, rgba(253,224,71,0.15), rgba(234,179,8,0.05))', border: '1px solid rgba(234,179,8,0.3)', transform: 'scale(1.02)' };
      case 1: return { background: 'linear-gradient(135deg, rgba(226,232,240,0.4), rgba(148,163,184,0.1))', border: '1px solid rgba(148,163,184,0.2)' };
      case 2: return { background: 'linear-gradient(135deg, rgba(253,186,116,0.2), rgba(180,83,9,0.05))', border: '1px solid rgba(180,83,9,0.2)' };
      default: return { background: 'var(--bg-glass)', border: '1px solid rgba(0,0,0,0.05)' };
    }
  };

  return (
    <div className="animate-fade-in delay-100" style={{ padding: '32px 16px', maxWidth: '800px', margin: '0 auto' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary))', color: 'white', marginBottom: '16px', boxShadow: '0 8px 24px rgba(168,85,247,0.3)' }}>
          <Trophy size={40} />
        </div>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--color-primary-dark)', margin: '0 0 8px' }}>Leaderboard</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: 0 }}>ตารางจัดอันดับผู้ที่ได้คะแนนรวมสูงสุด (Top 100)</p>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>กำลังโหลดข้อมูล...</p>
        ) : ranking.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>ยังไม่มีข้อมูลการจัดอันดับ</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {ranking.map((r, index) => {
              const isCurrentUser = user && user._id === r.userId;
              
              return (
                <div key={r.userId} style={{
                  display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px', borderRadius: '16px',
                  ...getRankStyle(index),
                  boxShadow: isCurrentUser ? '0 0 0 2px var(--color-primary)' : 'none',
                  position: 'relative', overflow: 'hidden'
                }}>
                  {isCurrentUser && (
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'var(--color-primary)' }} />
                  )}
                  
                  <div style={{ width: '40px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                    {getRankIcon(index)}
                  </div>
                  
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#e2e8f0', overflow: 'hidden', flexShrink: 0, border: '2px solid white' }}>
                    {r.avatar ? (
                      <img src={r.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #c4b5fd, #8b5cf6)', color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }}>
                        {r.name ? r.name.charAt(0) : '?'}
                      </div>
                    )}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {r.name || 'ไม่ระบุชื่อ'}
                      {isCurrentUser && <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'var(--color-primary)', color: 'white', borderRadius: '12px' }}>คุณ</span>}
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--color-primary)', lineHeight: '1' }}>
                      {r.totalScore}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>คะแนน</div>
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
