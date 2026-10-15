const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const XLSX = require('xlsx');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore, FieldValue, Filter } = require('firebase-admin/firestore');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_2026';

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Multer storage for uploaded files
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Helper to hash password using PBKDF2
function hashPassword(password) {
  const salt = 'antigravity_salt_2026';
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

// Database Initialization & Migration
async function initDb() {
  // Create default Admin account if empty
  const adminSnapshot = await db.collection('users').where('username', '==', 'admin').get();
  if (adminSnapshot.empty) {
    const hashed = hashPassword('admin2026');
    await db.collection('users').add({
      username: 'admin',
      password: hashed,
      role: 'Admin',
      permissions: '{}'
    });
    console.log("Default admin account created: admin / admin2026");
  }
}

// In-Memory and Offline Fallback Cache to protect against quota exhaustion
let devicesCache = null;
let lastDevicesFetch = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory cache

function loadLocalDevicesCache() {
  try {
    const cacheFile = path.join(__dirname, 'data', 'devices_cache.json');
    if (fs.existsSync(cacheFile)) {
      return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    }
  } catch (e) {
    console.error('Failed to load local devices cache:', e.message);
  }
  return [];
}

function loadLocalColumnsCache() {
  try {
    const cacheFile = path.join(__dirname, 'data', 'columns_cache.json');
    if (fs.existsSync(cacheFile)) {
      return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    }
  } catch (e) {}
  return [];
}

function loadLocalUsersCache() {
  try {
    const cacheFile = path.join(__dirname, 'data', 'users_cache.json');
    if (fs.existsSync(cacheFile)) {
      return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    }
  } catch (e) {}
  return [];
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

function requireAdminOrSupervisor(req, res, next) {
  authenticateToken(req, res, () => {
    if (req.user.role !== 'Admin' && req.user.role !== 'Supervisor') {
      return res.status(403).json({ error: 'غير مصرح: هذه الصلاحية للإدارة والمشرفين فقط' });
    }
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

function requirePermission(perm) {
  return function(req, res, next) {
    authenticateToken(req, res, () => {
      if (req.user.role === 'Admin') return next();
      
      let perms = req.user.permissions;
      if (typeof perms === 'string') {
        try { perms = JSON.parse(perms); } catch(e) { perms = {}; }
      }
      
      if (perms && perms[perm]) {
        return next();
      }
      return res.status(403).json({ error: 'غير مصرح: لا تملك الصلاحية للقيام بهذه العملية' });
    });
  };
}

// ==========================================
// SSE - REAL-TIME UPDATES
// ==========================================

const sseClients = new Set();

function broadcastUpdate(eventType, data = {}) {
  if (eventType === 'devices_updated') {
    devicesCache = null;
    lastDevicesFetch = 0;
  }
  const payload = `data: ${JSON.stringify({ type: eventType, ...data })}\n\n`;
  sseClients.forEach(client => {
    try {
      client.write(payload);
    } catch (e) {
      sseClients.delete(client);
    }
  });
}

async function logSystemActivity(action, entityType, entityName, username, details = '', targetUser = null) {
  try {
    const logData = {
      action, // 'add', 'edit', 'delete', 'import'
      entityType, // 'device', 'user', 'history'
      entityName, // e.g. "Ahmed's PC"
      username, // who did it
      details,
      timestamp: new Date().toISOString(),
      targetUser: targetUser || null
    };
    await db.collection('system_logs').add(logData);
    broadcastUpdate('new_log', logData);
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}

// SSE Endpoint
app.get('/api/events', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).end();

  jwt.verify(token, JWT_SECRET, (err) => {
    if (err) return res.status(403).end();

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);
    sseClients.add(res);

    const heartbeat = setInterval(() => {
      try { res.write(': heartbeat\n\n'); } catch (e) { clearInterval(heartbeat); }
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

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'اسم المستخدم وكلمة المرور مطلوبان' });

  try {
    const usersRef = db.collection('users');
    let user;
    let userId;

    try {
      const snapshot = await usersRef.where('username', '==', username.trim()).get();
      if (!snapshot.empty) {
        snapshot.forEach(doc => { user = doc.data(); userId = doc.id; });
      }
    } catch (dbErr) {
      console.warn('Firestore login lookup failed, checking local users cache:', dbErr.message);
    }

    if (!user) {
      const localUsers = loadLocalUsersCache();
      const found = localUsers.find(u => u.username === username.trim());
      if (found) {
        user = found;
        userId = found.id;
      }
    }

    if (!user) return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });

    const hashed = hashPassword(password);
    if (user.password !== hashed) return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });

    if (user.mustChangePassword) {
      return res.json({ requirePasswordChange: true, username: user.username });
    }

    const token = jwt.sign({ id: userId, username: user.username, role: user.role, permissions: user.permissions }, JWT_SECRET, { expiresIn: '365d' });
    res.cookie('token', token, { httpOnly: true, secure: false, maxAge: 365 * 24 * 60 * 60 * 1000 });
    res.json({ success: true, user: { username: user.username, role: user.role, permissions: user.permissions } });
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ أثناء تسجيل الدخول' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
});

app.get('/api/auth/me', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ authenticated: false });

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(401).json({ authenticated: false });
    
    try {
      const doc = await db.collection('users').doc(decoded.id).get();
      if (doc.exists) {
        const user = doc.data();
        return res.json({ authenticated: true, user: { id: decoded.id, username: user.username, role: user.role, permissions: user.permissions } });
      }
    } catch(e) {}
    
    res.json({ authenticated: true, user: decoded });
  });
});

