import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { BookOpen, Trophy, LayoutDashboard, User as UserIcon } from 'lucide-react';
import { useUser } from './context/UserContext';
import './App.css';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import EditProfile from './pages/EditProfile';
import LoginPage from './pages/LoginPage';
import StartPage from './pages/StartPage';
import AdminDashboard from './pages/AdminDashboard';
import SkillSelect from './pages/SkillSelect';
import ListeningTest from './pages/ListeningTest';
import SpeakingTest from './pages/SpeakingTest';
import ReadingTest from './pages/ReadingTest';
import WritingTest from './pages/WritingTest';
import FullTest from './pages/FullTest';
import Ranking from './pages/Ranking';

// Protected route: redirect to /start if not authenticated
function ProtectedRoute({ children }) {
  const { token, loading } = useUser();
  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>กำลังโหลด...</div>
      </div>
    );
  }
  if (!token) return <Navigate to="/start" replace />;
  return children;
}

function AppLayout() {
  const { user, apiError } = useUser();
  const location = useLocation();
  const isTestPage = location.pathname.startsWith('/skills') || location.pathname.startsWith('/test/');

  return (
    <div className="app-wrapper">
      {apiError === 'offline' && (
        <div style={{ background: '#fef2f2', borderBottom: '1px solid #fecaca', padding: '10px 24px', textAlign: 'center', fontSize: '0.9rem', color: '#dc2626', zIndex: 1000 }}>
          ⚠️ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้
        </div>
      )}
      {!isTestPage && (
        <header className="glass-panel app-header">
        <div className="header" style={{ padding: 0 }}>
          <Link to="/" className="header-logo">
            <div className="header-logo-icon logo-wrapper">
              <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div className="header-titles">
              <div className="header-logo-text">นรารู้ไทย</div>
              <div className="header-logo-sub">สำนักงานส่งเสริมการเรียนรู้ประจำจังหวัดนราธิวาส</div>
            </div>
          </Link>
        </div>
        <nav className="nav-links">
          <Link to="/" className="nav-item">
            <BookOpen size={20} /> <span className="nav-text">หน้าแรก</span>
          </Link>
          <Link to="/skills" className="nav-item">
            <Trophy size={20} /> <span className="nav-text">เริ่มประเมิน</span>
          </Link>
          <Link to="/ranking" className="nav-item">
            <Trophy size={20} /> <span className="nav-text">จัดอันดับ</span>
          </Link>
          <Link to="/dashboard" className="nav-item">
            <LayoutDashboard size={20} /> <span className="nav-text">แดชบอร์ด</span>
          </Link>
          {user ? (
            <Link to="/profile" className="nav-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {user.avatar
                ? <img src={user.avatar} alt="avatar" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary-light)' }} />
                : <UserIcon size={20} />
              }
              <span className="nav-text">{user.name ? user.name.split(' ')[0] : 'โปรไฟล์'}</span>
            </Link>
          ) : (
            <Link to="/start" className="nav-item btn-primary" style={{ padding: '8px 16px', borderRadius: '20px', color: 'white', textDecoration: 'none' }}>
              <span className="nav-text">เริ่มต้นใช้งาน</span>
            </Link>
          )}
        </nav>
      </header>
      )}

      <main className="main-content container relative z-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/ranking" element={<ProtectedRoute><Ranking /></ProtectedRoute>} />
          <Route path="/skills" element={<ProtectedRoute><FullTest /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path="/test/listening" element={<ProtectedRoute><ListeningTest /></ProtectedRoute>} />
          <Route path="/test/speaking" element={<ProtectedRoute><SpeakingTest /></ProtectedRoute>} />
          <Route path="/test/reading" element={<ProtectedRoute><ReadingTest /></ProtectedRoute>} />
          <Route path="/test/writing" element={<ProtectedRoute><WritingTest /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          {/* Legacy redirects */}
          <Route path="/levels" element={<Navigate to="/skills" replace />} />
          <Route path="/level/:id" element={<Navigate to="/skills" replace />} />
          <Route path="/level/:id/*" element={<Navigate to="/skills" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes - no header */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/start" element={<StartPage />} />
        {/* All other routes go through AppLayout with header */}
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </Router>
  );
}

export default App;
