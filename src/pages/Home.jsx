import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '75vh', position: 'relative' }}>
      {/* Decorative Background Blobs */}
      <div style={{ position: 'absolute', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(126, 34, 206, 0.25) 0%, rgba(126, 34, 206, 0) 70%)', top: '-10%', left: '0%', zIndex: 0, filter: 'blur(50px)', animation: 'preloader-pulse 4s infinite alternate' }}></div>
      <div style={{ position: 'absolute', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(212, 175, 55, 0.25) 0%, rgba(212, 175, 55, 0) 70%)', bottom: '-5%', right: '5%', zIndex: 0, filter: 'blur(50px)', animation: 'preloader-pulse 5s infinite alternate-reverse' }}></div>

      <div className="glass-card text-center animate-fade-in" style={{ padding: '80px 60px', zIndex: 1, maxWidth: '760px', width: '100%', margin: '0 20px' }}>
        <div className="animate-fade-in delay-100" style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
          <div style={{ width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {/* Spinning Aura around the logo */}
            <div style={{ position: 'absolute', inset: -15, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-secondary))', opacity: 0.35, filter: 'blur(15px)', animation: 'preloader-spin 8s linear infinite' }}></div>
            <img src="/logo.jpg" alt="Narathiwat Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', filter: 'drop-shadow(0px 8px 24px rgba(76, 29, 149, 0.3))', position: 'relative', zIndex: 2 }} />
          </div>
        </div>
        <h1 className="animate-fade-in delay-200" style={{ fontSize: '3rem', marginBottom: '16px', color: 'var(--color-primary-dark)', letterSpacing: '-0.5px' }}>
          ยินดีต้อนรับสู่ นรารู้ไทย
        </h1>
        <p className="animate-fade-in delay-300" style={{ fontSize: '1.25rem', marginBottom: '48px', color: 'var(--text-muted)' }}>
          สำนักงานส่งเสริมการเรียนรู้ประจำจังหวัดนราธิวาส
        </p>

        <div className="animate-fade-in delay-300" style={{ display: 'flex', justifyContent: 'center' }}>
          <Link to="/skills" className="btn-primary" style={{ padding: '16px 40px', fontSize: '1.25rem', textDecoration: 'none' }}>
            เริ่มการประเมิน
          </Link>
        </div>
      </div>
    </div>
  );
}
