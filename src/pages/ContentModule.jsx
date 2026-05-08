import { useParams, Link } from 'react-router-dom';

export default function ContentModule() {
  const { id } = useParams();

  const lessons = {
    1: [
      { id: 1, title: 'พยัญชนะไทยเบื้องต้น', content: 'ก ข ฃ ค ฅ ฆ ง จ ฉ ช ซ ฌ ญ ฎ ฏ ฐ ฑ ฒ ณ ด ต ถ ท ธ น บ ป ผ ฝ พ ฟ ภ ม ย ร ล ว ศ ษ ส ห ฬ อ ฮ' },
      { id: 2, title: 'การผสมสระ', content: 'สระ อะ อา อิ อี อึ อื อุ อู เอ แอ โอ ออ' },
      { id: 3, title: 'การผันวรรณยุกต์', content: 'สามัญ เอก โท ตรี จัตวา (เช่น กา ก่า ก้า ก๊า ก๋า)' }
    ],
    2: [
      { id: 1, title: 'ประโยคพื้นฐาน', content: 'สวัสดี ประโยคที่มี ประธาน กริยา กรรม (เช่น ฉันกินข้าว, น้องไปโรงเรียน)' },
      { id: 2, title: 'การสนทนาซื้อของ', content: 'อันนี้ราคาเท่าไหร่ครับ? ลดได้ไหมคะ?' },
      { id: 3, title: 'ประโยคคำถาม', content: 'ใคร ทำอะไร ที่ไหน เมื่อไหร่ อย่างไร ทำไม' }
    ],
    3: [
      { id: 1, title: 'บทความยาว', content: 'การอ่านนิทานอีสป ข่าวสาร หรือบทความขนาดสั้นเพื่อจับใจความสำคัญ' },
      { id: 2, title: 'คำศัพท์เฉพาะทาง', content: 'คำศัพท์สำหรับการทำงาน ทักษะวิชาชีพ และเทคโนโลยี' },
      { id: 3, title: 'อภิปรายและแสดงความคิดเห็น', content: 'ฉันคิดว่า... ในมุมมองของฉัน...' }
    ]
  };

  const currentLessons = lessons[id] || lessons[1];

  return (
    <div className="animate-fade-in px-4 py-8">
      <Link to={`/level/${id}`} style={{ color: 'var(--color-primary)', fontWeight: '500', marginBottom: '24px', display: 'inline-block', textDecoration: 'none' }}>
        &larr; กลับไปหน้า Level {id}
      </Link>
      
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '32px', marginTop: '16px' }}>
        <h2 style={{ fontSize: '2rem', color: 'var(--color-primary-dark)', marginBottom: '8px' }}>บทเรียนเนื้อหา - Level {id}</h2>
        <p style={{ color: 'var(--text-muted)' }}>อ่านและศึกษาเนื้อหาก่อนเริ่มทำแบบทดสอบและเกม</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {currentLessons.map((lesson, idx) => (
          <div key={lesson.id} className="glass-card" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary)', marginBottom: '16px' }}>บทที่ {idx + 1}: {lesson.title}</h3>
            <p style={{ color: 'var(--text-main)', marginBottom: '24px', lineHeight: '1.8', fontSize: '1.1rem' }}>{lesson.content}</p>
            <button className="btn-secondary">อ่านเนื้อหาแบบเต็ม</button>
          </div>
        ))}
      </div>
    </div>
  );
}
