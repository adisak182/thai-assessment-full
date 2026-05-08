import fs from 'fs';
import https from 'https';
import path from 'path';

const phrases = [
  "ลูกค้าต้องการซื้ออะไรคะ",
  "ขอโทษค่ะ ช่วยบอกทางไปโรงพยาบาลได้ไหมคะ",
  "วันนี้คนไข้มีอาการอย่างไรคะ",
  "เราต้องเตรียมอุปกรณ์อะไรบ้าง ในการทำกิจกรรมจิตอาสา",
  "พรุ่งนี้เรานัดทำการบ้านที่ไหนดี"
];

const dir = './public/audio';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

phrases.forEach((text, i) => {
  const url = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=th&q=${encodeURIComponent(text)}`;
  const dest = path.join(dir, `l2_bot_q${i+1}.mp3`);
  
  const file = fs.createWriteStream(dest);
  https.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close();  
      console.log(`Downloaded l2_bot_q${i+1}.mp3`);
    });
  }).on('error', function(err) {
    fs.unlink(dest, () => {}); 
    console.error(`Error downloading l2_bot_q${i+1}.mp3: ${err.message}`);
  });
});
