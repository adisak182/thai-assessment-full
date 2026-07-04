import fs from 'fs';
import https from 'https';
import path from 'path';

const textChunks = [
  "ขอประกาศแจ้งเตือนพี่น้องชาวเกษตรกร เนื่องจากสัปดาห์หน้าจะมีมวลอากาศเย็นกำลังแรงแผ่ปกคลุมพื้นที่ ทำให้อุณหภูมิลดฮวบลง 3 ถึง 5 องศาเซลเซียส",
  "ขอให้ทุกท่านเร่งจัดทำแผงบังลมและเตรียมวัสดุคลุมดินเพื่อรักษาอุณหภูมิให้แก่พืชผัก รวมถึงดูแลสุขภาพของสัตว์เลี้ยงอย่างใกล้ชิดด้วยค่ะ"
];

const dir = './public/audio';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

const outputFile = path.join(dir, 'l3_listen_announcement.mp3');
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
