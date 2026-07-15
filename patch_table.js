const fs = require('fs');
let txt = fs.readFileSync('public/index.html', 'utf8');

const oldTableHead = `              <tr>
                <th>الموظف</th>
                <th>الموقع التنظيمي</th>
                <th>موديل الجهاز</th>
                <th>نوع/حجم الهاردسك</th>
                <th>الرام</th>
                <th>السيريال (Service Tag)</th>
                <th>الحالة التقنية</th>
                <th class="admin-only-element">الإجراءات</th>
              </tr>`;

const newTableHead = `              <tr>
                <th>الرقم الوظيفي</th>
                <th>اسم الموظف</th>
                <th>المسمى الوظيفي</th>
                <th>الحالة التقنية</th>
                <th class="admin-only-element">الإجراءات</th>
              </tr>`;

txt = txt.replace(oldTableHead, newTableHead);
fs.writeFileSync('public/index.html', txt);

let appTxt = fs.readFileSync('public/js/app.js', 'utf8');

const oldAppTableHead = `    let headHtml = \`
      <tr>
        <th>\${window.t ? window.t('th_employee') : 'الموظف'}</th>
        <th>\${window.t ? window.t('th_department') : 'الموقع التنظيمي'}</th>
        <th>\${window.t ? window.t('th_model') : 'موديل الجهاز'}</th>
        <th>\${window.t ? window.t('th_storage') : 'نوع/حجم الهاردسك'}</th>
        <th>\${window.t ? window.t('th_ram') : 'الرام'}</th>
        <th>\${window.t ? window.t('th_service_tag') : 'السيريال (Service Tag)'}</th>
    \`;
    customKeys.forEach(k => {
      headHtml += \`<th>\${k}</th>\`;
    });
    headHtml += \`
        <th>\${window.t ? window.t('th_status') : 'الحالة التقنية'}</th>
        <th class="admin-only-element">\${window.t ? window.t('th_actions') : 'الإجراءات'}</th>
      </tr>
    \`;`;

const newAppTableHead = `    let headHtml = \`
      <tr>
        <th>الرقم الوظيفي</th>
        <th>\${window.t ? window.t('th_employee') : 'اسم الموظف'}</th>
        <th>\${window.t ? window.t('th_department') : 'المسمى الوظيفي'}</th>
        <th>\${window.t ? window.t('th_status') : 'الحالة التقنية'}</th>
        <th class="admin-only-element">\${window.t ? window.t('th_actions') : 'الإجراءات'}</th>
      </tr>
    \`;`;

appTxt = appTxt.replace(oldAppTableHead, newAppTableHead);

const oldAppTableRow = `    let rowHtml = \`
      <td>
        <div class="employee-cell">
          <span class="emp-name">\${d.employeeName}</span>
          <span class="emp-details">\${d.orgPath ? d.orgPath.split('||').pop() : '-'}</span>
        </div>
      </td>
      <td>
        <span style="font-weight: 500; display: block; margin-bottom: 4px; color: var(--primary-color);">\${d.orgPath ? d.orgPath.split('||').pop() : '-'}</span>
        <span style="font-size: 0.85rem; color: var(--text-muted);" title="\${d.orgPath ? d.orgPath.replace(/\\|\\|/g, ' > ') : ''}">\${d.orgPath ? d.orgPath.replace(/\\|\\|/g, ' > ') : '-'}</span>
      </td>
      <td>
        <div style="font-weight: 600">\${d.deviceModel}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted)">\${window.t ? window.t('nature_prefix') : 'طبيعة الجهاز:'} \${translateNature(d.deviceNature)}</div>
      </td>
      <td>\${storageSpec}</td>
      <td>\${ramSpec}</td>
      <td><code>\${d.serviceTag}</code></td>
    \`;
    
    // Custom keys cells
    customKeys.forEach(k => {
      const field = d.customFields ? d.customFields.find(cf => cf.label === k) : null;
      rowHtml += \`<td>\${field ? field.value : '—'}</td>\`;
    });

    rowHtml += \`
      <td>\${statusBadge}</td>`;

const newAppTableRow = `    let rowHtml = \`
      <td>
        <div class="employee-cell">
          <span class="emp-name">\${d.employeeId || '—'}</span>
        </div>
      </td>
      <td>
        <div class="employee-cell">
          <span class="emp-name">\${d.employeeName}</span>
        </div>
      </td>
      <td>
        <span style="font-weight: 500; display: block; margin-bottom: 4px; color: var(--primary-color);">\${d.orgPath ? d.orgPath.split('||').pop() : '-'}</span>
        <span style="font-size: 0.85rem; color: var(--text-muted);" title="\${d.orgPath ? d.orgPath.replace(/\\|\\|/g, ' > ') : ''}">\${d.orgPath ? d.orgPath.replace(/\\|\\|/g, ' > ') : '-'}</span>
      </td>
      <td>\${statusBadge}</td>
    \`;`;

appTxt = appTxt.replace(oldAppTableRow, newAppTableRow);

const oldTotalCols = `const totalCols = 8 + customKeys.length;`;
const newTotalCols = `const totalCols = 5;`;
appTxt = appTxt.replace(oldTotalCols, newTotalCols);

fs.writeFileSync('public/js/app.js', appTxt);
