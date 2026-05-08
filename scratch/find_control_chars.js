import fs from 'fs';

const filePath = 'src/pages/Level1Reading.jsx';
const buffer = fs.readFileSync(filePath);

for (let i = 0; i < buffer.length; i++) {
    const b = buffer[i];
    if (b === 0) {
        console.log(`Null byte at position ${i}`);
    }
    if (b < 32 && b !== 9 && b !== 10 && b !== 13) {
        console.log(`Control character ${b} at position ${i}`);
    }
}
