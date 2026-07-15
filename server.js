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
      name TEXT UNIQUE,
      section TEXT DEFAULT 'specs'
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
      employeeId TEXT,
      technicalStatus TEXT,
      customFields TEXT,
      connectionType TEXT
    )
  `);

  
  try {
    await dbRun(`ALTER TABLE devices ADD COLUMN employeeId TEXT`);
    console.log("Added employeeId column to devices table.");
  } catch (err) {
    // Column likely exists
  }

  // Try to add connectionType to existing devices table if it doesn't exist
  try {
    await dbRun(`ALTER TABLE devices ADD COLUMN connectionType TEXT`);
    console.log("Added connectionType column to devices table.");
  } catch (err) {
    // Column likely exists
  }

  await dbRun(`
    CREATE TABLE IF NOT EXISTS device_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id INTEGER,
      previous_employee TEXT,
      previous_department TEXT,
      previous_section TEXT,
      previous_unit TEXT,
      new_employee TEXT,
      new_department TEXT,
      new_section TEXT,
      new_unit TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      changed_by TEXT,
      FOREIGN KEY(device_id) REFERENCES devices(id) ON DELETE CASCADE
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
            monitorsCount, deviceNature, serviceTag, recurringIssues, notes, systemsUsed, phone, employeeId, technicalStatus, customFields
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
      employeeId || '',
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
    const rows = await dbAll(`SELECT id, name, section FROM columns`);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الأعمدة' });
  }
});

// Get device history
app.get('/api/devices/:id/history', authenticateToken, async (req, res) => {
  const device_id = parseInt(req.params.id);
  try {
    const history = await dbAll(`SELECT * FROM device_history WHERE device_id = ? ORDER BY timestamp DESC`, [device_id]);
    res.json(history);
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب سجل الجهاز' });
  }
});

// Add custom column (Admin only)
app.post('/api/columns', requireAdmin, async (req, res) => {
  const { name, section } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'اسم الحقل مطلوب' });
  }
  const colSection = section || 'specs';
  try {
    const result = await dbRun(`INSERT INTO columns (name, section) VALUES (?, ?)`, [name.trim(), colSection]);
    res.status(201).json({ id: result.lastID, name: name.trim(), section: colSection });
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      res.status(400).json({ error: 'اسم الحقل موجود مسبقاً' });
    } else {
      res.status(500).json({ error: 'فشل إضافة الحقل' });
    }
  }
});

// Edit custom column (Admin only)
app.put('/api/columns/:id', requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, section } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'اسم الحقل مطلوب' });
  }

  try {
    const column = await dbGet(`SELECT name FROM columns WHERE id = ?`, [id]);
    if (!column) return res.status(404).json({ error: 'العمود غير موجود' });
    const oldName = column.name;
    const newName = name.trim();

    if (section) {
      await dbRun(`UPDATE columns SET name = ?, section = ? WHERE id = ?`, [newName, section, id]);
    } else {
      await dbRun(`UPDATE columns SET name = ? WHERE id = ?`, [newName, id]);
    }

    // Update devices JSON fields
    const devices = await dbAll(`SELECT id, customFields FROM devices WHERE customFields IS NOT NULL AND customFields != '[]'`);
    for (const d of devices) {
      let fields = JSON.parse(d.customFields);
      let changed = false;
      fields.forEach(f => {
        if (f.label === oldName) {
          f.label = newName;
          changed = true;
        }
      });
      if (changed) {
        await dbRun(`UPDATE devices SET customFields = ? WHERE id = ?`, [JSON.stringify(fields), d.id]);
      }
    }

    res.json({ success: true });
    broadcastUpdate('devices_updated', { action: 'columns_changed' });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'الاسم موجود بالفعل' });
    }
    res.status(500).json({ error: 'فشل تعديل الحقل' });
  }
});

// Delete custom column (Admin only)
app.delete('/api/columns/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const column = await dbGet(`SELECT name FROM columns WHERE id = ?`, [id]);
    if (!column) return res.status(404).json({ error: 'العمود غير موجود' });
    const oldName = column.name;

    await dbRun(`DELETE FROM columns WHERE id = ?`, [id]);

    // Remove from devices JSON fields
    const devices = await dbAll(`SELECT id, customFields FROM devices WHERE customFields IS NOT NULL AND customFields != '[]'`);
    for (const d of devices) {
      let fields = JSON.parse(d.customFields);
      const originalLength = fields.length;
      fields = fields.filter(f => f.label !== oldName);
      if (fields.length !== originalLength) {
        await dbRun(`UPDATE devices SET customFields = ? WHERE id = ?`, [JSON.stringify(fields), d.id]);
      }
    }

    res.json({ success: true });
    broadcastUpdate('devices_updated', { action: 'columns_changed' });
  } catch (error) {
    res.status(500).json({ error: 'فشل حذف الحقل' });
  }
});

