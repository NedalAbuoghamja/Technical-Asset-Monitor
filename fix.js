const fs = require('fs');
let txt = fs.readFileSync('seed_random_devices.js', 'utf8');
txt = txt.replace(/\\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync('seed_random_devices.js', txt);
