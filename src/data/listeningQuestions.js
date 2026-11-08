// ===== QUESTION DATA =====
// Section A: Vocab flashcards (ข้อ 1-3) - 2 options
export const vocabQ = [
  { id: 1, word: 'สร้อย', audio: '/audio/vocab_1.mp3', image: '/images/vocab_1_necklace_1777619701174.png',
    question: 'ข้อ 1. คำว่า "สร้อย" อ่านอย่างไร ?',
    options: [{ text: 'ก. สะ-ร้อย', correct: false }, { text: 'ข. ส้อย', correct: true }] },
  { id: 2, word: 'ปลอดภัย', audio: '/audio/vocab_2.mp3', image: '/images/vocab_2_safety_1777619714847.png',
    question: 'ข้อ 2. คำว่า "ปลอดภัย" อ่านอย่างไร ?',
    options: [{ text: 'ก. ปลอด-พัย', correct: true }, { text: 'ข. ปะ-ลอด-พัย', correct: false }] },
  { id: 3, word: 'ภูมิปัญญา', audio: '/audio/vocab_3.mp3', image: '/images/vocab_4_wisdom_1777619757158.png',
    question: 'ข้อ 3. คำว่า "ภูมิปัญญา" อ่านอย่างไร ?',
    options: [{ text: 'ก. พู-มิ-ปัน-ยา', correct: false }, { text: 'ข. พูม-ปัน-ยา', correct: true }] },
];

// Section B: Short announcements (ข้อ 4-6) - 2 options
export const announcementQ = [
  { id: 4, audio: '/audio/announce_1.mp3',
    script: '"ประกาศ... ห้ามลงเล่นน้ำในบริเวณนี้เนื่องจากน้ำลึกและไหลเชี่ยว"',
    question: 'ข้อ 4. ข้อใดเป็นคำเตือนจากประกาศนี้ ?',
    options: [{ text: 'ก. ห้ามว่ายน้ำ', correct: true }, { text: 'ข. ห้ามตกปลา', correct: false }] },
  { id: 5, audio: '/audio/announce_2.mp3',
    script: '"โปรดทิ้งขยะลงถังให้ถูกประเภท"',
    question: 'ข้อ 5. ข้อใดที่ท่านควรพึงปฏิบัติ ?',
    options: [{ text: 'ก. ทิ้งขยะรวมกัน', correct: false }, { text: 'ข. แยกขยะก่อนทิ้ง', correct: true }] },
  { id: 6, audio: '/audio/announce_3.mp3',
    script: '"เมื่อทำข้อสอบเสร็จแล้ว ให้วางกระดาษคำตอบบนโต๊ะแล้วเดินออกจากห้องเงียบ ๆ"',
    question: 'ข้อ 6. ข้อใดไม่ควรปฏิบัติ ?',
    options: [{ text: 'ก. เดินออกจากห้องเบา ๆ', correct: false }, { text: 'ข. ตะโกนบอกเพื่อนว่าทำเสร็จแล้ว', correct: true }] },
];

// Section C: Story questions (ข้อ 7-9)
export const STORY_AUDIO = '/audio/story_donkey_merchant_new.m4a';
export const STORY_IMG = '/images/story_donkey_merchant_1777621288896.png';
export const storyQ = [
  { id: 7, question: 'ข้อ 7. พ่อค้าบรรทุกสิ่งใดไว้บนหลังลาในครั้งแรก ?',
    options: [{ text: 'ก. กระสอบเกลือ', correct: true }, { text: 'ข. กระสอบนุ่น', correct: false }] },
  { id: 8, question: 'ข้อ 8. เพราะเหตุใดลาจึงรู้สึกว่าของเบาลง หลังจากตกน้ำครั้งแรก ?',
    options: [{ text: 'ก. พ่อค้าช่วยยกของออก', correct: false }, { text: 'ข. เกลือละลายไปกับน้ำ', correct: true }] },
  { id: 9, question: 'ข้อ 9. ข้อคิดจากนิทานเรื่องนี้ตรงกับข้อใด ?',
    options: [
      { text: 'ก. ความเจ้าเล่ห์เพื่อเลี่ยงงานหนัก มักนำมาซึ่งความลำบากที่มากกว่าเดิม', correct: true },
      { text: 'ข. ความพยายามอยู่ที่ไหน ความสำเร็จอยู่ที่นั่น', correct: false }
    ] },
];

