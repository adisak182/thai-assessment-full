import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Trophy, XCircle, ArrowRight, RefreshCw, CheckCircle } from 'lucide-react';
import { useUser } from '../context/UserContext';
import confetti from 'canvas-confetti';

// ===== QUESTION DATA =====

// Section A: Reading comprehension – มารยาทการฟังและการดู (ข้อ 41-45)
const ARTICLE_A = `"การฟังและการดูเป็นสิ่งสำคัญในชีวิตประจำวัน มารยาทที่ดีควรเริ่มจากการตั้งใจฟัง ไม่พูดแทรกขณะผู้อื่นกำลังพูด หากสงสัยควรจดบันทึกไว้ถามเมื่อผู้พูดพูดจบในที่สาธารณะ เช่น โรงภาพยนตร์หรือห้องสมุด เราไม่ควรส่งเสียงดังรบกวนผู้อื่น และไม่ควรแสดงกิริยาที่ไม่สุภาพ เช่น การโห่ร้อง หรือการใช้โทรศัพท์มือถือขณะร่วมกิจกรรม การมีมารยาทที่ดีจะช่วยให้เราได้รับความรู้และเป็นที่รักของคนรอบข้าง"`;
const sectionAQ = [
  { id: 41, question: 'ข้อ 41. มารยาทที่ดีควรเริ่มจากสิ่งใดเป็นอันดับแรก ?', options: [{ text: 'ก. การตั้งใจฟัง', correct: true }, { text: 'ข. การพูดคุยกับเพื่อน', correct: false }] },
  { id: 42, question: 'ข้อ 42. ขณะที่ครูกำลังพูด ผู้เรียนควรทำอย่างไร ?', options: [{ text: 'ก. พูดแทรกทันที', correct: false }, { text: 'ข. ฟังอย่างสงบ', correct: true }] },
  { id: 43, question: 'ข้อ 43. หากผู้เรียนมีข้อสงสัยขณะฟัง ควรปฏิบัติอย่างไร ?', options: [{ text: 'ก. ยกมือถามแทรกทันที', correct: false }, { text: 'ข. จดบันทึกไว้ถามภายหลัง', correct: true }] },
  { id: 44, question: 'ข้อ 44. ขณะดูการแสดงบนเวที การกระทำใดถือว่า "เสียมารยาท" ?', options: [{ text: 'ก. การโห่ร้องเยาะเย้ย', correct: true }, { text: 'ข. การปรบมือเมื่อจบการแสดง', correct: false }] },
  { id: 45, question: 'ข้อ 45. การมีมารยาทในการฟังและการดู ส่งผลดีต่อผู้เรียนอย่างไร ?', options: [{ text: 'ก. ทำให้เป็นที่รักและได้รับความรู้', correct: true }, { text: 'ข. ทำให้เรียนจบเร็วขึ้น', correct: false }] },
];

