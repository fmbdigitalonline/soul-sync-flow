// This is a temporary file to help identify the issue
const fs = require('fs');

try {
  const content = fs.readFileSync('src/contexts/LanguageContext.tsx', 'utf8');
  const lines = content.split('\n');
  
  console.log('Lines around 2220-2225:');
  for (let i = 2215; i < 2230; i++) {
    if (lines[i]) {
      console.log(`${i + 1}: ${lines[i]}`);
    }
  }
} catch (error) {
  console.error('Error reading file:', error);
}