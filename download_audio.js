import fs from 'fs';
import https from 'https';
import path from 'path';

const words = [
  { id: 1, text: 'สร้อย' },
  { id: 2, text: 'ปลอดภัย' },
  { id: 3, text: 'สำเร็จ' },
  { id: 4, text: 'ภูมิปัญญา' },
  { id: 5, text: 'มลภาวะ' }
];

const dir = './public/audio';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

words.forEach(word => {
  const url = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=th&q=${encodeURIComponent(word.text)}`;
  const dest = path.join(dir, `vocab_${word.id}.mp3`);
  
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
