const fs = require('fs');
let txt = fs.readFileSync('server.js', 'utf8');

const oldHeaderDetection = `
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

const newHeaderDetection = `
    let headerIdx = -1;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] || [];
      let matchCount = 0;
      row.forEach(cell => {
        if (!cell) return;
        const c = String(cell).trim();
        if (c.includes("الموظف") || c.includes("الاسم") || c.includes("الجهاز") || c.includes("الرام") || c.includes("سيريال") || c.includes("الهاردسك") || c.includes("القسم") || c.includes("الإدارة")) {
          matchCount++;
        }
      });
      // Require at least 2 headers to match to avoid false positives (like a title row)
      if (matchCount >= 2) {
        headerIdx = i;
        break;
      }
    }

    if (headerIdx === -1) {
      // Fallback to searching for at least 1
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i] || [];
        const hasHeader = row.some(cell => {
          if (!cell) return false;
          const c = String(cell).trim();
          return c.includes("الموظف") || c.includes("الاسم") || c.includes("الجهاز") || c.includes("سيريال");
        });
        if (hasHeader) {
          headerIdx = i;
          break;
        }
      }
    }
    
    if (headerIdx === -1) {
       headerIdx = 0;
    }
`;

txt = txt.replace(oldHeaderDetection, newHeaderDetection);

const oldSkipCondition = `
    for (const row of dataRows) {
      if (!row || row.length === 0 || !row[0]) continue;
`;

const newSkipCondition = `
    for (const row of dataRows) {
      if (!row || row.length === 0) continue;
`;

txt = txt.replace(oldSkipCondition, newSkipCondition);

fs.writeFileSync('server.js', txt);