// Add device (Admin only)
app.post('/api/devices', requireAdmin, async (req, res) => {
  try {
    const {
      employeeName, orgPath, deviceModel, ram, storageType, storageSize,
      monitorsCount, deviceNature, serviceTag, recurringIssues, notes, systemsUsed, phone, employeeId, technicalStatus, customFields, connectionType, osVersion, ipAddress
    } = req.body;

    const result = await dbRun(`
      INSERT INTO devices (
        employeeName, orgPath, deviceModel, ram, storageType, storageSize,
        monitorsCount, deviceNature, serviceTag, recurringIssues, notes, systemsUsed, phone, employeeId, technicalStatus, customFields, connectionType, osVersion, ipAddress, department, circle, section, unit
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', '', '', '')
    `, [
      employeeName || 'غير معروف',
      orgPath || 'مجلس الإدارة',
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
      JSON.stringify(customFields || []),
      connectionType || 'USB',
      osVersion || '',
      ipAddress || ''
    ]);

    const newDevice = {
      id: result.lastID,
      employeeName, orgPath, deviceModel, ram, storageType, storageSize,
      monitorsCount, deviceNature, serviceTag, recurringIssues, notes, systemsUsed, phone, employeeId, technicalStatus, customFields, connectionType, osVersion, ipAddress
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
      employeeName, orgPath, deviceModel, ram, storageType, storageSize,
      monitorsCount, deviceNature, serviceTag, recurringIssues, notes, systemsUsed, phone, employeeId, technicalStatus, customFields, connectionType, osVersion, ipAddress
    } = req.body;

    const updatedEmployeeName = employeeName !== undefined ? employeeName : device.employeeName;
    const updatedOrgPath = orgPath !== undefined ? orgPath : device.orgPath;

    // Check if employee or location changed
    if (
      updatedEmployeeName !== device.employeeName ||
      updatedOrgPath !== device.orgPath
    ) {
      await dbRun(`
        INSERT INTO device_history (
          device_id, previous_employee, previous_orgPath,
          new_employee, new_orgPath, changed_by
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        id, device.employeeName, device.orgPath,
        updatedEmployeeName, updatedOrgPath, req.user.username
      ]);
    }

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
    const updatedEmployeeId = employeeId !== undefined ? employeeId : device.employeeId;
    const updatedTechnicalStatus = technicalStatus !== undefined ? technicalStatus : device.technicalStatus;
    const updatedCustomFields = customFields !== undefined ? JSON.stringify(customFields) : device.customFields;
    const updatedConnectionType = connectionType !== undefined ? connectionType : device.connectionType;
    const updatedOsVersion = osVersion !== undefined ? osVersion : device.osVersion;
    const updatedIpAddress = ipAddress !== undefined ? ipAddress : device.ipAddress;

    await dbRun(`
      UPDATE devices SET
        employeeName = ?, orgPath = ?, deviceModel = ?, ram = ?, storageType = ?, storageSize = ?,
        monitorsCount = ?, deviceNature = ?, serviceTag = ?, recurringIssues = ?, notes = ?, systemsUsed = ?, phone = ?, employeeId = ?, technicalStatus = ?, customFields = ?, connectionType = ?, osVersion = ?, ipAddress = ?
      WHERE id = ?
    `, [
      updatedEmployeeName, updatedOrgPath, updatedDeviceModel, updatedRam, updatedStorageType, updatedStorageSize,
      updatedMonitorsCount, updatedDeviceNature, updatedServiceTag, updatedRecurringIssues, updatedNotes, updatedSystemsUsed, updatedPhone, updatedEmployeeId, updatedTechnicalStatus, updatedCustomFields, updatedConnectionType, updatedOsVersion, updatedIpAddress,
      id
    ]);

    const updatedDevice = {
      id,
      employeeName: updatedEmployeeName,
      orgPath: updatedOrgPath,
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
      customFields: updatedCustomFields ? JSON.parse(updatedCustomFields) : [],
      connectionType: updatedConnectionType,
      osVersion: updatedOsVersion,
      ipAddress: updatedIpAddress
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
      const paths = d.orgPath ? d.orgPath.split('||') : [];
      const row = {
        "اسم الموظف": d.employeeName,
        "الرقم الوظيفي": d.employeeId || '',
        "مجلس الإدارة / المكاتب": paths[0] || d.department || '',
        "الإدارة": paths[1] || d.section || '',
        "القسم": paths[2] || d.unit || '',
        "الوحدة": paths[3] || '',
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

    let headerIdx = 0;
    let maxScore = -1;
    
    for (let i = 0; i < Math.min(rows.length, 10); i++) {
      const row = rows[i] || [];
      let score = 0;
      row.forEach(cell => {
        if (!cell) return;
        const c = String(cell).trim();
        if (
          c.includes("الموظف") || c.includes("الاسم") || c.includes("الجهاز") || 
          c.includes("الرام") || c.includes("سيريال") || c.includes("الهاردسك") || 
          c.includes("القسم") || c.includes("الإدارة") || c.includes("الوحدة") ||
          c.includes("ملاحظات") || c.includes("الهاتف") || c.includes("الشاشات") ||
          c.includes("السيرفس")
        ) {
          score++;
        }
      });
      if (score > maxScore) {
        maxScore = score;
        headerIdx = i;
      }
    }

    const headers = rows[headerIdx];
    const dataRows = rows.slice(headerIdx + 1);

    const dbDevices = await dbAll(`SELECT * FROM devices`);
    const devices = dbDevices.map(r => ({
      ...r,
      customFields: r.customFields ? JSON.parse(r.customFields) : []
    }));

    const standardHeaders = [
      "اسم الموظف", "الاسم", "الإدارة", "القسم", "الوحدة", "نوع الجهاز",
      "سعة الرام (RAM)", "سعة الرام", "نوع الهاردسك", "حجم الهاردسك",
      "عدد الشاشات", "طبيعة الجهاز", "السيرفس تاق (Service Tag)", "السيرفس تاق",
      "السيريال ماي [Service Tag]", "الحالة التقنية", "المشاكل المتكررة", "الملاحظات", "ملاحظات", "الأنظمة والمنظومات المستخدمة",
      "الأنظمة والمستلزمات المستخدمة", "الهاتف / الملحقات", "الهاتف", "هاتف", "تليفون",
      "مجلس الإدارة / المكاتب", "الرقم الوظيفي", "رقم الموظف"
    ];

    let addedCount = 0;
    let updatedCount = 0;

    for (const row of dataRows) {
      if (!row || row.length === 0) continue;

      const getValue = (headerNames, indexFallback) => {
        let foundIdx = -1;
        for (const name of headerNames) {
          const idx = headers.indexOf(name);
          if (idx !== -1) {
            foundIdx = idx;
            break;
          }
        }
        
        if (foundIdx !== -1) {
          if (row[foundIdx] !== undefined) {
             return String(row[foundIdx]).trim();
          } else {
             return 'لا يوجد';
          }
        }
        
        if (indexFallback !== undefined && row[indexFallback] !== undefined) {
          return String(row[indexFallback]).trim();
        }
        return 'لا يوجد';
      };

      const employeeName = getValue(["اسم الموظف", "الاسم"], 0);
      const employeeId = getValue(["الرقم الوظيفي", "رقم الموظف"]);
      const topLevel = getValue(["مجلس الإدارة / المكاتب"]);
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
      
      let paths = [];
      if (topLevel && topLevel !== 'لا يوجد') paths.push(topLevel);
      if (department && department !== 'لا يوجد') paths.push(department);
      if (section && section !== 'لا يوجد') paths.push(section);
      if (unit && unit !== 'لا يوجد') paths.push(unit);
      
      const orgPath = paths.length > 0 ? paths.join('||') : 'مجلس الإدارة';

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
            employeeName, employeeId, orgPath, department, section, unit, deviceModel, ram, storageType, storageSize,
            monitorsCount, deviceNature, serviceTag, recurringIssues, notes, systemsUsed, phone, technicalStatus, customFields
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          employeeName, employeeId !== 'لا يوجد' ? employeeId : '', orgPath, department, section, unit, deviceModel, ram, storageType, storageSize,
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
