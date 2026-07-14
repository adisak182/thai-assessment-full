const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/ReadingTest.jsx',
  'src/pages/ListeningTest.jsx',
  'src/pages/WritingTest.jsx',
  'src/pages/SpeakingTest.jsx'
];

files.forEach(relPath => {
  const filePath = path.join(__dirname, relPath);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Bump font sizes for better readability
  content = content.replace(/0\.8rem/g, '0.9rem');
  content = content.replace(/0\.85rem/g, '0.95rem');
  content = content.replace(/0\.9rem/g, '1rem');
  content = content.replace(/0\.95rem/g, '1.1rem');
  content = content.replace(/'1rem'/g, "'1.1rem'");
  content = content.replace(/'1\.05rem'/g, "'1.15rem'");
  
  // Increase padding on buttons/cards
  content = content.replace(/'12px 16px'/g, "'14px 20px'");
  content = content.replace(/'10px 14px'/g, "'12px 18px'");
  content = content.replace(/'8px 14px'/g, "'10px 18px'");
  content = content.replace(/'8px 12px'/g, "'10px 16px'");
  content = content.replace(/'8px 18px'/g, "'10px 22px'");

  // Increase gap between options
  content = content.replace(/gap: '8px'/g, "gap: '12px'");
  content = content.replace(/gap: '10px'/g, "gap: '14px'");

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${relPath}`);
});
