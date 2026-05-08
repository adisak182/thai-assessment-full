import { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Volume2, CheckCircle, XCircle, ArrowRight, Play, RefreshCw, Headphones } from 'lucide-react';
import { useUser } from '../context/UserContext';

const l3Questions = {
  news: [
    {
      q: '1. จากข่าวข้างต้น ข้อใดสรุปใจความสำคัญได้ถูกต้องที่สุด',
      options: [
        { text: 'รัฐบาลสั่งการให้เขื่อนทุกแห่งเร่งระบายน้ำเพื่อช่วยเกษตรกร', isCorrect: false },
        { text: 'ประเทศไทยกำลังจะเกิดพายุหมุนเขตร้อนจำนวนมากในเดือนสิงหาคม', isCorrect: false },
        { text: 'ปรากฏการณ์ลานีญาเกิดจากอุณหภูมิผิวน้ำทะเลในมหาสมุทรแปซิฟิกลดลง', isCorrect: false },
        { text: 'กรมอุตุฯ เตือนให้ระวังปรากฏการณ์ลานีญาที่จะทำให้ฝนตกหนักและเสี่ยงน้ำท่วม', isCorrect: true }
      ]
    },
    {
      q: '2. หากท่านเป็นเกษตรกรในพื้นที่ภาคกลาง การกระทำใดสอดคล้องกับการรู้เท่าทันข้อมูลจากข่าวนี้มากที่สุด',
      options: [
        { text: 'รีบขายผลผลิตทั้งหมดทิ้งทันทีเพราะกลัวน้ำท่วมฉับพลัน', isCorrect: false },
        { text: 'ขุดบ่อเก็บน้ำเพิ่มให้ได้มากที่สุดเพื่อรองรับน้ำฝนร้อยละ 15', isCorrect: false },
        { text: 'ย้ายที่อยู่อาศัยขึ้นไปบนที่สูงเพื่อความปลอดภัยของครอบครัว', isCorrect: false },
        { text: 'ติดตามประกาศจากกรมอุตุฯ เป็นระยะและวางแผนระบบระบายน้ำในไร่นา', isCorrect: true }
      ]
    },
    {
      q: '3. จากข่าว ปรากฏการณ์ลานีญาในครั้งนี้ ส่งผลกระทบต่อปริมาณฝนสะสมในประเทศไทยอย่างไร',
      options: [
        { text: 'ปริมาณฝนจะลดลงร้อยละ 10-15 จากปีก่อน', isCorrect: false },
        { text: 'ปริมาณฝนจะเท่ากับค่าเฉลี่ยปกติแต่ตกบ่อยขึ้น', isCorrect: false },
        { text: 'ปริมาณฝนจะสูงกว่าค่าเฉลี่ยปกติร้อยละ 10-15', isCorrect: true },
        { text: 'ปริมาณฝนจะสูงขึ้นเฉพาะในพื้นที่ภาคใต้เท่านั้น', isCorrect: false }
      ]
    }
  ],
  announcement: [
    {
      q: '4. จุดประสงค์หลักของประกาศนี้คืออะไร',
      options: [
        { text: 'รายงานสภาพอากาศประจำวัน', isCorrect: false },
        { text: 'เตือนให้เตรียมรับมือกับภัยหนาว', isCorrect: true },
        { text: 'แนะนำวิธีการปลูกพืชในฤดูหนาว', isCorrect: false },
        { text: 'ประชาสัมพันธ์โครงการช่วยเหลือเกษตรกร', isCorrect: false }
      ]
    },
    {
      q: '5. กลุ่มเป้าหมายหลักของประกาศนี้คือใคร',
      options: [
        { text: 'ปศุสัตว์จังหวัด', isCorrect: false },
        { text: 'พ่อค้าคนกลาง', isCorrect: false },
        { text: 'ผู้ที่อาศัยอยู่ในเมือง', isCorrect: false },
        { text: 'เกษตรกรและผู้เลี้ยงสัตว์', isCorrect: true }
      ]
    },
    {
      q: '6. จากประกาศ ข้อใดคือ แนวทางปฏิบัติ ที่ถูกต้องและสอดคล้องกับจุดประสงค์ของประกาศนี้มากที่สุด',
      options: [
        { text: 'การนำกองฟางหรือเศษใบไม้มาคลุมหน้าดินบริเวณโคนต้นพืช', isCorrect: true },
        { text: 'การเปิดพัดลมระบายอากาศในโรงเรือนเพื่อให้อากาศถ่ายเทได้สะดวก', isCorrect: false },
        { text: 'การนำสัตว์เลี้ยงไปอาบน้ำเพื่อความสะอาดในช่วงที่อากาศเปลี่ยนแปลง', isCorrect: false },
        { text: 'การฉีดพ่นน้ำปริมาณมากที่ใบพืชเพื่อเพิ่มความชุ่มชื้นในช่วงอุณหภูมิลดลง', isCorrect: false }
      ]
    }
  ],
  ad: [
    {
      q: '7. โฆษณานี้ใช้กลยุทธ์ใดในการโน้มน้าวใจ',
      options: [
        { text: 'การข่มขู่ให้เกิดความกลัว', isCorrect: false },
        { text: 'การใช้ตัวเลขสถิติที่ซับซ้อน', isCorrect: false },
        { text: 'การใช้บุคคลที่มีชื่อเสียงมาการันตี', isCorrect: false },
        { text: 'การจี้จุดปัญหา (Pain Point) และเสนอทางออก', isCorrect: true }
      ]
    },
    {
      q: '8. คำพูดในข้อใดมีลักษณะเป็น การโฆษณาเกินจริง',
      options: [
        { text: 'จดจำแม่นยำเหมือนวัยหนุ่มสาว', isCorrect: true },
        { text: 'สั่งซื้อวันนี้ลดทันที 50%', isCorrect: false },
        { text: 'สารสกัดจากธรรมชาติ', isCorrect: false },
        { text: 'ผ่านการวิจัยมาแล้ว', isCorrect: false }
      ]
    },
    {
      q: '9. หาก "สมชาย" ต้องตัดสินใจซื้อผลิตภัณฑ์นี้อย่างมีวิจารณญาณ เขาควรทำสิ่งใดเป็นอันดับแรก',
      options: [
        { text: 'รีบสั่งซื้อทันทีเพราะมีการลดราคาถึง 50% ซึ่งคุ้มค่ามาก', isCorrect: false },
        { text: 'ลองซื้อมาทานดูก่อนเพราะเป็นสารสกัดจากธรรมชาติ ไม่น่าจะมีอันตราย', isCorrect: false },
        { text: 'สอบถามความเห็นจากเพื่อนในโซเชียลมีเดียว่ามีใครเคยใช้แล้วเห็นผลบ้าง', isCorrect: false },
        { text: 'ตรวจสอบเลขทะเบียน อย. และงานวิจัยที่อ้างถึงว่ามีที่มาที่ไปน่าเชื่อถือหรือไม่', isCorrect: true }
      ]
    }
  ],
  short_audio: [
    {
      q: '10. คำว่า คว่ำ มีกี่คำ',
      audio: '/audio/l3_listen_q10.mp3',
      fallbackText: 'เรือคว่ำ ชามคว่ำ',
      options: [
        { text: '1 คำ', isCorrect: false },
        { text: '2 คำ', isCorrect: true },
        { text: '3 คำ', isCorrect: false },
        { text: '4 คำ', isCorrect: false }
      ]
    },
    {
      q: '11. คำใดเป็น คำกริยา',
      audio: '/audio/l3_listen_q11.mp3',
      fallbackText: 'แม่ค้าขายของและเด็กๆเล่นกัน',
      options: [
        { text: 'สำลี', isCorrect: false },
        { text: 'สำรวย', isCorrect: false },
        { text: 'หวยและสี', isCorrect: false },
        { text: 'ขายและเล่น', isCorrect: true }
      ]
    },
    {
      q: '12. คำว่า "ขัน" คำแรก มีความหมายตรงกับข้อใด',
      audio: '/audio/l3_listen_q12.mp3',
      fallbackText: 'เรื่องนี้น่าขันจริงๆ ขันใบนี้ก็สวย',
      options: [
        { text: 'ภาชนะตักน้ำ', isCorrect: false },
        { text: 'ตลกขบขัน', isCorrect: true },
        { text: 'การทำให้ตึง', isCorrect: false },
        { text: 'เสียงร้องของไก่', isCorrect: false }
      ]
    },
    {
      q: '13. คำว่า "กัน" ในประโยคนี้ ทำหน้าที่เป็นคำชนิดใดตามลำดับ',
      audio: '/audio/l3_listen_q13.mp3',
      fallbackText: 'เรามาเล่นด้วยกัน เพื่อป้องกันอันตราย',
      options: [
        { text: 'คำนาม / คำกริยา', isCorrect: false },
        { text: 'คำช่วยกริยา / คำนาม', isCorrect: false },
        { text: 'คำสรรพนาม / คำกริยา', isCorrect: true },
        { text: 'คำกริยา / คำสรรพนาม', isCorrect: false }
      ]
    },
    {
      q: '14. ข้อใดกล่าวได้ถูกต้อง',
      audio: '/audio/l3_listen_q14.mp3',
      fallbackText: 'เขากินมันทอดน้ำมันมะพร้าวอย่างเมามัน',
      options: [
        { text: 'เขากำลังใช้มือทาเปื้อนน้ำมันมะพร้าวเพื่อกินขนม', isCorrect: false },
        { text: 'เขารู้สึกเลี่ยนน้ำมันมะพร้าวในขณะที่กำลังถือหัวมัน', isCorrect: false },
        { text: 'เขากำลังปลูกต้นมันเพื่อสกัดน้ำมันมะพร้าวอย่างเพลิดเพลิน', isCorrect: false },
        { text: 'เขารู้สึกสนุกกับการรับประทานพืชชนิดหนึ่งที่ปรุงด้วยไขมันพืช', isCorrect: true }
      ]
    },
    {
      q: '15. คำที่อยู่ในมาตราตัวสะกด แม่เกย มีกี่คำ (โดยไม่นับคำซ้ำ)',
      audio: '/audio/l3_listen_q15.mp3',
      fallbackText: 'ยายขายเนยที่ตลาด',
      options: [
        { text: '1 คำ', isCorrect: false },
        { text: '2 คำ', isCorrect: false },
        { text: '3 คำ', isCorrect: true },
        { text: '4 คำ', isCorrect: false }
      ]
    }
  ]
};

