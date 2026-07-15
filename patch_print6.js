const fs = require('fs');
let txt = fs.readFileSync('public/css/styles.css', 'utf8').split('\n');

txt.splice(1580, 1640 - 1580 + 1); // Delete from index 1580 to 1640 inclusive (lines 1581-1641)

fs.writeFileSync('public/css/styles.css', txt.join('\n'));
