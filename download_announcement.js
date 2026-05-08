import fs from 'fs';
import https from 'https';
import path from 'path';

const announcements = [
  "วันพรุ่งนี้ให้ผู้เรียนนำดินสอสีและกระดาษวาดเขียนมาด้วย",
  "ประกาศ ห้ามลงเล่นน้ำในบริเวณนี้เนื่องจากน้ำลึกและไหลเชี่ยว",
  "ก่อนรับประทานอาหารทุกครั้ง อย่าลืมล้างมือให้สะอาดด้วยสบู่",
  "โปรดทิ้งขยะลงในถังที่เตรียมไว้แยกตามประเภท",
  "เมื่อทำข้อสอบเสร็จแล้ว ให้วางกระดาษคำถามลงบนโต๊ะแล้วเดินออกจากห้องเงียบๆ"
];

const dir = './public/audio';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

announcements.forEach((text, i) => {
  const url = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=th&q=${encodeURIComponent(text)}`;
  const dest = path.join(dir, `announce_${i+1}.mp3`);
  
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