export default function Level3Listening() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recordScore } = useUser();

  const [phase, setPhase] = useState('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  
  const [isPlaying, setIsPlaying] = useState(false);

  const playTTS = (text) => {
    if (!text || !window.speechSynthesis) {
       setIsPlaying(false);
       alert('ไม่พบไฟล์เสียงและเบราว์เซอร์ไม่รองรับการอ่านออกเสียงอัตโนมัติ');
       return;
    }
    
    window.speechSynthesis.cancel(); // Clear queue

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'th-TH';
    utterance.rate = 0.9;
    
    const voices = window.speechSynthesis.getVoices();
    const thaiVoice = voices.find(v => v.lang.includes('th'));
    if (thaiVoice) {
      utterance.voice = thaiVoice;
    }

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = (e) => {
       console.error('TTS Error:', e);
       setIsPlaying(false);
       alert('เบราว์เซอร์ของคุณอาจยังไม่ติดตั้งเสียงภาษาไทย (TTS) ทำให้ไม่มีเสียงออกครับ');
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const playAudio = (audioPath, fallbackText) => {
    if (isPlaying) return;
    setIsPlaying(true);

    const audio = new Audio(audioPath);
    audio.onended = () => setIsPlaying(false);
    let errorHandled = false;

    const handleError = () => {
      if (errorHandled) return;
      errorHandled = true;
      console.warn(`ไม่พบไฟล์เสียง: ${audioPath}, กำลังใช้ระบบอ่านออกเสียงอัตโนมัติแทน`);
      playTTS(fallbackText);
    };

    audio.onerror = handleError;
    audio.play().catch(handleError);
  };

  const handleSelect = (option) => {
    if (showResult) return;
    setSelectedOption(option);
    setShowResult(true);
    if (option.isCorrect) {
      setScore(s => s + 1);
    }
  };

  useEffect(() => {
    if (phase === 'result' && !scoreSubmitted) {
      setScoreSubmitted(true);
      recordScore({ level: parseInt(id), skill: 'listening', score, maxScore: 15 });
    }
  }, [phase, scoreSubmitted, id, score, recordScore]);

  const advancePhase = (currentList, nextPhase) => {
    if (currentIdx < currentList.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setPhase(nextPhase);
      setCurrentIdx(0);
      setSelectedOption(null);
      setShowResult(false);
    }
  };

  const handleNextNews = () => advancePhase(l3Questions.news, 'announcement_intro');
  const handleNextAnnouncement = () => advancePhase(l3Questions.announcement, 'ad_intro');
  const handleNextAd = () => advancePhase(l3Questions.ad, 'short_audio_intro');
  const handleNextShortAudio = () => advancePhase(l3Questions.short_audio, 'result');

  const renderIntro = () => (
    <div className="animate-fade-in px-4 py-8 max-w-2xl mx-auto text-center">
      <Link to={`/level/${id}`} style={{ color: 'var(--color-primary)', fontWeight: '500', marginBottom: '24px', display: 'inline-block', textDecoration: 'none' }}>
        &larr; กลับไปหน้าระดับ {id}
      </Link>
      <div className="glass-panel" style={{ padding: '48px', marginTop: '16px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7, #7e22ce)', color: 'white', marginBottom: '24px' }}>
          <Headphones size={40} />
        </div>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '16px', color: 'var(--color-primary-dark)' }}>แบบทดสอบทักษะการฟัง Level 3</h2>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.6' }}>
          จำนวน 15 ข้อ (15 คะแนน)<br />
          ผ่าน 35 ข้อ ใน 50 = ร้อยละ 70<br />
          คำชี้แจง : ให้ผู้เรียนกดปุ่ม “ ฟังข่าว ” (ใส่รูปลำโพง) แล้วตอบคำถามให้ถูกต้อง
        </p>
        <button onClick={() => setPhase('news_intro')} className="btn-primary" style={{ padding: '16px 32px', fontSize: '1.2rem' }}>
          เริ่มทำแบบทดสอบ <ArrowRight size={24} style={{ marginLeft: '8px', display: 'inline' }} />
        </button>
      </div>
    </div>
  );

  const renderTransitionPhase = (title, subtitle, nextPhase) => (
    <div className="animate-fade-in px-4 py-8 max-w-2xl mx-auto text-center">
      <div className="glass-panel" style={{ padding: '48px', marginTop: '16px' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--color-primary-dark)' }}>{title}</h2>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '32px' }}>{subtitle}</p>
        <button onClick={() => setPhase(nextPhase)} className="btn-primary" style={{ padding: '12px 32px', fontSize: '1.2rem' }}>
          เริ่มทำส่วนต่อไป <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );

  const renderPassagePhase = (title, content, handleStartMCQ, audioPath, btnText = 'ฟังเสียงข้อความ') => (
    <div className="animate-fade-in px-4 py-8 max-w-3xl mx-auto">
      <div className="glass-panel" style={{ padding: '48px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', marginBottom: '24px' }}>
          <Volume2 size={40} />
        </div>
        <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--color-primary-dark)' }}>{title}</h2>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <button 
            onClick={() => playAudio(audioPath, content)} 
            disabled={isPlaying}
            className="btn-primary" 
            style={{ borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)' }}
          >
            <Volume2 size={24} /> {isPlaying ? 'กำลังเล่นเสียง...' : btnText}
          </button>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.7)', padding: '24px', borderRadius: '16px', marginBottom: '32px', textAlign: 'left', lineHeight: '1.8', color: 'var(--text-main)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <p><strong>ข้อความที่ได้ยิน:</strong><br/>"{content}"</p>
        </div>

        <button 
          onClick={handleStartMCQ} 
          className="btn-primary" 
          style={{ padding: '12px 32px', fontSize: '1.2rem', borderRadius: '30px' }}
        >
          ไปทำข้อสอบ <ArrowRight size={20} style={{ display: 'inline', marginLeft: '8px' }} />
        </button>
      </div>
    </div>
  );

  const renderQuestionPhase = (currentList, handleNext, title, introText) => {
    const currentQ = currentList[currentIdx];
    return (
      <div className="animate-fade-in px-4 py-8 max-w-2xl mx-auto">
        <Link to={`/level/${id}`} style={{ color: 'var(--color-primary)', fontWeight: '500', marginBottom: '24px', display: 'inline-block', textDecoration: 'none' }}>
          &larr; ออกจากแบบทดสอบ
        </Link>
        <div className="glass-panel" style={{ padding: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary-dark)', margin: 0 }}>{title}</h2>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>ข้อที่ {currentIdx + 1} / {currentList.length}</div>
          </div>
          
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px', textAlign: 'center' }}>{introText}</p>

          {currentQ.audio && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
              <button 
                onClick={() => playAudio(currentQ.audio, currentQ.fallbackText || currentQ.q)} 
                disabled={isPlaying}
                className="btn-primary" 
                style={{ borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', boxShadow: '0 4px 14px rgba(168, 85, 247, 0.4)' }}
              >
                <Volume2 size={24} /> {isPlaying ? 'กำลังเล่นเสียง...' : 'ฟังข้อความ'}
              </button>
            </div>
          )}

          <h3 style={{ fontSize: '1.3rem', marginBottom: '24px', color: 'var(--text-main)', textAlign: 'center', lineHeight: '1.5' }}>
            {currentQ.q}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {currentQ.options.map((option, index) => {
              const isSelected = selectedOption === option;
              let btnStyle = { 
                padding: '16px 20px', 
                fontSize: '1.1rem', 
                borderRadius: '16px',
                border: '2px solid transparent',
                background: 'rgba(255,255,255,0.8)',
                color: 'var(--text-main)',
                transition: 'all 0.2s',
                cursor: showResult ? 'default' : 'pointer',
                textAlign: 'left',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                fontWeight: '500'
              };

              if (showResult) {
                if (option.isCorrect) {
                  btnStyle.background = 'rgba(16, 185, 129, 0.1)';
                  btnStyle.border = '2px solid #10b981';
                  btnStyle.color = '#059669';
                } else if (isSelected && !option.isCorrect) {
                  btnStyle.background = 'rgba(239, 68, 68, 0.1)';
                  btnStyle.border = '2px solid #ef4444';
                  btnStyle.color = '#dc2626';
                }
              } else {
                btnStyle[':hover'] = {
                  background: 'white',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.1)'
                };
              }

              const prefixMap = ['ก. ', 'ข. ', 'ค. ', 'ง. '];
              const prefix = prefixMap[index];

              return (
                <button 
                  key={index} 
                  onClick={() => handleSelect(option)}
                  disabled={showResult}
                  style={btnStyle}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {showResult && option.isCorrect && <CheckCircle size={24} color="#10b981" />}
                    {showResult && isSelected && !option.isCorrect && <XCircle size={24} color="#ef4444" />}
                    {!showResult && <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid var(--color-primary-light)' }} />}
                    <span>{prefix}{option.text}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {showResult && (
            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', animation: 'fadeIn 0.3s' }}>
              <button onClick={handleNext} className="btn-primary" style={{ padding: '12px 32px', fontSize: '1.1rem', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ดำเนินการต่อ <ArrowRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (phase === 'intro') return renderIntro();
  
  if (phase === 'news_intro') return renderPassagePhase('ส่วนที่ 1: ข่าว', 'กรมอุตุนิยมวิทยาออกประกาศเฝ้าระวังปรากฏการณ์ "ลานีญา" (La Niña) ที่กำลังก่อตัวขึ้นในมหาสมุทรแปซิฟิก โดยคาดการณ์ว่าประเทศไทยจะเริ่มได้รับผลกระทบชัดเจนตั้งแต่เดือนสิงหาคมนี้เป็นต้นไป ส่งผลให้ปริมาณฝนสะสมทั่วประเทศสูงกว่าค่าเฉลี่ยปกติร้อยละ 10 - 15 ดร.สมชาย ผู้เชี่ยวชาญด้านสภาพภูมิอากาศ ระบุว่าปรากฏการณ์นี้จะทำให้อุณหภูมิผิวน้ำทะเลบริเวณแปซิฟิกตะวันตกสูงขึ้น ส่งผลให้ความชื้นพัดเข้าสู่เอเชียตะวันออกเฉียงใต้มากขึ้น "สิ่งที่น่ากังวลไม่ใช่แค่ปริมาณฝน แต่คือความถี่ของพายุหมุนเขตร้อนที่อาจเคลื่อนตัวเข้าสู่ไทยมากกว่าปีที่ผ่านมา ซึ่งอาจส่งผลกระทบต่อพื้นที่เกษตรกรรมในภาคกลางและภาคตะวันออกเฉียงเหนือ" ทั้งนี้ รัฐบาลได้สั่งการให้หน่วยงานบริหารจัดการน้ำเร่งระบายน้ำในเขื่อนหลัก เพื่อเตรียมพื้นที่รองรับมวลน้ำใหม่ และขอให้ประชาชนติดตามข่าวสารอย่างใกล้ชิดเพื่อป้องกันความเสียหายที่อาจเกิดขึ้นกับทรัพย์สินและพืชผลทางการเกษตร', () => setPhase('news'), '/audio/l3_listen_news.mp3', 'ฟังข่าว');
  if (phase === 'news') return renderQuestionPhase(l3Questions.news, handleNextNews, 'ส่วนที่ 1: ตอบคำถามจากข่าว', 'ให้ผู้เรียนเลือกคำตอบที่ถูกต้องที่สุดจากข่าวที่ฟัง');

  if (phase === 'announcement_intro') return renderPassagePhase('ส่วนที่ 2: ประกาศ', 'ขอประกาศแจ้งเตือนพี่น้องชาวเกษตรกร เนื่องจากสัปดาห์หน้าจะมีมวลอากาศเย็นกำลังแรงแผ่ปกคลุมพื้นที่ ทำให้อุณหภูมิลดฮวบลง 3-5 องศาเซลเซียส ขอให้ทุกท่านเร่งจัดทำแผงบังลมและเตรียมวัสดุคลุมดินเพื่อรักษาอุณหภูมิให้แก่พืชผัก รวมถึงดูแลสุขภาพของสัตว์เลี้ยงอย่างใกล้ชิดด้วยค่ะ', () => setPhase('announcement'), '/audio/l3_listen_announcement.mp3', 'ฟังประกาศ');
  if (phase === 'announcement') return renderQuestionPhase(l3Questions.announcement, handleNextAnnouncement, 'ส่วนที่ 2: ตอบคำถามจากประกาศ', 'ให้ผู้เรียนเลือกคำตอบที่ถูกต้องที่สุดจากประกาศที่ฟัง');

  if (phase === 'ad_intro') return renderPassagePhase('ส่วนที่ 3: โฆษณา', 'เบื่อไหม? กับความจำที่ถดถอย ลืมกุญแจ ลืมนัด ลืมกระทั่งว่ากินข้าวหรือยัง... บำรุงดี ผลิตภัณฑ์ใหม่ สารสกัดจากธรรมชาติ ที่ผ่านการวิจัยมาแล้วว่า ช่วยกระตุ้นการทำงานของเซลล์สมอง ให้คุณจดจำทุกรายละเอียดได้แม่นยำ เหมือนวัยหนุ่มสาว สั่งซื้อวันนี้ ลดทันที 50%!', () => setPhase('ad'), '/audio/l3_listen_ad.mp3', 'ฟังโฆษณา');
  if (phase === 'ad') return renderQuestionPhase(l3Questions.ad, handleNextAd, 'ส่วนที่ 3: ตอบคำถามจากโฆษณา', 'ให้ผู้เรียนเลือกคำตอบที่ถูกต้องที่สุดจากโฆษณาที่ฟัง');

  if (phase === 'short_audio_intro') return renderTransitionPhase('ส่วนที่ 4: ฟังเสียงข้อความสั้นๆ', 'คำชี้แจง: ให้ผู้เรียนกดปุ่ม “ ฟังข้อความ ” (ใส่รูปลำโพง) แล้วตอบคำถามให้ถูกต้อง', 'short_audio');
  if (phase === 'short_audio') return renderQuestionPhase(l3Questions.short_audio, handleNextShortAudio, 'ส่วนที่ 4: เสียงข้อความสั้นๆ', 'ฟังข้อความแล้วเลือกคำตอบที่ถูกต้อง');

  if (phase === 'result') {
    return (
      <div className="animate-fade-in px-4 py-8 max-w-2xl mx-auto text-center">
        <div className="glass-panel" style={{ padding: '48px', marginTop: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', marginBottom: '24px' }}>
            <CheckCircle size={40} />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--color-primary-dark)' }}>
            ทำแบบทดสอบทักษะการฟัง Level 3 สำเร็จ!
          </h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '32px' }}>
            คุณได้คะแนนส่วนนี้ <strong style={{ color: 'var(--color-primary)', fontSize: '1.5rem' }}>{score}</strong> คะแนน (จาก 15 คะแนน)
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button onClick={() => {
              setPhase('intro');
              setScore(0);
              setCurrentIdx(0);
              setScoreSubmitted(false);
            }} className="btn-secondary" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RefreshCw size={20} /> ลองใหม่อีกครั้ง
            </button>
            <button onClick={() => navigate(`/level/${id}`)} className="btn-primary" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              กลับไปหน้าระดับ <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
