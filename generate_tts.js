import gtts from 'gtts';
import path from 'path';

const words = [
  { text: 'บรรทุก', file: 'vocab_bantuk.mp3' },
  { text: 'ละลาย', file: 'vocab_lalai.mp3' }
];

words.forEach(({ text, file }) => {
  const gTTS = new gtts(text, 'th');
  gTTS.save(path.join('public', 'audio', file), function (err, result){
    if(err) { throw new Error(err); }
    console.log("Success! Audio saved to " + file);
  });
});
