const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('data/inventory.db');
db.run('ALTER TABLE devices ADD COLUMN ipAddress TEXT DEFAULT ""', (err) => {
  console.log(err ? err.message : 'Column added');
});
