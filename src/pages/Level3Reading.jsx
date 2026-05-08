import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle, XCircle, ArrowRight, RefreshCw, FileText } from 'lucide-react';
import { useUser } from '../context/UserContext';

const readingData = {
  questions: [
    {
      q: '21. บทความข้างต้นระบุว่าเทคโนโลยีมีประโยชน์ต่อผู้สูงอายุในด้านใดชัดเจนที่สุด',
      options: [
        { text: 'การเพิ่มรายได้จากการขายของออนไลน์', isCorrect: false },
        { text: 'การเข้าถึงบริการสาธารณสุขทางไกล', isCorrect: true },
        { text: 'การสร้างความบันเทิงในครอบครัว', isCorrect: false },
        { text: 'การลดค่าใช้จ่ายในชีวิตประจำวัน', isCorrect: false }
      ]
    },
    {
      q: '22. คำว่า สังคมสูงวัยระดับสุดยอด ตามบริบทหมายถึงข้อใด',
      options: [
        { text: 'สังคมที่มีผู้สูงอายุเป็นผู้นำประเทศ', isCorrect: false },
        { text: 'สังคมที่ยกย่องให้ผู้สูงอายุเป็นบุคคลสำคัญ', isCorrect: false },
        { text: 'สังคมที่มีสัดส่วนผู้สูงอายุสูงมากตามเกณฑ์กำหนด', isCorrect: true },
        { text: 'สังคมที่ผู้สูงอายุทุกคนใช้เทคโนโลยีได้อย่างเชี่ยวชาญ', isCorrect: false }
      ]
    },
    {
      q: '23. สาเหตุหลักที่ทำให้เกิด ความเหลื่อมล้ำทางดิจิทัล ในกลุ่มผู้สูงอายุตามบทความคืออะไร',
      options: [
        { text: 'ลูกหลานไม่มีเวลาสอนการใช้งาน', isCorrect: false },
        { text: 'ราคาของอุปกรณ์ดิจิทัลที่สูงเกินไป', isCorrect: false },
        { text: 'สัญญาณอินเทอร์เน็ตเข้าไม่ถึงพื้นที่ห่างไกล', isCorrect: false },
        { text: 'ขาดทักษะและความกังวลเรื่องความปลอดภัย', isCorrect: true }
      ]
    },
    {
      q: '24. ข้อใดคือ ใจความสำคัญ ของบทความนี้',
      options: [
        { text: 'เทคโนโลยีคือทางออกเดียวของผู้สูงอายุ', isCorrect: false },
        { text: 'ประเทศไทยกำลังเข้าสู่สังคมผู้สูงอายุอย่างรวดเร็ว', isCorrect: false },
        { text: 'บริการสาธารณสุขทางไกลช่วยประหยัดงบประมาณภาครัฐ', isCorrect: false },
        { text: 'ความจำเป็นในการลดช่องว่างทางดิจิทัลเพื่อรองรับสังคมสูงวัย', isCorrect: true }
      ]
    },
    {
      q: '25. ข้อใดคือแนวทางการแก้ปัญหาที่สอดคล้องกับบทความนี้มากที่สุด',
      options: [
        { text: 'ลดราคาอุปกรณ์ไอทีให้ถูกที่สุด', isCorrect: false },
        { text: 'งดใช้เทคโนโลยีกับผู้สูงอายุเพื่อความปลอดภัย', isCorrect: false },
        { text: 'ให้ผู้สูงอายุอาศัยอยู่ในสถานสงเคราะห์ที่มีคนดูแล', isCorrect: false },
        { text: 'จัดอบรมทักษะดิจิทัลและสร้างระบบความปลอดภัยที่ใช้ง่าย', isCorrect: true }
      ]
    },
    {
      q: '26. "การที่วัยรุ่นสมัยนี้ติดเกมกันงอมแงมจนเสียการเรียน เป็นเรื่องที่ผู้ปกครองต้องรีบแก้ไขโดยด่วน" ข้อความนี้จัดอยู่ในภาษาระดับใด',
      options: [
        { text: 'ภาษาพิธีการ', isCorrect: false },
        { text: 'ภาษาทางการ', isCorrect: false },
        { text: 'ภาษากึ่งทางการ', isCorrect: false },
        { text: 'ภาษาไม่เป็นทางการ (ภาษาปาก)', isCorrect: true }
      ]
    },
    {
      q: '27. ข้อความในข้อใดใช้ "ภาษาทางการ" ได้ถูกต้อง',
      options: [
        { text: 'คณะกรรมการมีมติเห็นชอบให้เลื่อนการประชุม', isCorrect: true },
        { text: 'หมอแนะนำว่าเราไม่ควรทานอาหารที่มีรสจัดจนเกินไป', isCorrect: false },
        { text: 'ตำรวจกำลังไล่ล่าโจรที่เข้าไปขโมยของในห้างสรรพสินค้า', isCorrect: false },
        { text: 'นักเรียนทุกคนควรไปกินข้าวที่โรงอาหารที่โรงเรียนจัดไว้ให้', isCorrect: false }
      ]
    },
    {
      q: '28. "ข้าพเจ้ามีความยินดีเป็นอย่างยิ่งที่ได้มาเป็นประธานในพิธีเปิดงานวิชาการในวันนี้" ข้อความนี้มักพบในสถานการณ์ใดมากที่สุด',
      options: [
        { text: 'การสนทนาระหว่างครูกับนักเรียน', isCorrect: false },
        { text: 'การเขียนบทความในนิตยาสาร', isCorrect: false },
        { text: 'การกล่าวเปิดงานในพิธีการ', isCorrect: true },
        { text: 'การรายงานข่าวทางวิทยุ', isCorrect: false }
      ]
    },
    {
      q: '29. "วันนี้มีฝนตกหนักในหลายพื้นที่ พี่น้องประชาชนควรเช็กสภาพอากาศก่อนออกจากบ้าน" คำว่า "เช็ก" ควรเปลี่ยนเป็นคำในข้อใดเพื่อให้เป็น "ภาษากึ่งทางการ" ที่เหมาะสม',
      options: [
        { text: 'พิสูจน์', isCorrect: false },
        { text: 'ตรวจสอบ', isCorrect: true },
        { text: 'สังเกตการณ์', isCorrect: false },
        { text: 'พินิจพิจารณา', isCorrect: false }
      ]
    },
    {
      q: '30. ข้อความข้อใดใช้ระดับภาษา "ไม่สอดคล้อง" กับกลุ่มเพื่อนสนิท',
      options: [
        { text: 'เฮ้ย! เย็นนี้ไปหาอะไรกินกันดีวะ', isCorrect: false },
        { text: 'แกเห็นปากกาของฉันที่วางอยู่บนโต๊ะไหม', isCorrect: false },
        { text: 'ไปดูหนังกันเถอะ พลาดเรื่องนี้ไปเสียดายแย่เลย', isCorrect: false },
        { text: 'ท่านมีความประสงค์จะไปร่วมรับประทานอาหารกับเราหรือไม่', isCorrect: true }
      ]
    },
    {
      type: 'matching',
      q: 'ข้อ 31-34. โยงเส้นจับคู่คำประพันธ์กับความหมายให้ถูกต้อง',
      pairs: [
        { leftId: 'L1', left: 'อ่อนหวานมานมิตรล้น เหลือหลาย', rightId: 'R1', right: 'คนที่พูดจาอ่อนหวาน สุภาพ จะมีเพื่อนมากมาย มีคนรักใคร่เอ็นดู' },
        { leftId: 'L2', left: 'หยาบบ่มีเกลอกราย เกลื่อนใกล้', rightId: 'R2', right: 'คนที่พูดจาหยาบคาย จะไม่มีเพื่อนแท้ หรือแทบไม่มีใครอยากอยู่ใกล้' },
        { leftId: 'L3', left: 'ดุดดวงศศิฉาย ดาวดาษ ประดับนา', rightId: 'R3', right: 'เปรียบเหมือนดวงจันทร์ (ศศิ) ที่ส่องแสงสวยงาม มีดวงดาวมากมายล้อมรอบประดับอยู่' },
        { leftId: 'L4', left: 'สุริยส่องดาราไว้ เมื่อร้อนแรงแสง', rightId: 'R4', right: 'เปรียบเหมือนดวงอาทิตย์ที่มีแสงร้อนแรง จนทำให้มองไม่เห็นดาว หรือไม่มีดาวอยู่ใกล้' }
      ]
    },
    {
      q: '35. จากคำประพันธ์ข้างต้น ควรปฏิบัติตนตามข้อใดมากที่สุด',
      options: [
        { text: 'ใช้คำพูดสุภาพ อ่อนโยน เพื่อสร้างความสัมพันธ์ที่ดี', isCorrect: true },
        { text: 'พูดตรงไปตรงมาโดยไม่สนใจความรู้สึกผู้อื่น', isCorrect: false },
        { text: 'หลีกเลี่ยงการพูดคุยกับผู้อื่นเพื่อลดปัญหา', isCorrect: false },
        { text: 'แสดงความเก่งเพื่อให้ผู้อื่นยอมรับ', isCorrect: false }
      ]
    }
  ]
};

