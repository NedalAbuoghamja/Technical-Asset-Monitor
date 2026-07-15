const fs = require('fs');
let txt = fs.readFileSync('server.js', 'utf8');

// 1. Add to CREATE TABLE devices
txt = txt.replace('phone TEXT,', 'phone TEXT,\n      employeeId TEXT,');

// 2. Add ALTER TABLE logic
const alterSql = `
  try {
    await dbRun(\`ALTER TABLE devices ADD COLUMN employeeId TEXT\`);
    console.log("Added employeeId column to devices table.");
  } catch (err) {
    // Column likely exists
  }
`;
txt = txt.replace('// Try to add connectionType', alterSql + '\n  // Try to add connectionType');

// 3. POST /api/devices extraction
txt = txt.replace('systemsUsed, phone, technicalStatus', 'systemsUsed, phone, employeeId, technicalStatus');
// POST INSERT columns
txt = txt.replace('systemsUsed, phone, technicalStatus', 'systemsUsed, phone, employeeId, technicalStatus');
// POST INSERT values placeholders (add one '?')
txt = txt.replace('?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, \'\', \'\', \'\', \'\'', '?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, \'\', \'\', \'\', \'\'');
// POST INSERT values array
txt = txt.replace('phone || \'لا يوجد\',', 'phone || \'لا يوجد\',\n      employeeId || \'\',');
// POST newDevice object
txt = txt.replace('systemsUsed, phone, technicalStatus', 'systemsUsed, phone, employeeId, technicalStatus');

// 4. PUT /api/devices/:id extraction
txt = txt.replace('systemsUsed, phone, technicalStatus', 'systemsUsed, phone, employeeId, technicalStatus');
// PUT updated values
txt = txt.replace('const updatedPhone = phone !== undefined ? phone : device.phone;', 'const updatedPhone = phone !== undefined ? phone : device.phone;\n    const updatedEmployeeId = employeeId !== undefined ? employeeId : device.employeeId;');
// PUT UPDATE columns
txt = txt.replace('systemsUsed = ?, phone = ?, technicalStatus = ?', 'systemsUsed = ?, phone = ?, employeeId = ?, technicalStatus = ?');
// PUT UPDATE params array
txt = txt.replace('updatedSystemsUsed, updatedPhone, updatedTechnicalStatus', 'updatedSystemsUsed, updatedPhone, updatedEmployeeId, updatedTechnicalStatus');
// PUT updatedDevice object
txt = txt.replace('systemsUsed: updatedSystemsUsed, phone: updatedPhone, technicalStatus: updatedTechnicalStatus', 'systemsUsed: updatedSystemsUsed, phone: updatedPhone, employeeId: updatedEmployeeId, technicalStatus: updatedTechnicalStatus');

// 5. GET /api/export
txt = txt.replace('"اسم الموظف": d.employeeName,', '"اسم الموظف": d.employeeName,\n        "الرقم الوظيفي": d.employeeId || \'\',');

fs.writeFileSync('server.js', txt);