// ==========================================

app.post('/api/auth/force-change-password', async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;
  if (!username || !oldPassword || !newPassword) {
    return res.status(400).json({ error: 'الرجاء إدخال جميع الحقول' });
  }

  try {
    const snapshot = await db.collection('users').where('username', '==', username).get();
    if (snapshot.empty) {
      return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }
    const doc = snapshot.docs[0];
    const user = doc.data();
    
    // Verify old password
    const hashedOld = hashPassword(oldPassword);
    if (user.password !== hashedOld) {
      return res.status(401).json({ error: 'كلمة المرور المؤقتة غير صحيحة' });
    }

    // Update password
    const hashedNew = hashPassword(newPassword);
    await doc.ref.update({
      password: hashedNew,
      mustChangePassword: false
    });

    // Sign a new token so they don't have to log in again
    const token = jwt.sign({ id: doc.id, username: user.username, role: user.role, permissions: user.permissions }, JWT_SECRET, { expiresIn: '365d' });
    res.cookie('token', token, { httpOnly: true });

    res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (error) {
    console.error("Force change password error:", error);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// USER MANAGEMENT APIs
// ==========================================

app.get('/api/logs', authenticateToken, async (req, res) => {
  try {
    let snapshot;
    const perms = typeof req.user.permissions === 'string' ? JSON.parse(req.user.permissions || '{}') : (req.user.permissions || {});
    const isGlobal = req.user.role === 'Admin' || perms.canViewLogs === true;
    
    if (isGlobal) {
      snapshot = await db.collection('system_logs').orderBy('timestamp', 'desc').limit(100).get();
    } else {
      snapshot = await db.collection('system_logs').where(
        Filter.or(
          Filter.where('username', '==', req.user.username),
          Filter.where('targetUser', '==', req.user.username)
        )
      ).orderBy('timestamp', 'desc').limit(100).get();
    }
    
    const logs = [];
    snapshot.forEach(doc => {
      logs.push({ id: doc.id, ...doc.data() });
    });
    res.json(logs);
  } catch (error) {
    console.warn('Firestore logs failed, returning empty list:', error.message);
    res.json([]);
  }
});

app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    const users = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      users.push({ 
        id: doc.id, 
        username: data.username, 
        role: data.role, 
        permissions: data.permissions,
        mustChangePassword: data.mustChangePassword
      });
    });
    res.json(users);
  } catch (error) {
    console.warn('Firestore get users failed, serving local fallback:', error.message);
    const local = loadLocalUsersCache();
    res.json(local.map(u => ({ id: u.id, username: u.username, role: u.role, permissions: u.permissions, mustChangePassword: false })));
  }
});

app.post('/api/admin/users', requireAdmin, async (req, res) => {
  const { username, password, role, permissions, mustChangePassword } = req.body;
  if (!username || !password || !role) return res.status(400).json({ error: 'جميع الحقول مطلوبة' });

  try {
    const snapshot = await db.collection('users').where('username', '==', username.trim()).get();
    if (!snapshot.empty) return res.status(400).json({ error: 'اسم المستخدم موجود بالفعل' });

    const hashed = hashPassword(password);
    await db.collection('users').add({
      username: username.trim(),
      password: hashed,
      role,
      permissions: JSON.stringify(permissions || {}),
      mustChangePassword: mustChangePassword !== undefined ? mustChangePassword : true
    });
    res.status(201).json({ success: true, message: 'تم إضافة المستخدم بنجاح' });
    logSystemActivity('add', 'user', username.trim(), req.user.username);
  } catch (error) {
    res.status(500).json({ error: 'فشل في إضافة المستخدم' });
  }
});

