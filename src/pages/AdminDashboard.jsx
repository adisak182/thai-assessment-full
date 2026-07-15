import { useState, useEffect, useMemo, Fragment } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getAdminUsers, getAdminUserScores, deleteUser, updateUserByAdmin, getAdminSurveys } from '../services/api';
import { Shield, Trash2, Eye, CheckCircle, XCircle, X, Edit2, Users, Award, Search, Filter, Calendar, RefreshCw, ClipboardList, ChevronDown, ChevronUp, BarChart2, List } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

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
  const [editForm, setEditForm] = useState({ name: '', age: '', address: '', role: 'user' });

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Surveys Modal State
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [surveys, setSurveys] = useState([]);
  const [surveysLoading, setSurveysLoading] = useState(false);
  const [surveyTab, setSurveyTab] = useState('overview'); // 'overview' | 'list'
  const [expandedSurveyId, setExpandedSurveyId] = useState(null);

  const surveySummaryData = useMemo(() => {
    if (!surveys || surveys.length === 0) return [];
    const fields = [
      { key: 'design_1', label: '1.1 เมนูใช้งานง่าย' },
      { key: 'design_2', label: '1.2 ทันสมัย' },
      { key: 'design_3', label: '1.3 ตัวอักษรเหมาะสม' },
      { key: 'design_4', label: '1.4 ภาพประกอบชัดเจน' },
      { key: 'content_1', label: '2.1 ถูกต้องตามหลักภาษา' },
      { key: 'content_2', label: '2.2 เนื้อหาเหมาะสม' },
      { key: 'content_3', label: '2.3 ลำดับง่ายไปยาก' },
      { key: 'content_4', label: '2.4 น่าสนใจ' },
      { key: 'benefit_1', label: '3.1 ส่งเสริมความรู้' },
      { key: 'benefit_2', label: '3.2 พัฒนาทักษะภาษา' },
      { key: 'benefit_3', label: '3.3 ประยุกต์ใช้ได้' },
      { key: 'benefit_4', label: '3.4 เห็นคุณค่าภาษาไทย' },
    ];
    return fields.map(f => {
      const sum = surveys.reduce((acc, s) => acc + (Number(s[f.key]) || 0), 0);
      return {
        name: f.label,
        avg: parseFloat((sum / surveys.length).toFixed(2))
      };
    });
  }, [surveys]);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'admin') {
      navigate('/levels');
      return;
    }
    fetchUsers();
  }, [user]);

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filterStatus === 'all') return true;
    if (filterStatus === 'passed') return u.full_test_passed;
    if (filterStatus === 'notPassed') return !u.full_test_passed;
    return true;
  });

  const stats = {
    total: users.length,
    passed: users.filter(u => u.full_test_passed).length,
    notPassed: users.filter(u => !u.full_test_passed && u.full_test_score > 0).length,
    notTested: users.filter(u => !u.full_test_score).length,
  };


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

  const openSurveys = async () => {
    setShowSurveyModal(true);
    setSurveysLoading(true);
    try {
      const data = await getAdminSurveys(token);
      setSurveys(data);
    } catch (err) {
      alert('ดึงข้อมูลแบบสอบถามไม่สำเร็จ: ' + err.message);
    } finally {
      setSurveysLoading(false);
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
    setEditForm({ name: u.name, age: u.age || '', address: u.address || '', role: u.role || 'user' });
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
    <div className="animate-fade-in" style={{ padding: '24px 16px', maxWidth: '1400px', margin: '0 auto', minHeight: '100vh' }}>
      <style>{`
        .admin-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 32px; }
        .stat-card { background: white; padding: 24px; borderRadius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.05); display: flex; align-items: center; gap: 20px; transition: transform 0.2s; }
        .stat-card:hover { transform: translateY(-5px); }
        .search-container { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; align-items: center; }
        .search-input { flex: 1; min-width: 280px; position: relative; }
        .search-input input { width: 100%; padding: 12px 16px 12px 48px; borderRadius: 12px; border: 1.5px solid rgba(0,0,0,0.1); outline: none; font-size: 1rem; transition: all 0.2s; }
        .search-input input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.1); }
        .filter-select { padding: 12px 16px; borderRadius: 12px; border: 1.5px solid rgba(0,0,0,0.1); outline: none; font-size: 1rem; background: white; cursor: pointer; min-width: 180px; }
        
        .desktop-table { width: 100%; border-collapse: separate; border-spacing: 0; }
        .desktop-table th { padding: 16px; background: #f8fafc; color: #64748b; font-weight: 600; text-align: left; border-bottom: 2px solid #f1f5f9; }
        .desktop-table td { padding: 16px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        
        .mobile-cards { display: none; flex-direction: column; gap: 16px; }
        .user-card { background: white; padding: 20px; borderRadius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.05); }

        @media (max-width: 992px) {
          .desktop-view { display: none; }
          .mobile-cards { display: flex; }
        }

        @keyframes animate-scale-in {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in { animation: animate-scale-in 0.3s ease-out forwards; }
        
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>


      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--color-primary-dark)', margin: 0, display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(168, 85, 247, 0.3)' }}>
              <Shield size={32} />
            </div>
            Admin Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '8px 0 0 72px', fontSize: '1.1rem' }}>จัดการผู้ใช้งานและติดตามความคืบหน้า</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={openSurveys} className="btn-primary" style={{ padding: '12px 24px', borderRadius: '30px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClipboardList size={20} /> ดูผลแบบสอบถาม
          </button>
          <Link to="/levels" className="btn-secondary" style={{ textDecoration: 'none', padding: '12px 24px', borderRadius: '30px', fontWeight: '600' }}>
            กลับไปหน้าหลัก
          </Link>
        </div>
      </div>

      {/* Statistics Header */}
      <div className="admin-grid">
        <div className="stat-card">
          <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>ผู้ใช้งานทั้งหมด</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b' }}>{stats.total}</div>
          </div>
        </div>
        {[
          { label: 'สอบผ่าน', count: stats.passed, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
          { label: 'ยังไม่ผ่าน', count: stats.notPassed, color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.1)' },
          { label: 'ยังไม่ได้สอบ', count: stats.notTested, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
        ].map((s, idx) => (
          <div key={idx} className="stat-card">
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={28} />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>{s.label}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b' }}>
                {s.count} <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#94a3b8' }}>({stats.total > 0 ? Math.round(s.count/stats.total*100) : 0}%)</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && <div style={{ padding: '16px 24px', background: '#fee2e2', color: '#dc2626', borderRadius: '16px', marginBottom: '32px', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '12px' }}><XCircle size={24} /> {error}</div>}

      {/* Search and Filters */}
      <div className="search-container">
        <div className="search-input">
          <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อผู้ใช้ หรือ Username..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Filter size={20} color="#64748b" />
          <select 
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">ทั้งหมด</option>
            <option value="passed">สอบผ่าน {">="} 60</option>
            <option value="notPassed">ยังไม่ผ่าน / ยังไม่ได้สอบ</option>
          </select>
        </div>
        <div style={{ marginLeft: 'auto', color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>
          พบ {filteredUsers.length} รายการ
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <RefreshCw size={48} className="spin" color="var(--color-primary)" style={{ marginBottom: '16px' }} />
          <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>กำลังดึงข้อมูลผู้ใช้งาน...</div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="glass-panel" style={{ padding: '80px 0', textAlign: 'center' }}>
          <Users size={64} color="#d1d5db" style={{ marginBottom: '20px' }} />
          <h3 style={{ fontSize: '1.4rem', color: '#64748b', margin: 0 }}>ไม่พบผู้ใช้งานที่ตรงตามเงื่อนไข</h3>
          <button onClick={() => {setSearchTerm(''); setFilterStatus('all');}} style={{ marginTop: '16px', background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}>ล้างตัวกรองทั้งหมด</button>
        </div>
      ) : (
        <>
          {/* Desktop View */}
          <div className="glass-panel desktop-view" style={{ padding: '0', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)' }}>
            <table className="desktop-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: '24px' }}>รายชื่อผู้ใช้งาน</th>
                  <th style={{ textAlign: 'center' }}>ความคืบหน้า</th>
                  <th style={{ textAlign: 'center' }}>วันที่เข้าร่วม</th>
                  <th style={{ textAlign: 'center', paddingRight: '24px' }}>การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td style={{ paddingLeft: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontWeight: 'bold', fontSize: '1.1rem' }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {u.name} 
                            {u.role === 'admin' && <span style={{ fontSize: '0.7rem', background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Admin</span>}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{u.address || 'ไม่ระบุที่อยู่'} • {u.age ? u.age+' ปี' : 'ไม่ระบุอายุ'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <div style={{ padding: '6px 12px', borderRadius: '8px', background: u.full_test_passed ? '#10b981' : (u.full_test_score > 0 ? '#f43f5e' : '#f1f5f9'), color: (u.full_test_score > 0) ? 'white' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                            {u.full_test_passed ? <><CheckCircle size={16} /> ผ่านแล้ว</> : (u.full_test_score > 0 ? <><XCircle size={16} /> ไม่ผ่าน</> : 'ยังไม่ได้สอบ')}
                          </div>
                          {u.full_test_score > 0 && <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold' }}>{u.full_test_score} / 100 คะแนน</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <Calendar size={14} /> {formatDate(u.created_at)}
                      </div>
                    </td>
                    <td style={{ paddingRight: '24px' }}>
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button onClick={() => openScoreModal(u)} style={{ background: '#f5f3ff', color: '#7c3aed', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }} title="ดูคะแนน">
                          <Eye size={20} />
                        </button>
                        <button onClick={() => openEditModal(u)} style={{ background: '#f0f9ff', color: '#0ea5e9', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }} title="แก้ไขข้อมูล">
                          <Edit2 size={20} />
                        </button>
                        {u.role !== 'admin' && (
                          <button onClick={() => handleDelete(u.id, u.name)} style={{ background: '#fef2f2', color: '#ef4444', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }} title="ลบผู้ใช้">
                            <Trash2 size={20} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="mobile-cards">
            {filteredUsers.map((u) => (
              <div key={u.id} className="user-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '1.1rem' }}>{u.name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>@{u.username} • {u.role}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => openScoreModal(u)} style={{ background: '#f5f3ff', color: '#7c3aed', border: 'none', padding: '8px', borderRadius: '10px' }}><Eye size={18} /></button>
                    <button onClick={() => openEditModal(u)} style={{ background: '#f0f9ff', color: '#0ea5e9', border: 'none', padding: '8px', borderRadius: '10px' }}><Edit2 size={18} /></button>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '12px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    <strong>ที่อยู่:</strong> {u.address || '-'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    <strong>อายุ:</strong> {u.age || '-'} ปี
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', gridColumn: 'span 2' }}>
                    <strong>วันที่สมัคร:</strong> {formatDate(u.created_at)}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>สถานะ:</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ padding: '4px 10px', borderRadius: '6px', background: u.full_test_passed ? '#10b981' : (u.full_test_score > 0 ? '#f43f5e' : '#e2e8f0'), color: (u.full_test_score > 0) ? 'white' : '#94a3b8', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      {u.full_test_passed ? `ผ่าน (${u.full_test_score}/100)` : (u.full_test_score > 0 ? `ไม่ผ่าน (${u.full_test_score}/100)` : 'ยังไม่ได้สอบ')}
                    </div>
                  </div>
                  {u.role !== 'admin' && (
                    <button onClick={() => handleDelete(u.id, u.name)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444', padding: '4px' }}><Trash2 size={18} /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}


      {/* Score Details Modal */}
      {selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="glass-panel animate-scale-in" style={{ background: 'white', width: '100%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>ประวัติการทำแบบทดสอบ</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)' }}></div>
                  <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: '600' }}>{selectedUser.name} (@{selectedUser.username})</span>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', padding: '8px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={24} /></button>
            </div>
            <div style={{ padding: '32px', overflowY: 'auto', flex: 1, background: 'white' }}>
              {modalLoading ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <RefreshCw size={40} className="spin" color="var(--color-primary)" style={{ marginBottom: '16px' }} />
                  <div style={{ color: '#64748b' }}>กำลังโหลดข้อมูลประวัติ...</div>
                </div>
              ) : userScores.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', background: '#f8fafc', borderRadius: '20px', border: '2px dashed #e2e8f0' }}>
                  <Award size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                  <div style={{ color: '#64748b', fontSize: '1.1rem' }}>ยังไม่พบประวัติการทำแบบทดสอบในระบบ</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                  {userScores.map((h, i) => {
                    const pct = Math.round((h.score / h.max_score) * 100);
                    const passed = pct >= 70;
                    let evaluationLevel = '';
                    let evaluationColor = '';
                    if (pct >= 80) { evaluationLevel = 'ดีมาก'; evaluationColor = '#059669'; }
                    else if (pct >= 60) { evaluationLevel = 'ดี'; evaluationColor = '#2563eb'; }
                    else if (pct >= 50) { evaluationLevel = 'พอใช้'; evaluationColor = '#d97706'; }
                    else { evaluationLevel = 'ปรับปรุง'; evaluationColor = '#dc2626'; }

                    return (
                      <div key={i} style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: h.level === 1 ? '#10b981' : h.level === 2 ? '#3b82f6' : '#f59e0b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                              L{h.level}
                            </div>
                            <div>
                              <div style={{ fontWeight: '700', color: '#334155' }}>ทักษะ{h.skill === 'full_test' ? 'รวม (100 ข้อ)' : h.skill}</div>
                              <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                <Calendar size={12} /> {formatDate(h.taken_at)}
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: passed ? '#10b981' : '#f43f5e' }}>
                              {h.score} <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: '500' }}>/ {h.max_score}</span>
                            </div>
                            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: evaluationColor, marginTop: '2px' }}>
                              {evaluationLevel} <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>({pct}%)</span>
                            </div>
                          </div>
                        </div>
                        
                        {h.breakdown && Object.keys(h.breakdown).length > 0 && (
                          <div style={{ marginTop: '4px', padding: '12px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>คะแนนรายทักษะ</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                              {Object.entries(h.breakdown).map(([key, b], idx) => {
                                let skillPassed = false;
                                if (key === 'listening' && b.score >= 18) skillPassed = true;
                                if (key === 'speaking' && b.score >= 11) skillPassed = true;
                                if (key === 'reading' && b.score >= 21) skillPassed = true;
                                if (key === 'writing' && b.score >= 21) skillPassed = true;

                                return (
                                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', background: '#f8fafc', padding: '6px 8px', borderRadius: '6px' }}>
                                    <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      {b.label}
                                      <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '10px', background: skillPassed ? '#d1fae5' : '#fee2e2', color: skillPassed ? '#059669' : '#dc2626' }}>
                                        {skillPassed ? 'ผ่าน' : 'ไม่ผ่าน'}
                                      </span>
                                    </span>
                                    <span style={{ fontWeight: '600', color: 'var(--color-primary)' }}>{b.score}/{b.max}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div style={{ padding: '24px 32px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedUser(null)} className="btn-primary" style={{ padding: '12px 32px', borderRadius: '12px' }}>ปิดหน้าต่าง</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="glass-panel animate-scale-in" style={{ background: 'white', width: '100%', maxWidth: '500px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>แก้ไขข้อมูลสมาชิก</h3>
              <button onClick={() => setEditingUser(null)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', padding: '8px', borderRadius: '12px' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveEdit} style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="input-group">
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#475569', fontSize: '0.95rem' }}>ชื่อ-นามสกุล</label>
                <input 
                  type="text" 
                  required 
                  value={editForm.name} 
                  onChange={e => setEditForm({...editForm, name: e.target.value})} 
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '1rem' }} 
                />
              </div>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#475569', fontSize: '0.95rem' }}>อายุ</label>
                  <input 
                    type="number" 
                    value={editForm.age} 
                    onChange={e => setEditForm({...editForm, age: e.target.value})} 
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0', outline: 'none' }} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#475569', fontSize: '0.95rem' }}>ที่อยู่</label>
                  <input 
                    type="text"
                    value={editForm.address} 
                    onChange={e => setEditForm({...editForm, address: e.target.value})} 
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0', outline: 'none', background: 'white' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#475569', fontSize: '0.95rem' }}>สิทธิ์การใช้งาน (Role)</label>
                <select 
                  value={editForm.role} 
                  onChange={e => setEditForm({...editForm, role: e.target.value})} 
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0', outline: 'none', background: 'white' }}
                >
                  <option value="user">ผู้ใช้งานทั่วไป (User)</option>
                  <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                <button type="button" onClick={() => setEditingUser(null)} className="btn-secondary" style={{ flex: 1, padding: '14px', borderRadius: '12px', fontWeight: '700' }}>ยกเลิก</button>
                <button type="submit" className="btn-primary" style={{ flex: 2, padding: '14px', borderRadius: '12px', fontWeight: '700', boxShadow: '0 8px 16px rgba(168, 85, 247, 0.2)' }}>บันทึกการเปลี่ยนแปลง</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Surveys Modal */}
      {showSurveyModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="glass-panel animate-scale-in" style={{ background: 'white', width: '100%', maxWidth: '1000px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ClipboardList size={28} color="var(--color-primary)" />
                  ผลแบบสอบถาม ({surveys.length} รายการ)
                </h3>
              </div>
              <button onClick={() => setShowSurveyModal(false)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', padding: '8px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={24} /></button>
            </div>
            
            <div style={{ padding: '0 32px', display: 'flex', gap: '16px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <button onClick={() => setSurveyTab('overview')} style={{ padding: '16px 24px', background: 'transparent', border: 'none', borderBottom: surveyTab === 'overview' ? '3px solid var(--color-primary)' : '3px solid transparent', color: surveyTab === 'overview' ? 'var(--color-primary)' : '#64748b', fontWeight: surveyTab === 'overview' ? '700' : '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', transition: 'all 0.2s' }}>
                <BarChart2 size={20} /> ภาพรวมคะแนน
              </button>
              <button onClick={() => setSurveyTab('list')} style={{ padding: '16px 24px', background: 'transparent', border: 'none', borderBottom: surveyTab === 'list' ? '3px solid var(--color-primary)' : '3px solid transparent', color: surveyTab === 'list' ? 'var(--color-primary)' : '#64748b', fontWeight: surveyTab === 'list' ? '700' : '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', transition: 'all 0.2s' }}>
                <List size={20} /> รายชื่อผู้ตอบแบบสอบถาม
              </button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, background: 'white' }}>
              {surveysLoading ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <RefreshCw size={40} className="spin" color="var(--color-primary)" style={{ marginBottom: '16px' }} />
                  <div style={{ color: '#64748b' }}>กำลังโหลดข้อมูล...</div>
                </div>
              ) : surveys.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', background: '#f8fafc', borderRadius: '20px', border: '2px dashed #e2e8f0' }}>
                  <ClipboardList size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                  <div style={{ color: '#64748b', fontSize: '1.1rem' }}>ยังไม่มีข้อมูลแบบสอบถาม</div>
                </div>
              ) : (
                <>
                  {surveyTab === 'overview' && (
                    <div className="animate-fade-in">
                      <div style={{ marginBottom: '24px', background: 'linear-gradient(135deg, rgba(59,130,246,0.05), rgba(139,92,246,0.05))', padding: '20px', borderRadius: '16px', border: '1px solid rgba(59,130,246,0.1)' }}>
                        <h4 style={{ color: '#1e293b', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem' }}>
                          คะแนนความพึงพอใจเฉลี่ย (เต็ม 4)
                        </h4>
                        <p style={{ margin: 0, color: '#64748b' }}>กราฟแสดงค่าเฉลี่ยของคะแนนประเมินในแต่ละด้านจากผู้ทำแบบสอบถามทั้งหมด</p>
                      </div>
                      
                      <div style={{ height: '550px', width: '100%', paddingRight: '20px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={surveySummaryData} layout="vertical" margin={{ top: 5, right: 30, left: 160, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                            <XAxis type="number" domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} stroke="#64748b" />
                            <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 13, fill: '#475569' }} />
                            <RechartsTooltip 
                              cursor={{fill: 'rgba(59,130,246,0.05)'}} 
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                              formatter={(value) => [`${value} คะแนน`, 'ค่าเฉลี่ย']}
                            />
                            <Bar dataKey="avg" radius={[0, 6, 6, 0]} animationDuration={1000}>
                              {surveySummaryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.avg >= 3.5 ? '#10b981' : entry.avg >= 2.5 ? '#3b82f6' : '#f59e0b'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {surveyTab === 'list' && (
                    <div className="animate-fade-in" style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <th style={{ padding: '16px', width: '50px' }}></th>
                            <th style={{ padding: '16px', textAlign: 'left', color: '#475569', fontWeight: '600' }}>วันที่</th>
                            <th style={{ padding: '16px', textAlign: 'left', color: '#475569', fontWeight: '600' }}>เพศ/อายุ</th>
                            <th style={{ padding: '16px', textAlign: 'left', color: '#475569', fontWeight: '600' }}>กลุ่มเป้าหมาย</th>
                            <th style={{ padding: '16px', textAlign: 'left', color: '#475569', fontWeight: '600' }}>จังหวัด</th>
                            <th style={{ padding: '16px', textAlign: 'center', color: '#475569', fontWeight: '600' }}>คะแนนเฉลี่ย</th>
                          </tr>
                        </thead>
                        <tbody>
                          {surveys.map((s, i) => {
                            const isExpanded = expandedSurveyId === (s.id || i);
                            const currentId = s.id || i;
                            
                            const totalScore = (
                              Number(s.design_1||0) + Number(s.design_2||0) + Number(s.design_3||0) + Number(s.design_4||0) +
                              Number(s.content_1||0) + Number(s.content_2||0) + Number(s.content_3||0) + Number(s.content_4||0) +
                              Number(s.benefit_1||0) + Number(s.benefit_2||0) + Number(s.benefit_3||0) + Number(s.benefit_4||0)
                            );
                            const avgScore = (totalScore / 12).toFixed(2);

                            return (
                              <Fragment key={currentId}>
                                <tr style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', background: isExpanded ? 'rgba(59,130,246,0.03)' : 'white', transition: 'background 0.2s' }} onClick={() => setExpandedSurveyId(isExpanded ? null : currentId)}>
                                  <td style={{ padding: '16px', textAlign: 'center', color: isExpanded ? 'var(--color-primary)' : '#94a3b8' }}>
                                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                  </td>
                                  <td style={{ padding: '16px', color: '#334155', fontSize: '0.9rem' }}>{formatDate(s.submitted_at)}</td>
                                  <td style={{ padding: '16px', color: '#334155' }}>
                                    <div style={{ fontWeight: '600' }}>{s.gender || '-'}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{s.age ? `${s.age} ปี` : '-'}</div>
                                  </td>
                                  <td style={{ padding: '16px', color: '#334155', fontSize: '0.9rem' }}>{s.target_group || '-'}</td>
                                  <td style={{ padding: '16px', color: '#334155', fontSize: '0.9rem' }}>
                                    {s.province || '-'}
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.district ? `อ.${s.district}` : '-'}</div>
                                  </td>
                                  <td style={{ padding: '16px', textAlign: 'center' }}>
                                    <div style={{ display: 'inline-block', padding: '6px 12px', background: avgScore >= 3.5 ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)', color: avgScore >= 3.5 ? '#059669' : '#2563eb', borderRadius: '20px', fontWeight: 'bold' }}>
                                      {avgScore}
                                    </div>
                                  </td>
                                </tr>
                                {isExpanded && (
                                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                    <td colSpan={6} style={{ padding: '24px 32px' }}>
                                      <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                                        {/* Design */}
                                        <div style={{ background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
                                          <div style={{ fontWeight: 'bold', color: '#3b82f6', marginBottom: '12px', borderBottom: '2px solid #f1f5f9', paddingBottom: '8px' }}>1. ด้านการออกแบบ</div>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#334155' }}><span>เมนูใช้งานง่าย:</span> <strong>{s.design_1||'-'}/4</strong></div>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#334155' }}><span>ทันสมัย:</span> <strong>{s.design_2||'-'}/4</strong></div>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#334155' }}><span>ตัวอักษรเหมาะสม:</span> <strong>{s.design_3||'-'}/4</strong></div>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#334155' }}><span>ภาพประกอบชัดเจน:</span> <strong>{s.design_4||'-'}/4</strong></div>
                                        </div>
                                        {/* Content */}
                                        <div style={{ background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
                                          <div style={{ fontWeight: 'bold', color: '#10b981', marginBottom: '12px', borderBottom: '2px solid #f1f5f9', paddingBottom: '8px' }}>2. ด้านเนื้อหา</div>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#334155' }}><span>ถูกต้องตามหลักภาษา:</span> <strong>{s.content_1||'-'}/4</strong></div>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#334155' }}><span>เหมาะสมตามระดับ:</span> <strong>{s.content_2||'-'}/4</strong></div>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#334155' }}><span>ลำดับง่ายไปยาก:</span> <strong>{s.content_3||'-'}/4</strong></div>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#334155' }}><span>น่าสนใจ:</span> <strong>{s.content_4||'-'}/4</strong></div>
                                        </div>
                                        {/* Benefit */}
                                        <div style={{ background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
                                          <div style={{ fontWeight: 'bold', color: '#8b5cf6', marginBottom: '12px', borderBottom: '2px solid #f1f5f9', paddingBottom: '8px' }}>3. ด้านประโยชน์</div>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#334155' }}><span>ส่งเสริมความรู้:</span> <strong>{s.benefit_1||'-'}/4</strong></div>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#334155' }}><span>พัฒนาทักษะภาษา:</span> <strong>{s.benefit_2||'-'}/4</strong></div>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#334155' }}><span>ประยุกต์ใช้ได้:</span> <strong>{s.benefit_3||'-'}/4</strong></div>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#334155' }}><span>เห็นคุณค่าภาษาไทย:</span> <strong>{s.benefit_4||'-'}/4</strong></div>
                                        </div>
                                      </div>
                                      
                                      {/* Suggestions */}
                                      <div style={{ background: 'white', padding: '16px 20px', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.2)', borderLeft: '4px solid #ef4444' }}>
                                        <div style={{ fontWeight: 'bold', color: '#b91c1c', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                          💬 ข้อเสนอแนะ:
                                        </div>
                                        <div style={{ color: '#475569', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                                          {s.suggestions || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>- ไม่มีข้อเสนอแนะ -</span>}
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
