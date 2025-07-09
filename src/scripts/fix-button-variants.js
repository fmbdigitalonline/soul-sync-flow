// Quick script to fix all remaining button variant issues
const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, searchValue, replaceValue) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const updated = content.replace(new RegExp(searchValue, 'g'), replaceValue);
    fs.writeFileSync(filePath, updated);
    console.log(`Fixed: ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// All the patterns to fix
const fixes = [
  { search: 'variant="default"', replace: 'variant="filled"' },
  { search: 'variant=\\{"default"', replace: 'variant={"filled"' },
  { search: 'variant=\\{.*"default"', replace: 'variant={activeTab === "something" ? "filled"' },
  { search: 'size="default"', replace: 'size="md"' },
  { search: 'size=\\{"default"', replace: 'size={"md"' }
];

// Files to process
const filesToProcess = [
  'src/pages/Dreams.tsx',
  'src/pages/Tasks.tsx',
  'src/components/ui/mobile-toggle-panel.tsx',
  'src/components/ui/progressive-disclosure.tsx',
  'src/components/journey/EnhancedJourneyMap.tsx',
  'src/components/journey/JourneyHeader.tsx',
  'src/components/journey/TaskViews.tsx',
  'src/components/pie/PIESettingsPanel.tsx',
  'src/components/productivity/GoalAchievement.tsx'
];

filesToProcess.forEach(file => {
  if (fs.existsSync(file)) {
    fixes.forEach(fix => {
      replaceInFile(file, fix.search, fix.replace);
    });
  }
});

console.log('All button variant fixes completed!');