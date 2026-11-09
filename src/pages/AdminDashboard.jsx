import './AdminDashboard.css';
import ModalPortal from '../components/ModalPortal';
import AdminUserSummary from '../components/AdminUserSummary';
import { filterUsers, summarizeLearners, summarizeAttempts } from '../utils/adminSummary';
import { useState, useEffect, useMemo, useRef, Fragment } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getAdminUsers, getAdminUserScores, deleteUser, updateUserByAdmin, getAdminSurveys, getAdminAllHistory } from '../services/api';
import { Shield, Trash2, Eye, CheckCircle, XCircle, X, Edit2, Users, Award, Search, Filter, Calendar, RefreshCw, ClipboardList, ChevronDown, ChevronUp, BarChart2, List, History, Download, FileSpreadsheet, Printer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { getAllQuestions } from '../data/testData';
import ScoreDetailModal from '../components/ScoreDetailModal';

const SKILL_LABELS = {full_test:'แบบทดสอบรวม 100 ข้อ',listening:'การฟัง',conversation:'การพูด',speaking:'การพูด',reading:'การอ่าน',writing:'การเขียน'};

function formatDate(isoStr) {
  if (!isoStr) return 'ไม่ได้ระบุ';
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return 'ไม่ได้ระบุ';
  return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminDashboard() {
  const { user, token } = useUser();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Tab State: 'users' | 'all_history'
  const [adminTab, setAdminTab] = useState('users');

  // All History State
  const [allHistory, setAllHistory] = useState([]);
  const [allHistoryLoading, setAllHistoryLoading] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('all'); // 'all' | 'passed' | 'notPassed'
  const [historyDateFilter, setHistoryDateFilter] = useState('all'); // 'all' | 'today' | 'week' | 'month'

  // ScoreDetailModal state
  const [activeDetailAttempt, setActiveDetailAttempt] = useState(null);
  const [activeDetailUser, setActiveDetailUser] = useState(null);
  
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
  const [enrollmentFilter,setEnrollmentFilter] = useState('all');
  const [userSort,setUserSort] = useState('newest');
  const [userPage,setUserPage] = useState(1);
  const [modalError,setModalError] = useState('');
  const scoreRequest = useRef(0);

  // Surveys & Answer Key State
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [showAnswerKeyModal, setShowAnswerKeyModal] = useState(false);
  const [surveys, setSurveys] = useState([]);
  const [surveysLoading, setSurveysLoading] = useState(false);
  const [surveyTab, setSurveyTab] = useState('overview'); // 'overview' | 'list'
  const [expandedSurveyId, setExpandedSurveyId] = useState(null);

  const answerKeyData = useMemo(() => getAllQuestions(), []);


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
      navigate('/skills');
      return;
    }
    fetchUsers();
    fetchAllHistory();
    const refresh=event=>{
      fetchUsers();fetchAllHistory();
      setUserScores(previous=>previous.map(attempt=>attempt.id===event.detail.id?{...attempt,...event.detail}:attempt));
    };
    window.addEventListener('score-reviewed',refresh);
    return ()=>window.removeEventListener('score-reviewed',refresh);
  }, [user]);

  const filteredUsers = filterUsers(users,{search:searchTerm,status:filterStatus,enrollment:enrollmentFilter,sort:userSort});
  const stats = summarizeLearners(users);
  const pageCount = Math.max(1,Math.ceil(filteredUsers.length / 20));
  const currentPage = Math.min(userPage,pageCount);
  const pageUsers = filteredUsers.slice((currentPage-1)*20,currentPage*20);
  const resetFilters = () => {setSearchTerm('');setFilterStatus('all');setEnrollmentFilter('all');setUserPage(1);};

  const fetchUsers = async () => {
    try {
      setLoading(true);setError('');
      const data = await getAdminUsers(token);
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllHistory = async () => {
    try {
      setAllHistoryLoading(true);
      const data = await getAdminAllHistory(token);
      setAllHistory(data || []);
    } catch (err) {
      setError('โหลดประวัติสอบไม่สำเร็จ: ' + err.message);
    } finally {
      setAllHistoryLoading(false);
    }
  };

  const filteredAllHistory = useMemo(() => {
    return allHistory.filter(h => {
      const uName = (h.user?.name || '').toLowerCase();
      const uUser = (h.user?.username || '').toLowerCase();
      const sQuery = historySearch.toLowerCase().trim();
      const matchesSearch = !sQuery || uName.includes(sQuery) || uUser.includes(sQuery);
      if (!matchesSearch) return false;

      const pct = Math.round((h.score / (h.max_score || 100)) * 100);
      if (historyStatusFilter === 'passed' && pct < 70) return false;
      if (historyStatusFilter === 'notPassed' && pct >= 70) return false;

      if (historyDateFilter !== 'all' && h.taken_at) {
        const itemDate = new Date(h.taken_at);
        const now = new Date();
        if (historyDateFilter === 'today') {
          if (itemDate.toDateString() !== now.toDateString()) return false;
        } else if (historyDateFilter === 'week') {
          const diffDays = (now - itemDate) / (1000 * 60 * 60 * 24);
          if (diffDays > 7) return false;
        } else if (historyDateFilter === 'month') {
          const diffDays = (now - itemDate) / (1000 * 60 * 60 * 24);
          if (diffDays > 30) return false;
        }
      }

      return true;
    });
  }, [allHistory, historySearch, historyStatusFilter, historyDateFilter]);

  const historyStats = useMemo(() => {
    const summary = summarizeAttempts(allHistory);
    return {total:summary.total,passed:summary.passed,notPassed:summary.reviewed-summary.passed,avg:summary.average,pending:summary.pending};
  }, [allHistory]);

  const downloadAllHistoryCSV = () => {
    const headers = [
      'วันที่สอบ', 'ชื่อ-นามสกุล', 'ชื่อผู้ใช้ (Username)', 'อายุ', 'ที่อยู่', 'แบบทดสอบ',
      'คะแนนที่ได้', 'คะแนนเต็ม', 'ร้อยละ (%)', 'ผลการประเมิน', 'ระดับ',
      'การฟัง (25)', 'การพูด (15)', 'การอ่าน (30)', 'การเขียน (30)'
    ];

    const rows = filteredAllHistory.map(h => {
      const pct = Math.round((h.score / (h.max_score || 100)) * 100);
      const passed = pct >= 70 ? 'ผ่าน' : 'ไม่ผ่าน';
      let grade = 'ปรับปรุง';
      if (pct >= 80) grade = 'ดีมาก';
      else if (pct >= 60) grade = 'ดี';
      else if (pct >= 50) grade = 'พอใช้';

      const bd = h.breakdown || {};
      const lScore = bd.listening?.score ?? '-';
      const sScore = bd.speaking?.score ?? '-';
      const rScore = bd.reading?.score ?? '-';
      const wScore = bd.writing?.score ?? '-';

      const uName = h.user?.name || '-';
      const uUsername = h.user?.username || '-';
      const uAge = h.user?.age || '-';
      const uAddress = `"${(h.user?.address || '-').replace(/"/g, '""')}"`;
      const skillName = h.skill === 'full_test' ? 'แบบทดสอบรวม 100 ข้อ' : h.skill;

      return [
        formatDate(h.taken_at), uName, uUsername, uAge, uAddress, skillName,
        h.score, h.max_score, `${pct}%`, passed, grade,
        lScore, sScore, rScore, wScore
      ];
    });

    const csvContent = '\uFEFF' + headers.join(',') + '\n' + rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ประวัติการทำแบบทดสอบทั้งหมด_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const downloadSurveyCSV = () => {
    const headers = [
      'วันที่', 'เพศ', 'อายุ', 'สถานะ', 'ข้อมูลเพิ่มเติม', 'อำเภอ', 'จังหวัด',
      '1.1 แอปพลิเคชันมีเมนูการใช้งานที่ไม่ซับซ้อน เข้าถึงง่าย', '1.2 แอปพลิเคชันมีความน่าสนใจและทันสมัย', '1.3 ขนาดตัวอักษรมีความเหมาะสมชัดเจน', '1.4 ภาพประกอบมีความชัดเจนและสอดคล้องกับเนื้อหา',
      '2.1 เนื้อหามีความถูกต้องตามหลักภาษาไทย', '2.2 เนื้อหามีความเหมาะสมตามระดับการประเมิน', '2.3 การเรียงลำดับเนื้อหามีความเหมาะสมจากง่ายไปยาก', '2.4 เนื้อหามีความน่าสนใจและทันสมัย',
      '3.1 แอปพลิเคชันช่วยส่งเสริมความรู้ด้านภาษาไทย', '3.2 แอปพลิเคชันสามารถพัฒนาทักษะการใช้ภาษาไทยได้ดีขึ้น', '3.3 ผู้ใช้งานสามารถนำความรู้ไปประยุกต์ใช้ในชีวิตประจำวันได้', '3.4 ผู้ใช้งานเห็นคุณค่าและตระหนักถึงความสำคัญของภาษาไทย',
      'ข้อเสนอแนะ'
    ];
    
    const rows = surveys.map(data => [
      formatDate(data.submitted_at), data.gender, data.age, data.status, data.education_level || data.employment_status, data.district, data.province,
      data.design_1, data.design_2, data.design_3, data.design_4,
      data.content_1, data.content_2, data.content_3, data.content_4,
      data.benefit_1, data.benefit_2, data.benefit_3, data.benefit_4,
      `"${(data.suggestions || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + headers.join(',') + '\n' + rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ผลแบบประเมินทั้งหมด.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printSurveyBlank = () => {
    const win = window.open('', '_blank');
    const val = () => '___________________';
    const chk = () => '[ &nbsp;&nbsp; ]';
    
    const html = `
      <html>
        <head>
          <title>แบบประเมินความพึงพอใจ</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
            body { font-family: 'Sarabun', Tahoma, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            h2, h3, h4 { color: #111; margin-bottom: 10px; margin-top: 20px; }
            .row { margin-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background: #f9fafb; }
            .center { text-align: center; }
            @media print {
              body { padding: 0; }
              @page { margin: 20mm; }
            }
          </style>
        </head>
        <body>
          <h2 class="center">แบบประเมินความพึงพอใจ</h2>
          
          <h3>ส่วนที่ 1 ข้อมูลทั่วไป</h3>
          <div class="row">1. เพศ: ${val()} &nbsp;&nbsp;&nbsp; 2. อายุ: ${val()} ปี</div>
          <div class="row">3. สถานะ: ${val()} &nbsp;&nbsp;&nbsp; ข้อมูลเพิ่มเติม: ${val()}</div>
          <div class="row">4. ภูมิลำเนา (อำเภอ): ${val()} &nbsp;&nbsp;&nbsp; จังหวัด: ${val()}</div>
          
          <h3>ส่วนที่ 2 การประเมินความพึงพอใจ</h3>
          <table>
            <tr>
              <th rowspan="2">รายการประเมิน</th>
              <th colspan="4" class="center">ระดับความพึงพอใจ</th>
            </tr>
            <tr>
              <th width="12%" class="center">ดีมาก (4)</th>
              <th width="12%" class="center">ดี (3)</th>
              <th width="12%" class="center">พอใช้ (2)</th>
              <th width="12%" class="center">ปรับปรุง (1)</th>
            </tr>
            
            <tr><td colspan="5" style="background:#f3f4f6; font-weight:bold;">1. ด้านการออกแบบและการใช้งาน</td></tr>
            <tr><td>1.1 แอปพลิเคชันมีเมนูการใช้งานที่ไม่ซับซ้อน เข้าถึงง่าย</td><td class="center">${chk()}</td><td class="center">${chk()}</td><td class="center">${chk()}</td><td class="center">${chk()}</td></tr>
            <tr><td>1.2 แอปพลิเคชันมีความน่าสนใจและทันสมัย</td><td class="center">${chk()}</td><td class="center">${chk()}</td><td class="center">${chk()}</td><td class="center">${chk()}</td></tr>
            <tr><td>1.3 ขนาดตัวอักษรมีความเหมาะสมชัดเจน</td><td class="center">${chk()}</td><td class="center">${chk()}</td><td class="center">${chk()}</td><td class="center">${chk()}</td></tr>
            <tr><td>1.4 ภาพประกอบมีความชัดเจนและสอดคล้องกับเนื้อหา</td><td class="center">${chk()}</td><td class="center">${chk()}</td><td class="center">${chk()}</td><td class="center">${chk()}</td></tr>
            
            <tr><td colspan="5" style="background:#f3f4f6; font-weight:bold;">2. ด้านเนื้อหา</td></tr>
            <tr><td>2.1 เนื้อหามีความถูกต้องตามหลักภาษาไทย</td><td class="center">${chk()}</td><td class="center">${chk()}</td><td class="center">${chk()}</td><td class="center">${chk()}</td></tr>
            <tr><td>2.2 เนื้อหามีความเหมาะสมตามระดับการประเมิน</td><td class="center">${chk()}</td><td class="center">${chk()}</td><td class="center">${chk()}</td><td class="center">${chk()}</td></tr>
            <tr><td>2.3 การเรียงลำดับเนื้อหามีความเหมาะสมจากง่ายไปยาก</td><td class="center">${chk()}</td><td class="center">${chk()}</td><td class="center">${chk()}</td><td class="center">${chk()}</td></tr>
            <tr><td>2.4 เนื้อหามีความน่าสนใจและทันสมัย</td><td class="center">${chk()}</td><td class="center">${chk()}</td><td class="center">${chk()}</td><td class="center">${chk()}</td></tr>
            
            <tr><td colspan="5" style="background:#f3f4f6; font-weight:bold;">3. ประโยชน์การนำไปใช้</td></tr>
            <tr><td>3.1 แอปพลิเคชันช่วยส่งเสริมความรู้ด้านภาษาไทย</td><td class="center">${chk()}</td><td class="center">${chk()}</td><td class="center">${chk()}</td><td class="center">${chk()}</td></tr>
            <tr><td>3.2 แอปพลิเคชันสามารถพัฒนาทักษะการใช้ภาษาไทยได้ดีขึ้น</td><td class="center">${chk()}</td><td class="center">${chk()}</td><td class="center">${chk()}</td><td class="center">${chk()}</td></tr>
            <tr><td>3.3 ผู้ใช้งานสามารถนำความรู้ไปประยุกต์ใช้ในชีวิตประจำวันได้</td><td class="center">${chk()}</td><td class="center">${chk()}</td><td class="center">${chk()}</td><td class="center">${chk()}</td></tr>
            <tr><td>3.4 ผู้ใช้งานเห็นคุณค่าและตระหนักถึงความสำคัญของภาษาไทย</td><td class="center">${chk()}</td><td class="center">${chk()}</td><td class="center">${chk()}</td><td class="center">${chk()}</td></tr>
          </table>
          
          <h3>ส่วนที่ 3 ข้อเสนอแนะเพื่อการพัฒนา</h3>
          <div style="border: 1px solid #ddd; padding: 15px; min-height: 100px;">
          </div>
        </body>
      </html>
    `;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
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

  const closeScoreModal = () => {scoreRequest.current++;setSelectedUser(null);};
  const openScoreModal = async (u) => {
    const request = ++scoreRequest.current;
    setSelectedUser(u);setUserScores([]);setModalError('');setModalLoading(true);
    try {
      const data = await getAdminUserScores(token,u.id);
      if (request === scoreRequest.current) setUserScores(data.history || []);
    } catch (err) {
      if (request === scoreRequest.current) setModalError(err.message || 'โหลดผลสอบไม่สำเร็จ');
    } finally {
      if (request === scoreRequest.current) setModalLoading(false);
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
    <div className="admin-page page-content animate-fade-in" style={{ padding: '24px 16px', maxWidth: '1400px', margin: '0 auto', minHeight: '100vh' }}>



      <header className="admin-header">
        <div><p className="admin-eyebrow">นรารู้ไทย · พื้นที่ผู้ดูแล</p><h1>ภาพรวมการเรียนรู้</h1><p className="admin-muted">ติดตามผู้เรียน ผลการประเมิน และสถิติการสอบ</p></div>
        <div className="admin-header-actions">
          <button onClick={() => {fetchUsers();fetchAllHistory();}} className="btn-secondary" disabled={loading || allHistoryLoading}><RefreshCw size={16}/> รีเฟรช</button>
          <button onClick={() => setShowAnswerKeyModal(true)} className="btn-secondary"><List size={16}/> เฉลยข้อสอบ</button>
          <button onClick={openSurveys} className="btn-primary"><ClipboardList size={16}/> แบบสอบถาม</button>
        </div>
      </header>
      <nav className="admin-tabs" aria-label="ส่วนข้อมูลผู้ดูแล">
        <button aria-pressed={adminTab === 'users'} onClick={()=>setAdminTab('users')}><Users size={18}/> ผู้เรียนและผู้ใช้งาน <span>{users.length}</span></button>
        <button aria-pressed={adminTab === 'all_history'} onClick={()=>setAdminTab('all_history')}><History size={18}/> ประวัติสอบล่าสุด <span>{allHistory.length}</span></button>
      </nav>
      {error && <div className="admin-error" role="alert">{error}</div>}
      {adminTab === 'users' ? (
        <>
          <div className="admin-metrics">
            {[
              {label:'ผู้เรียนทั้งหมด',value:stats.total,unit:'คน',note:'ไม่รวมบัญชีเจ้าหน้าที่',status:'all',tone:'purple'},
              {label:'กิจกรรมรู้หนังสือ',value:stats.literacy,unit:'คน',note:'ผู้เรียนที่ระบุเข้าร่วมกิจกรรม',status:'all',enrollment:'literacy',tone:'blue'},
              {label:'ผ่านการประเมิน',value:stats.passed,unit:'คน',note:'คะแนนรวมที่ได้ ≥ 70%',status:'passed',tone:'green'},
              {label:'ยังไม่ผ่านเกณฑ์',value:stats.notPassed,unit:'คน',note:'คะแนนรวมที่ได้ < 70%',status:'notPassed',tone:'rose'},
            ].map(item=><button key={item.label} className={`admin-metric ${item.tone}`} onClick={()=>{setFilterStatus(item.status);setEnrollmentFilter(item.enrollment || 'all');setUserPage(1);}}>
              <span>{item.label}</span><strong>{loading ? '—' : item.value} <small>{item.unit}</small></strong><p>{item.note}</p>
            </button>)}
          </div>
          <section className="admin-users-panel">
            <div className="admin-section-heading"><div><h2>รายชื่อผู้ใช้งาน</h2><p className="admin-muted">ดูข้อมูลส่วนตัว ประวัติสอบ และผลรายทักษะได้จากรายละเอียด</p></div><span className="admin-count" role="status">{filteredUsers.length} รายการ</span></div>
            <div className="admin-filters">
              <label className="admin-search"><span>ค้นหาผู้ใช้งาน</span><input placeholder="ชื่อ บัญชี ที่อยู่ หรือระดับการศึกษา" value={searchTerm} onChange={e=>{setSearchTerm(e.target.value);setUserPage(1);}}/></label>
              <label><span>ผลการประเมิน</span><select value={filterStatus} onChange={e=>{setFilterStatus(e.target.value);setUserPage(1);}}><option value="all">ทุกสถานะ</option><option value="passed">ผ่านเกณฑ์ ≥ 70%</option><option value="notPassed">ยังไม่ผ่านเกณฑ์</option><option value="notTested">ยังไม่ได้สอบแบบรวม</option></select></label>
              <label><span>กิจกรรมรู้หนังสือ</span><select value={enrollmentFilter} onChange={e=>{setEnrollmentFilter(e.target.value);setUserPage(1);}}><option value="all">ผู้ใช้งานทั้งหมด</option><option value="literacy">เป็นผู้เรียนกิจกรรม</option><option value="other">ไม่ใช่ผู้เรียนกิจกรรม</option></select></label>
              <label><span>เรียงตาม</span><select value={userSort} onChange={e=>{setUserSort(e.target.value);setUserPage(1);}}><option value="newest">สมัครล่าสุด</option><option value="latest">ทำข้อสอบล่าสุด</option><option value="score">คะแนนสูงสุด</option></select></label>
            </div>
            {loading ? <p className="admin-empty" role="status">กำลังโหลดข้อมูลผู้ใช้งาน...</p> : !pageUsers.length ? <div className="admin-empty"><p>ไม่พบผู้ใช้งานที่ตรงกับตัวกรอง</p><button className="btn-secondary" onClick={resetFilters}>ล้างตัวกรอง</button></div> : <>
              <table className="admin-learners-table"><thead><tr><th>ผู้เรียน / ผู้ใช้งาน</th><th>สถานะการเรียน</th><th>ผลประเมินแบบรวม</th><th>สอบแบบรวม</th><th>จัดการ</th></tr></thead><tbody>
                {pageUsers.map(u=><tr key={u.id}>
                  <td><div className="admin-identity"><span className="admin-avatar">{(u.name || '?').charAt(0)}</span><div><strong>{u.name || 'ไม่ได้ระบุชื่อ'}</strong><small>@{u.username} {u.role === 'admin' && '· เจ้าหน้าที่'}</small><span className={`admin-tag ${u.is_literacy_learner ? 'blue' : ''}`}>{u.is_literacy_learner ? 'ผู้เรียนกิจกรรมรู้หนังสือ' : 'ไม่ได้เข้าร่วมกิจกรรมรู้หนังสือ'}</span></div></div></td>
                  <td data-label="สถานะการเรียน"><strong>{u.status || 'ไม่ได้ระบุ'}</strong><small>{u.education_level || u.employment_status || 'ไม่มีข้อมูลเพิ่มเติม'}</small><small>{u.age ? `${u.age} ปี` : 'ไม่ระบุอายุ'} · {u.address || 'ไม่ระบุที่อยู่'}</small></td>
                  <td data-label="ผลประเมิน"><span className={`admin-tag ${u.full_test_completed ? u.full_test_passed ? 'green' : 'red' : ''}`}>{u.full_test_completed ? u.full_test_passed ? 'ผ่านเกณฑ์' : 'ยังไม่ผ่าน' : 'ยังไม่ได้สอบ'}</span><strong className="admin-score">{u.full_test_completed ? `${u.full_test_score} / 100` : '—'}</strong></td>
                  <td data-label="สอบแบบรวม"><strong>{u.full_test_attempts || 0} ครั้ง</strong><small>{u.full_test_last_at ? `ล่าสุด ${formatDate(u.full_test_last_at)}` : 'ยังไม่มีประวัติแบบรวม'}</small><small>สมัคร {formatDate(u.created_at)}</small></td>
                  <td><div className="admin-row-actions"><button className="admin-detail-button" onClick={()=>openScoreModal(u)} aria-label={`ดูรายละเอียด ${u.name}`}><Eye size={16}/> รายละเอียด</button><button onClick={()=>openEditModal(u)} aria-label={`แก้ไข ${u.name}`} title="แก้ไขข้อมูล"><Edit2 size={16}/></button>{u.role !== 'admin' && <button className="admin-delete-button" onClick={()=>handleDelete(u.id,u.name)} aria-label={`ลบ ${u.name}`} title="ลบผู้ใช้"><Trash2 size={16}/></button>}</div></td>
                </tr>)}
              </tbody></table>
              <div className="admin-pagination"><span>แสดง {(currentPage-1)*20+1}–{Math.min(currentPage*20,filteredUsers.length)} จาก {filteredUsers.length} รายการ</span><div><button className="btn-secondary" disabled={currentPage===1} onClick={()=>setUserPage(currentPage-1)}>ก่อนหน้า</button><span>{currentPage} / {pageCount}</span><button className="btn-secondary" disabled={currentPage===pageCount} onClick={()=>setUserPage(currentPage+1)}>ถัดไป</button></div></div>
            </>}
          </section>
        </>
      ) : (
        /* ALL EXAM HISTORY TAB */
        <div>
          <p className="admin-muted">แสดงประวัติล่าสุดสูงสุด 300 ครั้ง สถิติส่วนนี้คำนวณจากรายการที่โหลด · ค่าเฉลี่ยใช้เฉพาะผลที่ตรวจครบ</p>
          {/* History Statistics Cards */}
          <div className="admin-grid">
            <div className="stat-card">
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ClipboardList size={28} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>การสอบทั้งหมด</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b' }}>{historyStats.total} ครั้ง</div>
              </div>
            </div>

            <div className="stat-card">
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={28} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>สอบผ่านเกณฑ์ (≥70%)</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b' }}>
                  {historyStats.passed} <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#94a3b8' }}>({historyStats.total > 0 ? Math.round(historyStats.passed/historyStats.total*100) : 0}%)</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <XCircle size={28} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>ยังไม่ผ่าน</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b' }}>
                  {historyStats.notPassed} <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#94a3b8' }}>({historyStats.total > 0 ? Math.round(historyStats.notPassed/historyStats.total*100) : 0}%)</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={28} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>คะแนนเฉลี่ย</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b' }}>
                  {historyStats.avg ?? '—'} <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#94a3b8' }}>% ของคะแนนเต็ม</span>
                </div>
              </div>
            </div>
            <div className="stat-card"><div><div style={{fontSize:'.9rem',color:'#64748b'}}>ไม่ผ่านเกณฑ์</div><strong style={{fontSize:'1.8rem',color:'#dc2626'}}>{historyStats.notPassed} <small style={{fontSize:'.85rem'}}>ครั้ง</small></strong></div></div>
          </div>

          {/* Search, Filters and CSV Export Toolbar */}
          <div className="search-container">
            <div className="search-input">
              <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="ค้นหาชื่อผู้เข้าสอบ หรือ Username..." 
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <Filter size={20} color="#64748b" />
              <select 
                className="filter-select"
                value={historyStatusFilter}
                onChange={(e) => setHistoryStatusFilter(e.target.value)}
              >
                <option value="all">ผลสอบทั้งหมด</option>
                <option value="passed">เฉพาะที่ผ่านเกณฑ์ (≥70%)</option>
                <option value="notPassed">เฉพาะที่ไม่ผ่าน (&lt;70%)</option>
              </select>

              <select 
                className="filter-select"
                value={historyDateFilter}
                onChange={(e) => setHistoryDateFilter(e.target.value)}
              >
                <option value="all">ทุกช่วงเวลา</option>
                <option value="today">วันนี้</option>
                <option value="week">7 วันล่าสุด</option>
                <option value="month">30 วันล่าสุด</option>
              </select>

              <button 
                onClick={downloadAllHistoryCSV}
                className="btn-primary"
                style={{ 
                  padding: '12px 20px', 
                  borderRadius: '12px', 
                  fontWeight: '700', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  background: '#059669',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
                }}
              >
                <FileSpreadsheet size={18} /> ส่งออก CSV ({filteredAllHistory.length})
              </button>

              <button 
                onClick={fetchAllHistory}
                style={{ 
                  background: '#f1f5f9', 
                  border: 'none', 
                  padding: '12px', 
                  borderRadius: '12px', 
                  cursor: 'pointer',
                  color: '#475569'
                }}
                title="รีเฟรชข้อมูลประวัติ"
              >
                <RefreshCw size={18} className={allHistoryLoading ? 'spin' : ''} />
              </button>
            </div>
          </div>

          {allHistoryLoading ? (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <RefreshCw size={48} className="spin" color="var(--color-primary)" style={{ marginBottom: '16px' }} />
              <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>กำลังดึงข้อมูลประวัติการสอบทั้งหมด...</div>
            </div>
          ) : filteredAllHistory.length === 0 ? (
            <div className="glass-panel" style={{ padding: '80px 0', textAlign: 'center' }}>
              <History size={64} color="#d1d5db" style={{ marginBottom: '20px' }} />
              <h3 style={{ fontSize: '1.4rem', color: '#64748b', margin: 0 }}>ไม่พบประวัติการสอบที่ตรงตามเงื่อนไข</h3>
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '0', overflowX: 'auto', border: '1px solid rgba(0,0,0,0.05)' }}>
              <table className="desktop-table">
                <thead>
                  <tr>
                    <th style={{ paddingLeft: '24px' }}>ผู้เข้าสอบ</th>
                    <th>แบบทดสอบ</th>
                    <th style={{ textAlign: 'center' }}>วันที่สอบ</th>
                    <th style={{ textAlign: 'center' }}>คะแนน</th>
                    <th style={{ textAlign: 'center' }}>ผลประเมิน</th>
                    <th style={{ textAlign: 'center', paddingRight: '24px' }}>การจัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAllHistory.map((h, idx) => {
                    const pct = Math.round((h.score / (h.max_score || 100)) * 100);
                    const passed = !(h.pending_count > 0) && pct >= 70;
                    let grade = 'ปรับปรุง';
                    let gradeColor = '#dc2626';
                    let gradeBg = '#fee2e2';
                    if (pct >= 80) { grade = 'ดีมาก'; gradeColor = '#059669'; gradeBg = '#d1fae5'; }
                    else if (pct >= 60) { grade = 'ดี'; gradeColor = '#2563eb'; gradeBg = '#dbeafe'; }
                    else if (pct >= 50) { grade = 'พอใช้'; gradeColor = '#d97706'; gradeBg = '#fef3c7'; }

                    const student = h.user || { name: 'ผู้ใช้งาน', username: '-' };

                    return (
                      <tr key={h.id || idx}>
                        <td style={{ paddingLeft: '24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #c084fc, #9333ea)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                              {(student.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: '700', color: '#1e293b' }}>{student.name}</div>
                              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                                @{student.username} {student.address ? `• ${student.address}` : ''}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: '600', color: '#334155' }}>
                            {SKILL_LABELS[h.skill] || h.skill}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <Calendar size={14} /> {formatDate(h.taken_at)}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: '800', color: passed ? '#10b981' : '#f43f5e' }}>
                            {h.score} <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>/ {h.max_score}</span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>({pct}%)</div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: '700', padding: '4px 10px', borderRadius: '12px', background: gradeBg, color: gradeColor }}>
                            {`${passed ? '✓ ผ่าน' : '✕ ไม่ผ่าน'} (${grade})`}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', paddingRight: '24px' }}>
                          <button 
                            onClick={() => {
                              setActiveDetailAttempt(h);
                              setActiveDetailUser(student);
                            }}
                            style={{
                              background: '#f5f3ff',
                              color: '#7c3aed',
                              border: 'none',
                              padding: '8px 16px',
                              borderRadius: '10px',
                              cursor: 'pointer',
                              fontWeight: '700',
                              fontSize: '0.85rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.2s'
                            }}
                          >
                            <Eye size={16} /> ตรวจคำตอบละเอียด
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}



      {/* Score Details Modal */}
      {selectedUser && (
        <ModalPortal label="รายละเอียดผู้เรียนและผลสอบ" onClose={closeScoreModal}>
        <div className="admin-user-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="admin-user-dialog modal-surface glass-panel" style={{ background: 'white', width: '100%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div className="admin-user-dialog-header" style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>ข้อมูลผู้เรียนและผลสอบ</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)' }}></div>
                  <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: '600' }}>{selectedUser.name} (@{selectedUser.username})</span>
                </div>
              </div>
              <button onClick={closeScoreModal} aria-label="ปิดรายละเอียดผู้เรียน" style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', padding: '8px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={24} /></button>
            </div>
            <div className="admin-user-dialog-body" style={{ padding: '32px', overflowY: 'auto', flex: 1, background: 'white' }}>
              <AdminUserSummary user={selectedUser} history={modalLoading || modalError ? null : userScores}/>
              <h4 className="admin-attempts-title">ประวัติการสอบทุกครั้ง</h4>
              {modalLoading ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <RefreshCw size={40} className="spin" color="var(--color-primary)" style={{ marginBottom: '16px' }} />
                  <div style={{ color: '#64748b' }}>กำลังโหลดข้อมูลประวัติ...</div>
                </div>
              ) : modalError ? <p role="alert" className="admin-error">{modalError}</p> : userScores.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', background: '#f8fafc', borderRadius: '20px', border: '2px dashed #e2e8f0' }}>
                  <Award size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                  <div style={{ color: '#64748b', fontSize: '1.1rem' }}>ยังไม่พบประวัติการทำแบบทดสอบในระบบ</div>
                </div>
              ) : (
                <div className="admin-attempt-list">
                  {userScores.map(h => {
                    const passed = h.score / (h.max_score || 100) >= .7;
                    return <article key={h.id} className="admin-attempt-row">
                      <div><strong>{SKILL_LABELS[h.skill] || h.skill}</strong><time dateTime={h.taken_at}>{formatDate(h.taken_at)}</time></div>
                      <div><strong>{h.score} <small>/ {h.max_score} คะแนน</small></strong><span className={`admin-tag ${passed ? 'green' : 'red'}`}>{passed ? 'ผ่านเกณฑ์' : 'ยังไม่ผ่าน'}</span></div>
                      <button className="admin-detail-button" onClick={()=>{closeScoreModal();setActiveDetailAttempt(h);setActiveDetailUser(selectedUser);}}><Eye size={16}/> ดูคำตอบละเอียด</button>
                    </article>;
                  })}
                </div>
              )}
            </div>
            <div style={{ padding: '24px 32px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={closeScoreModal} aria-label="ปิดรายละเอียดผู้เรียน" className="btn-primary" style={{ padding: '12px 32px', borderRadius: '12px' }}>ปิดหน้าต่าง</button>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <ModalPortal label="แก้ไขข้อมูลสมาชิก" onClose={()=>setEditingUser(null)}>
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="glass-panel modal-surface admin-responsive-dialog" style={{ background: 'white', width: '100%', maxWidth: '500px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div className="admin-dialog-header" style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>แก้ไขข้อมูลสมาชิก</h3>
              <button aria-label="ปิดแก้ไขข้อมูลสมาชิก" onClick={() => setEditingUser(null)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', padding: '8px', borderRadius: '12px' }}><X size={24} /></button>
            </div>
            <form className="admin-responsive-dialog-body" onSubmit={handleSaveEdit} style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="input-group">
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#475569', fontSize: '0.95rem' }}>ชื่อ-นามสกุล</label>
                <input 
                  type="text" 
                  required 
                  value={editForm.name} 
                  onChange={e => setEditForm({...editForm, name: e.target.value})} 
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '1rem' }} 
                  autoFocus
                />
              </div>
              <div className="form-pair" style={{ display: 'flex', gap: '20px' }}>
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
        </ModalPortal>
      )}

      {/* Surveys Modal */}
      {showSurveyModal && (
        <ModalPortal label="ผลแบบสอบถาม" onClose={()=>setShowSurveyModal(false)}>
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="glass-panel modal-surface admin-responsive-dialog" style={{ background: 'white', width: '100%', maxWidth: '1000px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div className="admin-dialog-header" style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ClipboardList size={28} color="var(--color-primary)" />
                  ผลแบบสอบถาม ({surveys.length} รายการ)
                </h3>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button onClick={printSurveyBlank} style={{ padding: '8px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🖨️ พิมพ์ฟอร์มเปล่า
                </button>
                <button onClick={downloadSurveyCSV} style={{ padding: '8px 16px', borderRadius: '12px', border: 'none', background: 'var(--color-primary)', color: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  📊 ดาวน์โหลด CSV ทั้งหมด
                </button>
                <button aria-label="ปิดผลแบบสอบถาม" onClick={() => setShowSurveyModal(false)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', padding: '8px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '12px' }}><X size={24} /></button>
              </div>
            </div>
            
            <div className="admin-dialog-tabs" style={{ padding: '0 32px', display: 'flex', gap: '16px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <button onClick={() => setSurveyTab('overview')} style={{ padding: '16px 24px', background: 'transparent', border: 'none', borderBottom: surveyTab === 'overview' ? '3px solid var(--color-primary)' : '3px solid transparent', color: surveyTab === 'overview' ? 'var(--color-primary)' : '#64748b', fontWeight: surveyTab === 'overview' ? '700' : '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', transition: 'all 0.2s' }}>
                <BarChart2 size={20} /> ภาพรวมคะแนน
              </button>
              <button onClick={() => setSurveyTab('list')} style={{ padding: '16px 24px', background: 'transparent', border: 'none', borderBottom: surveyTab === 'list' ? '3px solid var(--color-primary)' : '3px solid transparent', color: surveyTab === 'list' ? 'var(--color-primary)' : '#64748b', fontWeight: surveyTab === 'list' ? '700' : '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', transition: 'all 0.2s' }}>
                <List size={20} /> รายชื่อผู้ตอบแบบสอบถาม
              </button>
            </div>

            <div className="admin-responsive-dialog-body" style={{ padding: '24px', overflowY: 'auto', flex: 1, background: 'white' }}>
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
                                      <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '20px', marginBottom: '20px' }}>
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
        </ModalPortal>
      )}

      {/* Answer Key Modal */}
      {showAnswerKeyModal && (
        <ModalPortal label="เฉลยข้อสอบ" onClose={()=>setShowAnswerKeyModal(false)}>
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="glass-panel modal-surface admin-responsive-dialog" style={{ background: 'white', width: '100%', maxWidth: '900px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div className="admin-dialog-header" style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <List size={28} color="var(--color-primary)" />
                  เฉลยข้อสอบทั้งหมด ({answerKeyData.length} ข้อ)
                </h3>
              </div>
              <button aria-label="ปิดเฉลยข้อสอบ" onClick={() => setShowAnswerKeyModal(false)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', padding: '8px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={24} /></button>
            </div>
            
            <div className="admin-responsive-dialog-body" style={{ padding: '24px', overflowY: 'auto', flex: 1, background: 'white', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {answerKeyData.map((q, idx) => {
                let correctAnswerText = '';
                if (q.type === 'mcq') {
                  const correctOpt = q.options?.find(o => o.correct);
                  correctAnswerText = correctOpt ? correctOpt.text : '-';
                } else if (q.type === 'tf') {
                  correctAnswerText = q.correct === true ? 'จริง' : 'เท็จ';
                } else if (q.type === 'match') {
                  // matchAnswers is not exported here directly, we can assume q has something or just display a generic note.
                  correctAnswerText = 'ดูเฉลยในส่วนการจับคู่';
                } else if (q.type === 'text') {
                  correctAnswerText = q.answer || q.word || 'พิจารณาตามเนื้อหา / เติมคำตอบให้ถูกต้อง';
                } else if (q.type === 'speaking') {
                  correctAnswerText = q.text || (q.keywords ? q.keywords.join(', ') : 'พูดออกเสียงให้ถูกต้อง');
                }

                return (
                  <div key={idx} style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: '700', marginBottom: '8px' }}>{q.section}</div>
                    <div style={{ fontSize: '1.05rem', color: '#1e293b', fontWeight: '600', marginBottom: '12px' }}>{q.question || q.script || q.text || q.word || `ข้อ ${q.id}`}</div>
                    
                    <div style={{ display: 'flex', gap: '8px', background: 'white', padding: '12px', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                      <span style={{ color: '#64748b', fontWeight: '600', width: '80px' }}>เฉลย:</span>
                      <span style={{ color: '#10b981', fontWeight: '700', flex: 1 }}>{correctAnswerText}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* SCORE DETAIL MODAL */}
      {activeDetailAttempt && (
        <ScoreDetailModal
          attempt={activeDetailAttempt}
          user={activeDetailUser}
          onClose={() => {
            setActiveDetailAttempt(null);
            setActiveDetailUser(null);
          }}
        />
      )}


    </div>
  );
}
