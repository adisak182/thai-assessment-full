import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle, XCircle, ArrowRight, RefreshCw, FileText } from 'lucide-react';
import { useUser } from '../context/UserContext';

const readingData = {
  questions: [
    {
      q: 'ข้อ 21. บทความนี้มีวัตถุประสงค์เพื่ออะไร',
      options: [
        { text: 'ให้ความบันเทิง', isCorrect: false },
        { text: 'สอนการทำอาหาร', isCorrect: false },
        { text: 'แนะนำสถานที่ท่องเที่ยว', isCorrect: false },
        { text: 'ให้ความรู้และเตือนภัยเกี่ยวกับโรคในหน้าฝน', isCorrect: true }
      ]
    },
    {
      q: 'ข้อ 22. ข้อใดเป็นสาเหตุสำคัญที่ทำให้เกิดโรคในหน้าฝน',
      options: [
        { text: 'อากาศหนาว', isCorrect: false },
        { text: 'การนอนน้อย', isCorrect: false },
        { text: 'แสงแดดแรง', isCorrect: false },
        { text: 'น้ำฝนมีสิ่งปนเปื้อนและเชื้อโรค', isCorrect: true }
      ]
    },
    {
      q: 'ข้อ 23. โรคท้องเสียในบทความเกิดจากสาเหตุใด',
      options: [
        { text: 'การออกกำลังกาย', isCorrect: false },
        { text: 'การพักผ่อนไม่พอ', isCorrect: false },
        { text: 'การกินอาหารสะอาด', isCorrect: false },
        { text: 'การกินอาหารหรือสิ่งที่ปนเปื้อนเชื้อโรค', isCorrect: true }
      ]
    },
    {
      q: 'ข้อ 24. โรคฉี่หนูมักพบในบริเวณใด',
      options: [
        { text: 'ภูเขา', isCorrect: false },
        { text: 'ทะเล', isCorrect: false },
        { text: 'ห้างสรรพสินค้า', isCorrect: false },
        { text: 'พื้นที่น้ำขัง เช่น ทุ่งนา', isCorrect: true }
      ]
    },
    {
      q: 'ข้อ 25. หากในชุมชนมีน้ำขังจำนวนมาก ควรระวังโรคใดมากที่สุด',
      options: [
        { text: 'โรคหัวใจ', isCorrect: false },
        { text: 'ไข้เลือดออก', isCorrect: true },
        { text: 'โรคกระดูก', isCorrect: false },
        { text: 'โรคสายตา', isCorrect: false }
      ]
    },
    {
      q: 'ข้อ 26. ในช่วงหน้าฝนมีโรคหลายชนิดที่เกิดขึ้น',
      isFactOpinion: true,
      options: [
        { text: 'ข้อเท็จจริง', isCorrect: true },
        { text: 'ข้อคิดเห็น', isCorrect: false }
      ]
    },
    {
      q: 'ข้อ 27. ปัจจุบันในน้ำฝนมีสารปนเปื้อนและเชื้อโรค',
      isFactOpinion: true,
      options: [
        { text: 'ข้อเท็จจริง', isCorrect: true },
        { text: 'ข้อคิดเห็น', isCorrect: false }
      ]
    },
    {
      q: 'ข้อ 28. เราควรหลีกเลี่ยงการลุยน้ำสกปรกในช่วงหน้าฝน',
      isFactOpinion: true,
      options: [
        { text: 'ข้อเท็จจริง', isCorrect: false },
        { text: 'ข้อคิดเห็น', isCorrect: true }
      ]
    },
    {
      q: 'ข้อ 29. การล้างมือบ่อย ๆ ช่วยลดความเสี่ยงของการเกิดโรค',
      isFactOpinion: true,
      options: [
        { text: 'ข้อเท็จจริง', isCorrect: true },
        { text: 'ข้อคิดเห็น', isCorrect: false }
      ]
    },
    {
      q: 'ข้อ 30. ทุกคนควรดูแลสุขภาพให้ดีในช่วงหน้าฝน',
      isFactOpinion: true,
      options: [
        { text: 'ข้อเท็จจริง', isCorrect: false },
        { text: 'ข้อคิดเห็น', isCorrect: true }
      ]
    }
  ]
};

