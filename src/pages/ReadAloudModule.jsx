import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Mic, MicOff, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

export default function ReadAloudModule() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateScore } = useUser();
  const [currentWord, setCurrentWord] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState(null); // 'correct', 'incorrect', null
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  const levelWords = {
    1: ['โรงเรียน', 'กระเป๋า', 'กางเกง', 'หนังสือ'],
    2: ['สวัสดีครับ', 'ขอบคุณค่ะ', 'ห้องน้ำไปทางไหน', 'ตลาดสด'],
    3: ['เศรษฐกิจพอเพียง', 'ประมวลกฎหมายอาญา', 'เทคโนโลยีสารสนเทศ', 'การพัฒนาอย่างยั่งยืน']
  };

  const words = levelWords[id] || levelWords[1];

  const handleRecord = () => {
    if (!SpeechRecognition) {
      alert('เบราว์เซอร์ของคุณไม่รองรับระบบสั่งงานด้วยเสียง แนะนำให้ใช้ Google Chrome หรือ Edge');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'th-TH';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
      setTranscript('');
      setFeedback(null);
    };

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setTranscript(speechToText);
      
      const cleanTarget = words[currentWord].replace(/\s+/g, '');
      const cleanSpeech = speechToText.replace(/\s+/g, '');

      if (cleanSpeech.includes(cleanTarget) || cleanTarget.includes(cleanSpeech)) {
        setFeedback('correct');
        setScore(s => s + 25);
      } else {
        setFeedback('incorrect');
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const handleNext = () => {
    setTranscript('');
    setFeedback(null);
    if (currentWord < words.length - 1) {
      setCurrentWord(c => c + 1);
    } else {
      setShowResult(true);
      updateScore('readAloud', score);
    }
  };

  if (showResult) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', padding: '60px 20px' }}>
        <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center', maxWidth: '500px', width: '100%' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎙️</div>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--color-primary-dark)', marginBottom: '16px' }}>จบการประเมินการอ่าน</h2>
          <p style={{ fontSize: '1.25rem', marginBottom: '40px', color: 'var(--text-muted)' }}>คะแนนของคุณ: {score} / {words.length * 25}</p>
          <button onClick={() => navigate(`/level/${id}`)} className="btn-primary" style={{ width: '100%' }}>เยื่ยมมาก กลับไปหน้าเมนู</button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '32px 16px', maxWidth: '800px', margin: '0 auto' }}>
      <Link to={`/level/${id}`} style={{ color: 'var(--color-primary)', fontWeight: '500', marginBottom: '24px', display: 'inline-block', textDecoration: 'none' }}>
        &larr; ออกจากการฝึกอ่าน
      </Link>

      <div className="glass-card" style={{ padding: '48px 32px', textAlign: 'center', marginTop: '20px' }}>
        <h3 style={{ fontSize: '1.5rem', color: 'var(--text-muted)', marginBottom: '16px' }}>กรุณาอ่านคำหรือประโยคด้านล่าง</h3>
        <h1 style={{ fontSize: '4rem', color: 'var(--color-primary-dark)', fontWeight: 'bold', marginBottom: '48px' }}>
          {words[currentWord]}
        </h1>

        <div style={{ height: '150px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
          {isRecording ? (
            <div style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px', animation: 'fadeIn 1s infinite alternate' }}>
              <Mic size={32} />
              <span style={{ fontSize: '1.25rem' }}>กำลังฟังเสียงของคุณ...พูดเลย!</span>
            </div>
          ) : feedback === 'correct' ? (
            <div style={{ color: '#10b981', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <CheckCircle size={48} style={{ marginBottom: '8px' }} />
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>ยอดเยี่ยม! ออกเสียงถูกต้อง</span>
            </div>
          ) : feedback === 'incorrect' ? (
            <div style={{ color: '#ef4444', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <XCircle size={48} style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '1.25rem', marginBottom: '4px' }}>เสียงที่ได้ยิน: "{transcript}"</div>
              <span style={{ fontSize: '0.875rem' }}>ลองพยายามใหม่อีกครั้ง</span>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)' }}>
              กดปุ่มไมโครโฟนเพื่อเริ่มพูด
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          {!feedback ? (
            <button 
              onClick={handleRecord}
              disabled={isRecording}
              className="btn-primary"
              style={{ 
                borderRadius: '50%', 
                width: '80px', 
                height: '80px', 
                padding: '0', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: isRecording ? '#ef4444' : 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary))',
                opacity: isRecording ? 0.7 : 1,
                cursor: isRecording ? 'not-allowed' : 'pointer'
              }}
            >
              {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
            </button>
          ) : (
            <>
              <button onClick={handleRecord} className="btn-secondary" style={{ borderRadius: '12px', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RefreshCw size={20} /> ลองอีกครั้ง
              </button>
              <button onClick={handleNext} className="btn-primary" style={{ borderRadius: '12px', padding: '12px 32px' }}>
                คำต่อไป &rarr;
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