// Section B: 6 โรคฝน (ข้อ 46-50)
const ARTICLE_B = `รู้ไว้ป้องกันก่อน "6 โรค ที่มากับหน้าฝน" — นพ.กฤษดา ศิรามพุช เตือนให้ระวังการสัมผัสน้ำฝน เพราะมีสารปนเปื้อนและเชื้อโรค โดยเฉพาะ 6 โรคยอดฮิต ได้แก่ 1. โรคจากไวรัส (หวัด ไข้หวัดใหญ่) 2. คอติดเชื้อ 3. ท้องเสีย อาหารเป็นพิษ (เชื้ออีโคไล) 4. ผิวหนังอักเสบ 5. โรคฉี่หนู (น้ำขัง ทุ่งนา) 6. ไข้เลือดออก (ยุงลาย)`;
const sectionBQ = [
  { id: 46, question: 'ข้อ 46. บทความนี้มีวัตถุประสงค์เพื่ออะไร ?', options: [{ text: 'ก. ให้ความบันเทิง', correct: false }, { text: 'ข. สอนการทำอาหาร', correct: false }, { text: 'ค. แนะนำสถานที่ท่องเที่ยว', correct: false }, { text: 'ง. ให้ความรู้และเตือนภัยเกี่ยวกับโรคในหน้าฝน', correct: true }] },
  { id: 47, question: 'ข้อ 47. ข้อใดเป็นสาเหตุสำคัญที่ทำให้เกิดโรคในหน้าฝน ?', options: [{ text: 'ก. อากาศหนาว', correct: false }, { text: 'ข. การนอนน้อย', correct: false }, { text: 'ค. แสงแดดแรง', correct: false }, { text: 'ง. น้ำฝนมีสิ่งปนเปื้อนและเชื้อโรค', correct: true }] },
  { id: 48, question: 'ข้อ 48. โรคท้องเสียในบทความเกิดจากสาเหตุใด ?', options: [{ text: 'ก. การออกกำลังกาย', correct: false }, { text: 'ข. การพักผ่อนไม่พอ', correct: false }, { text: 'ค. การกินอาหารสะอาด', correct: false }, { text: 'ง. การกินอาหารหรือสิ่งที่ปนเปื้อนเชื้อโรค', correct: true }] },
  { id: 49, question: 'ข้อ 49. โรคฉี่หนูมักพบในบริเวณใด ?', options: [{ text: 'ก. ภูเขา', correct: false }, { text: 'ข. ทะเล', correct: false }, { text: 'ค. ห้างสรรพสินค้า', correct: false }, { text: 'ง. พื้นที่น้ำขัง เช่น ทุ่งนา', correct: true }] },
  { id: 50, question: 'ข้อ 50. หากในชุมชนมีน้ำขังจำนวนมาก ควรระวังโรคใดมากที่สุด ?', options: [{ text: 'ก. โรคหัวใจ', correct: false }, { text: 'ข. ไข้เลือดออก', correct: true }, { text: 'ค. โรคกระดูก', correct: false }, { text: 'ง. โรคสายตา', correct: false }] },
];

// Section B2: T/F (ข้อ 51-55)
const tfQ = [
  { id: 51, statement: 'ข้อ 51. ในช่วงหน้าฝนมีโรคหลายชนิดที่เกิดขึ้น', correct: 'fact' },
  { id: 52, statement: 'ข้อ 52. ปัจจุบันในน้ำฝนมีสารปนเปื้อนและเชื้อโรค', correct: 'fact' },
  { id: 53, statement: 'ข้อ 53. เราควรหลีกเลี่ยงการลุยน้ำสกปรกในช่วงหน้าฝน', correct: 'opinion' },
  { id: 54, statement: 'ข้อ 54. การล้างมือบ่อย ๆ ช่วยลดความเสี่ยงของการเกิดโรค', correct: 'fact' },
  { id: 55, statement: 'ข้อ 55. ทุกคนควรดูแลสุขภาพให้ดีในช่วงหน้าฝน', correct: 'opinion' },
];