app.put('/api/admin/users/:id', requireAdmin, async (req, res) => {
  const id = req.params.id;
  const { password, role, permissions, mustChangePassword } = req.body;
  
  try {
    const docRef = db.collection('users').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'المستخدم غير موجود' });
    
    const user = doc.data();
    if (user.username === 'admin') return res.status(400).json({ error: 'لا يمكن تعديل المدير الأساسي (admin) من هنا' });

    const updates = {};
    if (password && password.trim() !== '') {
      updates.password = hashPassword(password);
    }
    if (role) updates.role = role;
    if (permissions) updates.permissions = JSON.stringify(permissions);
    if (mustChangePassword !== undefined) updates.mustChangePassword = mustChangePassword;

        await docRef.update(updates);
    broadcastUpdate('user_updated', { userId: id });
    logSystemActivity('edit_permissions', 'user', user.username, req.user.username, 'تعديل الصلاحيات', user.username);
    res.json({ success: true, message: 'تم تعديل المستخدم بنجاح' });
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ أثناء تعديل المستخدم' });
  }
});

app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
  const id = req.params.id;
  try {
    const docRef = db.collection('users').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'المستخدم غير موجود' });
    
    const user = doc.data();
    if (user.username === 'admin') return res.status(400).json({ error: 'لا يمكن حذف الحساب الرئيسي (admin)' });
    if (id === req.user.id) return res.status(400).json({ error: 'لا يمكنك حذف حسابك الحالي أثناء تسجيل الدخول' });

        await docRef.delete();
    broadcastUpdate('user_deleted', { userId: id });
    logSystemActivity('delete_user', 'user', doc.data().username, req.user.username, 'حذف المستخدم', doc.data().username);
    res.json({ success: true, message: 'تم حذف المستخدم بنجاح' });
  } catch (error) {
    res.status(500).json({ error: 'فشل في حذف المستخدم' });
  }
});

// ==========================================
// CUSTODY / DEVICES APIs
// ==========================================

app.get('/api/devices', authenticateToken, async (req, res) => {
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');

  const now = Date.now();
  if (devicesCache && (now - lastDevicesFetch < CACHE_TTL_MS)) {
    return filterAndSendDevices(devicesCache, req, res);
  }

  try {
    const snapshot = await db.collection('devices').get();
    const devices = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.isDeleted) return;

      let cf = [];
      if (data.customFields) {
        if (typeof data.customFields === 'string') {
          try { cf = JSON.parse(data.customFields); } catch(e) { cf = []; }
        } else if (Array.isArray(data.customFields)) {
          cf = data.customFields;
        }
      }
      devices.push({ id: doc.id, ...data, customFields: cf });
    });

    devicesCache = devices;
    lastDevicesFetch = now;
    filterAndSendDevices(devices, req, res);
  } catch (error) {
    console.warn('Firestore get devices failed (likely quota exceeded), serving from cache:', error.message);
    if (!devicesCache || devicesCache.length === 0) {
      devicesCache = loadLocalDevicesCache();
    }
    if (devicesCache && devicesCache.length > 0) {
      return filterAndSendDevices(devicesCache, req, res);
    }
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الأجهزة' });
  }
});

function filterAndSendDevices(devices, req, res) {
  let filtered = devices;
  if ((req.user.role === 'DataEntry' || req.user.role === 'User') && req.user.username) {
    filtered = devices.filter(d => d.created_by === req.user.username);
  }
  res.json(filtered);
}

app.get('/api/columns', authenticateToken, async (req, res) => {
  try {
    const snapshot = await db.collection('columns').get();
    const columns = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      columns.push({ id: doc.id, name: data.name, section: data.section });
    });
    res.json(columns);
  } catch (error) {
    console.warn('Firestore get columns failed, serving fallback:', error.message);
    res.json(loadLocalColumnsCache());
  }
});

app.get('/api/devices/:id/history', authenticateToken, async (req, res) => {
  const device_id = req.params.id;
  try {
    const snapshot = await db.collection('device_history').where('device_id', '==', device_id).get();
    let history = [];
    snapshot.forEach(doc => history.push({ id: doc.id, ...doc.data() }));
    history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(history);
  } catch (error) {
    console.warn('Firestore device history failed, returning empty list:', error.message);
    res.json([]);
  }
});

