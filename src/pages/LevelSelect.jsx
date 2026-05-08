import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useUser } from '../context/UserContext';

export default function LevelSelect() {
  const { checkLevelPassed } = useUser();
  const level1Passed = checkLevelPassed(1);
  const level2Passed = checkLevelPassed(2);


  const levels = [
    { id: 1, title: 'ระดับพื้นฐาน (Beginner)', desc: 'เริ่มต้นเรียนรู้พยัญชนะ สระ และคำศัพท์พื้นฐาน', isLocked: false },
    { id: 2, title: 'ระดับกลาง (Intermediate)', desc: 'ฝึกการอ่านประโยคและการโต้ตอบในชีวิตประจำวัน', isLocked: !level1Passed, lockMsg: 'ต้องผ่าน Level 1' },
    { id: 3, title: 'ระดับสูง (Advanced)', desc: 'บทความยาว การอภิปราย และคำศัพท์เฉพาะทาง', isLocked: !level2Passed, lockMsg: 'ต้องผ่าน Level 2' }
  ];

  return (
    <div className="animate-fade-in delay-100" style={{ padding: '20px 0' }}>
      <div className="glass-panel" style={{ padding: '40px', marginBottom: '30px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', color: 'var(--color-primary-dark)', marginBottom: '10px' }}>เลือกระดับการเรียนรู้</h2>
        <p style={{ color: 'var(--text-muted)' }}>เลือกระดับที่เหมาะสมกับความสามารถของคุณเพื่อเริ่มการประเมิน (ต้องผ่าน Level 1 ก่อนถึงจะปลดล็อกระดับถัดไป)</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '30px' }}>
        {levels.map(level => (
          <div key={level.id} className="glass-card" style={{ padding: '40px 30px', textAlign: 'center', display: 'flex', flexDirection: 'column', opacity: level.isLocked ? 0.6 : 1, filter: level.isLocked ? 'grayscale(0.5)' : 'none' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: level.isLocked ? '#9ca3af' : 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', margin: '0 auto 20px' }}>
              {level.isLocked ? <Lock size={28} /> : level.id}
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: 'var(--color-primary-dark)' }}>{level.title}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px', flex: 1 }}>{level.desc}</p>
            
            {level.isLocked ? (
              <div className="btn-secondary" style={{ width: '100%', cursor: 'not-allowed', background: '#e5e7eb', color: '#6b7280', border: 'none' }}>
                <Lock size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
                {level.lockMsg}
              </div>
            ) : (
              <Link to={`/level/${level.id}`} className="btn-secondary" style={{ width: '100%', textDecoration: 'none', display: 'block' }}>
                เข้าสู่บทเรียน
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
