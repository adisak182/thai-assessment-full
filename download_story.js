import fs from 'fs';
import https from 'https';
import path from 'path';

const chunks = [
  "พ่อค้าคนหนึ่งมีลาไว้บรรทุกสิ่งของ วันหนึ่งเขาพาลาเดินทางไปซื้อเกลือในเมือง และบรรทุกกระสอบเกลือที่หนักมากบนหลังลาเพื่อเดินทางกลับบ้าน",
  "ระหว่างทางต้องข้ามลำคลอง ลาเดินเหยียบหินพลาดตกลงไปในน้ำ เมื่อลาลุกขึ้นยืนก็รู้สึกว่าของบนหลังเบาลง เพราะเกลือละลายน้ำไปหมดแล้ว ลาจึงดีใจมาก",
  "วันต่อมา ลาแกล้งตกน้ำอีกครั้ง พ่อค้าเดาอุบายของลาออก ครั้งต่อมาเขาจึงเปลี่ยนจากบรรทุกเกลือมาเป็นบรรทุกนุ่นแทน",
  "เมื่อลาแกล้งตกน้ำ นุ่นจึงดูดซับน้ำไว้จนหนักอึ้ง ลาต้องเดินแบกนุ่นที่หนักกว่าเดิมด้วยความลำบาก ตั้งแต่นั้นมาลาก็ไม่กล้าแกล้งตกน้ำอีกเลย",
  "นิทานเรื่องนี้สอนให้รู้ว่า ความเจ้าเล่ห์เพื่อเลี่ยงงานหนัก มักนำมาซึ่งความลำบากที่มากกว่าเดิม"
];

const dir = './public/audio';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

chunks.forEach((text, i) => {
  const url = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=th&q=${encodeURIComponent(text)}`;
  const dest = path.join(dir, `story_${i+1}.mp3`);
  
  const file = fs.createWriteStream(dest);
  https.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close();  
      console.log(`Downloaded ${dest}`);
    });
  }).on('error', function(err) {
    fs.unlink(dest, () => {}); 
    console.error(`Error downloading ${dest}: ${err.message}`);
  });
});
