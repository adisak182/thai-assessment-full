const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/ListeningTest.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Move audio to be below the image in MCQCard
// Currently:
// {q.audio && <div style={{ marginBottom: '12px' }}><AudioBtn src={q.audio} /></div>}
// {q.script && ... }
// {q.saying && ... }
// {q.image && <img ... />}
// We will match the image line and swap positions. But it's easier to just use regex to reorder.
const audioRegex = /\{\s*q\.audio\s*&&\s*<div[^>]*>\s*<AudioBtn\s*src=\{q\.audio\}[^>]*\/>\s*<\/div>\s*\}/;
const scriptRegex = /\{\s*q\.script\s*&&\s*<div[^>]*>\{q\.script\}<\/div>\s*\}/;
const sayingRegex = /\{\s*q\.saying\s*&&\s*<div[^>]*>สำนวน: \{q\.saying\}<\/div>\s*\}/;
const imgRegex = /\{\s*q\.image\s*&&\s*<img\s*src=\{q\.image\}[^>]*\/>\s*\}/;

// We want the order: script, saying, image, audio
// Let's replace the whole block
const oldBlockRegex = /\{q\.audio[\s\S]*?\{q\.image[^}]*\}/;

const match = content.match(oldBlockRegex);
if (match) {
  const block = match[0];
  const audioLine = block.match(audioRegex) ? block.match(audioRegex)[0] : '';
  const scriptLine = block.match(scriptRegex) ? block.match(scriptRegex)[0] : '';
  const sayingLine = block.match(sayingRegex) ? block.match(sayingRegex)[0] : '';
  const imgLine = block.match(imgRegex) ? block.match(imgRegex)[0] : '';

  // Center the audio div explicitly
  const newAudioLine = audioLine.replace(/style=\{\{\s*marginBottom:\s*'12px'\s*\}\}/, "style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}");

  const newBlock = `${scriptLine}\n        ${sayingLine}\n        ${imgLine}\n        ${newAudioLine}`;
  
  // Clean up empty lines
  const cleanBlock = newBlock.split('\n').filter(line => line.trim() !== '').join('\n');
  
  content = content.replace(block, cleanBlock);
}

// 2. Make AudioBtn Big
const oldBtnStyle = /style=\{\{\s*display:\s*'flex',\s*alignItems:\s*'center',\s*gap:\s*'12px',\s*padding:\s*'10px 20px',\s*borderRadius:\s*'30px',\s*border:\s*'none',\s*background:\s*playing\s*\?\s*'var\(--color-primary\)'\s*:\s*'rgba\(168,85,247,0.12\)',\s*color:\s*playing\s*\?\s*'white'\s*:\s*'var\(--color-primary\)',\s*fontWeight:\s*'600',\s*cursor:\s*'pointer',\s*fontSize:\s*'1.1rem',\s*transition:\s*'all 0.2s',\s*fontFamily:\s*'inherit'\s*\}\}/;

const newBtnStyle = `style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px 32px', borderRadius: '30px', border: '2px solid var(--color-primary)', background: playing ? 'var(--color-primary)' : 'white', color: playing ? 'white' : 'var(--color-primary)', fontWeight: '700', cursor: 'pointer', fontSize: '1.25rem', width: '100%', maxWidth: '300px', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(91, 33, 182, 0.15)' }}`;

content = content.replace(oldBtnStyle, newBtnStyle);

// 3. For the story section, ensure it looks good since we changed it to flex-col previously
// We want the AudioBtn there to also be centered
content = content.replace(
  /<AudioBtn src=\{STORY_AUDIO\} \/>/,
  `<div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}><AudioBtn src={STORY_AUDIO} /></div>`
);
content = content.replace(
  /<AudioBtn src=\{ARTICLE_AUDIO\} \/>/,
  `<div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}><AudioBtn src={ARTICLE_AUDIO} /></div>`
);
content = content.replace(
  /<AudioBtn src=\{ANN_COLD_AUDIO\} \/>/,
  `<div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}><AudioBtn src={ANN_COLD_AUDIO} /></div>`
);
content = content.replace(
  /<AudioBtn src=\{AD_AUDIO\} \/>/,
  `<div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}><AudioBtn src={AD_AUDIO} /></div>`
);


fs.writeFileSync(filePath, content);
console.log('ListeningTest updated for big audio buttons under images');
