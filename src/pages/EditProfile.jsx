import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Camera, LogOut, BookOpen, Volume2, MessageCircle, PenTool, CheckCircle, XCircle, Clock } from 'lucide-react';

const SKILL_LABELS = {
  listening: { label: 'ทักษะการฟัง', icon: <Volume2 size={16} />, color: '#8b5cf6' },
  conversation: { label: 'ทักษะการพูด', icon: <MessageCircle size={16} />, color: '#3b82f6' },
  reading: { label: 'ทักษะการอ่าน', icon: <BookOpen size={16} />, color: '#10b981' },
  writing: { label: 'ทักษะการเขียน', icon: <PenTool size={16} />, color: '#f59e0b' },
};

function formatDate(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function EditProfile() {
  const { user, logout, updateUser, fetchHistory } = useUser();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: user?.age || '',
    gender: user?.gender || '',
    address: user?.address || '',
    avatar: user?.avatar || '',
  });

  const [history, setHistory] = useState([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const h = await fetchHistory();
        setHistory(h || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadHistory();
  }, []);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError('รูปภาพต้องไม่เกิน 2MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setFormData(prev => ({ ...prev, avatar: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await updateUser(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const inputStyle = {
    width: '100%', padding: '14px 16px',
    border: '1.5px solid rgba(126,34,206,0.2)', borderRadius: '12px',
    fontSize: '1rem', fontFamily: 'inherit',
    background: 'rgba(255,255,255,0.8)', outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle = { display: 'block', marginBottom: '8px', color: 'var(--color-primary-dark)', fontWeight: '600', fontSize: '0.95rem' };

  return (
    <div className="animate-fade-in" style={{ padding: '40px 16px', maxWidth: '800px', margin: '0 auto' }}>

      {/* Profile Form */}
      <div className="glass-panel" style={{ padding: '40px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--color-primary-dark)', margin: 0 }}>ข้อมูลส่วนตัว</h2>
          <button onClick={handleLogout}
            style={{ background: 'none', border: '1.5px solid #ef4444', color: '#ef4444', padding: '8px 18px', borderRadius: '20px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem' }}>
            <LogOut size={18} /> ออกจากระบบ
          </button>
        </div>

        {error && <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#dc2626', marginBottom: '20px' }}>⚠️ {error}</div>}
        {saved && <div style={{ padding: '12px 16px', background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: '10px', color: '#059669', marginBottom: '20px' }}>✅ บันทึกข้อมูลสำเร็จ!</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Avatar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(168,85,247,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '3px dashed var(--color-primary-light)', cursor: 'pointer' }}
              onClick={() => fileInputRef.current.click()}>
              {formData.avatar
                ? <img src={formData.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <><Camera size={32} color="var(--color-primary)" /><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>คลิกเพื่อเปลี่ยนรูป</span></>
              }
            </div>
            <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
            {user?.username && <p style={{ marginTop: '10px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>@{user.username}</p>}
          </div>

          <div><label style={labelStyle}>ชื่อ-นามสกุล <span style={{ color: 'red' }}>*</span></label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="ชื่อ-นามสกุล" style={inputStyle} /></div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div><label style={labelStyle}>อายุ (ปี)</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} min="1" max="120" placeholder="เช่น 25" style={inputStyle} /></div>
            <div><label style={labelStyle}>เพศ</label>
              <select name="gender" value={formData.gender} onChange={handleChange} style={inputStyle}>
                <option value="">-- เลือก --</option>
                <option value="ชาย">ชาย</option>
                <option value="หญิง">หญิง</option>
                <option value="อื่นๆ">อื่นๆ / ไม่ระบุ</option>
              </select></div>
          </div>

          <div><label style={labelStyle}>ที่อยู่ / อำเภอ / จังหวัด</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="เช่น อ.เมืองนราธิวาส จ.นราธิวาส" style={inputStyle} /></div>

          <button type="submit" className="btn-primary" style={{ padding: '16px', fontSize: '1.1rem', width: '100%', justifyContent: 'center' }}>
            บันทึกข้อมูลส่วนตัว
          </button>
        </form>
      </div>

      {/* Score History */}
      <div className="glass-panel" style={{ padding: '40px' }}>
        <h3 style={{ fontSize: '1.4rem', color: 'var(--color-primary-dark)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Clock size={22} /> ประวัติการทำแบบทดสอบ
        </h3>
        {history.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>ยังไม่มีประวัติการทำแบบทดสอบ</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {history.map((h, i) => {
              const skillInfo = SKILL_LABELS[h.skill] || { label: h.skill, color: '#6b7280', icon: null };
              const passed = h.score >= Math.ceil(h.max_score * 0.6);
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', background: 'rgba(255,255,255,0.6)', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: skillInfo.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {skillInfo.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: 'var(--color-primary-dark)', fontSize: '0.95rem' }}>
                      Level {h.level} — {skillInfo.label}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>{formatDate(h.taken_at)}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: passed ? '#10b981' : '#ef4444' }}>
                      {h.score} / {h.max_score}
                    </div>
                    <div style={{ marginTop: '2px' }}>
                      {passed ? <CheckCircle size={16} color="#10b981" /> : <XCircle size={16} color="#ef4444" />}
                    </div>
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