app.post('/api/devices/:id/history', requireAdmin, async (req, res) => {
  const device_id = req.params.id;
  const { previous_employee, previous_orgPath, new_employee, new_orgPath, timestamp } = req.body;
  try {
    await db.collection('device_history').add({
      device_id, previous_employee, previous_orgPath, new_employee, new_orgPath, timestamp, changed_by: req.user.username
    });
    res.json({ success: true, message: 'تمت إضافة سجل الحركة بنجاح' });
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ أثناء إضافة السجل' });
  }
});

app.put('/api/devices/:id/history/:historyId', requireAdmin, async (req, res) => {
  const history_id = req.params.historyId;
  const { previous_employee, previous_orgPath, new_employee, new_orgPath, timestamp } = req.body;
  try {
    await db.collection('device_history').doc(history_id).update({
      previous_employee, previous_orgPath, new_employee, new_orgPath, timestamp, changed_by: req.user.username
    });
    res.json({ success: true, message: 'تم تعديل السجل بنجاح' });
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ أثناء تعديل السجل' });
  }
});

app.delete('/api/devices/:id/history/:historyId', requireAdmin, async (req, res) => {
  try {
    await db.collection('device_history').doc(req.params.historyId).delete();
    res.json({ success: true, message: 'تم حذف السجل بنجاح' });
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ أثناء حذف السجل' });
  }
});

app.post('/api/columns', authenticateToken, async (req, res) => {
  const { name, section } = req.body;
  if (!name || name.trim() === '') return res.status(400).json({ error: 'اسم الحقل مطلوب' });
  
  try {
    const snapshot = await db.collection('columns').where('name', '==', name.trim()).get();
    if (!snapshot.empty) return res.status(400).json({ error: 'اسم الحقل موجود مسبقاً' });

    const docRef = await db.collection('columns').add({ name: name.trim(), section: section || 'specs' });
    broadcastUpdate('devices_updated', { action: 'columns_changed' });
    res.status(201).json({ id: docRef.id, name: name.trim(), section: section || 'specs' });
  } catch (error) {
    res.status(500).json({ error: 'فشل إضافة الحقل' });
  }
});

app.put('/api/columns/:id', authenticateToken, async (req, res) => {
  const id = req.params.id;
  const { name, section } = req.body;
  if (!name || name.trim() === '') return res.status(400).json({ error: 'اسم الحقل مطلوب' });

  try {
    const docRef = db.collection('columns').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'العمود غير موجود' });
    const oldName = doc.data().name;

    const snap = await db.collection('columns').where('name', '==', name.trim()).get();
    if (!snap.empty && snap.docs[0].id !== id) return res.status(400).json({ error: 'الاسم موجود بالفعل' });

    const updateData = { name: name.trim() };
    if (section) updateData.section = section;
    await docRef.update(updateData);

    const devicesSnap = await db.collection('devices').get();
    const batch = db.batch();
    devicesSnap.forEach(dDoc => {
      const data = dDoc.data();
      if (data.customFields && data.customFields !== '[]') {
        let fields = JSON.parse(data.customFields);
        let changed = false;
        fields.forEach(f => { if (f.label === oldName) { f.label = name.trim(); changed = true; } });
        if (changed) batch.update(dDoc.ref, { customFields: JSON.stringify(fields) });
      }
    });
    await batch.commit();

    res.json({ success: true });
    broadcastUpdate('devices_updated', { action: 'columns_changed' });
  } catch (error) {
    res.status(500).json({ error: 'فشل تعديل الحقل' });
  }
});

app.delete('/api/columns/:id', authenticateToken, async (req, res) => {
  const id = req.params.id;
  try {
    const docRef = db.collection('columns').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'العمود غير موجود' });
    const oldName = doc.data().name;

        await docRef.delete();
    broadcastUpdate('user_deleted', { userId: id });
    logSystemActivity('delete_user', 'user', doc.data().username, req.user.username, 'حذف المستخدم', doc.data().username);

    const devicesSnap = await db.collection('devices').get();
    const batch = db.batch();
    devicesSnap.forEach(dDoc => {
      const data = dDoc.data();
      if (data.customFields && data.customFields !== '[]') {
        let fields = JSON.parse(data.customFields);
        const origLen = fields.length;
        fields = fields.filter(f => f.label !== oldName);
        if (fields.length !== origLen) batch.update(dDoc.ref, { customFields: JSON.stringify(fields) });
      }
    });
    await batch.commit();

    res.json({ success: true });
    broadcastUpdate('devices_updated', { action: 'columns_changed' });
  } catch (error) {
    res.status(500).json({ error: 'فشل حذف الحقل' });
  }
});