// Section C: สังคมสูงวัย (ข้อ 56-60)
const ARTICLE_C = `ในยุคปัจจุบันที่ประเทศไทยก้าวเข้าสู่ "สังคมสูงวัยระดับสุดยอด" (Super-Aged Society) อย่างเต็มตัว เทคโนโลยีเข้ามามีบทบาทในการขับเคลื่อนเศรษฐกิจ ดิจิทัลแพลตฟอร์มช่วยให้ผู้สูงอายุสามารถเข้าถึงบริการสาธารณสุขทางไกล (Telemedicine) และการทำธุรกรรมทางการเงินที่สะดวกขึ้น ทว่ากลับพบว่ามีผู้สูงอายุจำนวนไม่น้อยที่ประสบปัญหา "ความเหลื่อมล้ำทางดิจิทัล" (Digital Divide) เนื่องจากขาดทักษะและความกังวลด้านความปลอดภัยทางไซเบอร์`;
const sectionCQ = [
  { id: 56, question: 'ข้อ 56. เทคโนโลยีมีประโยชน์ต่อผู้สูงอายุในด้านใดชัดเจนที่สุด ?', options: [{ text: 'ก. การเพิ่มรายได้จากการขายของออนไลน์', correct: false }, { text: 'ข. การเข้าถึงบริการสาธารณสุขทางไกล', correct: true }, { text: 'ค. การสร้างความบันเทิงในครอบครัว', correct: false }, { text: 'ง. การลดค่าใช้จ่ายในชีวิตประจำวัน', correct: false }] },
  { id: 57, question: 'ข้อ 57. คำว่า "สังคมสูงวัยระดับสุดยอด" ตามบริบทหมายถึงข้อใด ?', options: [{ text: 'ก. สังคมที่มีผู้สูงอายุเป็นผู้นำประเทศ', correct: false }, { text: 'ข. สังคมที่ยกย่องให้ผู้สูงอายุเป็นบุคคลสำคัญ', correct: false }, { text: 'ค. สังคมที่มีสัดส่วนผู้สูงอายุสูงมากตามเกณฑ์กำหนด', correct: true }, { text: 'ง. สังคมที่ผู้สูงอายุทุกคนใช้เทคโนโลยีได้อย่างเชี่ยวชาญ', correct: false }] },
  { id: 58, question: 'ข้อ 58. สาเหตุหลักที่ทำให้เกิด "ความเหลื่อมล้ำทางดิจิทัล" ในกลุ่มผู้สูงอายุคืออะไร ?', options: [{ text: 'ก. ลูกหลานไม่มีเวลาสอนการใช้งาน', correct: false }, { text: 'ข. ราคาของอุปกรณ์ดิจิทัลที่สูงเกินไป', correct: false }, { text: 'ค. สัญญาณอินเทอร์เน็ตเข้าไม่ถึงพื้นที่ห่างไกล', correct: false }, { text: 'ง. ขาดทักษะและความกังวลเรื่องความปลอดภัย', correct: true }] },
  { id: 59, question: 'ข้อ 59. ข้อใดคือ ใจความสำคัญ ของบทความนี้ ?', options: [{ text: 'ก. เทคโนโลยีคือทางออกเดียวของผู้สูงอายุ', correct: false }, { text: 'ข. ประเทศไทยกำลังเข้าสู่สังคมผู้สูงอายุอย่างรวดเร็ว', correct: false }, { text: 'ค. บริการสาธารณสุขทางไกลช่วยประหยัดงบประมาณ', correct: false }, { text: 'ง. ความจำเป็นในการลดช่องว่างทางดิจิทัลเพื่อรองรับสังคมสูงวัย', correct: true }] },
  { id: 60, question: 'ข้อ 60. แนวทางการแก้ปัญหาที่สอดคล้องกับบทความนี้มากที่สุดคือข้อใด ?', options: [{ text: 'ก. ลดราคาอุปกรณ์ไอทีให้ถูกที่สุด', correct: false }, { text: 'ข. งดใช้เทคโนโลยีกับผู้สูงอายุเพื่อความปลอดภัย', correct: false }, { text: 'ค. ให้ผู้สูงอายุอาศัยอยู่ในสถานสงเคราะห์', correct: false }, { text: 'ง. จัดอบรมทักษะดิจิทัลและสร้างระบบความปลอดภัยที่ใช้ง่าย', correct: true }] },
];

