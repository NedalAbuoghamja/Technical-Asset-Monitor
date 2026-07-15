const fs = require('fs');

const func = `
function translateLabel(arabicLabel) {
  if (typeof window.t !== 'function') return arabicLabel;
  const map = {
    'التجارية': 'dept_commercial',
    'مجلس الإدارة': 'dept_board',
    'المدير العام': 'dept_gm',
    'إدارة الموارد': 'dept_hr',
    'الإدارة المالية': 'dept_finance',
    'الإدارة التجارية': 'dept_comm_dept',
    'الإدارة الفنية': 'dept_tech',
    'إدارة تقنية المعلومات': 'dept_it',
    'إدارة الخدمات': 'dept_services',
    'لا يوجد': 'dept_none',
    'سليم': 'clean',
    'به مشاكل تقنية': 'issues'
  };
  const key = map[arabicLabel];
  if (key) return window.t(key);
  return arabicLabel;
}
`;

fs.appendFileSync('public/js/app.js', func);
console.log('Added translateLabel function');
