const fs = require('fs');

let appJs = fs.readFileSync('public/js/app.js', 'utf8');

const replacements = [
  // Table headers
  [
    `        <th>الموظف</th>
        <th>الإدارة / القسم / الوحدة</th>
        <th>موديل الجهاز</th>
        <th>نوع/حجم الهاردسك</th>
        <th>الرام</th>
        <th>السيريال (Service Tag)</th>`,
    `        <th>\${window.t ? window.t('th_employee') : 'الموظف'}</th>
        <th>\${window.t ? window.t('th_department') : 'الإدارة / القسم / الوحدة'}</th>
        <th>\${window.t ? window.t('th_model') : 'موديل الجهاز'}</th>
        <th>\${window.t ? window.t('th_storage') : 'نوع/حجم الهاردسك'}</th>
        <th>\${window.t ? window.t('th_ram') : 'الرام'}</th>
        <th>\${window.t ? window.t('th_service_tag') : 'السيريال (Service Tag)'}</th>`
  ],
  [
    `        <th>الحالة التقنية</th>
        <th class="admin-only-element">الإجراءات</th>`,
    `        <th>\${window.t ? window.t('th_status') : 'الحالة التقنية'}</th>
        <th class="admin-only-element">\${window.t ? window.t('th_actions') : 'الإجراءات'}</th>`
  ],
  // Empty states
  [
    `<span>لا توجد بيانات مطابقة للبحث أو الفلتر</span>`,
    `<span>\${window.t ? window.t('no_data') : 'لا توجد بيانات مطابقة للبحث أو الفلتر'}</span>`
  ],
  [
    `<span>خطأ في تحميل البيانات: \${error.message}</span>`,
    `<span>\${window.t ? window.t('fetch_error') : 'خطأ في تحميل البيانات:'} \${error.message}</span>`
  ],
  // Action buttons
  [
    `<button class="action-btn circle-btn btn-primary-outline" onclick="openViewModal('\${d.id}')" title="عرض التفاصيل">`,
    `<button class="action-btn circle-btn btn-primary-outline" onclick="openViewModal('\${d.id}')" title="\${window.t ? window.t('btn_view') : 'عرض التفاصيل'}">`
  ],
  [
    `<button class="action-btn circle-btn btn-secondary" onclick="openEditModal('\${d.id}')" title="تعديل">`,
    `<button class="action-btn circle-btn btn-secondary" onclick="openEditModal('\${d.id}')" title="\${window.t ? window.t('btn_edit') : 'تعديل'}">`
  ],
  [
    `<button class="action-btn circle-btn btn-danger-outline" onclick="openDeleteConfirm('\${d.id}')" title="حذف">`,
    `<button class="action-btn circle-btn btn-danger-outline" onclick="openDeleteConfirm('\${d.id}')" title="\${window.t ? window.t('btn_delete') : 'حذف'}">`
  ]
];

replacements.forEach(([search, replace]) => {
  appJs = appJs.replace(search, replace);
});

// Add languageChanged event listener to app.js
if (!appJs.includes('languageChanged')) {
  appJs += `
// Re-render when language changes
window.addEventListener('languageChanged', () => {
  if (typeof renderTable === 'function') renderTable();
  if (typeof updateStats === 'function') updateStats();
  if (typeof renderCharts === 'function') renderCharts();
  if (typeof renderComparisons === 'function') renderComparisons();
});
`;
}

fs.writeFileSync('public/js/app.js', appJs);

// Also append some missing keys to i18n.js
let i18nJs = fs.readFileSync('public/js/i18n.js', 'utf8');
if (!i18nJs.includes('th_storage')) {
  i18nJs = i18nJs.replace('"th_employee": "اسم الموظف",', '"th_storage": "الهاردسك",\n    "th_ram": "الرام",\n    "no_data": "لا توجد بيانات مطابقة",\n    "fetch_error": "خطأ في التحميل:",\n    "th_employee": "اسم الموظف",');
  i18nJs = i18nJs.replace('"th_employee": "Employee Name",', '"th_storage": "Storage (HDD/SSD)",\n    "th_ram": "RAM",\n    "no_data": "No matching data found",\n    "fetch_error": "Fetch error:",\n    "th_employee": "Employee Name",');
  
  // Also expose `t` to window globally since appJs uses window.t
  if (!i18nJs.includes('window.t = t;')) {
    i18nJs += `\nwindow.t = t;\n`;
  }
  
  fs.writeFileSync('public/js/i18n.js', i18nJs);
}

console.log('App.js and i18n.js updated successfully for dynamic translation.');