// Section D: ระดับภาษา (ข้อ 61-65)
const sectionDQ = [
  { id: 61, question: 'ข้อ 61. "การที่วัยรุ่นสมัยนี้ติดเกมกันงอมแงมจนเสียการเรียน..." ข้อความนี้จัดอยู่ในภาษาระดับใด ?', options: [{ text: 'ก. ภาษาพิธีการ', correct: false }, { text: 'ข. ภาษาทางการ', correct: false }, { text: 'ค. ภาษากึ่งทางการ', correct: false }, { text: 'ง. ภาษาไม่เป็นทางการ (ภาษาปาก)', correct: true }] },
  { id: 62, question: 'ข้อ 62. ข้อความในข้อใดใช้ "ภาษาทางการ" ได้ถูกต้อง ?', options: [{ text: 'ก. คณะกรรมการมีมติเห็นชอบให้เลื่อนการประชุม', correct: true }, { text: 'ข. หมอแนะนำว่าเราไม่ควรทานอาหารที่มีรสจัดจนเกินไป', correct: false }, { text: 'ค. ตำรวจกำลังไล่ล่าโจรที่เข้าไปขโมยของในห้างสรรพสินค้า', correct: false }, { text: 'ง. นักเรียนทุกคนควรไปกินข้าวที่โรงอาหาร', correct: false }] },
  { id: 63, question: 'ข้อ 63. "ข้าพเจ้ามีความยินดีเป็นอย่างยิ่งที่ได้มาเป็นประธานในพิธีเปิดงาน..." มักพบในสถานการณ์ใด ?', options: [{ text: 'ก. การสนทนาระหว่างครูกับนักเรียน', correct: false }, { text: 'ข. การเขียนบทความในนิตยสาร', correct: false }, { text: 'ค. การกล่าวเปิดงานในพิธีการ', correct: true }, { text: 'ง. การรายงานข่าวทางวิทยุ', correct: false }] },
  { id: 64, question: 'ข้อ 64. คำว่า "เช็ก" ควรเปลี่ยนเป็นคำใดเพื่อให้เป็น "ภาษากึ่งทางการ" ที่เหมาะสม ?', options: [{ text: 'ก. พิสูจน์', correct: false }, { text: 'ข. ตรวจสอบ', correct: true }, { text: 'ค. สังเกตการณ์', correct: false }, { text: 'ง. พินิจพิจารณา', correct: false }] },
  { id: 65, question: 'ข้อ 65. ข้อความข้อใดใช้ระดับภาษา "ไม่สอดคล้อง" กับกลุ่มเพื่อนสนิท ?', options: [{ text: 'ก. เฮ้ย! เย็นนี้ไปหาอะไรกินกันดีวะ', correct: false }, { text: 'ข. แกเห็นปากกาของฉันที่วางอยู่บนโต๊ะไหม', correct: false }, { text: 'ค. ไปดูหนังกันเถอะ พลาดเรื่องนี้ไปเสียดายแย่เลย', correct: false }, { text: 'ง. ท่านมีความประสงค์จะไปร่วมรับประทานอาหารกับเราหรือไม่', correct: true }] },
];

// Section E: คำประพันธ์ matching (ข้อ 66-70)
const POEM = `อ่อนหวานมานมิตรล้น\tเหลือหลาย
หยาบบ่มีเกลอกราย\t\tเกลื่อนใกล้
ดุดดวงศศิฉาย\t\t\tดาวดาษ ประดับนา
สุริยส่องดาราไว้\t\t\tเมื่อร้อนแรงแสง`;

const matchData = [
  { id: 66, verse: 'อ่อนหวานมานมิตรล้น เหลือหลาย', meaning: 'คนที่พูดจาอ่อนหวาน สุภาพ จะมีเพื่อนมากมาย มีคนรักใคร่เอ็นดู' },
  { id: 67, verse: 'หยาบบ่มีเกลอกราย เกลื่อนใกล้', meaning: 'คนที่พูดจาหยาบคาย จะไม่มีเพื่อนแท้ หรือแทบไม่มีใครอยากอยู่ใกล้' },
  { id: 68, verse: 'ดุดดวงศศิฉาย ดาวดาษ ประดับนา', meaning: 'เปรียบเหมือนดวงจันทร์ (ศศิ) ที่ส่องแสงสวยงาม มีดวงดาวมากมายล้อมรอบประดับอยู่' },
  { id: 69, verse: 'สุริยส่องดาราไว้ เมื่อร้อนแรงแสง', meaning: 'เปรียบเหมือนดวงอาทิตย์ที่มีแสงร้อนแรง จนทำให้มองไม่เห็นดาว หรือไม่มีดาวอยู่ใกล้' },
];
const matchAnswers = { 66: 'คนที่พูดจาอ่อนหวาน สุภาพ จะมีเพื่อนมากมาย มีคนรักใคร่เอ็นดู', 67: 'คนที่พูดจาหยาบคาย จะไม่มีเพื่อนแท้ หรือแทบไม่มีใครอยากอยู่ใกล้', 68: 'เปรียบเหมือนดวงจันทร์ (ศศิ) ที่ส่องแสงสวยงาม มีดวงดาวมากมายล้อมรอบประดับอยู่', 69: 'เปรียบเหมือนดวงอาทิตย์ที่มีแสงร้อนแรง จนทำให้มองไม่เห็นดาว หรือไม่มีดาวอยู่ใกล้' };

