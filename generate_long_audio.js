import fs from 'fs';
import https from 'https';
import path from 'path';

const textChunks = [
  "กรมอุตุฯ เตือน ลานีญา จ่อถล่มไทย เตรียมรับมือฝนชุกกว่าปกติช่วงปลายปี กรุงเทพมหานคร กรมอุตุนิยมวิทยาออกประกาศเฝ้าระวังปรากฏการณ์ ลานีญา ที่กำลังก่อตัวขึ้นในมหาสมุทรแปซิฟิก",
  "โดยคาดการณ์ว่าประเทศไทยจะเริ่มได้รับผลกระทบชัดเจนตั้งแต่เดือนสิงหาคมนี้เป็นต้นไป ส่งผลให้ปริมาณฝนสะสมทั่วประเทศสูงกว่าค่าเฉลี่ยปกติร้อยละ 10 ถึง 15",
  "ดอกเตอร์สมชาย ผู้เชี่ยวชาญด้านสภาพภูมิอากาศ ระบุว่าปรากฏการณ์นี้จะทำให้อุณหภูมิผิวน้ำทะเลบริเวณแปซิฟิกตะวันตกสูงขึ้น ส่งผลให้ความชื้นพัดเข้าสู่เอเชียตะวันออกเฉียงใต้มากขึ้น",
  "สิ่งที่น่ากังวลไม่ใช่แค่ปริมาณฝน แต่คือความถี่ของพายุหมุนเขตร้อนที่อาจเคลื่อนตัวเข้าสู่ไทยมากกว่าปีที่ผ่านมา ซึ่งอาจส่งผลกระทบต่อพื้นที่เกษตรกรรมในภาคกลางและภาคตะวันออกเฉียงเหนือ",
  "ทั้งนี้ รัฐบาลได้สั่งการให้หน่วยงานบริหารจัดการน้ำเร่งระบายน้ำในเขื่อนหลัก เพื่อเตรียมพื้นที่รองรับมวลน้ำใหม่",
  "และขอให้ประชาชนติดตามข่าวสารอย่างใกล้ชิดเพื่อป้องกันความเสียหายที่อาจเกิดขึ้นกับทรัพย์สินและพืชผลทางการเกษตร"
];

const dir = './public/audio';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

const outputFile = path.join(dir, 'l3_listen_news.mp3');
const writeStream = fs.createWriteStream(outputFile);

const fetchChunk = (text) => {
  return new Promise((resolve, reject) => {
    const url = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=th&q=${encodeURIComponent(text)}`;
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to fetch chunk: ${response.statusCode}`));
      }
      
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
};

const run = async () => {
  console.log('Starting long TTS generation...');
  for (let i = 0; i < textChunks.length; i++) {
    console.log(`Fetching chunk ${i + 1}/${textChunks.length}...`);
    try {
      const buffer = await fetchChunk(textChunks[i]);
      writeStream.write(buffer);
      console.log(`Chunk ${i + 1} written.`);
      // Delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      console.error(`Error on chunk ${i + 1}:`, err);
    }
  }
  
  writeStream.end();
  console.log('Finished generating ' + outputFile);
};

run();
