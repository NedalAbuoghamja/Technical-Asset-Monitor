const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const XLSX = require('xlsx');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'devices.json');
const COLUMNS_FILE = path.join(__dirname, 'data', 'columns.json');
const DATA_DIR = path.join(__dirname, 'data');
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_2026';

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Multer storage for uploaded files
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// SQLite Database Setup
const dbFile = path.join(DATA_DIR, 'inventory.db');
const db = new sqlite3.Database(dbFile);

// SQLite Promise Wrappers
function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Helper to hash password using PBKDF2
function hashPassword(password) {
  const salt = 'antigravity_salt_2026';
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

// Database Initialization & Migration
async function initDb() {
  // Create tables
  await dbRun(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS columns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employeeName TEXT,
      department TEXT,
      section TEXT,
      unit TEXT,
      deviceModel TEXT,
      ram TEXT,
      storageType TEXT,
      storageSize TEXT,
      monitorsCount INTEGER,
      deviceNature TEXT,
      serviceTag TEXT,
      recurringIssues TEXT,
      notes TEXT,
      systemsUsed TEXT,
      phone TEXT,
      technicalStatus TEXT,
      customFields TEXT
    )
  `);

  // Create default Admin account if empty
  const adminExists = await dbGet(`SELECT * FROM users WHERE username = 'admin'`);
  if (!adminExists) {
    const hashed = hashPassword('admin2026');
    await dbRun(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`, ['admin', hashed, 'Admin']);
    console.log("Default admin account created: admin / admin2026");
  }

  // Migrate devices from JSON to SQLite if table is empty
  const deviceCount = await dbGet(`SELECT COUNT(*) as count FROM devices`);
  if (deviceCount.count === 0 && fs.existsSync(DATA_FILE)) {
    console.log("Migrating devices from JSON to SQLite...");
    try {
      const rawData = fs.readFileSync(DATA_FILE, 'utf8');
      const oldDevices = JSON.parse(rawData);
      for (const d of oldDevices) {
        await dbRun(`
          INSERT INTO devices (
            id, employeeName, department, section, unit, deviceModel, ram, storageType, storageSize,
            monitorsCount, deviceNature, serviceTag, recurringIssues, notes, systemsUsed, phone, technicalStatus, customFields
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          d.id,
          d.employeeName || 'غير معروف',
          d.department || 'لا يوجد',
          d.section || 'لا يوجد',
          d.unit || 'لا يوجد',
          d.deviceModel || 'لا يوجد',
          d.ram || 'لا يوجد',
          d.storageType || 'SSD',
          d.storageSize || 'لا يوجد',
          parseInt(d.monitorsCount) || 1,
          d.deviceNature || 'Desktop',
          d.serviceTag || 'لا يوجد',
          d.recurringIssues || 'لا توجد مشاكل حالياً',
          d.notes || 'لا يوجد',
          d.systemsUsed || 'لا يوجد',
          d.phone || 'لا يوجد',
          d.technicalStatus || 'سليم',
          JSON.stringify(d.customFields || [])
        ]);
      }
      console.log(`Successfully migrated ${oldDevices.length} devices.`);
      fs.renameSync(DATA_FILE, DATA_FILE + '.bak');
    } catch (e) {
      console.error("Migration of devices failed:", e);
    }
  }

  // Migrate columns from JSON to SQLite if table is empty
  const columnCount = await dbGet(`SELECT COUNT(*) as count FROM columns`);
  if (columnCount.count === 0 && fs.existsSync(COLUMNS_FILE)) {
    console.log("Migrating custom columns from JSON to SQLite...");
    try {
      const rawData = fs.readFileSync(COLUMNS_FILE, 'utf8');
      const oldColumns = JSON.parse(rawData);
      for (const colName of oldColumns) {
        if (colName && colName.trim()) {
          await dbRun(`INSERT OR IGNORE INTO columns (name) VALUES (?)`, [colName.trim()]);
        }
      }
      console.log(`Successfully migrated ${oldColumns.length} custom columns.`);
      fs.renameSync(COLUMNS_FILE, COLUMNS_FILE + '.bak');
    } catch (e) {
      console.error("Migration of columns failed:", e);
    }
  }
}

// Authentication Middlewares
function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'غير مصرح: يجب تسجيل الدخول' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'جلسة غير صالحة أو منتهية' });
    }
    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  authenticateToken(req, res, () => {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'غير مصرح: هذه العملية تتطلب صلاحية مدير النظام' });
    }
    next();
  });
}

// ==========================================
// SSE - REAL-TIME UPDATES
// ==========================================

const sseClients = new Set();

function broadcastUpdate(eventType, data = {}) {
  const payload = `data: ${JSON.stringify({ type: eventType, ...data })}\n\n`;
  sseClients.forEach(client => {
    try {
      client.write(payload);
    } catch (e) {
      sseClients.delete(client);
    }
  });
}

// SSE Endpoint - authenticated clients connect here to receive live updates
app.get('/api/events', (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).end();
  }

  jwt.verify(token, JWT_SECRET, (err) => {
    if (err) return res.status(403).end();

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    // Send initial connection confirmation
    res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

    sseClients.add(res);

    // Heartbeat every 25 seconds to keep connection alive
    const heartbeat = setInterval(() => {
      try {
        res.write(': heartbeat\n\n');
      } catch (e) {
        clearInterval(heartbeat);
      }
    }, 25000);

    req.on('close', () => {
      sseClients.delete(res);
      clearInterval(heartbeat);
    });
  });
});

// ==========================================
// AUTHENTICATION APIs
// ==========================================


// Login Route
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'اسم المستخدم وكلمة المرور مطلوبان' });
  }

  try {
    const user = await dbGet(`SELECT * FROM users WHERE username = ?`, [username.trim()]);
    if (!user) {
      return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }

    const hashed = hashPassword(password);
    if (user.password !== hashed) {
      return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.cookie('token', token, { httpOnly: true, secure: false, maxAge: 24 * 60 * 60 * 1000 });
    res.json({ success: true, user: { username: user.username, role: user.role } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: 'حدث خطأ أثناء تسجيل الدخول' });
  }
});

// Logout Route
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
});

// Session Verification Route
app.get('/api/auth/me', (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ authenticated: false });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ authenticated: false });
    }
    res.json({ authenticated: true, user: decoded });
  });
});

// ==========================================
// USER MANAGEMENT APIs (Admin Only)
// ==========================================

// Get all users
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const users = await dbAll(`SELECT id, username, role FROM users`);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'فشل في جلب المستخدمين' });
  }
});

// Add user
app.post('/api/admin/users', requireAdmin, async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
  }

  if (role !== 'Admin' && role !== 'User') {
    return res.status(400).json({ error: 'الدور غير صالح' });
  }

  try {
    const hashed = hashPassword(password);
    await dbRun(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`, [username.trim(), hashed, role]);
    res.status(201).json({ success: true, message: 'تم إضافة المستخدم بنجاح' });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'اسم المستخدم موجود بالفعل' });
    }
    res.status(500).json({ error: 'فشل في إضافة المستخدم' });
  }
});

