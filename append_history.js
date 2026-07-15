const fs = require('fs');

const func = `

async function viewDeviceHistory(id) {
  try {
    const res = await fetch(\`/api/devices/\${id}/history\`);
    if (!res.ok) throw new Error('Failed to fetch history');
    const history = await res.json();
    const tbody = document.getElementById('historyTableBody');
    if (history.length === 0) {
      tbody.innerHTML = \`<tr><td colspan="6" style="text-align: center" data-i18n="history_empty">لا توجد حركات سابقة لهذا الجهاز</td></tr>\`;
    } else {
      tbody.innerHTML = history.map(h => \`
        <tr>
          <td>\${new Date(h.timestamp).toLocaleString('ar-LY')}</td>
          <td>\${h.previous_employee || '-'}</td>
          <td>\${h.previous_department || '-'} / \${h.previous_section || '-'}</td>
          <td><strong style="color:var(--primary-color)">\${h.new_employee || '-'}</strong></td>
          <td><strong style="color:var(--primary-color)">\${h.new_department || '-'} / \${h.new_section || '-'}</strong></td>
          <td><span class="badge badge-info">\${h.changed_by}</span></td>
        </tr>
      \`).join('');
    }
    // Apply translations if i18n loaded
    if (window.applyTranslations) window.applyTranslations();
    openModal('historyModal');
  } catch(e) {
    showToast(e.message, true);
  }
}
`;

fs.appendFileSync('public/js/app.js', func);
console.log('Appended function successfully');
