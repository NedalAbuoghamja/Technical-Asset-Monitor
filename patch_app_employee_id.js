const fs = require('fs');
let txt = fs.readFileSync('public/js/app.js', 'utf8');

// 1. Populate form on edit
txt = txt.replace(
  "document.getElementById('employeeName').value = d.employeeName || '';",
  "document.getElementById('employeeName').value = d.employeeName || '';\n  document.getElementById('employeeId').value = d.employeeId || '';"
);

// 2. Clear form on Add
txt = txt.replace(
  "document.getElementById('employeeName').value = '';",
  "document.getElementById('employeeName').value = '';\n  document.getElementById('employeeId').value = '';"
);

// 3. Extract from form on submit
txt = txt.replace(
  "employeeName: document.getElementById('employeeName').value.trim(),",
  "employeeName: document.getElementById('employeeName').value.trim(),\n    employeeId: document.getElementById('employeeId').value.trim(),"
);

// 4. Update the print card to show employeeId next to employeeName
txt = txt.replace(
  "<div class=\"tech-item\"><span class=\"tech-label\">المستلم:</span> <span class=\"tech-val\">${d.employeeName}</span></div>",
  "<div class=\"tech-item\"><span class=\"tech-label\">المستلم:</span> <span class=\"tech-val\">${d.employeeName} ${d.employeeId ? ' (' + d.employeeId + ')' : ''}</span></div>"
);

txt = txt.replace(
  "<span>اسم الموظف: ${d.employeeName}</span>",
  "<span>اسم الموظف: ${d.employeeName} ${d.employeeId ? ' (' + d.employeeId + ')' : ''}</span>"
);

fs.writeFileSync('public/js/app.js', txt);
