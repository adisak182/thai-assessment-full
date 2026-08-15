import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { PlayCircle } from 'lucide-react';

export default function StartPage() {
  const { startSession } = useUser();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', age: '', status: '', education_level: '', employment_status: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!form.name.trim()) {
      setError('กรุณากรอกชื่อ-สกุล');
      return;
    }

    setLoading(true);
    try {
      await startSession({
        name: form.name, 
        age: form.age, 
        status: form.status,
        education_level: form.education_level,
        employment_status: form.employment_status
      });
      navigate('/skills');
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเริ่มต้นใช้งาน');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '14px 16px',
    border: '1.5px solid rgba(126,34,206,0.2)', borderRadius: '12px',
    fontSize: '1rem', fontFamily: 'inherit',
    background: 'rgba(255,255,255,0.8)', outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle = { display: 'block', marginBottom: '8px', color: 'var(--color-primary-dark)', fontWeight: '600', fontSize: '0.95rem' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 16px' }}>
      <div style={{ width: '100%', maxWidth: '500px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div className="animate-float" style={{ display: 'inline-flex', padding: '16px', background: 'rgba(91, 33, 182, 0.08)', borderRadius: '50%', marginBottom: '16px' }}>
            <User size={48} color="var(--color-primary)" />
          </div>
          <h1 className="text-shimmer" style={{ fontSize: '2rem', color: 'var(--color-primary-dark)', margin: '0 0 8px' }}>ยินดีต้อนรับ</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>กรุณากรอกข้อมูลเพื่อเริ่มต้นทำแบบทดสอบ</p>
        </div>

        <div className="glass-card animate-slide-up" style={{ padding: '40px' }}>
          {error && (
            <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#dc2626', marginBottom: '20px' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Name */}
            <div>
              <label style={labelStyle}>ชื่อ-สกุล <span style={{ color: 'red' }}>*</span></label>
              <input type="text" name="name" value={form.name} onChange={handleChange}
                required placeholder="เช่น สมชาย ใจดี" style={inputStyle} autoFocus />
            </div>

            {/* Age */}
            <div>
              <label style={labelStyle}>อายุ (ปี)</label>
              <input type="number" name="age" value={form.age} onChange={handleChange}
                min="1" max="120" placeholder="เช่น 25" style={inputStyle} />
            </div>

            {/* Status */}
            <div>
              <label style={labelStyle}>สถานะ</label>
              <select name="status" value={form.status} onChange={handleChange} style={inputStyle} required>
                <option value="">-- เลือกสถานะ --</option>
                <option value="กำลังศึกษา">กำลังศึกษา</option>
                <option value="ไม่ได้ศึกษา">ไม่ได้ศึกษา</option>
              </select>
            </div>
            
            {form.status === 'กำลังศึกษา' && (
              <div>
                <label style={labelStyle}>ระดับการศึกษา</label>
                <select name="education_level" value={form.education_level} onChange={handleChange} style={inputStyle} required>
                  <option value="">-- เลือกระดับการศึกษา --</option>
                  <option value="ระดับประถมศึกษา">ระดับประถมศึกษา</option>
                  <option value="ระดับมัธยมศึกษาตอนต้น">ระดับมัธยมศึกษาตอนต้น</option>
                  <option value="ระดับมัธยมศึกษาตอนปลาย">ระดับมัธยมศึกษาตอนปลาย</option>
                  <option value="ปวช./ปวส.">ปวช./ปวส.</option>
                  <option value="ระดับปริญญาตรี">ระดับปริญญาตรี</option>
                  <option value="สูงกว่าระดับปริญญาตรี">สูงกว่าระดับปริญญาตรี</option>
                </select>
              </div>
            )}

            {form.status === 'ไม่ได้ศึกษา' && (
              <div>
                <label style={labelStyle}>สถานะการทำงาน</label>
                <select name="employment_status" value={form.employment_status} onChange={handleChange} style={inputStyle} required>
                  <option value="">-- เลือกสถานะการทำงาน --</option>
                  <option value="ว่างงาน">ว่างงาน</option>
                  <option value="มีงานทำ">มีงานทำ</option>
                </select>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary"
              style={{ padding: '16px', fontSize: '1.1rem', justifyContent: 'center', width: '100%', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}>
              <PlayCircle size={24} /> {loading ? 'กำลังเข้าสู่ระบบ...' : 'เริ่มต้นใช้งาน'}
            </button>
          </form>
        </div>
      </div>
      
      {/* Admin Login Link */}
      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <a href="/login" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none' }}>
          🔒 สำหรับเจ้าหน้าที่
        </a>
      </div>
    </div>
  );
}