app.post('/api/devices', requirePermission('canAdd'), async (req, res) => {
  try {
    const {
      employeeName, orgPath, deviceModel, ram, storageType, storageSize,
      monitorsCount, monitorsDetails, dockingCount, dockingDetails, deviceNature, serviceTag, recurringIssues, notes, systemsUsed, phone, employeeId, sharedUsers, technicalStatus, customFields, connectionType, osVersion, ipAddress, assetType
    } = req.body;

    if (serviceTag && serviceTag.trim() !== '' && serviceTag.trim() !== 'لا يوجد' && serviceTag.trim() !== 'N/A' && serviceTag.trim() !== '-') {
      const tagSnapshot = await db.collection('devices').where('serviceTag', '==', serviceTag.trim()).get();
      if (!tagSnapshot.empty) {
        return res.status(400).json({ error: 'السيرفز تاق المُدخل مسجل مسبقاً لجهاز آخر! لا يمكن التكرار.' });
      }
    }



    const newDeviceData = {
      assetType: assetType || 'Computer',
      employeeName: employeeName || 'غير معروف',
      orgPath: orgPath || 'مجلس الإدارة',
      deviceModel: deviceModel || 'لا يوجد',
      ram: ram || 'لا يوجد',
      storageType: storageType || 'SSD',
      storageSize: storageSize || 'لا يوجد',
      monitorsCount: parseInt(monitorsCount) || 1,
      monitorsDetails: monitorsDetails || [],
      dockingCount: parseInt(dockingCount) || 0,
      dockingDetails: dockingDetails || [],
      deviceNature: deviceNature || 'Desktop',
      serviceTag: serviceTag || 'لا يوجد',
      recurringIssues: recurringIssues || 'لا توجد مشاكل حالياً',
      notes: notes || 'لا يوجد',
      systemsUsed: systemsUsed || 'لا يوجد',
      phone: phone || 'لا يوجد',
      employeeId: employeeId || '',
      sharedUsers: sharedUsers || '',
      technicalStatus: technicalStatus || 'سليم',
      customFields: JSON.stringify(customFields || []),
      connectionType: connectionType || 'USB',
      osVersion: osVersion || '',
      ipAddress: ipAddress || '',
      department: '', circle: '', section: '', unit: '',
      created_by: req.user.username,
      created_at: new Date().toISOString()
    };

    const docRef = await db.collection('devices').add(newDeviceData);
    
    res.status(201).json({ id: docRef.id, ...newDeviceData });
    broadcastUpdate('devices_updated', { action: 'add', by: req.user.username });
    logSystemActivity('add', 'device', newDeviceData.employeeName, req.user.username);
  } catch (error) {
    res.status(500).json({ error: 'فشل في إضافة الجهاز' });
  }
});

