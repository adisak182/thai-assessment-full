import fs from 'fs';
import https from 'https';
import path from 'path';

const botQuestions = [
  "สวัสดีครับ แนะนำตัวให้ฟังหน่อยครับ",
  "คุณเป็นคนที่ไหนครับ หรือบ้านเกิดอยู่ที่ไหน",
  "คุณเรียนจบระดับไหน หรือจบจากที่ไหนมาครับ",
  "ตอนนี้คุณทำงานอะไร หรือทำอาชีพอะไรอยู่ครับ",
  "คุณมีความสามารถพิเศษอะไร หรือยามว่างคุณชอบทำกิจกรรมอะไรมากที่สุดครับ"
];

const dir = './public/audio';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

botQuestions.forEach((text, i) => {
  const url = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=th&q=${encodeURIComponent(text)}`;
  const dest = path.join(dir, `bot_q${i+1}.mp3`);
  
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
