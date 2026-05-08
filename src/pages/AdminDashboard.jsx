import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getAdminUsers, getAdminUserScores, deleteUser, updateUserByAdmin } from '../services/api';
import { Shield, Trash2, Eye, CheckCircle, XCircle, X, Edit2 } from 'lucide-react';

function formatDate(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminDashboard() {
  const { user, token } = useUser();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [userScores, setUserScores] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  // Edit Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', age: '', gender: '', role: 'user' });

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'admin') {
      navigate('/levels');
      return;
    }
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAdminUsers(token);
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`ยืนยันการลบผู้ใช้ "${name}"?\nคะแนนทั้งหมดของผู้ใช้นี้จะถูกลบไปด้วยและไม่สามารถกู้คืนได้`)) return;
    try {
      await deleteUser(token, id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      alert('ลบไม่สำเร็จ: ' + err.message);
    }
  };

  const openScoreModal = async (u) => {
    setSelectedUser(u);
    setUserScores([]);
    setModalLoading(true);
    try {
      const data = await getAdminUserScores(token, u.id);
      setUserScores(data.history || []);
    } catch (err) {
      alert('ดึงข้อมูลคะแนนไม่สำเร็จ: ' + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setEditForm({ name: u.name, age: u.age || '', gender: u.gender || '', role: u.role || 'user' });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await updateUserByAdmin(token, editingUser.id, editForm);
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...editForm } : u));
      setEditingUser(null);
      alert('บันทึกข้อมูลสำเร็จ');
    } catch (err) {
      alert('บันทึกไม่สำเร็จ: ' + err.message);
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="animate-fade-in" style={{ padding: '32px 16px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--color-primary-dark)', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Shield size={32} color="var(--color-primary)" />
          ระบบผู้ดูแลระบบ
        </h1>
        <Link to="/levels" className="btn-secondary" style={{ textDecoration: 'none', padding: '10px 20px' }}>
          กลับไปหน้าหลัก
        </Link>
      </div>

      {error && <div style={{ padding: '16px', background: '#fef2f2', color: '#dc2626', borderRadius: '12px', marginBottom: '24px' }}>⚠️ {error}</div>}

      <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>กำลังโหลดข้อมูล...</div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>ไม่มีผู้ใช้งานในระบบ</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ background: 'var(--color-primary)', color: 'white' }}>
                <th style={{ padding: '16px', textAlign: 'left', borderRadius: '12px 0 0 0' }}>ผู้ใช้</th>
                <th style={{ padding: '16px', textAlign: 'center' }}>Level 1</th>
                <th style={{ padding: '16px', textAlign: 'center' }}>Level 2</th>
                <th style={{ padding: '16px', textAlign: 'center' }}>Level 3</th>
                <th style={{ padding: '16px', textAlign: 'center' }}>วันที่สมัคร</th>
                <th style={{ padding: '16px', textAlign: 'center', borderRadius: '0 12px 0 0' }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', background: i % 2 === 0 ? 'white' : 'rgba(255,255,255,0.4)' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: '600', color: 'var(--color-primary-dark)' }}>{u.name} {u.role === 'admin' && <span style={{fontSize:'0.75rem', background:'#ef4444', color:'white', padding:'2px 6px', borderRadius:'10px', marginLeft:'6px'}}>Admin</span>}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>@{u.username} • {u.gender || 'ไม่ระบุ'} • {u.age ? u.age+' ปี' : ''}</div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    {u.level1_passed ? <CheckCircle color="#10b981" /> : <XCircle color="#d1d5db" />}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    {u.level2_passed ? <CheckCircle color="#10b981" /> : <XCircle color="#d1d5db" />}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    {u.level3_passed ? <CheckCircle color="#10b981" /> : <XCircle color="#d1d5db" />}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {formatDate(u.created_at)}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button onClick={() => openScoreModal(u)} style={{ background: '#f3e8ff', color: '#7e22ce', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }} title="ดูคะแนน">
                        <Eye size={20} />
                      </button>
                      <button onClick={() => openEditModal(u)} style={{ background: '#e0f2fe', color: '#0284c7', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }} title="แก้ไขข้อมูล">
                        <Edit2 size={20} />
                      </button>
                      {u.role !== 'admin' && (
                        <button onClick={() => handleDelete(u.id, u.name)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }} title="ลบผู้ใช้">
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Score Details Modal */}
      {selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="glass-panel" style={{ background: 'white', width: '100%', maxWidth: '700px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--color-primary-dark)' }}>ประวัติคะแนน: {selectedUser.name}</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>@{selectedUser.username}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={28} /></button>
            </div>
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {modalLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>กำลังโหลดประวัติคะแนน...</div>
              ) : userScores.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>ยังไม่เคยทำแบบทดสอบ</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {userScores.map((h, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: 'var(--color-primary-dark)' }}>Level {h.level} - ทักษะ: {h.skill}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ทำเมื่อ: {formatDate(h.taken_at)}</div>
                      </div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: h.score >= (h.max_score*0.6) ? '#10b981' : '#ef4444' }}>
                        {h.score} / {h.max_score}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="glass-panel" style={{ background: 'white', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--color-primary-dark)' }}>แก้ไขข้อมูลผู้ใช้</h3>
              <button onClick={() => setEditingUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={28} /></button>
            </div>
            <form onSubmit={handleSaveEdit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>ชื่อ-นามสกุล</label>
                <input type="text" required value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>อายุ</label>
                  <input type="number" value={editForm.age} onChange={e => setEditForm({...editForm, age: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>เพศ</label>
                  <select value={editForm.gender} onChange={e => setEditForm({...editForm, gender: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
                    <option value="">ไม่ระบุ</option>
                    <option value="ชาย">ชาย</option>
                    <option value="หญิง">หญิง</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>สิทธิ์ (Role)</label>
                <select value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '12px' }}>บันทึกข้อมูล</button>
                <button type="button" onClick={() => setEditingUser(null)} className="btn-secondary" style={{ flex: 1, padding: '12px' }}>ยกเลิก</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