app.put('/api/devices/:id', requirePermission('canEdit'), async (req, res) => {
  const id = req.params.id;
  try {
    const docRef = db.collection('devices').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'الجهاز غير موجود' });
    const device = doc.data();

    // Enforce ownership for DataEntry
    if ((req.user.role === 'DataEntry' || req.user.role === 'User') && device.created_by !== req.user.username) {
      return res.status(403).json({ error: 'غير مصرح لك بتعديل هذا الجهاز' });
    }

    const {
      employeeName, orgPath, deviceModel, ram, storageType, storageSize,
      monitorsCount, monitorsDetails, dockingCount, dockingDetails, deviceNature, serviceTag, recurringIssues, notes, systemsUsed, phone, employeeId, sharedUsers, technicalStatus, customFields, connectionType, osVersion, ipAddress, assetType
    } = req.body;

    if (serviceTag && serviceTag.trim() !== '' && serviceTag.trim() !== 'لا يوجد' && serviceTag.trim() !== 'N/A' && serviceTag.trim() !== '-') {
      const tagSnapshot = await db.collection('devices').where('serviceTag', '==', serviceTag.trim()).get();
      const duplicate = tagSnapshot.docs.find(d => d.id !== id);
      if (duplicate) {
        return res.status(400).json({ error: 'السيرفز تاق المُدخل مسجل مسبقاً لجهاز آخر! لا يمكن التكرار.' });
      }
    }

    const updatedEmployeeName = employeeName !== undefined ? employeeName : device.employeeName;
    const updatedOrgPath = orgPath !== undefined ? orgPath : device.orgPath;

    if (updatedEmployeeName !== device.employeeName || updatedOrgPath !== device.orgPath) {
      await db.collection('device_history').add({
        device_id: id,
        previous_employee: device.employeeName, previous_orgPath: device.orgPath,
        new_employee: updatedEmployeeName, new_orgPath: updatedOrgPath,
        changed_by: req.user.username, timestamp: new Date().toISOString(),
        targetUser: device.created_by || null
      });
    }

    const updatedData = {
      employeeName: updatedEmployeeName, orgPath: updatedOrgPath,
      deviceModel: deviceModel !== undefined ? deviceModel : device.deviceModel,
      ram: ram !== undefined ? ram : device.ram,
      storageType: storageType !== undefined ? storageType : device.storageType,
      storageSize: storageSize !== undefined ? storageSize : device.storageSize,
      monitorsCount: monitorsCount !== undefined ? parseInt(monitorsCount) || 1 : device.monitorsCount,
      deviceNature: deviceNature !== undefined ? deviceNature : device.deviceNature,
      serviceTag: serviceTag !== undefined ? serviceTag : device.serviceTag,
      recurringIssues: recurringIssues !== undefined ? recurringIssues : device.recurringIssues,
      notes: notes !== undefined ? notes : device.notes,
      systemsUsed: systemsUsed !== undefined ? systemsUsed : device.systemsUsed,
      phone: phone !== undefined ? phone : device.phone,
      employeeId: employeeId !== undefined ? employeeId : device.employeeId,
      sharedUsers: sharedUsers !== undefined ? sharedUsers : device.sharedUsers,
      technicalStatus: technicalStatus !== undefined ? technicalStatus : device.technicalStatus,
      customFields: customFields !== undefined ? JSON.stringify(customFields) : device.customFields,
      connectionType: connectionType !== undefined ? connectionType : device.connectionType,
      osVersion: osVersion !== undefined ? osVersion : device.osVersion,
      ipAddress: ipAddress !== undefined ? ipAddress : device.ipAddress
    };

    await docRef.update(updatedData);

    res.json({ id, ...updatedData, customFields: updatedData.customFields ? JSON.parse(updatedData.customFields) : [] });
    broadcastUpdate('devices_updated', { action: 'edit', by: req.user.username });
    logSystemActivity('edit', 'device', updatedEmployeeName, req.user.username, '', device.created_by);
  } catch (error) {
    res.status(500).json({ error: 'فشل في تحديث الجهاز' });
  }
});

app.delete('/api/devices/:id', requirePermission('canDelete'), async (req, res) => {
  const id = req.params.id;
  try {
    const docRef = db.collection('devices').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'الجهاز غير موجود' });
    
    // Enforce ownership for DataEntry
    if ((req.user.role === 'DataEntry' || req.user.role === 'User') && doc.data().created_by !== req.user.username) {
      return res.status(403).json({ error: 'غير مصرح لك بحذف هذا الجهاز' });
    }

    // Soft Delete instead of permanent delete
    await docRef.update({
      isDeleted: true,
      deletedBy: req.user.username,
      deletedAt: new Date().toISOString()
    });

    res.json({ success: true, message: 'تم نقل الجهاز إلى سلة المهملات' });
    broadcastUpdate('devices_updated', { action: 'delete', by: req.user.username });
    logSystemActivity('delete', 'device', doc.data().employeeName || 'غير محدد', req.user.username, '', doc.data().created_by);
  } catch (error) {
    res.status(500).json({ error: 'فشل في حذف الجهاز' });
  }
});

// ==========================================
// RECYCLE BIN ROUTES
// ==========================================

// Get deleted devices (Admin/Supervisor only)
app.get('/api/devices/recycle-bin', authenticateToken, async (req, res) => {
  if (req.user.role !== 'Admin' && req.user.role !== 'Supervisor') {
    return res.status(403).json({ error: 'غير مصرح لك بعرض سلة المهملات' });
  }
  try {
    const snapshot = await db.collection('devices').where('isDeleted', '==', true).get();
    const devices = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      devices.push({ id: doc.id, ...data, customFields: data.customFields ? JSON.parse(data.customFields) : [] });
    });
    res.json(devices);
  } catch (error) {
    console.warn('Firestore recycle-bin failed, returning empty list:', error.message);
    res.json([]);
  }
});

