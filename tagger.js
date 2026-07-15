const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

const replacements = [
  ['> توزيع الأجهزة حسب الإدارة<', '><span data-i18n="chart_dist"> توزيع الأجهزة حسب الإدارة</span><'],
  ['> الأجهزة السليمة مقابل الأجهزة المعطلة<', '><span data-i18n="chart_status"> الأجهزة السليمة مقابل الأجهزة المعطلة</span><'],
  ['> مقارنات توزيع العهد والملحقات<', '><span data-i18n="chart_compare"> مقارنات توزيع العهد والملحقات</span><'],
  ['>تحليل مقارن للموظفين بناءً على الأجهزة والملحقات المستلمة<', '><span data-i18n="chart_desc">تحليل مقارن للموظفين بناءً على الأجهزة والملحقات المستلمة</span><'],
  ['>الإدارة:<', '><span data-i18n="filter_dept">الإدارة:</span><'],
  ['>نوع الجهاز:<', '><span data-i18n="filter_type">نوع الجهاز:</span><'],
  ['>الحالة:<', '><span data-i18n="filter_status">الحالة:</span><'],
  ['>سليم (بدون مشاكل)<', '><span data-i18n="status_clean">سليم (بدون مشاكل)</span><'],
  ['>به مشاكل تقنية<', '><span data-i18n="status_issues">به مشاكل تقنية</span><'],
  ['>مكتبي (Desktop)<', '><span data-i18n="desktop">مكتبي (Desktop)</span><'],
  ['>محمول (Laptop)<', '><span data-i18n="laptop">محمول (Laptop)</span><'],
  ['>بدون كمبيوتر / عهدة أخرى (None)<', '><span data-i18n="no_pc">بدون كمبيوتر / عهدة أخرى (None)</span><'],
  ['>جاري تحميل البيانات...<', '><span data-i18n="loading">جاري تحميل البيانات...</span><'],
  ['> إضافة مستخدم جديد<', '><span data-i18n="add_user"> إضافة مستخدم جديد</span><'],
  ['>اسم المستخدم <', '><span data-i18n="username">اسم المستخدم </span><'],
  ['>كلمة المرور <', '><span data-i18n="password">كلمة المرور </span><'],
  ['>مستخدم عادي (User)<', '><span data-i18n="role_user">مستخدم عادي (User)</span><'],
  ['>مدير النظام (Admin)<', '><span data-i18n="role_admin">مدير النظام (Admin)</span><'],
  ['> الحسابات المسجلة حالياً<', '><span data-i18n="registered_accounts"> الحسابات المسجلة حالياً</span><'],
  ['>اسم الموظف <', '><span data-i18n="emp_name">اسم الموظف </span><'],
  ['>الإدارة <', '><span data-i18n="emp_dept">الإدارة </span><'],
  ['>القسم<', '><span data-i18n="emp_sec">القسم</span><'],
  ['>الوحدة<', '><span data-i18n="emp_unit">الوحدة</span><'],
  ['>طبيعة الجهاز<', '><span data-i18n="device_nature">طبيعة الجهاز</span><'],
  ['>موديل الجهاز <', '><span data-i18n="device_model">موديل الجهاز </span><'],
  ['>السيرفس تاق (Service Tag) <', '><span data-i18n="service_tag">السيرفس تاق (Service Tag) </span><'],
  ['>سعة الرام (RAM)<', '><span data-i18n="ram_size">سعة الرام (RAM)</span><'],
  ['>نوع الهاردسك<', '><span data-i18n="disk_type">نوع الهاردسك</span><'],
  ['>حجم الهاردسك<', '><span data-i18n="disk_size">حجم الهاردسك</span><'],
  ['>عدد الشاشات المرفقة<', '><span data-i18n="monitors">عدد الشاشات المرفقة</span><'],
  ['>الهاتف / Cisco IP Phone<', '><span data-i18n="ip_phone">الهاتف / Cisco IP Phone</span><'],
  ['>سليم<', '><span data-i18n="status_ok">سليم</span><'],
  ['>بحاجة لصيانة<', '><span data-i18n="status_need_maint">بحاجة لصيانة</span><'],
  ['>تحت الصيانة<', '><span data-i18n="status_in_maint">تحت الصيانة</span><'],
  ['>الأنظمة والمنظومات المستخدمة<', '><span data-i18n="used_systems">الأنظمة والمنظومات المستخدمة</span><'],
  ['>المشاكل والأعطال التقنية المتكررة<', '><span data-i18n="tech_issues">المشاكل والأعطال التقنية المتكررة</span><'],
  ['>الملاحظات العامة<', '><span data-i18n=\"general_notes\">الملاحظات العامة</span><'],
  ['>الحقول الإضافية المخصصة<', '><span data-i18n="custom_fields">الحقول الإضافية المخصصة</span><'],
  ['>حفظ البيانات<', '><span data-i18n="save_data">حفظ البيانات</span><'],
  ['>استيراد البيانات من ملف Excel<', '><span data-i18n="import_excel_modal">استيراد البيانات من ملف Excel</span><'],
  ['>ابدأ الاستيراد<', '><span data-i18n="start_import">ابدأ الاستيراد</span><'],
  ['>تأكيد الحذف<', '><span data-i18n="confirm_delete\">تأكيد الحذف</span><'],
  ['>إضافة عمود جديد للمنظومة<', '><span data-i18n="add_column_sys\">إضافة عمود جديد للمنظومة</span><'],
  ['>اسم العمود المخصص الجديد <', '><span data-i18n="new_col_name\">اسم العمود المخصص الجديد </span><'],
  ['>إضافة العمود<', '><span data-i18n="btn_add_col\">إضافة العمود</span><'],
  ['>قائمة الموظفين<', '><span data-i18n="emp_list\">قائمة الموظفين</span><'],
  ['>هل أنت متأكد من رغبتك في حذف هذا الجهاز نهائياً من العهدة؟<', '><span data-i18n="delete_msg\">هل أنت متأكد من رغبتك في حذف هذا الجهاز نهائياً من العهدة؟</span><'],
  ['>ملاحظة: هذا الإجراء لا يمكن التراجع عنه.<', '><span data-i18n="delete_note\">ملاحظة: هذا الإجراء لا يمكن التراجع عنه.</span><'],
  ['>إلغاء<', '><span data-i18n="cancel\">إلغاء</span><'],
  ['>إغلاق<', '><span data-i18n="close\">إغلاق</span><'],
  ['>إضافة<', '><span data-i18n="add\">إضافة</span><']
];

let replacedCount = 0;
for (const [ar, tag] of replacements) {
  if (html.includes(ar)) {
    html = html.split(ar).join(tag);
    replacedCount++;
  } else {
    console.log("NOT FOUND: ", ar);
  }
}

fs.writeFileSync('public/index.html', html);
console.log('Replaced', replacedCount, 'occurrences in index.html');

let loginHtml = fs.readFileSync('public/login.html', 'utf8');
const loginReplacements = [
  ['>اسم المستخدم<', '><span data-i18n="username">اسم المستخدم</span><'],
  ['>كلمة المرور<', '><span data-i18n="password">كلمة المرور</span><']
];
let lReplacedCount = 0;
for (const [ar, tag] of loginReplacements) {
  if (loginHtml.includes(ar)) {
    loginHtml = loginHtml.split(ar).join(tag);
    lReplacedCount++;
  }
}
fs.writeFileSync('public/login.html', loginHtml);
console.log('Replaced', lReplacedCount, 'occurrences in login.html');
