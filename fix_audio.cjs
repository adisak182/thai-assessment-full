const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/ListeningTest.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix audio paths
const replacements = {
  '/audio/vocab_soi.mp3': '/audio/vocab_1.mp3',
  '/audio/vocab_plodbpai.mp3': '/audio/vocab_2.mp3',
  '/audio/vocab_pumipanya.mp3': '/audio/vocab_3.mp3',
  '/audio/ann_swimming.mp3': '/audio/announce_1.mp3',
  '/audio/ann_trash.mp3': '/audio/announce_2.mp3',
  '/audio/ann_exam.mp3': '/audio/announce_3.mp3',
  '/audio/vocab_consul.mp3': '/audio/vocab_4.mp3',
  '/audio/vocab_watsil.mp3': '/audio/vocab_5.mp3',
  '/audio/prov_fish.mp3': '/audio/announce_4.mp3',
  '/audio/prov_water.mp3': '/audio/announce_5.mp3',
  '/audio/prov_paddle.mp3': '/audio/story_1.mp3',
  '/audio/ann_cold_weather.mp3': '/audio/l3_listen_announcement.mp3',
  '/audio/q24_kun.mp3': '/audio/l3_listen_q14.mp3',
  '/audio/q25_yai.mp3': '/audio/l3_listen_q15.mp3'
};

for (const [oldPath, newPath] of Object.entries(replacements)) {
  content = content.replace(oldPath, newPath);
}

// Fix AudioBtn to always show 'ฟังเสียง'
content = content.replace(/function AudioBtn\(\{ src, label = 'ฟังเสียง' \}\) \{/, 'function AudioBtn({ src }) {');
content = content.replace(/\{playing \? 'กำลังเล่น\.\.\.' : label\}/g, "{playing ? 'กำลังเล่น...' : 'ฟังเสียง'}");

fs.writeFileSync(filePath, content);
console.log('ListeningTest.jsx updated with correct audio paths and fixed AudioBtn label.');
