import { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Mic, MicOff, Volume2, User as UserIcon, Bot, ArrowRight, CheckCircle, XCircle } from 'lucide-react';

export default function ConversationModule() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recordScore } = useUser();
  const [currentScenario, setCurrentScenario] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState(null); // 'correct', 'incorrect', null
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const audioRef = useRef(null);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [currentScenario]);


  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  const scenarios = {
    1: [
      {
        bot: 'สวัสดีค่ะ คุณชื่ออะไรคะ',
        keywords: ['ชื่อ', 'ผม', 'ฉัน', 'ดิฉัน', 'นามสกุล', 'เล่น', 'นาย', 'นางสาว', 'ครับ', 'ค่ะ'],
        hint: 'บอกชื่อ - นามสกุล และชื่อเล่นอย่างเป็นทางการ'
      },
      {
        bot: 'คุณเป็นคนที่ไหนคะ บ้านเกิดอยู่ที่ไหน',
        keywords: ['จังหวัด', 'อำเภอ', 'ตำบล', 'เกิด', 'บ้าน', 'อยู่', 'กรุงเทพ', 'นราธิวาส', 'เป็นคน', 'ครับ', 'ค่ะ'],
        hint: 'บอกชื่อจังหวัด หรืออำเภอที่ตนเองเติบโตมา'
      },
      {
        bot: 'คุณเรียนจบระดับไหน และจบจากที่ไหนมาคะ',
        keywords: ['จบ', 'เรียน', 'ปริญญา', 'มัธยม', 'ประถม', 'มหาวิทยาลัย', 'โรงเรียน', 'การศึกษา', 'ชั้น', 'ครับ', 'ค่ะ'],
        hint: 'ระบุระดับการศึกษาล่าสุด หรือสถานศึกษาที่จบมา'
      },
      {
        bot: 'ตอนนี้คุณทำงานอะไร หรือทำอาชีพอะไรอยู่คะ',
        keywords: ['ทำ', 'อาชีพ', 'งาน', 'บริษัท', 'ค้าขาย', 'รับจ้าง', 'พนักงาน', 'ราชการ', 'ครู', 'ไม่ได้ทำ', 'เรียนอยู่', 'ครับ', 'ค่ะ'],
        hint: 'บอกตำแหน่งงาน หน่วยงานหรือลักษณะงานที่ทำ'
      },
      {
        bot: 'เวลาว่างคุณชอบทำกิจกรรมอะไรมากที่สุดคะ',
        keywords: ['ชอบ', 'เล่น', 'กีฬา', 'เพลง', 'อาหาร', 'อ่าน', 'หนังสือ', 'ดู', 'หนัง', 'วาด', 'รูป', 'ท่องเที่ยว', 'ครับ', 'ค่ะ'],
        hint: 'อธิบายสิ่งที่ชอบทำ พร้อมให้เหตุผลสั้น ๆ ได้'
      }
    ],
    2: [
      { bot: 'ลูกค้าต้องการซื้ออะไรคะ', keywords: ['ข้าว', 'น้ำ', 'นม', 'ขนม', 'เสื้อ', 'กางเกง', 'ผลไม้', 'ผัก', 'ยา', 'หนังสือ', 'ปากกา', 'ดินสอ', 'เอา', 'ซื้อ', 'ต้องการ'], hint: 'บอกชื่อสินค้า' },
      { bot: 'ขอโทษค่ะ ช่วยบอกทางไปโรงพยาบาลได้ไหมคะ', keywords: ['ตรงไป', 'เลี้ยวซ้าย', 'เลี้ยวขวา', 'ข้ามถนน', 'ใกล้', 'อยู่ตรงข้าม', 'ด้านหน้า', 'ด้านหลัง', 'ทาง'], hint: 'การบอกทาง' },
      { bot: 'วันนี้คนไข้มีอาการอย่างไรคะ', keywords: ['ปวด', 'เจ็บ', 'เวียนหัว', 'ไข้', 'ไอ', 'น้ำมูก', 'ท้องเสีย', 'เป็นหวัด', 'เหนื่อย'], hint: 'อาการป่วย' },
      { bot: 'เราต้องเตรียมอุปกรณ์อะไรบ้าง ในการทำกิจกรรมจิตอาสา', keywords: ['ไม้กวาด', 'ถุงขยะ', 'ถุงดำ', 'ถุงมือ', 'ที่ตักขยะ', 'ผ้าขี้ริ้ว', 'ถังน้ำ', 'แปรง'], hint: 'วัสดุอุปกรณ์ในการทำความสะอาด' },
      { bot: 'พรุ่งนี้เรานัดทำการบ้านที่ไหนดี', keywords: ['บ้าน', 'ห้องสมุด', 'โรงเรียน', 'ร้านกาแฟ', 'คาเฟ่', 'สวน', 'หอ', 'ที่ไหนก็ได้'], hint: 'บอกสถานที่' }
    ],
    3: [
      {
        bot: 'สวัสดีค่ะ แนะนำตัวสั้นๆ ให้ฟังหน่อยค่ะว่าตอนนี้เรียนอยู่ที่ไหน และทำไมถึงอยากทำงาน Part time ที่นี่',
        keywords: ['ชื่อ', 'ผม', 'ฉัน', 'เรียนอยู่', 'ประสบการณ์', 'รายได้เสริม', 'หาเงิน'],
        hint: 'แนะนำตัว บอกสถานที่เรียน และเหตุผล (เช่น หารายได้เสริม)'
      },
      {
        bot: 'ถ้าต้องทำงานหลังเลิกเรียนหรือหลังเลิกงานประจำ คุณจะแบ่งเวลาอย่างไร',
        keywords: ['จัดสรรเวลา', 'ตารางเรียน', 'แบ่งเวลา', 'ทบทวน'],
        hint: 'พูดถึงการ "จัดสรรเวลา" หรือ "ตารางเรียน" ให้ชัดเจน'
      },
      {
        bot: 'ถ้าเจอลูกค้าที่กำลังหงุดหงิดหรือตำหนิเรา คุณจะมีวิธีพูดโต้ตอบอย่างไร',
        keywords: ['ขอโทษ', 'สุภาพ'],
        hint: 'พูดถึงการกล่าวคำ "ขอโทษ" และรับฟังอย่าง "สุภาพ"'
      },
      {
        bot: 'หากวันไหนคุณมีธุระด่วนไม่สามารถมาเข้ากะ Part time ได้ คุณจะจัดการแจ้งทางร้านอย่างไร',
        keywords: ['แจ้งล่วงหน้า', 'โทรบอก', 'โทรแจ้ง', 'หัวหน้า'],
        hint: 'พูดถึงการ "แจ้งล่วงหน้า" หรือ "โทรบอก" หัวหน้างาน'
      },
      {
        bot: 'สุดท้ายนี้ คุณคิดว่าจุดเด่นอะไรในตัวคุณที่ทำให้เราควรเลือกคุณเข้าทำงานค่ะ',
        keywords: ['ความรับผิดชอบ', 'รับผิดชอบ', 'ตรงต่อเวลา'],
        hint: 'ระบุจุดเด่น เช่น มี "ความรับผิดชอบ" หรือ "ตรงต่อเวลา"'
      }
    ]
  };

  const tasks = scenarios[id] || scenarios[1];

  const handleSpeak = () => {
    stopAudio();
    setIsPlaying(true);

    let audioPath = `/audio/bot_q${currentScenario + 1}.mp3`;
    if (id === '2') {
      audioPath = `/audio/l2_bot_q${currentScenario + 1}.mp3`;
    } else if (id === '3') {
      audioPath = `/audio/l3_bot_q${currentScenario + 1}.mp3`;
    }

    const audio = new Audio(audioPath);
    audioRef.current = audio;

    audio.onended = () => setIsPlaying(false);
    audio.onerror = (e) => {
      console.error('Failed to play bot audio', e);
      setIsPlaying(false);
    };

    audio.play().catch(e => {
      console.error('Audio playback blocked by browser', e);
      setIsPlaying(false);
    });
  };

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

      const scenario = tasks[currentScenario];
      const match = scenario.keywords.some(kw => speechToText.includes(kw));
      const hasPolite = speechToText.includes('ครับ') || speechToText.includes('ค่ะ');

      if (id === '3') {
        if (match && hasPolite) {
          setFeedback('correct');
          setScore(s => s + 1);
        } else if (match && !hasPolite) {
          setFeedback('partial');
        } else {
          setFeedback('incorrect');
        }
      } else {
        if (match) {
          setFeedback('correct');
          setScore(s => s + 1);
        } else {
          setFeedback('incorrect');
        }
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
    if (currentScenario < tasks.length - 1) {
      setCurrentScenario(c => c + 1);
    } else {
      setShowResult(true);
      updateScore('conversation', score);
    }
  };

  useEffect(() => {
    if (showResult && !scoreSubmitted) {
      setScoreSubmitted(true);
      recordScore({ level: parseInt(id), skill: 'conversation', score, maxScore: tasks.length });
    }
  }, [showResult, scoreSubmitted, id, score, tasks.length, recordScore]);

  if (showResult) {

    return (
      <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', padding: '60px 20px' }}>
        <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center', maxWidth: '500px', width: '100%' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>💬</div>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--color-primary-dark)', marginBottom: '16px' }}>จบการประเมินการโต้ตอบสนทนา</h2>
          <p style={{ fontSize: '1.25rem', marginBottom: '40px', color: 'var(--text-muted)' }}>คะแนนของคุณ: {score} / {tasks.length}</p>
          <button onClick={() => navigate(`/level/${id}`)} className="btn-primary" style={{ width: '100%' }}>เยี่ยมมาก กลับไปหน้าเมนู</button>
        </div>
      </div>
    );
  }

  const currentTask = tasks[currentScenario];

  return (
    <div className="animate-fade-in" style={{ padding: '32px 16px', maxWidth: '800px', margin: '0 auto' }}>
      <Link to={`/level/${id}`} style={{ color: 'var(--color-primary)', fontWeight: '500', marginBottom: '24px', display: 'inline-block', textDecoration: 'none' }}>
        &larr; ออกจากการฝึกสนทนา
      </Link>

      <div className="glass-panel" style={{ padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary-dark)', margin: 0 }}>สถานการณ์ที่ {currentScenario + 1} / {tasks.length}</h2>
        </div>

        {/* Chat Bot Area */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 10px rgba(126, 34, 206, 0.2)' }}>
            <Bot size={24} />
          </div>
          <div style={{ background: 'var(--bg-glass)', padding: '20px 24px', borderRadius: '0 20px 20px 20px', border: '1px solid rgba(168, 85, 247, 0.4)', position: 'relative', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            <p style={{ fontSize: '1.25rem', color: 'var(--color-primary-dark)', marginBottom: '16px', fontWeight: '500' }}>{currentTask.bot}</p>
            <button
              onClick={handleSpeak}
              disabled={isPlaying}
              className="btn-secondary"
              style={{ fontSize: '0.9rem', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '8px', opacity: isPlaying ? 0.7 : 1, borderRadius: '8px' }}
            >
              <Volume2 size={16} /> {isPlaying ? 'กำลังพูด...' : 'ฟังคำถาม'}
            </button>
          </div>
        </div>

        {/* User Reply Area */}
        <div style={{ display: 'flex', gap: '16px', flexDirection: 'row-reverse', marginBottom: '32px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-secondary-dark)', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 10px rgba(251, 191, 36, 0.3)' }}>
            <UserIcon size={24} />
          </div>
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px 0 20px 20px', boxShadow: '0 4px 14px rgba(0,0,0,0.05)', maxWidth: '80%', textAlign: 'right', border: '1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '16px', borderBottom: '1px dashed #e5e7eb', paddingBottom: '8px' }}>💬 คำแนะนำแนวทางการตอบ: {currentTask.hint}</div>

            {transcript ? (
              <p style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '16px' }}>"{transcript}"</p>
            ) : (
              <p style={{ fontSize: '1rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '16px' }}>กำลังรอคำตอบของคุณ...</p>
            )}

            {feedback === 'correct' && (
              <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', fontWeight: 'bold' }}>
                <CheckCircle size={20} /> ตอบรับได้ดีมาก! (+1 คะแนน)
              </div>
            )}

            {feedback === 'partial' && (
              <div style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', fontWeight: 'bold' }}>
                <CheckCircle size={20} /> เนื้อหาดี แต่ลืมพูดคำลงท้าย (ครับ/ค่ะ) (คะแนน +0)
              </div>
            )}

            {feedback === 'incorrect' && (
              <div style={{ color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                <XCircle size={20} /> ยังไม่ตรงกับบริบท หรือขาดคีย์เวิร์ดสำคัญ (คะแนน +0)
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '32px' }}>
          <div>
            {!feedback ? (
              <button
                onClick={handleRecord}
                disabled={isRecording}
                className="btn-primary"
                style={{ borderRadius: '30px', background: isRecording ? '#ef4444' : 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary))', boxShadow: isRecording ? '0 4px 14px rgba(239, 68, 68, 0.4)' : '' }}
              >
                {isRecording ? <><MicOff size={20} /> กำลังฟัง...</> : <><Mic size={20} /> กดเพื่อพูดตอบกลับ</>}
              </button>
            ) : (
              <button onClick={handleRecord} className="btn-secondary" style={{ borderRadius: '30px', background: '#f3f4f6', color: 'var(--text-main)', boxShadow: 'none' }}>
                ลองพูดใหม่
              </button>
            )}
          </div>

          {feedback && (
            <button onClick={handleNext} className="btn-primary" style={{ borderRadius: '30px' }}>
              ถัดไป <ArrowRight size={20} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
