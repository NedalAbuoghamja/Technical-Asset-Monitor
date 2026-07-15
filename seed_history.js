const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, 'data');
const dbFile = path.join(DATA_DIR, 'inventory.db');
const db = new sqlite3.Database(dbFile);

const firstNames = ['أحمد', 'محمد', 'علي', 'عمر', 'خالد', 'طارق', 'حسن', 'عبدالله', 'سالم', 'يوسف', 'محمود', 'أسامة', 'ابراهيم', 'فاطمة', 'عائشة', 'مريم', 'زينب', 'خديجة', 'سعاد', 'هدى'];
const lastNames = ['الورفلي', 'المقرحي', 'الترهوني', 'الزنتاني', 'الزوي', 'المصراتي', 'الطابوني', 'الفيتوري', 'الشلماني', 'العبيدي', 'التاجوري'];

const allOrgPaths = [
  "مجلس الإدارة||مكتب شؤون مجلس الادارة||وحدة شؤون الاجتماعات",
  "مجلس الإدارة||المدير العام||الإدارة الفنية||قسم الصيانة",
  "مجلس الإدارة||المدير العام||الإدارة الفنية||قسم التركيبات",
  "مجلس الإدارة||المدير العام||الإدارة المالية||قسم الخزينة",
  "مجلس الإدارة||المدير العام||الإدارة المالية||قسم المرتبات",
  "مجلس الإدارة||المدير العام||إدارة تقنية المعلومات||قسم الدعم الفني",
  "مجلس الإدارة||المدير العام||إدارة تقنية المعلومات||قسم الشبكات",
  "مجلس الإدارة||المدير العام||مكتب شؤون المدير العام",
  "مجلس الإدارة||مكتب المراجعة الداخلية",
  "مجلس الإدارة||المكتب القانوني",
  "مجلس الإدارة||مكتب امن المعلومات والامن السيبراني"
];

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomName() {
  return `${randomElement(firstNames)} ${randomElement(lastNames)}`;
}

db.serialize(() => {
  db.all("SELECT id, employeeName, orgPath FROM devices", (err, devices) => {
    if (err) {
      console.error(err);
      return;
    }

    let inserted = 0;
    let stmt = db.prepare(`
      INSERT INTO device_history (
        device_id, previous_employee, previous_orgPath,
        new_employee, new_orgPath, changed_by, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now', ?))
    `);

    // Add 1-3 history records for half of the devices
    devices.forEach(device => {
      if (Math.random() > 0.5) {
        const numHistories = Math.floor(Math.random() * 3) + 1;
        let currentEmployee = device.employeeName;
        let currentOrgPath = device.orgPath;
        
        // We generate them backwards in time
        for (let i = 0; i < numHistories; i++) {
          let prevEmployee = generateRandomName();
          let prevOrgPath = randomElement(allOrgPaths);
          
          let daysAgo = -(Math.floor(Math.random() * 300) + (i * 300));
          let timeModifier = `${daysAgo} days`;

          stmt.run([
            device.id, prevEmployee, prevOrgPath,
            currentEmployee, currentOrgPath, 'admin', timeModifier
          ]);
          
          currentEmployee = prevEmployee;
          currentOrgPath = prevOrgPath;
          inserted++;
        }
      }
    });

    stmt.finalize(() => {
      console.log(`Successfully generated ${inserted} history records for existing devices.`);
      db.close();
    });
  });
});