// Section D: 4-option vocab (ข้อ 10-11)
export const vocab4Q = [
  { id: 10, audio: '/audio/vocab_4.mp3', word: '"กงสุล"',
    question: 'ข้อ 10. คำศัพท์ที่ฟังตรงกับข้อใด ?',
    options: [
      { text: 'ก. กงสน', correct: false }, { text: 'ข. กงสุล', correct: true },
      { text: 'ค. กงสุน', correct: false }, { text: 'ง. กงศุล', correct: false }
    ] },
  { id: 11, audio: '/audio/vocab_5.mp3', word: '"วาทศิลป์"',
    question: 'ข้อ 11. คำศัพท์ที่ฟังตรงกับข้อใด ?',
    options: [
      { text: 'ก. วาทศิลป์', correct: true }, { text: 'ข. วาทสิน', correct: false },
      { text: 'ค. วาทศิล', correct: false }, { text: 'ง. วาทสินป์', correct: false }
    ] },
];

// Section E: Proverbs (ข้อ 12-14)
export const proverbQ = [
  { id: 12, audio: '/audio/announce_4.mp3', saying: '"จับปลาสองมือ"',
    question: 'ข้อ 12. สำนวนนี้มีความหมายตรงกับข้อใด ?',
    options: [
      { text: 'ก. เลือกทำสิ่งที่ง่ายที่สุด', correct: false },
      { text: 'ข. ทำงานอย่างตั้งใจและรอบคอบ', correct: false },
      { text: 'ค. ทำสิ่งใดสิ่งหนึ่งเพียงอย่างเดียว', correct: false },
      { text: 'ง. ทำหลายอย่างพร้อมกันจนไม่สำเร็จสักอย่าง', correct: true }
    ] },
  { id: 13, audio: '/audio/announce_5.mp3', saying: '"น้ำขึ้นให้รีบตัก"',
    question: 'ข้อ 13. สำนวนนี้มีความหมายตรงกับข้อใด ?',
    options: [
      { text: 'ก. รีบทำเมื่อมีโอกาสดี', correct: true },
      { text: 'ข. ทำงานอย่างไม่เร่งรีบ', correct: false },
      { text: 'ค. ทำงานตามลำดับขั้นตอน', correct: false },
      { text: 'ง. รอเวลาที่เหมาะสมก่อนลงมือทำ', correct: false }
    ] },
  { id: 14, audio: '/audio/story_1.mp3', saying: '"มือไม่พาย เอาเท้าราน้ำ"',
    question: 'ข้อ 14. สำนวนนี้มีความหมายตรงกับข้อใด ?',
    options: [
      { text: 'ก. ทำงานอย่างมีความสุข', correct: false },
      { text: 'ข. ทำงานด้วยความรวดเร็ว', correct: false },
      { text: 'ค. ช่วยเหลือผู้อื่นอย่างเต็มที่', correct: false },
      { text: 'ง. ไม่ช่วยแล้วยังขัดขวางผู้อื่น', correct: true }
    ] },
];

// Section F: Article T/F (ข้อ 15-19) - true/false
export const ARTICLE_AUDIO = '/audio/record6_new.m4a';
export const tfQ = [
  { id: 15, statement: 'ข้อ 15. การใช้สื่อไม่มีผลเสียต่อสุขภาพ', correct: false },
  { id: 16, statement: 'ข้อ 16. เด็กที่ติดจอสามารถควบคุมอารมณ์ได้', correct: false },
  { id: 17, statement: 'ข้อ 17. การใช้สื่อต้องมีผู้ปกครองควบคุมดูแลอย่างใกล้ชิด', correct: true },
  { id: 18, statement: 'ข้อ 18. การใช้จอมากเกินไปส่งผลเสียต่อพัฒนาการด้านต่างๆ', correct: true },
  { id: 19, statement: 'ข้อ 19. ผู้ปกครองควรเลือกโปรแกรมหรือแอปพลิเคชันที่เหมาะสมกับวัย', correct: true },
];

