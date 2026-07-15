const fs = require('fs');
const content = fs.readFileSync('public/js/app.js', 'utf8');

// find fetch devices
const match = content.match(/async function.*?fetch\(['"]\/api\/devices['"]\)/);
if (match) {
  console.log("Found using fetch api devices.");
} else {
  // Let's print out all function names
  const funcMatch = content.match(/function\s+(\w+)\s*\(/g);
  console.log("Functions in app.js:", funcMatch);
}
