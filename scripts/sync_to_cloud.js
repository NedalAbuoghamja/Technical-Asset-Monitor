const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const serviceAccount = require('../serviceAccountKey.json');

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const firestore = getFirestore();
firestore.settings({ preferRest: true });

async function syncAllToCloud() {
  console.log('--- Starting Cloud Synchronization ---');
  const dbPath = path.join(__dirname, '..', 'data', 'inventory.db');
  const db = new sqlite3.Database(dbPath);

  db.all('SELECT * FROM devices', async (err, rows) => {
    if (err) {
      console.error('SQLite read error:', err);
      process.exit(1);
    }

    console.log(`Read ${rows.length} records from local SQLite.`);

    // 1. Update local cache file
    const formatted = rows.map(r => ({
      ...r,
      id: String(r.id),
      customFields: r.customFields ? (typeof r.customFields === 'string' ? JSON.parse(r.customFields) : r.customFields) : []
    }));

    const cachePath = path.join(__dirname, '..', 'data', 'devices_cache.json');
    fs.writeFileSync(cachePath, JSON.stringify(formatted, null, 2), 'utf8');
    console.log(`Updated local cache at ${cachePath}`);

    // 2. Sync to Firebase Firestore
    console.log('Updating Firebase Firestore in batches...');
    for (let i = 0; i < rows.length; i += 400) {
      const batch = firestore.batch();
      const chunk = rows.slice(i, i + 400);

      chunk.forEach(d => {
        let cf = [];
        if (d.customFields) {
          try { cf = JSON.parse(d.customFields); } catch (e) { cf = []; }
        }

        const docRef = firestore.collection('devices').doc(String(d.id));
        batch.set(docRef, {
          id: String(d.id),
          employeeName: d.employeeName || 'غير معروف',
          orgPath: d.orgPath || 'مجلس الإدارة',
          deviceModel: d.deviceModel || 'لا يوجد',
          ram: d.ram || 'لا يوجد',
          storageType: d.storageType || 'SSD',
          storageSize: d.storageSize || 'لا يوجد',
          monitorsCount: parseInt(d.monitorsCount) || 1,
          deviceNature: d.deviceNature || 'Desktop',
          serviceTag: d.serviceTag || 'لا يوجد',
          recurringIssues: d.recurringIssues || 'لا توجد مشاكل حالياً',
          notes: d.notes || 'لا يوجد',
          systemsUsed: d.systemsUsed || 'لا يوجد',
          phone: d.phone || 'لا يوجد',
          employeeId: d.employeeId || '',
          sharedUsers: d.sharedUsers || '',
          technicalStatus: d.technicalStatus || '',
          customFields: JSON.stringify(cf),
          connectionType: d.connectionType || 'USB',
          osVersion: d.osVersion || '',
          ipAddress: d.ipAddress || '',
          assetType: d.assetType || (d.deviceNature === 'None' || d.deviceModel === 'لا يوجد' ? 'None' : 'Computer'),
          deviceName: d.deviceName || '',
          englishName: d.englishName || '',
          email: d.email || '',
          department: d.department || '',
          circle: d.circle || '',
          section: d.section || '',
          unit: d.unit || '',
          isDeleted: false,
          created_by: 'admin',
          created_at: new Date().toISOString()
        });
      });

      await batch.commit();
      console.log(`Synced batch ${i + 1} to ${Math.min(i + 400, rows.length)}`);
    }

    // 3. Sync Users
    console.log('Syncing Users to Firestore & local cache...');
    db.all('SELECT * FROM users', async (userErr, userRows) => {
      if (userErr) {
        console.error('Error fetching users from SQLite:', userErr);
      } else {
        const usersCachePath = path.join(__dirname, '..', 'data', 'users_cache.json');
        const formattedUsers = userRows.map(u => ({
          id: String(u.id),
          username: u.username,
          password: u.password,
          role: u.role,
          permissions: u.permissions || '{}'
        }));
        fs.writeFileSync(usersCachePath, JSON.stringify(formattedUsers, null, 2), 'utf8');
        console.log(`Updated users cache at ${usersCachePath}`);

        for (const u of userRows) {
          const snapshot = await firestore.collection('users').where('username', '==', u.username).get();
          if (snapshot.empty) {
            await firestore.collection('users').add({
              username: u.username,
              password: u.password,
              role: u.role,
              permissions: u.permissions || '{}'
            });
            console.log(`Added user ${u.username} to Firestore`);
          } else {
            const userDoc = snapshot.docs[0];
            await userDoc.ref.update({
              password: u.password,
              role: u.role,
              permissions: u.permissions || '{}'
            });
            console.log(`Updated user ${u.username} in Firestore`);
          }
        }
      }

      console.log('Cloud Sync Complete! Vercel & Firebase are now 100% up to date.');
      db.close();
    });
  });
}

syncAllToCloud().catch(console.error);