// Restore device from recycle bin
app.post('/api/devices/:id/restore', authenticateToken, async (req, res) => {
  if (req.user.role !== 'Admin' && req.user.role !== 'Supervisor') {
    return res.status(403).json({ error: 'غير مصرح لك باسترجاع الأجهزة' });
  }
  try {
    const docRef = db.collection('devices').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'الجهاز غير موجود' });

    // Use FieldValue.delete() to remove the fields entirely
    await docRef.update({
      isDeleted: FieldValue.delete(),
      deletedBy: FieldValue.delete(),
      deletedAt: FieldValue.delete(),
      restoredBy: req.user.username,
      restoredAt: new Date().toISOString()
    });

    res.json({ success: true, message: 'تم استرجاع الجهاز بنجاح' });
    broadcastUpdate('devices_updated', { action: 'restore', by: req.user.username });
    logSystemActivity('restore', 'device', doc.data().employeeName || 'غير محدد', req.user.username, '', doc.data().created_by);
  } catch (error) {
    console.error("Restore Error:", error);
    res.status(500).json({ error: 'حدث خطأ أثناء الاسترجاع' });
  }
});

// Permanent Delete
app.delete('/api/devices/:id/permanent', requireAdmin, async (req, res) => {
  const id = req.params.id;
  try {
    const docRef = db.collection('devices').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'الجهاز غير موجود' });
    
        await docRef.delete();
    broadcastUpdate('user_deleted', { userId: id });
    logSystemActivity('delete_user', 'user', doc.data().username, req.user.username, 'حذف المستخدم', doc.data().username);
    
    // Delete device history
    const historySnap = await db.collection('device_history').where('device_id', '==', id).get();
    const batch = db.batch();
    historySnap.forEach(h => batch.delete(h.ref));
    await batch.commit();

    res.json({ success: true, message: 'تم حذف الجهاز نهائياً' });
    broadcastUpdate('devices_updated', { action: 'permanent_delete', by: req.user.username });
    logSystemActivity('permanent_delete', 'device', doc.data().employeeName || 'غير محدد', req.user.username, '', doc.data().created_by);
  } catch (error) {
    res.status(500).json({ error: 'فشل في حذف الجهاز نهائياً' });
  }
});

