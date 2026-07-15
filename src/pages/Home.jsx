import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="glass-card text-center animate-fade-in" style={{ padding: '80px 40px', marginTop: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
        <div style={{ width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/logo.png" alt="Narathiwat Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.15))' }} />
        </div>
      </div>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '16px', color: 'var(--color-primary-dark)' }}>
        ยินดีต้อนรับสู่ นรารู้ไทย
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '40px', color: 'var(--text-muted)' }}>
        สำนักงานส่งเสริมการเรียนรู้ประจำจังหวัดนราธิวาส
      </p>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Link to="/levels" className="btn-primary" style={{ padding: '16px 32px', fontSize: '1.2rem', textDecoration: 'none' }}>
          เริ่มการประเมิน
        </Link>
      </div>
    </div>
  );
}
