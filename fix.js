const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/pages');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('if (!scoreSubmitted) {') && content.includes('setScoreSubmitted(true);')) {
    console.log(`Fixing ${file}`);
    
    // Ensure useEffect is imported
    if (content.match(/import\s+{.*useState.*}\s+from\s+['"]react['"]/)) {
      if (!content.includes('useEffect')) {
        content = content.replace(/(import\s+{.*)(useState)(.*}\s+from\s+['"]react['"])/, '$1$2, useEffect$3');
      }
    } else if (!content.includes('useEffect')) {
      content = `import { useEffect } from 'react';\n` + content;
    }

    // Replace the block with an empty block, and inject useEffect before the return
    // Wait, the block is:
    // if (!scoreSubmitted) {
    //   setScoreSubmitted(true);
    //   recordScore({ ... });
    // }
    
    // Find the recordScore line
    const match = content.match(/if \(!scoreSubmitted\) \{\s*setScoreSubmitted\(true\);\s*([\s\S]*?)\s*\}/);
    if (match) {
      const recordScoreCode = match[1];
      
      // Remove the old block
      content = content.replace(match[0], '');
      
      // Inject useEffect before the return statement inside the result phase
      // Typically:
      // if (phase === 'result' || showResult) {
      //   return (
      
      // We'll replace the old block with the useEffect
      const useEffectCode = `
    useEffect(() => {
      if (!scoreSubmitted) {
        setScoreSubmitted(true);
        ${recordScoreCode}
      }
    }, [scoreSubmitted]);
`;
      // Where to put it? Just above the return statement in the result block.
      // Actually, since it's a hook, we CANNOT put it inside an if block!
      // Hooks must be at the top level of the component!
      console.log(`WARNING: Cannot easily auto-fix ${file} because hooks cannot be conditional.`);
    }
  }
}