export default function Level2Reading() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recordScore } = useUser();
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState('quiz'); // 'quiz', 'result'


  const questions = readingData.questions;
  const currentQ = questions[currentIdx];

  const handleSelect = (option) => {
    if (showResult) return;
    setSelectedOption(option);
    setShowResult(true);
    if (option.isCorrect) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setPhase('result');
    }
  };

  const handleRetry = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setShowResult(false);
    setScore(0);
    setPhase('quiz');
  };

  useEffect(() => {
    if (phase === 'result' && !scoreSubmitted) {
      setScoreSubmitted(true);
      recordScore({ level: parseInt(id), skill: 'reading', score, maxScore: questions.length });
    }
  }, [phase, scoreSubmitted, questions.length, id, score, recordScore]);

  if (phase === 'result') {

    return (
      <div className="animate-fade-in px-4 py-8 max-w-2xl mx-auto text-center">
        <div className="glass-panel" style={{ padding: '48px', marginTop: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', marginBottom: '24px' }}>
            <CheckCircle size={40} />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--color-primary-dark)' }}>ทำแบบทดสอบการอ่านสำเร็จ!</h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '32px' }}>
            คุณได้คะแนนส่วนนี้ <strong style={{ color: 'var(--color-primary)', fontSize: '1.5rem' }}>{score}</strong> คะแนน (จาก {questions.length} คะแนน)
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button onClick={handleRetry} className="btn-secondary" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
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

  return (
    <div className="animate-fade-in px-4 py-8 max-w-6xl mx-auto">
      <Link to={`/level/${id}`} style={{ color: 'var(--color-primary)', fontWeight: '500', marginBottom: '24px', display: 'inline-block', textDecoration: 'none' }}>
        &larr; กลับไปหน้าระดับ {id}
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left Column: Passage */}
        <div className="glass-panel" style={{ padding: '32px', height: 'calc(100vh - 150px)', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', position: 'sticky', top: '0', background: 'var(--bg-glass)', padding: '10px 0', zIndex: 10 }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--color-primary-light)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={24} />
            </div>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary-dark)', margin: 0 }}>บทอ่าน</h2>
          </div>
          <div style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-main)', padding: '24px', background: 'rgba(255,255,255,0.6)', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '16px', textAlign: 'center', color: 'var(--color-primary-dark)' }}>รู้ไว้ป้องกันก่อน “6 โรค ที่มากับหน้าฝน”</h3>
            <p style={{ marginBottom: '16px' }}>นพ.กฤษดา ศิรามพุช ผู้อำนวยการศูนย์เวชศาสตร์อายุรวัฒน์นานาชาติ ได้ออกมาเตือนให้ประชาชนระวังการสัมผัสน้ำฝนให้มากขึ้น เพราะในน้ำฝนมีสารปนเปื้อนและเชื้อโรคบางอย่างที่จะทำให้คุณเจ็บไข้ได้ป่วย โดยเฉพาะ 6 โรคยอดฮิตที่มาพร้อมกับหน้าฝนต่อไปนี้</p>
            
            <p style={{ marginBottom: '12px' }}><strong>1. โรคจากไวรัส</strong> ทำให้เป็นหวัดคัดจมูกและเกิดอาการไข้ได้ โดยเฉพาะกลุ่มทารก ต้องระวังการถูกฝนให้มาก เพราะอาจเจ็บป่วยไม่สบาย จนถึงขั้นหลอดลมฝอยอักเสบ รวมทั้งโรคไข้หวัดใหญ่</p>
            
            <p style={{ marginBottom: '12px' }}><strong>2. คอติดเชื้อ</strong> สังเกตได้จากจะเริ่มมีอาการเจ็บคอเป็นหลัก จากนั้นจะมีไข้ ปวดเมื่อยเนื้อเมื่อยตัวตามมา บางรายมีน้ำมูกร่วมด้วย เกิดจากการเผลอกลืนน้ำฝนปนเปื้อนลงคอไปจนทำให้คออักเสบ</p>
            
            <p style={{ marginBottom: '12px' }}><strong>3. ท้องเสีย อาหารเป็นพิษ</strong> เนื่องจากอาหารตามตลาดอาจได้รับเชื้ออีโคไลจากน้ำฝนที่ปนเปื้อน ซึ่งเชื้ออีโคไลนี้ เป็นเชื้อที่ทำให้ ลำไส้อักเสบติดเชื้อ จึงทำให้เกิดความผิดปกติในระบบย่อยอาหารตามมา</p>
            
            <p style={{ marginBottom: '12px' }}><strong>4. ผิวหนังอักเสบ</strong> น้ำฝนที่ขังตามพื้นถนนนาน ๆ เข้าจะกลายเป็นน้ำเน่าเหม็น เป็นแหล่งสะสมของเชื้อโรค หากกระเซ็นมาโดนตัว เราก็มีโอกาสเสี่ยงต่อผิวหนังอักเสบได้ ยิ่งไปกว่านั้น น้ำสกปรกยังอาจทำให้แผลติดเชื้อ เกิดเชื้อรา คัน เกิดตุ่มหนองและฝีได้ ดังนั้น แนะนำให้ล้างมือล้างเท้าบ่อย ๆ หลังจากกลับเข้าบ้าน</p>
            
            <p style={{ marginBottom: '12px' }}><strong>5. โรคฉี่หนู</strong> เป็นอีกโรคหนึ่งที่ระบาดในช่วงหน้าฝนนี้ แพร่ระบาดได้ในพื้นที่ที่มีน้ำขัง เช่น ทุ่งนา ส่วนในเมือง หากฝนตกทำให้น้ำขังบนถนนออกมาผสมกับท่อระบายน้ำก็มีโอกาสติดเชื้อโรคดังกล่าวได้ แม้ในรายที่รื้อบ้านแล้วมีมูลหนูปนออกมาจนเผลอไปเหยียบเข้าผ่านจากผิวหนังที่เป็นแผลก็จะทำให้ป่วยด้วยโรคนี้ได้ โดยผู้ป่วยจะมีไข้สูง ปวดตามตัวโดยเฉพาะน่อง และเบื่ออาหาร</p>
            
            <p style={{ marginBottom: '12px' }}><strong>6. ไข้เลือดออก</strong> โรคร้ายที่มียุงลายเป็นพาหะนำโรค ซึ่งยุงลายจะเพาะพันธุ์ในหน้าฝนที่มีฝนตกลงมาท่วมขัง หากใครมีไข้สูงมาก ไข้ไม่ยอมลด เบื่ออาหาร รู้สึกอ่อนเพลีย เชื่องซึม ขอให้รีบไปพบแพทย์ โดยสันนิษฐานไว้ก่อนว่าอาจเป็นโรคไข้เลือดออกก็ได้</p>
          </div>
        </div>

        {/* Right Column: Questions */}
        <div className="glass-panel" style={{ padding: '32px', height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.3rem', color: 'var(--color-primary-dark)', margin: 0 }}>
              ตอบคำถามส่วนที่ {currentIdx < 5 ? '1 (ปรนัย)' : '2 (ข้อเท็จจริง/ข้อคิดเห็น)'}
            </h2>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>ข้อที่ {currentIdx + 1} / {questions.length}</div>
          </div>

          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
            {currentQ.isFactOpinion ? 'คำชี้แจง : ให้ผู้เรียนอ่านข้อความแล้วพิจารณาว่าเป็น (ก) ข้อเท็จจริง (ข) ข้อคิดเห็น' : 'คำชี้แจง : ให้ผู้เรียนอ่านบทความฝั่งซ้ายแล้วตอบคำถามให้ถูกต้อง'}
          </p>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '32px', color: 'var(--text-main)', lineHeight: '1.6' }}>
              {currentQ.q}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: currentQ.isFactOpinion ? '1fr 1fr' : '1fr', gap: '16px' }}>
              {currentQ.options.map((option, index) => {
                const isSelected = selectedOption === option;
                let btnStyle = { 
                  padding: '16px 20px', 
                  fontSize: '1.1rem', 
                  borderRadius: '12px',
                  border: '2px solid transparent',
                  background: 'rgba(255,255,255,0.6)',
                  color: 'var(--text-main)',
                  transition: 'all 0.2s',
                  cursor: showResult ? 'default' : 'pointer',
                  textAlign: 'left',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: currentQ.isFactOpinion ? 'center' : 'flex-start',
                  gap: '12px'
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
                    boxShadow: '0 6px 12px rgba(0,0,0,0.1)'
                  };
                }

                const prefixMap = ['ก. ', 'ข. ', 'ค. ', 'ง. '];
                const prefix = currentQ.isFactOpinion ? '' : prefixMap[index];

                return (
                  <button 
                    key={index} 
                    onClick={() => handleSelect(option)}
                    disabled={showResult}
                    style={btnStyle}
                  >
                    {showResult && option.isCorrect && <CheckCircle size={20} color="#10b981" style={{ flexShrink: 0 }} />}
                    {showResult && isSelected && !option.isCorrect && <XCircle size={20} color="#ef4444" style={{ flexShrink: 0 }} />}
                    {!showResult && !currentQ.isFactOpinion && <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid var(--color-primary-light)', flexShrink: 0 }} />}
                    <span>{prefix} {option.text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {showResult && (
            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', animation: 'fadeIn 0.3s' }}>
              <button onClick={handleNext} className="btn-primary" style={{ padding: '12px 32px', fontSize: '1.1rem', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {currentIdx < questions.length - 1 ? 'ข้อถัดไป' : 'ดูผลคะแนน'} <ArrowRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
