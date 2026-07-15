const fs = require('fs');
let txt = fs.readFileSync('server.js', 'utf8');

// 1. Better Header detection
const oldHeaderDetection = `
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
`;
const newHeaderDetection = `
    let headerIdx = -1;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] || [];
      // Look for any common header term anywhere in the row
      const hasHeader = row.some(cell => {
        if (!cell) return false;
        const c = String(cell).trim();
        return c.includes("الموظف") || c.includes("الاسم") || c.includes("الجهاز") || c.includes("الرام") || c.includes("سيريال");
      });
      if (hasHeader) {
        headerIdx = i;
        break;
      }
    }

    if (headerIdx === -1) {
      headerIdx = 0;
    }
`;
txt = txt.replace(oldHeaderDetection, newHeaderDetection);

// 2. Add orgPath parsing and employeeId to standardHeaders
const oldStandardHeaders = `
    const standardHeaders = [
      "اسم الموظف", "الإدارة", "القسم", "الوحدة", "نوع الجهاز",
      "سعة الرام (RAM)", "سعة الرام", "نوع الهاردسك", "حجم الهاردسك",
      "عدد الشاشات", "طبيعة الجهاز", "السيرفس تاق (Service Tag)", "السيرفس تاق",
      "السيريال ماي [Service Tag]", "الحالة التقنية", "المشاكل المتكررة", "الملاحظات", "ملاحظات", "الأنظمة والمنظومات المستخدمة",
      "الأنظمة والمستلزمات المستخدمة", "الهاتف / الملحقات", "الهاتف", "هاتف", "تليفون"
    ];
`;
const newStandardHeaders = `
    const standardHeaders = [
      "اسم الموظف", "الاسم", "الإدارة", "القسم", "الوحدة", "نوع الجهاز",
      "سعة الرام (RAM)", "سعة الرام", "نوع الهاردسك", "حجم الهاردسك",
      "عدد الشاشات", "طبيعة الجهاز", "السيرفس تاق (Service Tag)", "السيرفس تاق",
      "السيريال ماي [Service Tag]", "الحالة التقنية", "المشاكل المتكررة", "الملاحظات", "ملاحظات", "الأنظمة والمنظومات المستخدمة",
      "الأنظمة والمستلزمات المستخدمة", "الهاتف / الملحقات", "الهاتف", "هاتف", "تليفون",
      "مجلس الإدارة / المكاتب", "الرقم الوظيفي", "رقم الموظف"
    ];
`;
txt = txt.replace(oldStandardHeaders, newStandardHeaders);

// 3. Mapping fields in row parsing
const oldRowParsing = `
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
`;
const newRowParsing = `
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
`;
txt = txt.replace(oldRowParsing, newRowParsing);

// 4. Update the INSERT and UPDATE statements inside /api/import loop
// Old INSERT
const oldInsert = `
          INSERT INTO devices (
            employeeName, department, section, unit, deviceModel, ram, storageType, storageSize,
            monitorsCount, deviceNature, serviceTag, recurringIssues, notes, systemsUsed, phone, technicalStatus, customFields
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        \`, [
          employeeName, department, section, unit, deviceModel, ram, storageType, storageSize,
          monitorsCount, deviceNature, serviceTag, recurringIssues, notes, systemsUsed, phone, technicalStatus, JSON.stringify(customFields)
        ]);
`;
const newInsert = `
          INSERT INTO devices (
            employeeName, employeeId, orgPath, department, section, unit, deviceModel, ram, storageType, storageSize,
            monitorsCount, deviceNature, serviceTag, recurringIssues, notes, systemsUsed, phone, technicalStatus, customFields
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        \`, [
          employeeName, employeeId !== 'لا يوجد' ? employeeId : '', orgPath, department, section, unit, deviceModel, ram, storageType, storageSize,
          monitorsCount, deviceNature, serviceTag, recurringIssues, notes, systemsUsed, phone, technicalStatus, JSON.stringify(customFields)
        ]);
`;
txt = txt.replace(oldInsert, newInsert);

// Old UPDATE
const oldUpdate = `
          UPDATE devices SET
            employeeName = ?, department = ?, section = ?, unit = ?, deviceModel = ?, ram = ?, storageType = ?, storageSize = ?,
            monitorsCount = ?, deviceNature = ?, serviceTag = ?, recurringIssues = ?, notes = ?, systemsUsed = ?, phone = ?, technicalStatus = ?, customFields = ?
          WHERE id = ?
        \`, [
          employeeName, department, section, unit, deviceModel, ram, storageType, storageSize,
          monitorsCount, deviceNature, serviceTag, recurringIssues, notes, systemsUsed, phone, technicalStatus, JSON.stringify(customFields), match.id
        ]);
`;
const newUpdate = `
          UPDATE devices SET
            employeeName = ?, employeeId = ?, orgPath = ?, department = ?, section = ?, unit = ?, deviceModel = ?, ram = ?, storageType = ?, storageSize = ?,
            monitorsCount = ?, deviceNature = ?, serviceTag = ?, recurringIssues = ?, notes = ?, systemsUsed = ?, phone = ?, technicalStatus = ?, customFields = ?
          WHERE id = ?
        \`, [
          employeeName, employeeId !== 'لا يوجد' ? employeeId : '', orgPath, department, section, unit, deviceModel, ram, storageType, storageSize,
          monitorsCount, deviceNature, serviceTag, recurringIssues, notes, systemsUsed, phone, technicalStatus, JSON.stringify(customFields), match.id
        ]);
`;
txt = txt.replace(oldUpdate, newUpdate);

fs.writeFileSync('server.js', txt);
