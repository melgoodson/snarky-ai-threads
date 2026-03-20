// check-colors.js
// Scan all .ts files in supabase/functions for leftover #7C3AED color codes
const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', 'supabase', 'functions');
let leftover = false;
function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('#7C3AED')) {
        console.log('Found leftover color in', fullPath);
        leftover = true;
      }
    }
  }
}
walk(baseDir);
if (!leftover) {
  console.log('No leftover #7C3AED color codes found.');
}
