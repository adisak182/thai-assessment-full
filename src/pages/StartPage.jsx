import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { PlayCircle } from 'lucide-react';
import logoImg from '../assets/logo.jpg';
import { NAME_PREFIXES, combineNameWithPrefix } from '../utils/namePrefix';

export default function StartPage() {
  const { startSession } = useUser();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    prefix: '', name: '', age: '', status: '', education_level: '', employment_status: '', is_literacy_learner: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!form.prefix) {
      setError('กรุณาเลือกคำนำหน้า');
      return;
    }

    if (!form.name.trim()) {
      setError('กรุณากรอกชื่อ-สกุล');
      return;
    }

    const fullName = combineNameWithPrefix(form.prefix, form.name);

    setLoading(true);
    try {
      await startSession({
        name: fullName, 
        age: form.age, 
        status: form.status,
        education_level: form.education_level,
        employment_status: form.employment_status,
        is_literacy_learner: form.is_literacy_learner
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
    <div className="auth-shell">
      <div className="auth-content">
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div className="animate-float" style={{ display: 'inline-flex', padding: '6px', background: 'rgba(255,255,255,0.8)', borderRadius: '50%', marginBottom: '16px', boxShadow: '0 8px 24px rgba(76, 29, 149, 0.15)' }}>
            <img src={logoImg} alt="Logo" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
          </div>
          <h1 className="text-shimmer" style={{ fontSize: '2rem', color: 'var(--color-primary-dark)', margin: '0 0 8px' }}>ยินดีต้อนรับ</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>กรุณากรอกข้อมูลเพื่อเริ่มต้นทำแบบทดสอบ</p>
        </div>

        <div className="glass-card auth-card">
          {error && (
            <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#dc2626', marginBottom: '20px' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Prefix & Name */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ flex: '0 1 155px', minWidth: '130px' }}>
                <label htmlFor="start-prefix" style={labelStyle}>คำนำหน้า <span style={{ color: 'red' }}>*</span></label>
                <select id="start-prefix" name="prefix" value={form.prefix} onChange={handleChange} required style={inputStyle}>
                  <option value="">-- คำนำหน้า --</option>
                  {NAME_PREFIXES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                <label htmlFor="start-name" style={labelStyle}>ชื่อ-สกุล <span style={{ color: 'red' }}>*</span></label>
                <input type="text" id="start-name" name="name" value={form.name} onChange={handleChange}
                  required placeholder="เช่น สมชาย ใจดี" style={inputStyle} />
              </div>
            </div>

            {/* Age */}
            <div>
              <label htmlFor="start-age" style={labelStyle}>อายุ (ปี)</label>
              <input type="number" id="start-age" name="age" value={form.age} onChange={handleChange}
                min="1" max="120" placeholder="เช่น 25" style={inputStyle} />
            </div>

            <label className="literacy-checkbox" htmlFor="start-is-literacy-learner">
              <input type="checkbox" id="start-is-literacy-learner" name="is_literacy_learner"
                checked={form.is_literacy_learner}
                onChange={e => setForm(prev => ({ ...prev, is_literacy_learner: e.target.checked }))}
                aria-describedby="literacy-learner-help" />
              <span>
                <strong>ผู้เรียนกิจกรรมส่งเสริมการรู้หนังสือ</strong>
                <small id="literacy-learner-help">ไม่ติ๊กหมายถึงไม่ใช่ผู้เรียนกิจกรรมนี้</small>
              </span>
            </label>

            {/* Status */}
            <div>
              <label htmlFor="start-status" style={labelStyle}>สถานะ</label>
              <select id="start-status" name="status" value={form.status} onChange={handleChange} style={inputStyle} required>
                <option value="">-- เลือกสถานะ --</option>
                <option value="กำลังศึกษา">กำลังศึกษา</option>
                <option value="ไม่ได้ศึกษา">ไม่ได้ศึกษา</option>
              </select>
            </div>
            


            {form.status === 'กำลังศึกษา' && (
              <div>
                <label htmlFor="start-education_level" style={labelStyle}>ระดับการศึกษา</label>
                <select id="start-education_level" name="education_level" value={form.education_level} onChange={handleChange} style={inputStyle} required>
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
                <label htmlFor="start-employment_status" style={labelStyle}>สถานะการทำงาน</label>
                <select id="start-employment_status" name="employment_status" value={form.employment_status} onChange={handleChange} style={inputStyle} required>
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
      
      {/* Admin Login Link */}
      <div className="auth-footer">
        <a href="/login" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none' }}>
          🔒 สำหรับเจ้าหน้าที่
        </a>
      </div>
      </div>
    </div>
  );
}
