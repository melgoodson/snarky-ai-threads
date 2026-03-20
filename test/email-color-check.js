// email-color-check.js
// This script scans email function files for any remaining #7C3AED color codes.
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'supabase', 'functions');
console.log('Scanning directory:', dir);
const files = [];
function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
}
walk(dir);
let found = false;
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('#7C3AED')) {
    console.log(`Found leftover color in ${file}`);
    found = true;
  }
}
if (!found) {
  console.log('No leftover #7C3AED color codes found.');
}
