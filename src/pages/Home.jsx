import { Link } from 'react-router-dom';
import logoImg from '../assets/logo.jpg';

export default function Home() {
  return (
    <div className="home-shell">
      <section className="glass-card home-card">
        <img src={logoImg} alt="ตรานรารู้ไทย" className="home-logo" />
        <h1 className="home-title">ยินดีต้อนรับสู่ นรารู้ไทย</h1>
        <p className="home-subtitle">สำนักงานส่งเสริมการเรียนรู้ประจำจังหวัดนราธิวาส</p>
        <Link to="/skills" className="btn-primary">เริ่มการใช้งาน</Link>
      </section>
    </div>
  );
}
