import { getAllQuestions } from './src/data/testData.js';

const questions = getAllQuestions();
let hasErrors = false;

questions.forEach(q => {
  if (q.options) {
    const correctCount = q.options.filter(o => o.correct === true).length;
    if (correctCount !== 1) {
      console.log(`Question ${q.id} has ${correctCount} correct options!`);
      hasErrors = true;
    }
  }
});

if (!hasErrors) {
  console.log('All MCQ questions have exactly one correct option.');
}