// Delete user
app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const userToDelete = await dbGet(`SELECT * FROM users WHERE id = ?`, [id]);
    if (!userToDelete) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    if (userToDelete.username === 'admin') {
      return res.status(400).json({ error: 'لا يمكن حذف الحساب الرئيسي (admin)' });
    }

    if (userToDelete.id === req.user.id) {
      return res.status(400).json({ error: 'لا يمكنك حذف حسابك الحالي أثناء تسجيل الدخول' });
    }

    await dbRun(`DELETE FROM users WHERE id = ?`, [id]);
    res.json({ success: true, message: 'تم حذف المستخدم بنجاح' });
  } catch (error) {
    res.status(500).json({ error: 'فشل في حذف المستخدم' });
  }
});

// ==========================================
// CUSTODY / DEVICES APIs
// ==========================================

// Get all devices
app.get('/api/devices', authenticateToken, async (req, res) => {
  try {
    const rows = await dbAll(`SELECT * FROM devices`);
    const devices = rows.map(r => ({
      ...r,
      customFields: r.customFields ? JSON.parse(r.customFields) : []
    }));
    res.json(devices);
  } catch (error) {
    console.error("Get devices error:", error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الأجهزة' });
  }
});

// Get all custom columns
app.get('/api/columns', authenticateToken, async (req, res) => {
  try {
    const rows = await dbAll(`SELECT name FROM columns`);
    res.json(rows.map(r => r.name));
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الأعمدة' });
  }
});

// Add custom column (Admin only)
app.post('/api/columns', requireAdmin, async (req, res) => {
  const name = req.body.name ? req.body.name.trim() : '';
  if (!name) {
    return res.status(400).json({ error: 'الاسم مطلوب' });
  }

  try {
    await dbRun(`INSERT INTO columns (name) VALUES (?)`, [name]);
    const rows = await dbAll(`SELECT name FROM columns`);
    res.json(rows.map(r => r.name));
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'العمود موجود بالفعل' });
    }
    res.status(500).json({ error: 'فشل في إضافة العمود' });
  }
});

