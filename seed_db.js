const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbFile = path.join(__dirname, 'data', 'inventory.db');
const db = new sqlite3.Database(dbFile);

function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

const structure = {
    "مجلس الإدارة": ["مكتب شؤون مجلس الإدارة", "مكتب الاستراتيجيات", "مكتب المخاطر والامتثال", "المكتب القانوني", "مكتب المراجعة الداخلية"],
    "المدير العام": ["مكتب شؤون المدير العام", "مكتب البرامج والمشروعات", "مكتب أمن المعلومات والأمن السيبراني", "مكتب ضمان الجودة وتطوير الأعمال"],
    "إدارة الموارد": ["قسم عمليات الموارد البشرية", "قسم تخطيط الموارد", "قسم التطوير والتقييم"],
    "الإدارة المالية": ["قسم الاعتمادات المستندية", "قسم المقبوضات", "قسم المدفوعات", "قسم المحاسبة والميزانيات"],
    "الإدارة التجارية": ["دائرة التسويق والمبيعات", "دائرة المنتجات", "قسم الحركة الهاتفية"],
    "الإدارة الفنية": ["مركز عمليات الشبكة", "دائرة التشغيل والصيانة"],
    "إدارة تقنية المعلومات": ["قسم الدعم الفني لتقنية المعلومات", "قسم البنية التحتية لتقنية المعلومات", "قسم التطبيقات"],
    "إدارة الخدمات": ["قسم الخدمات", "قسم المخازن", "قسم المشاريع والعقود"]
};

const names = ["أحمد علي", "محمد حسن", "فاطمة محمود", "عائشة سالم", "عبدالله سعيد", "عمر خالد", "خديجة إبراهيم", "مريم مصطفى", "يوسف طارق", "مصطفى كمال", "علي منصور", "حسين فرج", "محمود رمضان", "نور الدين", "سالم جمعة", "صالح فوزي"];

const deviceNatures = ["مكتبي (Desktop)", "محمول (Laptop)", "بدون كمبيوتر / عهدة أخرى (None)"];
const models = ["Dell OptiPlex 7090", "HP EliteDesk 800", "Lenovo ThinkCentre M70q", "Dell Latitude 5420", "HP EliteBook 840", "Lenovo ThinkPad T14", "MacBook Pro 14", "iMac 24"];
const rams = ["8GB", "16GB", "32GB"];
const storageTypes = ["HDD", "SSD", "NVMe"];
const storageSizes = ["256GB", "512GB", "1TB"];
const statuses = ["سليم", "بحاجة لصيانة", "تحت الصيانة"];

function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
    console.log("Seeding database...");
    let addedCount = 0;
    
    for (const [dept, sections] of Object.entries(structure)) {
        for (const section of sections) {
            const numDevices = Math.floor(Math.random() * 5) + 3; // 3 to 7 devices per section
            for (let i = 0; i < numDevices; i++) {
                const nature = getRandom(deviceNatures);
                const isNoPc = nature.includes("بدون");
                
                const deviceData = {
                    employeeName: getRandom(names) + " " + getRandom(names).split(" ")[1],
                    department: dept,
                    section: section,
                    unit: "",
                    deviceNature: nature,
                    deviceModel: isNoPc ? "-" : getRandom(models),
                    serviceTag: isNoPc ? "-" : "SN-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
                    ram: isNoPc ? "-" : getRandom(rams),
                    storageType: isNoPc ? "-" : getRandom(storageTypes),
                    storageSize: isNoPc ? "-" : getRandom(storageSizes),
                    monitorsCount: isNoPc ? 0 : Math.floor(Math.random() * 3), // 0 to 2 monitors
                    phone: Math.random() > 0.3 ? "Cisco " + (Math.floor(Math.random() * 8000) + 1000) : "لا يوجد",
                    technicalStatus: getRandom(statuses),
                    systemsUsed: "Microsoft Office, ERP",
                    recurringIssues: Math.random() > 0.8 ? "بطء في النظام" : "",
                    notes: "",
                    customFields: JSON.stringify({})
                };

                await dbRun(`
                  INSERT INTO devices (
                    employeeName, department, section, unit,
                    deviceModel, ram, storageType, storageSize,
                    monitorsCount, phone, technicalStatus, systemsUsed,
                    recurringIssues, notes, customFields,
                    deviceNature, serviceTag
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    deviceData.employeeName, deviceData.department, deviceData.section, deviceData.unit,
                    deviceData.deviceModel, deviceData.ram, deviceData.storageType, deviceData.storageSize,
                    deviceData.monitorsCount, deviceData.phone, deviceData.technicalStatus, deviceData.systemsUsed,
                    deviceData.recurringIssues, deviceData.notes, deviceData.customFields,
                    deviceData.deviceNature, deviceData.serviceTag
                ]);
                addedCount++;
            }
        }
    }
    console.log(`Seeding complete. Added ${addedCount} devices.`);
}

seed().catch(console.error);