export default function Level3Reading() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recordScore } = useUser();
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState('quiz'); // 'quiz', 'result'

  // Matching game state
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [connections, setConnections] = useState([]);
  const [matchingSubmitted, setMatchingSubmitted] = useState(false);
  const [lineCoords, setLineCoords] = useState([]);
  const matchContainerRef = useRef(null);

  const questions = readingData.questions;
  const currentQ = questions[currentIdx];

  // Shuffle right items once
  const shuffledRightItems = useMemo(() => {
    if (currentQ && currentQ.type === 'matching') {
      return [...currentQ.pairs].sort(() => Math.random() - 0.5);
    }
    return [];
  }, [currentQ]);

  // Update lines for matching game
  useEffect(() => {
    if (currentQ?.type !== 'matching') return;
    
    const updateLines = () => {
      if (!matchContainerRef.current) return;
      const containerRect = matchContainerRef.current.getBoundingClientRect();
      const newCoords = connections.map(conn => {
        const leftEl = document.getElementById(conn.leftId);
        const rightEl = document.getElementById(conn.rightId);
        if (leftEl && rightEl) {
          const lRect = leftEl.getBoundingClientRect();
          const rRect = rightEl.getBoundingClientRect();
          
          let color = '#d1d5db'; // Default line color
          if (matchingSubmitted) {
            const pair = currentQ.pairs.find(p => p.leftId === conn.leftId);
            color = pair && pair.rightId === conn.rightId ? '#10b981' : '#ef4444'; // Green or Red
          } else if (selectedLeft === conn.leftId) {
            color = 'var(--color-primary)';
          }

          return {
            id: `${conn.leftId}-${conn.rightId}`,
            leftId: conn.leftId,
            rightId: conn.rightId,
            x1: lRect.right - containerRect.left,
            y1: lRect.top + (lRect.height / 2) - containerRect.top,
            x2: rRect.left - containerRect.left,
            y2: rRect.top + (rRect.height / 2) - containerRect.top,
            color
          };
        }
        return null;
      }).filter(Boolean);
      setLineCoords(newCoords);
    };

    updateLines();
    window.addEventListener('resize', updateLines);
    // Observe DOM changes or layout shifts
    const observer = new MutationObserver(updateLines);
    if (matchContainerRef.current) {
      observer.observe(matchContainerRef.current, { childList: true, subtree: true, attributes: true });
    }
    return () => {
      window.removeEventListener('resize', updateLines);
      observer.disconnect();
    };
  }, [connections, currentIdx, currentQ, matchingSubmitted, selectedLeft]);

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
      // Reset matching game state if necessary, though it only shows once
      if (questions[currentIdx + 1].type === 'matching') {
        setSelectedLeft(null);
        setConnections([]);
        setMatchingSubmitted(false);
      }
    } else {
      setPhase('result');
    }
  };

  useEffect(() => {
    if (phase === 'result' && !scoreSubmitted) {
      setScoreSubmitted(true);
      const maxScore = questions.reduce((acc, q) => acc + (q.type === 'matching' ? 4 : 1), 0);
      recordScore({ level: parseInt(id), skill: 'reading', score, maxScore });
    }
  }, [phase, scoreSubmitted, questions, id, score, recordScore]);

  const handleRetry = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setShowResult(false);
    setScore(0);
    setPhase('quiz');
    setSelectedLeft(null);
    setConnections([]);
    setMatchingSubmitted(false);
  };

  const handleLeftClick = (id) => {
    if (matchingSubmitted) return;
    setSelectedLeft(id === selectedLeft ? null : id);
  };

  const handleRightClick = (id) => {
    if (matchingSubmitted) return;
    if (selectedLeft) {
      setConnections(prev => {
        // Remove existing connections for this left or right item
        const filtered = prev.filter(c => c.leftId !== selectedLeft && c.rightId !== id);
        return [...filtered, { leftId: selectedLeft, rightId: id }];
      });
      setSelectedLeft(null);
    }
  };

  const checkMatching = () => {
    let earned = 0;
    connections.forEach(conn => {
      const pair = currentQ.pairs.find(p => p.leftId === conn.leftId);
      if (pair && pair.rightId === conn.rightId) {
        earned++;
      }
    });
    setScore(s => s + earned);
    setMatchingSubmitted(true);
  };

  const renderLeftPanel = () => {
    if (currentIdx >= 0 && currentIdx <= 4) {
      return (
        <div className="glass-panel" style={{ padding: '32px', height: 'calc(100vh - 150px)', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', position: 'sticky', top: '0', background: 'var(--bg-glass)', padding: '10px 0', zIndex: 10 }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--color-primary-light)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={24} />
            </div>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary-dark)', margin: 0 }}>บทอ่าน</h2>
          </div>
          <div style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-main)', padding: '24px', background: 'rgba(255,255,255,0.6)', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '16px', textAlign: 'center', color: 'var(--color-primary-dark)' }}>สังคมสูงวัยกับเศรษฐกิจดิจิทัล โอกาสหรือความเหลื่อมล้ำ</h3>
            <p style={{ marginBottom: '16px', textIndent: '30px' }}>
              ในยุคปัจจุบันที่ประเทศไทยก้าวเข้าสู่ "สังคมสูงวัยระดับสุดยอด" (Super-Aged Society) อย่างเต็มตัว เทคโนโลยีเข้ามามีบทบาทในการขับเคลื่อนเศรษฐกิจอย่างก้าวกระโดด ในแง่หนึ่ง ดิจิทัลแพลตฟอร์มช่วยให้ผู้สูงอายุสามารถเข้าถึงบริการสาธารณสุขทางไกล (Telemedicine) และการทำธุรกรรมทางการเงินที่สะดวกขึ้น 
            </p>
            <p style={{ marginBottom: '16px', textIndent: '30px' }}>
              ทว่าในอีกด้านหนึ่ง กลับพบว่ามีผู้สูงอายุจำนวนไม่น้อยที่ยังคงประสบปัญหา "ความเหลื่อมล้ำทางดิจิทัล" (Digital Divide) เนื่องจากขาดทักษะการใช้เทคโนโลยีและความกังวลด้านความปลอดภัยทางไซเบอร์ ซึ่งหากภาครัฐและเอกชนไม่เร่งเข้ามาเติมเต็มทักษะเหล่านี้ ช่องว่างระหว่างวัยในโลกเศรษฐกิจอาจกลายเป็นปัญหาเชิงโครงสร้างที่ยากจะแก้ไข
            </p>
          </div>
        </div>
      );
    } else if (currentIdx >= 5 && currentIdx <= 9) {
      return (
        <div className="glass-panel" style={{ padding: '32px', height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, #a855f7, #7e22ce)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
            <BookOpen size={32} />
          </div>
          <h2 style={{ fontSize: '2rem', color: 'var(--color-primary-dark)', marginBottom: '16px' }}>ภาษาระดับต่าง ๆ</h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>พิจารณาข้อความที่กำหนดให้ และเลือกคำตอบที่ถูกต้องที่สุดตามหลักการใช้ภาษาระดับต่าง ๆ</p>
        </div>
      );
    } else {
      return (
        <div className="glass-panel" style={{ padding: '32px', height: 'calc(100vh - 150px)', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', position: 'sticky', top: '0', background: 'var(--bg-glass)', padding: '10px 0', zIndex: 10 }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--color-primary-light)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={24} />
            </div>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary-dark)', margin: 0 }}>บทอ่านโคลงสี่สุภาพ</h2>
          </div>
          <div style={{ fontSize: '1.2rem', lineHeight: '2.5', color: 'var(--text-main)', padding: '32px', background: 'rgba(255,255,255,0.6)', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <div style={{ display: 'inline-block', textAlign: 'left' }}>
              <p>อ่อนหวานมานมิตรล้น &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; เหลือหลาย</p>
              <p>หยาบบ่มีเกลอกราย &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; เกลื่อนใกล้</p>
              <p>ดุดดวงศศิฉาย &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ดาวดาษ ประดับนา</p>
              <p>สุริยส่องดาราไว้ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; เมื่อร้อนแรงแสง</p>
            </div>
            <p style={{ marginTop: '24px', fontStyle: 'italic', color: 'var(--text-muted)' }}>- สุภาษิตพระร่วง -</p>
          </div>
        </div>
      );
    }
  };

  const renderMatchingGame = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <h3 style={{ fontSize: '1.3rem', marginBottom: '16px', color: 'var(--text-main)', lineHeight: '1.6' }}>
          {currentQ.q}
        </h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>
          คลิกที่คำประพันธ์ด้านซ้าย แล้วคลิกที่ความหมายด้านขวาเพื่อโยงเส้นจับคู่
        </p>
        
        <div ref={matchContainerRef} style={{ position: 'relative', flex: 1, display: 'flex', justifyContent: 'space-between', gap: '40px' }}>
          {/* SVG Overlay for Lines */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
            {lineCoords.map(line => (
              <line 
                key={line.id} 
                x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} 
                stroke={line.color} 
                strokeWidth="4" 
                strokeLinecap="round"
                style={{ transition: 'stroke 0.3s ease' }}
              />
            ))}
          </svg>

          {/* Left Column */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 2 }}>
            {currentQ.pairs.map(pair => {
              const isSelected = selectedLeft === pair.leftId;
              const isConnected = connections.some(c => c.leftId === pair.leftId);
              let bg = 'rgba(255,255,255,0.9)';
              let borderColor = isSelected ? 'var(--color-primary)' : 'transparent';
              
              if (matchingSubmitted) {
                const conn = connections.find(c => c.leftId === pair.leftId);
                if (conn && conn.rightId === pair.rightId) {
                  borderColor = '#10b981';
                  bg = 'rgba(16, 185, 129, 0.1)';
                } else {
                  borderColor = '#ef4444';
                  bg = 'rgba(239, 68, 68, 0.1)';
                }
              }

              return (
                <div 
                  key={pair.leftId} id={pair.leftId}
                  onClick={() => handleLeftClick(pair.leftId)}
                  style={{ 
                    padding: '16px', borderRadius: '12px', background: bg, 
                    border: `2px solid ${borderColor}`, cursor: matchingSubmitted ? 'default' : 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)', flex: 1, display: 'flex', alignItems: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  {pair.left}
                </div>
              );
            })}
          </div>

          {/* Right Column */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 2 }}>
            {shuffledRightItems.map(pair => {
              const isConnected = connections.some(c => c.rightId === pair.rightId);
              let bg = 'rgba(255,255,255,0.9)';
              let borderColor = 'transparent';
              
              if (matchingSubmitted) {
                const conn = connections.find(c => c.rightId === pair.rightId);
                if (conn) {
                  const originalPair = currentQ.pairs.find(p => p.leftId === conn.leftId);
                  if (originalPair && originalPair.rightId === pair.rightId) {
                    borderColor = '#10b981';
                    bg = 'rgba(16, 185, 129, 0.1)';
                  } else {
                    borderColor = '#ef4444';
                    bg = 'rgba(239, 68, 68, 0.1)';
                  }
                }
              }

              return (
                <div 
                  key={pair.rightId} id={pair.rightId}
                  onClick={() => handleRightClick(pair.rightId)}
                  style={{ 
                    padding: '16px', borderRadius: '12px', background: bg, 
                    border: `2px solid ${borderColor}`, cursor: matchingSubmitted ? 'default' : 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)', flex: 1, display: 'flex', alignItems: 'center',
                    transition: 'all 0.2s', fontSize: '0.95rem'
                  }}
                >
                  {pair.right}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
          {!matchingSubmitted ? (
            <button 
              onClick={checkMatching} 
              disabled={connections.length < 4}
              className="btn-primary" 
              style={{ padding: '12px 32px', borderRadius: '30px', opacity: connections.length < 4 ? 0.5 : 1 }}
            >
              ตรวจสอบคำตอบ
            </button>
          ) : (
            <button onClick={handleNext} className="btn-primary" style={{ padding: '12px 32px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ข้อถัดไป <ArrowRight size={20} />
            </button>
          )}
        </div>
      </div>
    );
  };

  if (phase === 'result') {
    const maxScore = questions.reduce((acc, q) => acc + (q.type === 'matching' ? 4 : 1), 0);

    return (
      <div className="animate-fade-in px-4 py-8 max-w-2xl mx-auto text-center">
        <div className="glass-panel" style={{ padding: '48px', marginTop: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', marginBottom: '24px' }}>
            <CheckCircle size={40} />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--color-primary-dark)' }}>ทำแบบทดสอบการอ่านสำเร็จ!</h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '32px' }}>
            คุณได้คะแนนส่วนนี้ <strong style={{ color: 'var(--color-primary)', fontSize: '1.5rem' }}>{score}</strong> คะแนน (จาก {maxScore} คะแนน)
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
        {renderLeftPanel()}

        {/* Right Column: Questions */}
        <div className="glass-panel" style={{ padding: '32px', height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.3rem', color: 'var(--color-primary-dark)', margin: 0 }}>
              {currentQ.type === 'matching' ? 'ส่วนที่ 3 (จับคู่)' : `ตอบคำถามส่วนที่ ${currentIdx <= 4 ? '1' : currentIdx <= 9 ? '2' : '3'}`}
            </h2>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {currentQ.type === 'matching' ? 'ข้อที่ 11' : `ข้อที่ ${currentIdx + 1}`} / {questions.length}
            </div>
          </div>

          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
            {currentQ.type === 'matching' ? '' :
             currentIdx <= 4 ? 'คำชี้แจง : ให้ผู้เรียนอ่านบทความฝั่งซ้ายแล้วตอบคำถามให้ถูกต้อง' : 
             currentIdx <= 9 ? 'คำชี้แจง : อ่านโจทย์แล้วเลือกคำตอบที่สอดคล้องกับภาษาระดับต่าง ๆ' : 
             'คำชี้แจง : ให้ผู้เรียนอ่านคำประพันธ์ฝั่งซ้าย แล้วตอบคำถามให้ถูกต้อง'}
          </p>

          {currentQ.type === 'matching' ? (
            renderMatchingGame()
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '32px', color: 'var(--text-main)', lineHeight: '1.6' }}>
                {currentQ.q}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
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
                    justifyContent: 'flex-start',
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
                  const prefix = prefixMap[index];

                  return (
                    <button 
                      key={index} 
                      onClick={() => handleSelect(option)}
                      disabled={showResult}
                      style={btnStyle}
                    >
                      {showResult && option.isCorrect && <CheckCircle size={20} color="#10b981" style={{ flexShrink: 0 }} />}
                      {showResult && isSelected && !option.isCorrect && <XCircle size={20} color="#ef4444" style={{ flexShrink: 0 }} />}
                      {!showResult && <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid var(--color-primary-light)', flexShrink: 0 }} />}
                      <span>{prefix} {option.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {showResult && currentQ.type !== 'matching' && (
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
