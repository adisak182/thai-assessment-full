const fs = require('fs');
const path = require('path');

let content;

// ListeningTest.jsx
const listeningPath = path.join(__dirname, 'src/pages/ListeningTest.jsx');
content = fs.readFileSync(listeningPath, 'utf8');

// Replace standard image
content = content.replace(
  /width: '100%', maxWidth: '240px', borderRadius: '12px', marginBottom: '12px', display: 'block'/g,
  "width: '100%', maxWidth: '240px', borderRadius: '12px', margin: '0 auto 16px auto', display: 'block'"
);

// Replace story image layout
content = content.replace(
  /<div style=\{\{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '16px' \}\}>\s*<img src=\{STORY_IMG\} alt="นิทาน" style=\{\{ width: '180px', borderRadius: '12px', flexShrink: 0 \}\} \/>/,
  `<div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', marginBottom: '20px', textAlign: 'center' }}>\n          <img src={STORY_IMG} alt="นิทาน" style={{ width: '180px', borderRadius: '12px' }} />`
);
fs.writeFileSync(listeningPath, content);

// WritingTest.jsx
const writingPath = path.join(__dirname, 'src/pages/WritingTest.jsx');
content = fs.readFileSync(writingPath, 'utf8');

content = content.replace(
  /width: '180px', borderRadius: '12px', marginBottom: '12px', display: 'block'/g,
  "width: '220px', borderRadius: '12px', margin: '0 auto 16px auto', display: 'block'"
);
fs.writeFileSync(writingPath, content);
console.log('Images centered successfully.');
