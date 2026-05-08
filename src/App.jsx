import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { BookOpen, Trophy, LayoutDashboard, User as UserIcon } from 'lucide-react';
import { useUser } from './context/UserContext';
import './App.css';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import LevelSelect from './pages/LevelSelect';
import LevelDashboard from './pages/LevelDashboard';
import ContentModule from './pages/ContentModule';
import FlashcardsGame from './pages/FlashcardsGame';
import QuizModule from './pages/QuizModule';
import ReadAloudModule from './pages/ReadAloudModule';
import ConversationModule from './pages/ConversationModule';
import EditProfile from './pages/EditProfile';
import ListeningModule from './pages/ListeningModule';
import ReadingModule from './pages/ReadingModule';
import WritingModule from './pages/WritingModule';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';

// Protected route: redirect to /login if not authenticated
function ProtectedRoute({ children }) {
  const { token, loading } = useUser();
  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>กำลังโหลด...</div>
      </div>
    );
  }
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function AppLayout() {
  const { user, apiError } = useUser();

  return (
    <div className="app-wrapper">
      {apiError === 'offline' && (
        <div style={{ background: '#fef2f2', borderBottom: '1px solid #fecaca', padding: '10px 24px', textAlign: 'center', fontSize: '0.9rem', color: '#dc2626', zIndex: 1000 }}>
          ⚠️ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ — กรุณาตรวจสอบว่า Backend รันอยู่ที่ <code>localhost:3001</code> หรือไม่
        </div>
      )}
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
          <Link to="/levels" className="nav-item">
            <Trophy size={20} /> <span className="nav-text">เริ่มประเมิน</span>
          </Link>
          <Link to="/dashboard" className="nav-item">
            <LayoutDashboard size={20} /> <span className="nav-text">สถิติของฉัน</span>
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
            <Link to="/login" className="nav-item btn-primary" style={{ padding: '8px 16px', borderRadius: '20px', color: 'white', textDecoration: 'none' }}>
              <span className="nav-text">เข้าสู่ระบบ</span>
            </Link>
          )}
        </nav>
      </header>

      <main className="main-content container relative z-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/levels" element={<ProtectedRoute><LevelSelect /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path="/level/:id" element={<ProtectedRoute><LevelDashboard /></ProtectedRoute>} />
          <Route path="/level/:id/content" element={<ProtectedRoute><ContentModule /></ProtectedRoute>} />
          <Route path="/level/:id/flashcards" element={<ProtectedRoute><FlashcardsGame /></ProtectedRoute>} />
          <Route path="/level/:id/quiz" element={<ProtectedRoute><QuizModule /></ProtectedRoute>} />
          <Route path="/level/:id/read-aloud" element={<ProtectedRoute><ReadAloudModule /></ProtectedRoute>} />
          <Route path="/level/:id/conversation" element={<ProtectedRoute><ConversationModule /></ProtectedRoute>} />
          <Route path="/level/:id/listening" element={<ProtectedRoute><ListeningModule /></ProtectedRoute>} />
          <Route path="/level/:id/reading" element={<ProtectedRoute><ReadingModule /></ProtectedRoute>} />
          <Route path="/level/:id/writing" element={<ProtectedRoute><WritingModule /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
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
        <Route path="/register" element={<RegisterPage />} />
        {/* All other routes go through AppLayout with header */}
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </Router>
  );
}

export default App;