// Section G: Announcement MCQ (ข้อ 20-21)
export const ANN_COLD_AUDIO = '/audio/l3_listen_announcement.mp3';
export const annColdQ = [
  { id: 20, question: 'ข้อ 20. จุดประสงค์หลักของประกาศนี้คืออะไร ?',
    options: [
      { text: 'ก. รายงานสภาพอากาศประจำวัน', correct: false },
      { text: 'ข. เตือนให้เตรียมรับมือกับภัยหนาว', correct: true },
      { text: 'ค. แนะนำวิธีการปลูกพืชในฤดูหนาว', correct: false },
      { text: 'ง. ประชาสัมพันธ์โครงการช่วยเหลือเกษตรกร', correct: false }
    ] },
  { id: 21, question: 'ข้อ 21. กลุ่มเป้าหมายหลักของประกาศนี้คือใคร ?',
    options: [
      { text: 'ก. ปศุสัตว์จังหวัด', correct: false },
      { text: 'ข. พ่อค้าคนกลาง', correct: false },
      { text: 'ค. ผู้ที่อาศัยอยู่ในเมือง', correct: false },
      { text: 'ง. เกษตรกรและผู้เลี้ยงสัตว์', correct: true }
    ] },
];

// Section H: Ad questions (ข้อ 22-23)
export const AD_AUDIO = '/audio/ad_new.m4a';
export const adQ = [
  { id: 22, question: 'ข้อ 22. คำพูดในข้อใดมีลักษณะเป็น การโฆษณาเกินจริง ?',
    options: [
      { text: 'ก. จดจำแม่นยำเหมือนวัยหนุ่มสาว', correct: true },
      { text: 'ข. สั่งซื้อวันนี้ลดทันที 50%', correct: false },
      { text: 'ค. สารสกัดจากธรรมชาติ', correct: false },
      { text: 'ง. ผ่านการวิจัยมาแล้ว', correct: false }
    ] },
  { id: 23, question: 'ข้อ 23. หาก "สมชาย" จะตัดสินใจซื้อผลิตภัณฑ์นี้อย่างมีวิจารณญาณ ควรทำสิ่งใดเป็นอันดับแรก ?',
    options: [
      { text: 'ก. รีบสั่งซื้อทันทีเพราะลดราคาถึง 50%', correct: false },
      { text: 'ข. ลองซื้อมาทานดูก่อนเพราะเป็นสารสกัดจากธรรมชาติ', correct: false },
      { text: 'ค. สอบถามความเห็นจากเพื่อนในโซเชียลมีเดีย', correct: false },
      { text: 'ง. ตรวจสอบเลขทะเบียน อย. และงานวิจัยที่อ้างถึง', correct: true }
    ] },
];

// Section I: Polysemy & spelling (ข้อ 24-25)
export const lastQ = [
  { id: 24, audio: '/audio/l3_listen_q14.mp3',
    script: '"เขาหัวเราะจน ขัน ที่ถืออยู่สั่นไปมา เพราะนึกถึงเรื่อง ขัน ที่เพื่อนเล่า"',
    question: 'ข้อ 24. คำว่า "ขัน" คำแรก มีความหมายตรงกับข้อใด ?',
    options: [
      { text: 'ก. ภาชนะตักน้ำ', correct: true },
      { text: 'ข. ตลกขบขัน', correct: false },
      { text: 'ค. การทำให้ตึง', correct: false },
      { text: 'ง. เสียงร้องของไก่', correct: false }
    ] },
  { id: 25, audio: '/audio/l3_listen_q15.mp3',
    script: '"ยายกินลำไย น้ำลายยายไหลย้อย"',
    question: 'ข้อ 25. คำที่อยู่ในมาตราตัวสะกด แม่เกย มีกี่คำ (ไม่นับคำซ้ำ) ?',
    options: [
      { text: 'ก. 1 คำ', correct: false },
      { text: 'ข. 2 คำ', correct: false },
      { text: 'ค. 3 คำ', correct: true },
      { text: 'ง. 4 คำ', correct: false }
    ] },
];

// ===== AUDIO BUTTON =====
