import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/logo.jpg';
import { getExamStatus } from '../services/api';

export default function Home() {
  const [examStatus, setExamStatus] = useState(null);

  useEffect(() => {
    getExamStatus().then(setExamStatus).catch(() => {});
  }, []);

  return (
    <div className="home-shell">
      <section className="glass-card home-card">
        <img src={logoImg} alt="ตรานรารู้ไทย" className="home-logo" />
        <h1 className="home-title">ยินดีต้อนรับสู่ นรารู้ไทย</h1>
        <p className="home-subtitle">สำนักงานส่งเสริมการเรียนรู้ประจำจังหวัดนราธิวาส</p>
        {examStatus && (!examStatus.rawOpen || examStatus.mode === 'scheduled') && (
          <p
            style={{
              margin: '0 0 18px',
              padding: '10px 16px',
              borderRadius: '12px',
              fontSize: '0.88rem',
              fontWeight: 600,
              background: examStatus.rawOpen ? '#ecfdf5' : '#fef2f2',
              color: examStatus.rawOpen ? '#047857' : '#b91c1c',
              border: `1px solid ${examStatus.rawOpen ? '#a7f3d0' : '#fecaca'}`,
            }}
          >
            {examStatus.reason}
          </p>
        )}
        <Link to="/skills" className="btn-primary">เริ่มการใช้งาน</Link>
      </section>
    </div>
  );
}
