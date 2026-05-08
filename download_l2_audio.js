import fs from 'fs';
import https from 'https';
import path from 'path';

const words = [
  "กงสุล",
  "วาทศิลป์",
  "จับปลาสองมือ",
  "น้ำขึ้นให้รีบตัก",
  "มือไม่พาย เอาเท้าราน้ำ"
];

// Split the article into chunks < 200 chars
const articleChunks = [
  "นพ.สุวรรณชัย กล่าวว่า หากปล่อยให้เด็กใกล้ชิดจอมือถือ แท็บเล็ตมากเกินไปโดยไม่กำหนดเวลาดูหรือเลือกสื่อที่ไม่เหมาะสม จะส่งผลเสียหลายด้าน คือ",
  "1. ด้านการสื่อสาร พูดช้า พูดไม่ชัด ขาดความคิดสร้างสรรค์ และการจ้องมองจอภาพเป็นเวลานาน จะส่งผลเสียกับดวงตาได้ เช่น ทำให้สายตาสั้น ดวงตาแห้ง",
  "2. ด้านร่างกาย จะไม่แข็งแรง เหนื่อยง่าย ขาดการเคลื่อนไหวออกกำลังกายตามที่ควรจะเป็น หรืออาจ ส่งผลให้เป็นเด็กขี้เกียจได้",
  "3. ด้านอารมณ์ ไม่สามารถควบคุมอารมณ์ได้ เพราะเด็กแยกแยะโลกของอินเทอร์เน็ตกับความจริงไม่ได้ หงุดหงิดง่าย ใจร้อน รอคอยไม่เป็น",
  "4. ด้านพฤติกรรม จะก้าวร้าว ซน สมาธิสั้น มีพฤติกรรมคล้ายออทิสติก คือ ดื้อ ต่อต้าน มีโลกส่วนตัวสูง สื่อสารกับคนอื่นน้อย",
  "ทั้งนี้ เวลาในการใช้สื่อเทคโนโลยีที่เหมาะสมควรคำนึงถึงช่วงอายุเป็นหลักคือ เด็กอายุต่ำกว่า 2 ปี ให้หลีกเลี่ยงการใช้สื่อมีจอทุกชนิด",
  "สำหรับเด็กอายุ 2 ถึง 5 ปี ให้จำกัดเวลาการใช้สื่อมีจอ ไม่ควรเกินวันละ 1 ชั่วโมง และควรเลือกโปรแกรมที่เหมาะสมกับวัย",
  "อธิบดีกรมอนามัย กล่าวว่า สิ่งสำคัญคือ พ่อแม่ควรหลีกเลี่ยงการใช้สื่อมีจอเพื่อให้เด็กสงบนิ่ง หรือหยุดร้องไห้",
  "เนื่องจากการใช้สื่อมีจออาจทำให้เด็กสงบได้จริง แต่นำมาซึ่งปัญหาการไม่สามารถจำกัดเวลาการเล่นได้"
];

const dir = './public/audio';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

function downloadAudio(text, filename) {
  const url = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=th&q=${encodeURIComponent(text)}`;
  const dest = path.join(dir, filename);
  
  const file = fs.createWriteStream(dest);
  https.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close();  
      console.log(`Downloaded ${filename}`);
    });
  }).on('error', function(err) {
    fs.unlink(dest, () => {}); 
    console.error(`Error downloading ${filename}: ${err.message}`);
  });
}

words.forEach((text, i) => {
  downloadAudio(text, `l2_listen_q${i+1}.mp3`);
});

articleChunks.forEach((text, i) => {
  downloadAudio(text, `l2_listen_article_${i+1}.mp3`);
});
