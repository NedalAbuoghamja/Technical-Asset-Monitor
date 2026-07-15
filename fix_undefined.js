const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('data/inventory.db');
db.run("UPDATE devices SET customFields = '[]' WHERE id = 3", (err) => {
  if (err) console.error(err);
  else console.log('Fixed undefined custom field');
});
