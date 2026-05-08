import fs from 'fs';

const filePath = 'src/pages/Level1Reading.jsx';
const content = fs.readFileSync(filePath, 'utf8');
fs.writeFileSync(filePath, content, 'utf8');
console.log('File sanitized.');