app.get('/api/export', authenticateToken, async (req, res) => {
  try {
    const snapshot = await db.collection('devices').get();
    const devices = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if ((req.user.role === 'DataEntry' || req.user.role === 'User') && data.created_by !== req.user.username) return;
      devices.push({ ...data, customFields: data.customFields ? JSON.parse(data.customFields) : [] });
    });

    const customKeys = [];
    devices.forEach(d => {
      if (d.customFields) {
        d.customFields.forEach(cf => {
          if (cf.label && !customKeys.includes(cf.label)) customKeys.push(cf.label);
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
    res.status(500).send("فشل تصدير البيانات");
  }
});

app.post('/api/import', requireAdmin, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'لم يتم رفع أي ملف' });

  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (rows.length < 3) return res.status(400).json({ error: 'تنسيق ورقة عمل Excel غير صالح' });

    let headerIdx = 0; let maxScore = -1;
    for (let i = 0; i < Math.min(rows.length, 10); i++) {
      const row = rows[i] || [];
      let score = 0;
      row.forEach(cell => {
        if (!cell) return;
        const c = String(cell).trim();
        if (c.includes("الموظف") || c.includes("الاسم") || c.includes("الجهاز") || c.includes("الرام") || c.includes("سيريال") || c.includes("الهاردسك") || c.includes("القسم") || c.includes("الإدارة") || c.includes("الوحدة") || c.includes("ملاحظات") || c.includes("الهاتف") || c.includes("الشاشات") || c.includes("السيرفس")) score++;
      });
      if (score > maxScore) { maxScore = score; headerIdx = i; }
    }

    const headers = rows[headerIdx];
    const dataRows = rows.slice(headerIdx + 1);

    const snapshot = await db.collection('devices').get();
    const devices = [];
    snapshot.forEach(doc => devices.push({ id: doc.id, ...doc.data() }));

    const standardHeaders = [
      "اسم الموظف", "الاسم", "الإدارة", "القسم", "الوحدة", "نوع الجهاز",
      "سعة الرام (RAM)", "سعة الرام", "حجم الرام", "نوع الهاردسك", "حجم الهاردسك",
      "عدد الشاشات", "طبيعة الجهاز", "السيرفس تاق (Service Tag)", "السيرفس تاق",
      "السيريال ماي [Service Tag]", "السيرفر تاق", "الحالة التقنية", "المشاكل المتكررة", "المشاكل", "الملاحظات", "ملاحظات", "الأنظمة والمنظومات المستخدمة",
      "الأنظمة والمستلزمات المستخدمة", "الهاتف / الملحقات", "الهاتف", "هاتف", "تليفون", "الهاتف الداخلي",
      "مجلس الإدارة / المكاتب", "الرقم الوظيفي", "رقم الموظف"
    ];

    let addedCount = 0; let updatedCount = 0;

    for (const row of dataRows) {
      if (!row || row.length === 0) continue;

      const getValue = (headerNames, indexFallback) => {
        for (const name of headerNames) {
          const idx = headers.indexOf(name);
          if (idx !== -1) return row[idx] !== undefined ? String(row[idx]).trim() : 'لا يوجد';
        }
        if (indexFallback !== undefined && row[indexFallback] !== undefined) return String(row[indexFallback]).trim();
        return 'لا يوجد';
      };

      const employeeName = getValue(["اسم الموظف", "الاسم"], 0);
      const employeeId = getValue(["الرقم الوظيفي", "رقم الموظف"]);
      const topLevel = getValue(["مجلس الإدارة / المكاتب"]);
      const department = getValue(["الإدارة"], 1);
      const section = getValue(["القسم"], 2);
      const unit = getValue(["الوحدة"], 3);
      const deviceModel = getValue(["نوع الجهاز"], 4);
      const ram = getValue(["سعة الرام (RAM)", "سعة الرام", "حجم الرام"], 5);
      const storageType = getValue(["نوع الهاردسك"], 6);
      const storageSize = getValue(["حجم الهاردسك"], 7);
      const monitorsCount = parseInt(getValue(["عدد الشاشات"], 8)) || 1;
      const deviceNature = getValue(["طبيعة الجهاز"], 9);
      const serviceTag = getValue(["السيرفس تاق (Service Tag)", "السيرفس تاق", "السيريال ماي [Service Tag]", "السيرفر تاق"], 10);
      const technicalStatus = getValue(["الحالة التقنية"], 11) || 'سليم';
      const recurringIssues = getValue(["المشاكل المتكررة", "المشاكل"], 12);
      const notes = getValue(["الملاحظات", "ملاحظات"], 13);
      const systemsUsed = getValue(["الأنظمة والمنظومات المستخدمة", "الأنظمة والمستلزمات المستخدمة"], 14);
      const phone = getValue(["الهاتف / الملحقات", "هاتف", "تليفون", "الهاتف الداخلي"], 15);
      
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
          if (val && val !== 'لا يوجد' && val !== 'لايوجد') customFields.push({ label: header.trim(), value: val });
        }
      });

      const match = devices.find(d => (d.serviceTag !== 'لا يوجد' && d.serviceTag.toLowerCase() === serviceTag.toLowerCase()) || (d.employeeName.toLowerCase() === employeeName.toLowerCase()));

      if (match) {
        await db.collection('devices').doc(match.id).update({
          employeeName, department, section, unit, deviceModel, ram, storageType, storageSize,
          monitorsCount, deviceNature, serviceTag, recurringIssues, notes, systemsUsed, phone, technicalStatus, customFields: JSON.stringify(customFields)
        });
        updatedCount++;
      } else {
        await db.collection('devices').add({
          employeeName, employeeId: employeeId !== 'لا يوجد' ? employeeId : '', orgPath, department, section, unit, deviceModel, ram, storageType, storageSize,
          monitorsCount, deviceNature, serviceTag, recurringIssues, notes, systemsUsed, phone, technicalStatus, customFields: JSON.stringify(customFields)
        });
        addedCount++;
      }
    }

    res.json({ success: true, message: `تم استيراد البيانات بنجاح. المضافة: ${addedCount}، المحدثة: ${updatedCount}`, addedCount, updatedCount });
    broadcastUpdate('devices_updated', { action: 'import', by: req.user.username });
    logSystemActivity('import', 'device', `استيراد Excel (${addedCount} جديد, ${updatedCount} معدل)`, req.user.username);
  } catch (error) {
    res.status(500).json({ error: 'فشل في قراءة ملف Excel: ' + error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// For Vercel Serverless Function export
module.exports = app;

if (require.main === module) {
  initDb().then(() => {
    app.listen(PORT, () => {
      console.log(`==================================================`);
      console.log(`  Device Inventory System (Firebase) is running!`);
      console.log(`  Access UI: http://localhost:${PORT}`);
      console.log(`==================================================`);
    });
  }).catch(err => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });
}

// ==========================================
// PUBLIC APIs
// ==========================================
app.get('/api/public/devices/:id', async (req, res) => {
  try {
    const doc = await db.collection('devices').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Device not found' });
    }
    const data = doc.data();
    // Return only necessary fields for read-only view
    res.json({ id: doc.id, ...data });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
