const fs = require('fs');
let content = fs.readFileSync('public/js/i18n.js', 'utf8');

const missingAR = `
    "history_modal_title": "سجل حركات الجهاز",
    "history_date": "تاريخ الحركة",
    "history_prev_emp": "الموظف السابق",
    "history_prev_loc": "الإدارة السابقة",
    "history_new_emp": "الموظف الجديد",
    "history_new_loc": "الإدارة الجديدة",
    "history_changed_by": "بواسطة",
    "history_empty": "لا توجد حركات سابقة لهذا الجهاز",
`;

const missingEN = `
    "history_modal_title": "Device Transfer History",
    "history_date": "Transfer Date",
    "history_prev_emp": "Previous Employee",
    "history_prev_loc": "Previous Location",
    "history_new_emp": "New Employee",
    "history_new_loc": "New Location",
    "history_changed_by": "Changed By",
    "history_empty": "No previous transfer history for this device",
`;

content = content.replace('"btn_delete": "حذف",', '"btn_delete": "حذف",
' + missingAR);
content = content.replace('"btn_delete": "Delete",', '"btn_delete": "Delete",
' + missingEN);

fs.writeFileSync('public/js/i18n.js', content);
console.log('Added history keys to i18n.js');
