import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { LogIn, Eye, EyeOff, BookOpen } from 'lucide-react';

export default function LoginPage() {
  const { login } = useUser();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาด');
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>

        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '72px', height: '72px', borderRadius: '20px', background: 'linear-gradient(135deg, #a855f7, #7e22ce)', color: 'white', marginBottom: '16px', boxShadow: '0 8px 24px rgba(168,85,247,0.35)' }}>
            <BookOpen size={36} />
          </div>
          <h1 style={{ fontSize: '2rem', color: 'var(--color-primary-dark)', margin: '0 0 4px' }}>นรารู้ไทย</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>สำนักงานส่งเสริมการเรียนรู้ประจำจังหวัดนราธิวาส</p>
        </div>

        <div className="glass-panel" style={{ padding: '40px' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary-dark)', marginBottom: '28px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <LogIn size={22} /> เข้าสู่ระบบ
          </h2>

          {error && (
            <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#dc2626', marginBottom: '20px', fontSize: '0.95rem' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-primary-dark)', fontWeight: '600' }}>
                ชื่อผู้ใช้ <span style={{ color: 'red' }}>*</span>
              </label>
              <input type="text" name="username" value={form.username} onChange={handleChange}
                required autoFocus placeholder="กรอกชื่อผู้ใช้" style={inputStyle} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-primary-dark)', fontWeight: '600' }}>
                รหัสผ่าน <span style={{ color: 'red' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                  required placeholder="กรอกรหัสผ่าน" style={{ ...inputStyle, paddingRight: '48px' }} />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                  {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary"
              style={{ padding: '16px', fontSize: '1.1rem', justifyContent: 'center', width: '100%', marginTop: '8px', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-muted)' }}>
            ยังไม่มีบัญชี?{' '}
            <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none' }}>
              สมัครสมาชิกที่นี่
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