const sectionEQ = [
  { id: 70, question: 'ข้อ 70. จากคำประพันธ์ข้างต้น ควรปฏิบัติตนตามข้อใดมากที่สุด ?', options: [{ text: 'ก. ใช้คำพูดสุภาพ อ่อนโยน เพื่อสร้างความสัมพันธ์ที่ดี', correct: true }, { text: 'ข. พูดตรงไปตรงมาโดยไม่สนใจความรู้สึกผู้อื่น', correct: false }, { text: 'ค. หลีกเลี่ยงการพูดคุยกับผู้อื่นเพื่อลดปัญหา', correct: false }, { text: 'ง. แสดงความเก่งเพื่อให้ผู้อื่นยอมรับ', correct: false }] },
];

function ResultModal({ score, total, onClose, onRetry }) {
  const pct = Math.round((score / total) * 100);
  const passed = score >= 21;
  const fire = useCallback(() => confetti({ particleCount: 150, spread: 80, origin: { y: 0.55 }, colors: ['#10b981', '#059669', '#fbbf24'], zIndex: 9999 }), []);
  useEffect(() => { if (passed) { fire(); setTimeout(fire, 1000); } }, [passed, fire]);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div className="animate-fade-in" style={{ background: 'white', borderRadius: '24px', padding: '48px 40px', maxWidth: '480px', width: '100%', textAlign: 'center', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ width: '90px', height: '90px', borderRadius: '50%', margin: '0 auto 24px', background: passed ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#ef4444,#dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          {passed ? <Trophy size={44} /> : <XCircle size={44} />}
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: passed ? '#059669' : '#dc2626', marginBottom: '8px' }}>{passed ? '🎉 ยอดเยี่ยม!' : '❌ ยังไม่ผ่านเกณฑ์'}</h2>
        <p style={{ color: '#6b7280', marginBottom: '28px' }}>{passed ? 'คุณทำทักษะการอ่านได้ดีมากครับ!' : 'ลองทำใหม่อีกครั้งนะครับ'}</p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '28px' }}>
          <div style={{ padding: '16px 28px', background: 'rgba(16,185,129,0.08)', borderRadius: '16px', border: '2px solid rgba(16,185,129,0.2)' }}>
            <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '4px' }}>คะแนน</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#059669', lineHeight: 1 }}>{score}</div>
            <div style={{ fontSize: '0.9rem', color: '#9ca3af' }}>จาก {total}</div>
          </div>
          <div style={{ padding: '16px 28px', background: passed ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', borderRadius: '16px', border: `2px solid ${passed ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
            <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '4px' }}>ร้อยละ</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: passed ? '#059669' : '#dc2626', lineHeight: 1 }}>{pct}%</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={onRetry} className="btn-secondary" style={{ padding: '12px 24px', borderRadius: '30px' }}>ทำใหม่</button>
          <button onClick={onClose} className="btn-primary" style={{ padding: '12px 28px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px' }}><ArrowRight size={18} /> ออก</button>
        </div>
      </div>
    </div>
  );
}

