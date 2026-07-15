const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbFile = path.resolve('data/inventory.db');
const db = new sqlite3.Database(dbFile);

const departments = [
  'إدارة تقنية المعلومات', 'الإدارة المالية', 'الموارد البشرية', 'التسويق والمبيعات', 'الإدارة القانونية',
  'إدارة المشتريات', 'خدمات المشتركين', 'إدارة العمليات', 'الإدارة الهندسية', 'المراجعة الداخلية'
];

const sections = [
  ['قسم الدعم الفني', 'قسم الشبكات', 'قسم تطوير البرمجيات'],
  ['قسم الحسابات', 'قسم الخزينة', 'قسم الميزانية'],
  ['قسم التوظيف', 'قسم شؤون الموظفين', 'قسم التدريب'],
  ['قسم التسويق الرقمي', 'قسم العلاقات العامة', 'قسم المبيعات المباشرة'],
  ['قسم العقود', 'قسم التحقيقات', 'قسم الاستشارات'],
  ['قسم المشتريات المحلية', 'قسم المشتريات الخارجية', 'قسم المخازن'],
  ['قسم الدعم', 'قسم الشكاوى', 'قسم الجودة'],
  ['قسم التشغيل', 'قسم الصيانة', 'قسم التخطيط'],
  ['قسم البنية التحتية', 'قسم الاتصالات', 'قسم الطاقة'],
  ['قسم المراجعة المالية', 'قسم المراجعة الإدارية']
];

const firstNames = ['أحمد', 'محمد', 'علي', 'عمر', 'خالد', 'عبدالله', 'طارق', 'يوسف', 'حسن', 'حسين', 'سالم', 'فاطمة', 'مريم', 'عائشة', 'سعاد', 'هدى', 'زينب', 'خديجة'];
const lastNames = ['الورفلي', 'المقرحي', 'الترهوني', 'الزنتاني', 'الزوي', 'المسماري', 'العبيدي', 'الفيتوري', 'الكريمي', 'بن علي', 'الفرجاني'];

const computerNatures = ['Printer', 'Fingerprint', 'AccessPoint'];
const connectionTypes = ['Network', 'Wireless'];
const models = {
  Printer: ['HP LaserJet Pro M404', 'Epson EcoTank L3150', 'Canon i-SENSYS', 'Brother HL-L2350DW', 'HP Color LaserJet'],
  Fingerprint: ['ZKTeco K40', 'ZKTeco F18', 'ZK uFace800', 'Suprema BioLite N2'],
  AccessPoint: ['Ubiquiti UniFi UAP-AC-PRO', 'Cisco Meraki MR46', 'Aruba Instant On AP22', 'TP-Link EAP225']
};
const statuses = ['سليم', 'سليم', 'سليم', 'سليم', 'بحاجة لصيانة', 'تحت الصيانة'];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomDevice() {
  const deptIndex = Math.floor(Math.random() * departments.length);
  const department = departments[deptIndex];
  const section = getRandomItem(sections[deptIndex]);
  const employeeName = `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`;
  
  const deviceNature = getRandomItem(computerNatures);
  
  let deviceModel = getRandomItem(models[deviceNature]);
  let serviceTag = Math.random().toString(36).substring(2, 9).toUpperCase() + Math.floor(Math.random() * 1000);
  let connectionType = getRandomItem(connectionTypes);
  
  const technicalStatus = getRandomItem(statuses);

  return {
    employeeName,
    department,
    section,
    unit: '',
    deviceNature,
    deviceModel,
    serviceTag,
    technicalStatus,
    recurringIssues: '',
    notes: 'تمت الإضافة تلقائياً بغرض التجربة',
    systemsUsed: '',
    phone: '',
    ram: 'لا يوجد',
    storageType: 'لا يوجد',
    storageSize: 'لا يوجد',
    monitorsCount: 0,
    customFields: '[]',
    connectionType
  };
}

const devices = Array.from({ length: 150 }, generateRandomDevice);

db.serialize(() => {
  db.run("BEGIN TRANSACTION");
  const stmt = db.prepare(`
    INSERT INTO devices (
      employeeName, department, section, unit, deviceNature, deviceModel, serviceTag,
      technicalStatus, recurringIssues, notes, systemsUsed, phone, ram, storageType, storageSize, monitorsCount,
      customFields, connectionType
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  devices.forEach(d => {
    stmt.run(
      d.employeeName, d.department, d.section, d.unit, d.deviceNature, d.deviceModel, d.serviceTag,
      d.technicalStatus, d.recurringIssues, d.notes, d.systemsUsed, d.phone, d.ram, d.storageType, d.storageSize, d.monitorsCount,
      d.customFields, d.connectionType
    );
  });

  stmt.finalize();
  db.run("COMMIT", (err) => {
    if (err) console.error(err);
    else console.log("Successfully inserted 150 extra devices (Printers, Fingerprints, Access Points)!");
    db.close();
  });
});