// Add device (Admin only)
app.post('/api/devices', requireAdmin, async (req, res) => {
  try {
    const {
      employeeName, department, section, unit, deviceModel, ram, storageType, storageSize,
      monitorsCount, deviceNature, serviceTag, recurringIssues, notes, systemsUsed, phone, technicalStatus, customFields
    } = req.body;

    const result = await dbRun(`
      INSERT INTO devices (
        employeeName, department, section, unit, deviceModel, ram, storageType, storageSize,
        monitorsCount, deviceNature, serviceTag, recurringIssues, notes, systemsUsed, phone, technicalStatus, customFields
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      employeeName || 'غير معروف',
      department || 'لا يوجد',
      section || 'لا يوجد',
      unit || 'لا يوجد',
      deviceModel || 'لا يوجد',
      ram || 'لا يوجد',
      storageType || 'SSD',
      storageSize || 'لا يوجد',
      parseInt(monitorsCount) || 1,
      deviceNature || 'Desktop',
      serviceTag || 'لا يوجد',
      recurringIssues || 'لا توجد مشاكل حالياً',
      notes || 'لا يوجد',
      systemsUsed || 'لا يوجد',
      phone || 'لا يوجد',
      technicalStatus || 'سليم',
      JSON.stringify(customFields || [])
    ]);

    const newDevice = {
      id: result.lastID,
      employeeName, department, section, unit, deviceModel, ram, storageType, storageSize,
      monitorsCount, deviceNature, serviceTag, recurringIssues, notes, systemsUsed, phone, technicalStatus, customFields
    };

    res.status(201).json(newDevice);
    broadcastUpdate('devices_updated', { action: 'add', by: req.user.username });
  } catch (error) {
    console.error("Add device error:", error);
    res.status(500).json({ error: 'فشل في إضافة الجهاز' });
  }
});

// Edit device (Admin only)
app.put('/api/devices/:id', requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const device = await dbGet(`SELECT * FROM devices WHERE id = ?`, [id]);
    if (!device) {
      return res.status(404).json({ error: 'الجهاز غير موجود' });
    }

    const {
      employeeName, department, section, unit, deviceModel, ram, storageType, storageSize,
      monitorsCount, deviceNature, serviceTag, recurringIssues, notes, systemsUsed, phone, technicalStatus, customFields
    } = req.body;

    const updatedEmployeeName = employeeName !== undefined ? employeeName : device.employeeName;
    const updatedDepartment = department !== undefined ? department : device.department;
    const updatedSection = section !== undefined ? section : device.section;
    const updatedUnit = unit !== undefined ? unit : device.unit;
    const updatedDeviceModel = deviceModel !== undefined ? deviceModel : device.deviceModel;
    const updatedRam = ram !== undefined ? ram : device.ram;
    const updatedStorageType = storageType !== undefined ? storageType : device.storageType;
    const updatedStorageSize = storageSize !== undefined ? storageSize : device.storageSize;
    const updatedMonitorsCount = monitorsCount !== undefined ? parseInt(monitorsCount) || 1 : device.monitorsCount;
    const updatedDeviceNature = deviceNature !== undefined ? deviceNature : device.deviceNature;
    const updatedServiceTag = serviceTag !== undefined ? serviceTag : device.serviceTag;
    const updatedRecurringIssues = recurringIssues !== undefined ? recurringIssues : device.recurringIssues;
    const updatedNotes = notes !== undefined ? notes : device.notes;
    const updatedSystemsUsed = systemsUsed !== undefined ? systemsUsed : device.systemsUsed;
    const updatedPhone = phone !== undefined ? phone : device.phone;
    const updatedTechnicalStatus = technicalStatus !== undefined ? technicalStatus : device.technicalStatus;
    const updatedCustomFields = customFields !== undefined ? JSON.stringify(customFields) : device.customFields;

    await dbRun(`
      UPDATE devices SET
        employeeName = ?, department = ?, section = ?, unit = ?, deviceModel = ?, ram = ?, storageType = ?, storageSize = ?,
        monitorsCount = ?, deviceNature = ?, serviceTag = ?, recurringIssues = ?, notes = ?, systemsUsed = ?, phone = ?, technicalStatus = ?, customFields = ?
      WHERE id = ?
    `, [
      updatedEmployeeName, updatedDepartment, updatedSection, updatedUnit, updatedDeviceModel, updatedRam, updatedStorageType, updatedStorageSize,
      updatedMonitorsCount, updatedDeviceNature, updatedServiceTag, updatedRecurringIssues, updatedNotes, updatedSystemsUsed, updatedPhone, updatedTechnicalStatus, updatedCustomFields,
      id
    ]);

    const updatedDevice = {
      id,
      employeeName: updatedEmployeeName,
      department: updatedDepartment,
      section: updatedSection,
      unit: updatedUnit,
      deviceModel: updatedDeviceModel,
      ram: updatedRam,
      storageType: updatedStorageType,
      storageSize: updatedStorageSize,
      monitorsCount: updatedMonitorsCount,
      deviceNature: updatedDeviceNature,
      serviceTag: updatedServiceTag,
      recurringIssues: updatedRecurringIssues,
      notes: updatedNotes,
      systemsUsed: updatedSystemsUsed,
      phone: updatedPhone,
      technicalStatus: updatedTechnicalStatus,
      customFields: updatedCustomFields ? JSON.parse(updatedCustomFields) : []
    };

    res.json(updatedDevice);
    broadcastUpdate('devices_updated', { action: 'edit', by: req.user.username });
  } catch (error) {
    console.error("Update device error:", error);
    res.status(500).json({ error: 'فشل في تحديث الجهاز' });
  }
});

// Delete device (Admin only)
app.delete('/api/devices/:id', requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const device = await dbGet(`SELECT * FROM devices WHERE id = ?`, [id]);
    if (!device) {
      return res.status(404).json({ error: 'الجهاز غير موجود' });
    }

    await dbRun(`DELETE FROM devices WHERE id = ?`, [id]);
    res.json({ success: true, message: 'تم حذف الجهاز بنجاح' });
    broadcastUpdate('devices_updated', { action: 'delete', by: req.user.username });
  } catch (error) {
    res.status(500).json({ error: 'فشل في حذف الجهاز' });
  }
});

// Export to Excel (All authenticated users)
app.get('/api/export', authenticateToken, async (req, res) => {
  try {
    const rows = await dbAll(`SELECT * FROM devices`);
    const devices = rows.map(r => ({
      ...r,
      customFields: r.customFields ? JSON.parse(r.customFields) : []
    }));

    // Find all unique custom field labels
    const customKeys = [];
    devices.forEach(d => {
      if (d.customFields) {
        d.customFields.forEach(cf => {
          if (cf.label && !customKeys.includes(cf.label)) {
            customKeys.push(cf.label);
          }
        });
      }
    });

    const formattedData = devices.map(d => {
      const row = {
        "اسم الموظف": d.employeeName,
        "الإدارة": d.department,
        "القسم": d.section,
        "الوحدة": d.unit,
        "نوع الجهاز": d.deviceModel,
        "سعة الرام (RAM)": d.ram,
        "نوع الهاردسك": d.storageType,
        "حجم الهاردسك": d.storageSize,
        "عدد الشاشات": d.monitorsCount,
        "طبيعة الجهاز": d.deviceNature,
        "السيرفس تاق (Service Tag)": d.serviceTag,
        "الحالة التقنية": d.technicalStatus || 'سليم',
        "المشاكل المتكررة": d.recurringIssues,
        "الملاحظات": d.notes || 'لا يوجد',
        "الأنظمة والمنظومات المستخدمة": d.systemsUsed,
        "الهاتف / الملحقات": d.phone
      };

      customKeys.forEach(key => {
        const field = d.customFields ? d.customFields.find(cf => cf.label === key) : null;
        row[key] = field ? field.value : 'لا يوجد';
      });

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "بيانات الأجهزة والموظفين");
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Inventory_Employees_Devices_Export.xlsx');
    res.send(buffer);
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).send("فشل تصدير البيانات");
  }
});

// Import from Excel (Admin only)
app.post('/api/import', requireAdmin, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'لم يتم رفع أي ملف' });
  }

  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (rows.length < 3) {
      return res.status(400).json({ error: 'تنسيق ورقة عمل Excel غير صالح أو لا يحتوي على بيانات كافية' });
    }

    let headerIdx = -1;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row.includes("اسم الموظف") || row.includes("السيرفس تاق (Service Tag)") || row.includes("نوع الجهاز")) {
        headerIdx = i;
        break;
      }
    }

    if (headerIdx === -1) {
      headerIdx = rows.length > 2 ? 2 : 0;
    }

    const headers = rows[headerIdx];
    const dataRows = rows.slice(headerIdx + 1);

    const dbDevices = await dbAll(`SELECT * FROM devices`);
    const devices = dbDevices.map(r => ({
      ...r,
      customFields: r.customFields ? JSON.parse(r.customFields) : []
    }));

    const standardHeaders = [
      "اسم الموظف", "الإدارة", "القسم", "الوحدة", "نوع الجهاز",
      "سعة الرام (RAM)", "سعة الرام", "نوع الهاردسك", "حجم الهاردسك",
      "عدد الشاشات", "طبيعة الجهاز", "السيرفس تاق (Service Tag)", "السيرفس تاق",
      "السيريال ماي [Service Tag]", "الحالة التقنية", "المشاكل المتكررة", "الملاحظات", "ملاحظات", "الأنظمة والمنظومات المستخدمة",
      "الأنظمة والمستلزمات المستخدمة", "الهاتف / الملحقات", "الهاتف", "هاتف", "تليفون"
    ];

    let addedCount = 0;
    let updatedCount = 0;

    for (const row of dataRows) {
      if (!row || row.length === 0 || !row[0]) continue;

      const getValue = (headerNames, indexFallback) => {
        for (const name of headerNames) {
          const idx = headers.indexOf(name);
          if (idx !== -1 && row[idx] !== undefined) {
            return String(row[idx]).trim();
          }
        }
        if (row[indexFallback] !== undefined) {
          return String(row[indexFallback]).trim();
        }
        return 'لا يوجد';
      };

      const employeeName = getValue(["اسم الموظف"], 0);
      const department = getValue(["الإدارة"], 1);
      const section = getValue(["القسم"], 2);
      const unit = getValue(["الوحدة"], 3);
      const deviceModel = getValue(["نوع الجهاز"], 4);
      const ram = getValue(["سعة الرام (RAM)", "سعة الرام"], 5);
      const storageType = getValue(["نوع الهاردسك"], 6);
      const storageSize = getValue(["حجم الهاردسك"], 7);
      const rawMonitors = getValue(["عدد الشاشات"], 8);
      const monitorsCount = parseInt(rawMonitors) || 1;
      const deviceNature = getValue(["طبيعة الجهاز"], 9);
      const serviceTag = getValue(["السيرفس تاق (Service Tag)", "السيرفس تاق", "السيريال ماي [Service Tag]"], 10);
      const technicalStatus = getValue(["الحالة التقنية"], 11) || 'سليم';
      const recurringIssues = getValue(["المشاكل المتكررة"], 12);
      const notes = getValue(["الملاحظات", "ملاحظات"], 13);
      const systemsUsed = getValue(["الأنظمة والمنظومات المستخدمة", "الأنظمة والمستلزمات المستخدمة"], 14);
      const phone = getValue(["الهاتف / الملحقات", "هاتف", "تليفون"], 15);

      const customFields = [];
      headers.forEach((header, idx) => {
        if (header && !standardHeaders.includes(header.trim()) && row[idx] !== undefined) {
          const val = String(row[idx]).trim();
          if (val && val !== 'لا يوجد' && val !== 'لايوجد') {
            customFields.push({ label: header.trim(), value: val });
          }
        }
      });

      const match = devices.find(d => 
        (d.serviceTag !== 'لا يوجد' && d.serviceTag.toLowerCase() === serviceTag.toLowerCase()) ||
        (d.employeeName.toLowerCase() === employeeName.toLowerCase())
      );

      if (match) {
        await dbRun(`
          UPDATE devices SET
            employeeName = ?, department = ?, section = ?, unit = ?, deviceModel = ?, ram = ?, storageType = ?, storageSize = ?,
            monitorsCount = ?, deviceNature = ?, serviceTag = ?, recurringIssues = ?, notes = ?, systemsUsed = ?, phone = ?, technicalStatus = ?, customFields = ?
          WHERE id = ?
        `, [
          employeeName, department, section, unit, deviceModel, ram, storageType, storageSize,
          monitorsCount, deviceNature, serviceTag, recurringIssues, notes, systemsUsed, phone, technicalStatus, JSON.stringify(customFields),
          match.id
        ]);
        updatedCount++;
      } else {
        await dbRun(`
          INSERT INTO devices (
            employeeName, department, section, unit, deviceModel, ram, storageType, storageSize,
            monitorsCount, deviceNature, serviceTag, recurringIssues, notes, systemsUsed, phone, technicalStatus, customFields
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          employeeName, department, section, unit, deviceModel, ram, storageType, storageSize,
          monitorsCount, deviceNature, serviceTag, recurringIssues, notes, systemsUsed, phone, technicalStatus, JSON.stringify(customFields)
        ]);
        addedCount++;
      }
    }

    res.json({ 
      success: true, 
      message: `تم استيراد البيانات بنجاح. المضافة: ${addedCount}، المحدثة: ${updatedCount}`,
      addedCount,
      updatedCount
    });
    broadcastUpdate('devices_updated', { action: 'import', by: req.user.username });
  } catch (error) {
    console.error("Import error:", error);
    res.status(500).json({ error: 'فشل في قراءة ملف Excel: ' + error.message });
  }
});

// Fallback to index.html for frontend routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start DB and start server
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`==================================================`);
      console.log(`  Device Inventory System is running locally!`);
      console.log(`  Access UI: http://localhost:${PORT}`);
      console.log(`==================================================`);
    });
  })
  .catch(err => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });
