const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('data/inventory.db');

db.serialize(() => {
  db.run("DELETE FROM devices", err => { if(!err) console.log('Cleared devices'); });
  db.run("DELETE FROM device_history", err => { if(!err) console.log('Cleared device_history'); });
  db.run("DELETE FROM columns", err => { if(!err) console.log('Cleared columns'); });
  db.run("DELETE FROM users WHERE username != 'admin'", err => { if(!err) console.log('Cleared users (kept admin)'); });
});
