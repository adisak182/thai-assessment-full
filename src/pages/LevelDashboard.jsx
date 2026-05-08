import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, Volume2, MessageCircle, Award, PenTool } from 'lucide-react';
import { useUser } from '../context/UserContext';

export default function LevelDashboard() {
  const { id } = useParams();
  const { user, fetchScores } = useUser();
  const [scores, setScores] = useState({ listening: 0, conversation: 0, reading: 0, writing: 0, totalScore: 0 });

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      const allScores = await fetchScores();
      const levelData = allScores[id] || {};

      const listening   = levelData.listening?.score   || 0;
      const conversation = levelData.conversation?.score || 0;
      const reading     = levelData.reading?.score     || 0;
      const writing     = levelData.writing?.score     || 0;
      const totalScore  = listening + conversation + reading + writing;
      setScores({ listening, conversation, reading, writing, totalScore });
    };
    loadData();
  }, [id, user]);

  
  const modules = [];
  
  if (id === '1') {
    modules.push({ 
      title: 'ทักษะการฟัง', 
      path: 'listening', 
      icon: <Volume2 size={32} />, 
      desc: 'ทดสอบการฟังคำศัพท์ นิทาน และประกาศ', 
      bg: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' 
    });
    
    modules.push({
      title: 'ทักษะการพูด (สนทนาโต้ตอบ)',
      path: 'conversation',
      icon: <MessageCircle size={32} />,
      desc: 'ฝึกการสนทนาโต้ตอบกับระบบ 5 สถานการณ์',
      bg: 'linear-gradient(135deg, #3b82f6, #2563eb)'
    });
    
    modules.push({
      title: 'ทักษะการอ่าน (จับใจความ)',
      path: 'reading',
      icon: <BookOpen size={32} />,
      desc: 'อ่านบทความและตอบคำถามเพื่อประยุกต์ใช้ในสถานการณ์ต่างๆ',
      bg: 'linear-gradient(135deg, #10b981, #059669)'
    });

    modules.push({
      title: 'ทักษะการเขียน (เกมแฟลชการ์ด)',
      path: 'writing',
      icon: <PenTool size={32} />,
      desc: 'ดูภาพและฟังเสียงคำศัพท์ แล้วเลือกคำที่สะกดถูกต้อง',
      bg: 'linear-gradient(135deg, #f59e0b, #d97706)'
    });
  }
  
  if (id === '2') {
    modules.push({ 
      title: 'ทักษะการฟัง', 
      path: 'listening', 
      icon: <Volume2 size={32} />, 
      desc: 'ทดสอบการฟังคำศัพท์ สำนวน และบทความ', 
      bg: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' 
    });
    
    modules.push({
      title: 'ทักษะการพูด (สนทนาโต้ตอบ)',
      path: 'conversation',
      icon: <MessageCircle size={32} />,
      desc: 'ฝึกการสนทนาโต้ตอบกับระบบ 5 สถานการณ์',
      bg: 'linear-gradient(135deg, #3b82f6, #2563eb)'
    });

    modules.push({
      title: 'ทักษะการอ่าน (จับใจความ)',
      path: 'reading',
      icon: <BookOpen size={32} />,
      desc: 'อ่านบทความ "6 โรค ที่มากับหน้าฝน" และตอบคำถาม 10 ข้อ',
      bg: 'linear-gradient(135deg, #10b981, #059669)'
    });

    modules.push({
      title: 'ทักษะการเขียน',
      path: 'writing',
      icon: <PenTool size={32} />,
      desc: 'เขียนคำศัพท์ตามคำอ่าน และเรียงคำเป็นประโยค',
      bg: 'linear-gradient(135deg, #f59e0b, #d97706)'
    });
  }

  if (id === '3') {
    modules.push({ 
      title: 'ทักษะการฟัง', 
      path: 'listening', 
      icon: <Volume2 size={32} />, 
      desc: 'ทดสอบการฟังข่าว ประกาศ โฆษณา และวิเคราะห์สาร', 
      bg: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' 
    });
    
    modules.push({
      title: 'ทักษะการพูด (สนทนาโต้ตอบ)',
      path: 'conversation',
      icon: <MessageCircle size={32} />,
      desc: 'ฝึกการสนทนาโต้ตอบในสถานการณ์สัมภาษณ์งานและการแก้ปัญหา',
      bg: 'linear-gradient(135deg, #3b82f6, #2563eb)'
    });

    modules.push({
      title: 'ทักษะการอ่าน (จับใจความ)',
      path: 'reading',
      icon: <BookOpen size={32} />,
      desc: 'อ่านบทความสังคมสูงวัย วิเคราะห์ระดับภาษา และโคลงสี่สุภาพ',
      bg: 'linear-gradient(135deg, #10b981, #059669)'
    });

    modules.push({
      title: 'ทักษะการเขียน (การใช้ภาษา)',
      path: 'writing',
      icon: <PenTool size={32} />,
      desc: 'เรียงคำศัพท์ยาก เรียงประโยค และการเขียนตอบคำถาม',
      bg: 'linear-gradient(135deg, #f59e0b, #d97706)'
    });
  }

  return (
    <div className="animate-fade-in px-4 py-8">
      <Link to="/levels" style={{ color: 'var(--color-primary)', fontWeight: '500', marginBottom: '24px', display: 'inline-block', textDecoration: 'none' }}>
        &larr; กลับไปหน้าระดับทั้งหมด
      </Link>
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '32px', marginTop: '16px' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '8px', color: 'var(--color-primary-dark)' }}>Level {id} Dashboard</h2>
        <p style={{ color: 'var(--text-muted)' }}>เลือกแบบฝึกหัดหรือเนื้อหาการเรียนรู้ที่คุณต้องการ</p>

        {(id === '1' || id === '2' || id === '3') && (() => {
          const isL1 = id === '1';
          const isL2 = id === '2';
          const isL3 = id === '3';
          
          let maxScore = 30;
          let passScore = 21;
          let readingMax = 5;
          let writingMax = 5;

          if (isL2) {
            maxScore = 40;
            passScore = 28;
            readingMax = 10;
            writingMax = 10;
          } else if (isL3) {
            maxScore = 50;
            passScore = 35;
            readingMax = 15;
            writingMax = 15;
          }

          const passed = scores.totalScore >= passScore;
          const nextLevel = isL1 ? 2 : (isL2 ? 3 : 3); // No level 4 yet
          return (
            <div style={{ marginTop: '24px', padding: '24px', background: 'rgba(255,255,255,0.5)', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={20} /> สรุปคะแนนรวม Level {id}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div style={{ background: 'white', padding: '16px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>การฟัง</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{scores.listening}/15</div>
                </div>
                <div style={{ background: 'white', padding: '16px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>การพูด</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>{scores.conversation}/5</div>
                </div>
                <div style={{ background: 'white', padding: '16px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>การอ่าน</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>{scores.reading}/{readingMax}</div>
                </div>
                <div style={{ background: 'white', padding: '16px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>การเขียน</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>{scores.writing}/{writingMax}</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: passed ? '#ecfdf5' : '#fef2f2', borderRadius: '12px', border: `2px solid ${passed ? '#10b981' : '#ef4444'}` }}>
                <div>
                  <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: passed ? '#059669' : '#dc2626' }}>คะแนนรวมทั้งหมด: {scores.totalScore} / {maxScore}</span>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>(เกณฑ์ผ่าน {passScore} คะแนน)</div>
                </div>
                <div>
                  {isL3 ? (
                    passed ? (
                      <span style={{ padding: '8px 16px', background: '#10b981', color: 'white', borderRadius: '20px', fontWeight: 'bold', display: 'inline-block' }}>🏅 ยอดเยี่ยม! คุณทำสำเร็จครบทุกระดับแล้ว</span>
                    ) : (
                      <span style={{ padding: '8px 16px', background: '#ef4444', color: 'white', borderRadius: '20px', fontWeight: 'bold', display: 'inline-block' }}>❌ ยังไม่ผ่านเกณฑ์</span>
                    )
                  ) : (
                    passed ? (
                      <span style={{ padding: '8px 16px', background: '#10b981', color: 'white', borderRadius: '20px', fontWeight: 'bold', display: 'inline-block' }}>🎉 สอบผ่าน! ปลดล็อก Level {nextLevel} แล้ว</span>
                    ) : (
                      <span style={{ padding: '8px 16px', background: '#ef4444', color: 'white', borderRadius: '20px', fontWeight: 'bold', display: 'inline-block' }}>❌ ยังไม่ผ่านเกณฑ์</span>
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {modules.map(mod => (
          <Link key={mod.path} to={`/level/${id}/${mod.path}`} style={{ textDecoration: 'none' }}>
            <div className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: mod.bg, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                {mod.icon}
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--color-primary-dark)' }}>{mod.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{mod.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
