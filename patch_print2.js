const fs = require('fs');
let txt = fs.readFileSync('public/css/styles.css', 'utf8').split('\n');

txt.splice(1534, 1566 - 1534 + 1); // Delete from index 1534 to 1565 inclusive (lines 1535-1566)

fs.writeFileSync('public/css/styles.css', txt.join('\n'));