export default function ReadingTest() {
  const { recordScore } = useUser();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});      // { qId: correctness (bool) }
  const [selIdx, setSelIdx] = useState({});         // { qId: optionIndex }
  const [tfAnswers, setTfAnswers] = useState({});   // { qId: 'fact'|'opinion' }
  const [matchSel, setMatchSel] = useState({});     // { verseId: meaningText }
  const [showResult, setShowResult] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const totalQ = 30;
  const answeredMCQ = Object.keys(answers).length;
  const answeredTF = Object.keys(tfAnswers).length;
  const answeredMatch = Object.keys(matchSel).length;
  const answeredCount = answeredMCQ + answeredTF + answeredMatch;
  const progress = Math.round((answeredCount / totalQ) * 100);

  const calcScore = () => {
    let s = 0;
    Object.values(answers).forEach(v => { if (v) s++; });
    Object.entries(tfAnswers).forEach(([id, ans]) => {
      const q = tfQ.find(q => q.id === parseInt(id));
      if (q && ans === q.correct) s++;
    });
    Object.entries(matchSel).forEach(([vid, chosen]) => {
      if (matchAnswers[parseInt(vid)] === chosen) s++;
    });
    return s;
  };

  const pick = (qId, optCorrect, idx) => {
    setAnswers(prev => ({ ...prev, [qId]: optCorrect }));
    setSelIdx(prev => ({ ...prev, [qId]: idx }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const score = calcScore();
    try { await recordScore({ level: 1, skill: 'reading', score, maxScore: totalQ }); } catch (e) {}
    setShowResult(true);
    setSubmitting(false);
  };

  const SectionHeader = ({ num, title, sub }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', marginTop: '40px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>{num}</div>
      <div><h3 style={{ margin: 0, color: 'var(--color-primary-dark)', fontSize: '1.1rem' }}>{title}</h3>{sub && <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{sub}</p>}</div>
    </div>
  );

  const MCQCard = ({ q }) => (
    <div style={{ marginBottom: '16px' }}>
      <p style={{ fontWeight: '600', color: 'var(--color-primary-dark)', marginBottom: '12px' }}>{q.question}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {q.options.map((opt, i) => (
          <button key={i} onClick={() => pick(q.id, opt.correct, i)} className="option-btn"
            style={{ padding: '12px 16px', borderRadius: '10px', border: `2px solid ${selIdx[q.id] === i ? '#10b981' : 'rgba(0,0,0,0.08)'}`, background: selIdx[q.id] === i ? 'rgba(16,185,129,0.1)' : 'white', color: '#374151', textAlign: 'left', cursor: 'pointer', fontWeight: selIdx[q.id] === i ? '600' : '400', transition: 'all 0.2s', fontFamily: 'inherit', fontSize: '0.95rem' }}>
            {opt.text}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>
      {showResult && <ResultModal score={calcScore()} total={totalQ} onClose={() => navigate('/skills')} onRetry={() => { setAnswers({}); setSelIdx({}); setTfAnswers({}); setMatchSel({}); setShowResult(false); }} />}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <Link to="/skills" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: '500', marginBottom: '8px', display: 'block' }}>← กลับหน้าเลือกทักษะ</Link>
          <h1 style={{ margin: 0, color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BookOpen size={28} color="#059669" /> ทักษะการอ่าน (30 ข้อ)
          </h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>ตอบแล้ว {answeredCount} / {totalQ}</div>
          <div style={{ height: '8px', width: '150px', borderRadius: '999px', background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,#10b981,#059669)', borderRadius: '999px', transition: 'width 0.3s' }} />
          </div>
        </div>
      </div>

      {/* Section A */}
      <SectionHeader num="A" title='มารยาทการฟังและการดู (ข้อ 41-45)' sub="อ่านบทความแล้วตอบคำถาม" />
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px', background: 'rgba(16,185,129,0.04)', borderLeft: '4px solid #10b981' }}>
        <p style={{ margin: 0, color: 'var(--color-primary-dark)', lineHeight: '1.9', fontSize: '0.95rem' }}>{ARTICLE_A}</p>
      </div>
      <div className="glass-panel" style={{ padding: '24px' }}>
        {sectionAQ.map(q => <MCQCard key={q.id} q={q} />)}
      </div>

      {/* Section B */}
      <SectionHeader num="B" title='6 โรคที่มากับหน้าฝน (ข้อ 46-55)' sub="อ่านบทความ แล้วตอบ MCQ และแยกแยะข้อเท็จจริง/ข้อคิดเห็น" />
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px', background: 'rgba(16,185,129,0.04)', borderLeft: '4px solid #10b981' }}>
        <p style={{ margin: 0, color: 'var(--color-primary-dark)', lineHeight: '1.9', fontSize: '0.95rem' }}>{ARTICLE_B}</p>
      </div>
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '16px' }}>
        {sectionBQ.map(q => <MCQCard key={q.id} q={q} />)}
      </div>
      {/* T/F */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <p style={{ fontWeight: '600', color: 'var(--color-primary-dark)', marginBottom: '16px' }}>ให้พิจารณาว่าแต่ละข้อความเป็น "ข้อเท็จจริง" หรือ "ข้อคิดเห็น"</p>
        {tfQ.map(q => (
          <div key={q.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.06)', flexWrap: 'wrap' }}>
            <p style={{ margin: 0, color: 'var(--color-primary-dark)', fontSize: '0.95rem', flex: 1, minWidth: '200px' }}>{q.statement}</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[{ label: 'ข้อเท็จจริง', val: 'fact' }, { label: 'ข้อคิดเห็น', val: 'opinion' }].map(({ label, val }) => (
                <button key={val} onClick={() => setTfAnswers(prev => ({ ...prev, [q.id]: val }))} className="option-btn"
                  style={{ padding: '8px 14px', borderRadius: '20px', border: `2px solid ${tfAnswers[q.id] === val ? '#10b981' : 'rgba(0,0,0,0.1)'}`, background: tfAnswers[q.id] === val ? 'rgba(16,185,129,0.1)' : 'white', color: tfAnswers[q.id] === val ? '#059669' : '#6b7280', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem', transition: 'all 0.2s' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Section C */}
      <SectionHeader num="C" title='สังคมสูงวัยกับเศรษฐกิจดิจิทัล (ข้อ 56-60)' sub="อ่านบทความเชิงวิเคราะห์แล้วตอบคำถาม" />
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px', background: 'rgba(16,185,129,0.04)', borderLeft: '4px solid #10b981' }}>
        <p style={{ margin: 0, color: 'var(--color-primary-dark)', lineHeight: '1.9', fontSize: '0.95rem' }}>{ARTICLE_C}</p>
      </div>
      <div className="glass-panel" style={{ padding: '24px' }}>
        {sectionCQ.map(q => <MCQCard key={q.id} q={q} />)}
      </div>

      {/* Section D */}
      <SectionHeader num="D" title='ระดับภาษา (ข้อ 61-65)' sub="วิเคราะห์ระดับภาษาในแต่ละสถานการณ์" />
      <div className="glass-panel" style={{ padding: '24px' }}>
        {sectionDQ.map(q => <MCQCard key={q.id} q={q} />)}
      </div>

      {/* Section E: Poem matching + MCQ */}
      <SectionHeader num="E" title='คำประพันธ์สุภาษิตพระร่วง (ข้อ 66-70)' sub="จับคู่ความหมายและตอบคำถาม" />
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '16px', background: 'rgba(16,185,129,0.04)', borderLeft: '4px solid #10b981' }}>
        <pre style={{ fontFamily: 'Kanit, sans-serif', color: 'var(--color-primary-dark)', lineHeight: '2', margin: 0, fontSize: '1rem', whiteSpace: 'pre-wrap' }}>{POEM}</pre>
        <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>— สุภาษิตพระร่วง</p>
      </div>
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '16px' }}>
        <p style={{ fontWeight: '600', color: 'var(--color-primary-dark)', marginBottom: '16px' }}>จับคู่คำประพันธ์ (ข้อ 66-69) ให้ตรงกับความหมาย:</p>
        {matchData.map(m => {
          const currentSel = matchSel[m.id];
          return (
            <div key={m.id} style={{ marginBottom: '20px' }}>
              <p style={{ fontWeight: '600', color: '#1e3a8a', fontStyle: 'italic', marginBottom: '10px' }}>ข้อ {m.id}. "{m.verse}"</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {matchData.map(opt => (
                  <button key={opt.id} onClick={() => setMatchSel(prev => ({ ...prev, [m.id]: opt.meaning }))} className="option-btn"
                    style={{ padding: '10px 14px', borderRadius: '10px', border: `2px solid ${currentSel === opt.meaning ? '#10b981' : 'rgba(0,0,0,0.08)'}`, background: currentSel === opt.meaning ? 'rgba(16,185,129,0.1)' : 'white', color: '#374151', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem', transition: 'all 0.2s' }}>
                    {opt.meaning}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="glass-panel" style={{ padding: '24px' }}>
        {sectionEQ.map(q => <MCQCard key={q.id} q={q} />)}
      </div>

      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <button onClick={handleSubmit} disabled={submitting} className="btn-primary"
          style={{ padding: '16px 48px', fontSize: '1.1rem', borderRadius: '30px', display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 8px 20px rgba(16,185,129,0.4)', opacity: submitting ? 0.7 : 1 }}>
          {submitting ? <><RefreshCw size={20} className="spin" /> บันทึก...</> : <><Trophy size={20} /> ส่งคำตอบและดูผล</>}
        </button>
        <p style={{ color: 'var(--text-muted)', marginTop: '12px', fontSize: '0.9rem' }}>ตอบแล้ว {answeredCount} จาก {totalQ} ข้อ</p>
      </div>
    </div>
  );
}
