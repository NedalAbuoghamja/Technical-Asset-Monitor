const fs = require('fs');

const file = 'public/index.html';
let html = fs.readFileSync(file, 'utf8');

const replacements = [
  ['>حصر العهد<', ' data-i18n="sidebar_title">حصر العهد<'],
  ['>لوحة التحكم والمتابعة<', ' data-i18n="dashboard">لوحة التحكم والمتابعة<'],
  ['>السجل والمتابعة<', ' data-i18n="inventory">السجل والمتابعة<'],
  ['>إضافة جهاز جديد<', ' data-i18n="add_device">إضافة جهاز جديد<'],
  ['>إضافة عمود جديد<', ' data-i18n="add_column">إضافة عمود جديد<'],
  ['>الإعدادات المتقدمة<', ' data-i18n="advanced_settings">الإعدادات المتقدمة<'],
  ['>إجمالي الأجهزة<', ' data-i18n="total_devices">إجمالي الأجهزة<'],
  ['>أجهزة مكتبية (Desktop)<', ' data-i18n="desktop_devices">أجهزة مكتبية (Desktop)<'],
  ['>أجهزة محمولة (Laptop)<', ' data-i18n="laptop_devices">أجهزة محمولة (Laptop)<'],
  ['>أجهزة بها مشاكل<', ' data-i18n="faulty_devices">أجهزة بها مشاكل<'],
  ['title="إدارة المستخدمين"', 'title="إدارة المستخدمين" data-i18n-title="user_management"'],
  ['title="تسجيل الخروج"', 'title="تسجيل الخروج" data-i18n-title="logout"'],
  ['>استيراد Excel<', ' data-i18n="import_excel">استيراد Excel<'],
  ['>تصدير Excel<', ' data-i18n="export_excel">تصدير Excel<'],
  ['>توزيع الأجهزة حسب الإدارة<', ' data-i18n="chart_dept">توزيع الأجهزة حسب الإدارة<'],
  ['>الأجهزة السليمة مقابل الأجهزة المعطلة<', ' data-i18n="chart_status">الأجهزة السليمة مقابل الأجهزة المعطلة<'],
  ['>مقارنات توزيع العهد والملحقات<', ' data-i18n="comparisons">مقارنات توزيع العهد والملحقات<'],
  ['placeholder="ابحث عن جهاز، اسم الموظف، الموديل، السيرفيس..."', 'placeholder="ابحث عن جهاز، اسم الموظف، الموديل، السيرفيس..." data-i18n="search_placeholder"'],
  ['<option value="all">كل الأقسام</option>', '<option value="all" data-i18n="all_departments">كل الأقسام</option>'],
  ['<option value="all">كل القطاعات</option>', '<option value="all" data-i18n="all_natures">كل القطاعات</option>'],
  ['<option value="شخصي">شخصي</option>', '<option value="شخصي" data-i18n="personal_device">شخصي</option>'],
  ['<option value="قسم">قسم</option>', '<option value="قسم" data-i18n="department_device">قسم</option>'],
  ['<option value="all">كل الحالات</option>', '<option value="all" data-i18n="all_statuses">كل الحالات</option>'],
  ['<option value="clean">سليم</option>', '<option value="clean" data-i18n="clean">سليم</option>'],
  ['<option value="issues">أعطال</option>', '<option value="issues" data-i18n="issues">أعطال</option>'],
  ['<button id="themeToggleBtn" class="action-btn circle-btn" title="تبديل المظهر">', '<button id="langToggleBtn" class="action-btn circle-btn" title="تغيير اللغة"><i class="bi bi-translate"></i><span id="langToggleText" style="display:none" data-i18n="toggle_lang">English</span></button>\n        <button id="themeToggleBtn" class="action-btn circle-btn" title="تبديل المظهر">']
];

replacements.forEach(([search, replace]) => {
  html = html.replace(search, replace);
});

fs.writeFileSync(file, html);
console.log('Done modifying index.html');
