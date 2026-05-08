import fs from 'fs';

const filePath = 'src/pages/Level1Reading.jsx';
const buffer = fs.readFileSync(filePath);

console.log('File size:', buffer.length);
for (let i = 0; i < Math.min(buffer.length, 1000); i++) {
    if (buffer[i] > 127) {
        console.log(`Non-ASCII at byte ${i}: ${buffer[i]}`);
    }
}
