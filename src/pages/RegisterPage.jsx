import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Camera, UserPlus, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useUser();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    username: '', password: '', confirmPassword: '',
    name: '', age: '', gender: '', address: '', avatar: ''
  });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError('ขนาดรูปภาพต้องไม่เกิน 2MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setForm(prev => ({ ...prev, avatar: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('รหัสผ่านทั้งสองช่องไม่ตรงกัน');
      return;
    }
    setLoading(true);
    try {
      await register({
        username: form.username, password: form.password,
        name: form.name, age: form.age, gender: form.gender,
        address: form.address, avatar: form.avatar
      });
      navigate('/levels');
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
  const labelStyle = { display: 'block', marginBottom: '8px', color: 'var(--color-primary-dark)', fontWeight: '600', fontSize: '0.95rem' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 16px' }}>
      <div style={{ width: '100%', maxWidth: '500px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--color-primary-dark)', margin: '0 0 4px' }}>สร้างบัญชีใหม่</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>กรอกข้อมูลเพื่อเริ่มใช้งานระบบประเมินภาษาไทย</p>
        </div>

        <div className="glass-panel" style={{ padding: '40px' }}>
          {error && (
            <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#dc2626', marginBottom: '20px' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Avatar */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(168,85,247,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '3px dashed var(--color-primary-light)', cursor: 'pointer' }}
                onClick={() => fileInputRef.current.click()}
              >
                {form.avatar
                  ? <img src={form.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <><Camera size={28} color="var(--color-primary)" /><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>อัพรูปโปรไฟล์</span></>
                }
              </div>
              <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>คลิกเพื่อเลือกรูปภาพ (ไม่เกิน 2MB)</p>
            </div>

            {/* Username */}
            <div>
              <label style={labelStyle}>ชื่อผู้ใช้ (Username) <span style={{ color: 'red' }}>*</span></label>
              <input type="text" name="username" value={form.username} onChange={handleChange}
                required placeholder="ตัวอย่าง: somchai01" style={inputStyle} />
            </div>

            {/* Password */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>รหัสผ่าน <span style={{ color: 'red' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <input type={showPw ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                    required placeholder="อย่างน้อย 4 ตัว" style={{ ...inputStyle, paddingRight: '44px' }} />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={labelStyle}>ยืนยันรหัสผ่าน <span style={{ color: 'red' }}>*</span></label>
                <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                  required placeholder="พิมพ์อีกครั้ง" style={inputStyle} />
              </div>
            </div>

            {/* Name */}
            <div>
              <label style={labelStyle}>ชื่อ-นามสกุล <span style={{ color: 'red' }}>*</span></label>
              <input type="text" name="name" value={form.name} onChange={handleChange}
                required placeholder="เช่น สมชาย ใจดี" style={inputStyle} />
            </div>

            {/* Age + Gender */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>อายุ (ปี)</label>
                <input type="number" name="age" value={form.age} onChange={handleChange}
                  min="1" max="120" placeholder="เช่น 25" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>เพศ</label>
                <select name="gender" value={form.gender} onChange={handleChange} style={inputStyle}>
                  <option value="">-- เลือก --</option>
                  <option value="ชาย">ชาย</option>
                  <option value="หญิง">หญิง</option>
                  <option value="อื่นๆ">อื่นๆ / ไม่ระบุ</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div>
              <label style={labelStyle}>ที่อยู่ / อำเภอ / จังหวัด</label>
              <input type="text" name="address" value={form.address} onChange={handleChange}
                placeholder="เช่น อ.เมืองนราธิวาส จ.นราธิวาส" style={inputStyle} />
            </div>

            <button type="submit" disabled={loading} className="btn-primary"
              style={{ padding: '16px', fontSize: '1.1rem', justifyContent: 'center', width: '100%', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}>
              <UserPlus size={20} /> {loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-muted)' }}>
            มีบัญชีอยู่แล้ว?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none' }}>
              เข้าสู่ระบบที่นี่
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
