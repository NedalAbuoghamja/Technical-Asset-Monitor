const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data/inventory.db');
const db = new sqlite3.Database(dbPath);

// Extract orgStructure from app.js
let js = fs.readFileSync('public/js/app.js', 'utf8');
const match = js.match(/const orgStructure = (\{[\s\S]*?\n\});/);
let orgStructure;
eval("orgStructure = " + match[1]);

// Collect all possible orgPaths by traversing orgStructure
const allPaths = [];

function traverseNode(node, currentPath) {
  if (node && typeof node === 'object') {
    const keys = Object.keys(node);
    if (keys.length === 0) {
      allPaths.push(currentPath);
    } else {
      // Sometimes we can also assign to a parent node, so we can add it to allPaths too
      if (currentPath.length > 0) {
         allPaths.push(currentPath);
      }
      keys.forEach(key => {
        traverseNode(node[key], [...currentPath, key]);
      });
    }
  }
}

traverseNode(orgStructure, []);

// Mock data arrays
const names = ['أحمد', 'محمد', 'علي', 'عمر', 'خالد', 'عبدالله', 'يوسف', 'سالم', 'طارق', 'حسن', 'محمود', 'مصطفى', 'وليد'];
const lastNames = ['الزنتاني', 'الورفلي', 'مصباح', 'عبدالسلام', 'العكروت', 'الشريف', 'الطاهر', 'المصراتي', 'المقرحي'];
const models = ['HP EliteDesk 800 G5', 'Dell OptiPlex 7090', 'Lenovo ThinkCentre M720', 'MacBook Pro 16', 'HP ProBook 450 G8', 'Dell Latitude 5520', 'HP LaserJet Pro M404n', 'Epson L3150'];
const natures = ['Desktop', 'Desktop', 'Desktop', 'Laptop', 'Laptop', 'Laptop', 'Printer', 'Printer'];

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const devices = [];

// Generate 150 random devices
for (let i = 0; i < 150; i++) {
  const modelIdx = Math.floor(Math.random() * models.length);
  const orgPath = randomElement(allPaths);
  const deviceNature = natures[modelIdx];
  const assetType = deviceNature === 'Printer' ? 'Printer' : 'Computer';
  
  const device = {
    employeeName: assetType === 'Printer' ? 'طابعة مشتركة' : `${randomElement(names)} ${randomElement(names)} ${randomElement(lastNames)}`,
    department: orgPath[0] || '',
    circle: orgPath[1] || '',
    section: orgPath[2] || '',
    unit: orgPath[3] || '',
    orgPath: orgPath.join('||'),
    deviceNature: deviceNature,
    deviceModel: models[modelIdx],
    serviceTag: `SN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    ram: assetType === 'Printer' ? '' : randomElement(['8 GB', '16 GB', '32 GB']),
    storageType: assetType === 'Printer' ? '' : 'SSD',
    storageSize: assetType === 'Printer' ? '' : randomElement(['256 GB', '512 GB', '1 TB']),
    monitorsCount: assetType === 'Printer' ? 0 : randomElement([1, 2]),
    connectionType: assetType === 'Printer' ? randomElement(['Network', 'USB', 'Wireless']) : '',
    ipAddress: (assetType === 'Printer' && Math.random() > 0.5) ? `192.168.1.${Math.floor(Math.random()*200)+1}` : '',
    phone: assetType === 'Printer' ? '' : `41${Math.floor(Math.random() * 99)}`,
    osVersion: assetType === 'Printer' ? '' : randomElement(['Windows 10 Pro', 'Windows 11 Pro', 'macOS Sonoma']),
    systemsUsed: '',
    recurringIssues: '',
    notes: '',
    technicalStatus: randomElement(['سليم', 'سليم', 'سليم', 'بحاجة لصيانة', 'تحت الصيانة'])
  };
  devices.push(device);
}

db.serialize(() => {
  db.run("DELETE FROM devices", (err) => {
    if (err) console.error(err);
    console.log('All previous devices deleted.');
    
    const stmt = db.prepare(`
      INSERT INTO devices (
        employeeName, department, circle, section, unit, orgPath,
        deviceNature, connectionType, ipAddress, deviceModel, serviceTag,
        ram, storageType, storageSize, monitorsCount, phone, osVersion,
        systemsUsed, recurringIssues, notes, technicalStatus
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    devices.forEach(d => {
      stmt.run([
        d.employeeName, d.department, d.circle, d.section, d.unit, d.orgPath,
        d.deviceNature, d.connectionType, d.ipAddress, d.deviceModel, d.serviceTag,
        d.ram, d.storageType, d.storageSize, d.monitorsCount, d.phone, d.osVersion,
        d.systemsUsed, d.recurringIssues, d.notes, d.technicalStatus
      ]);
    });
    
    stmt.finalize(() => {
      console.log(`Successfully inserted ${devices.length} random devices.`);
      db.close();
    });
  });
});
