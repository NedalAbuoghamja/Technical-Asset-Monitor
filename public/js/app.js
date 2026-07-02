// APP STATE
let devices = [];
let filteredDevices = [];
let deptChartInstance = null;
let statusChartInstance = null;
let customColumns = [];

// DOM ELEMENTS
const devicesTableBody = document.getElementById('devicesTableBody');
const searchInput = document.getElementById('searchInput');
const filterDept = document.getElementById('filterDept');
const filterNature = document.getElementById('filterNature');
const filterStatus = document.getElementById('filterStatus');

// Stats elements
const statTotalDevices = document.getElementById('statTotalDevices');
const statDesktops = document.getElementById('statDesktops');
const statLaptops = document.getElementById('statLaptops');
const statIssueDevices = document.getElementById('statIssueDevices');

// Modal buttons
const openAddModalBtn = document.getElementById('openAddModalBtn');
const openImportModalBtn = document.getElementById('openImportModalBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeIcon = document.getElementById('themeIcon');

// Forms & Modals
const deviceModal = document.getElementById('deviceModal');
const deviceForm = document.getElementById('deviceForm');
const detailsModal = document.getElementById('detailsModal');
const detailBody = document.getElementById('detailBody');
const deleteModal = document.getElementById('deleteModal');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const importModal = document.getElementById('importModal');
const importForm = document.getElementById('importForm');
const excelFileInput = document.getElementById('excelFile');
const dropZone = document.getElementById('dropZone');
const selectedFileName = document.getElementById('selectedFileName');
const startImportBtn = document.getElementById('startImportBtn');

// Toast
const toast = document.getElementById('toast');
const toastIcon = document.getElementById('toastIcon');
const toastMessage = document.getElementById('toastMessage');

// USER AUTHENTICATION STATE & FUNCTIONS
let currentUser = null;

async function checkAuth() {
  try {
    const res = await fetch('/api/auth/me');
    if (!res.ok) {
      window.location.href = '/login.html';
      return false;
    }
    const data = await res.json();
    if (!data.authenticated) {
      window.location.href = '/login.html';
      return false;
    }
    currentUser = data.user;
    return true;
  } catch (error) {
    console.error("Auth check failed:", error);
    window.location.href = '/login.html';
    return false;
  }
}

function initUserInterface() {
  if (!currentUser) return;
  
  // Show user session info container
  const userSessionInfo = document.getElementById('userSessionInfo');
  if (userSessionInfo) {
    userSessionInfo.style.display = 'flex';
  }
  
  // Populate username
  const userNameText = document.getElementById('userNameText');
  if (userNameText) {
    userNameText.textContent = currentUser.username;
  }
  
  // Populate role badge
  const userRoleBadge = document.getElementById('userRoleBadge');
  if (userRoleBadge) {
    const isAdmin = currentUser.role === 'Admin';
    userRoleBadge.className = `user-role-badge ${isAdmin ? 'role-admin' : 'role-user'}`;
    userRoleBadge.innerHTML = `<i class="bi ${isAdmin ? 'bi-shield-lock-fill' : 'bi-person-fill'}"></i> ${isAdmin ? 'مدير النظام' : 'مستخدم عادي'}`;
  }
  
  // Set is-admin class on body if Admin
  if (currentUser.role === 'Admin') {
    document.body.classList.add('is-admin');
  } else {
    document.body.classList.remove('is-admin');
  }

  // Logout button handler
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        const res = await fetch('/api/auth/logout', { method: 'POST' });
        if (res.ok) {
          window.location.href = '/login.html';
        }
      } catch (err) {
        console.error("Logout failed:", err);
      }
    });
  }
}

function setupUserManagement() {
  if (!currentUser || currentUser.role !== 'Admin') return;

  const openUserManagementBtn = document.getElementById('openUserManagementBtn');
  const addUserForm = document.getElementById('addUserForm');

  if (openUserManagementBtn) {
    openUserManagementBtn.addEventListener('click', () => {
      openModal('userManagementModal');
      fetchUsers();
    });
  }

  if (addUserForm) {
    addUserForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const usernameInput = document.getElementById('newUsername');
      const passwordInput = document.getElementById('newUserPassword');
      const roleInput = document.getElementById('newUserRole');

      try {
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: usernameInput.value,
            password: passwordInput.value,
            role: roleInput.value
          })
        });

        const data = await res.json();
        if (res.ok) {
          showToast('تم إضافة المستخدم بنجاح');
          usernameInput.value = '';
          passwordInput.value = '';
          fetchUsers();
        } else {
          showToast(data.error || 'فشل إضافة المستخدم', true);
        }
      } catch (error) {
        showToast('خطأ في الاتصال بالخادم', true);
      }
    });
  }
}

async function fetchUsers() {
  try {
    const res = await fetch('/api/admin/users');
    if (!res.ok) throw new Error('فشل جلب المستخدمين');
    const users = await res.json();
    renderUsers(users);
  } catch (error) {
    console.error(error);
  }
}

function renderUsers(users) {
  const usersTableBody = document.getElementById('usersTableBody');
  if (!usersTableBody) return;

  usersTableBody.innerHTML = '';
  users.forEach(u => {
    const tr = document.createElement('tr');
    
    // Disable delete if user is 'admin' or if it is the logged-in user
    const isSelfOrAdmin = u.username === 'admin' || (currentUser && u.username === currentUser.username);
    const deleteButton = isSelfOrAdmin 
      ? `<span class="badge badge-info" style="opacity: 0.6;">محمي</span>`
      : `<button class="action-icon-btn btn-delete" onclick="deleteUser(${u.id}, '${u.username}')" title="حذف">
           <i class="bi bi-trash"></i>
         </button>`;

    const roleLabel = u.role === 'Admin' ? 'مدير النظام' : 'مستخدم عادي';

    tr.innerHTML = `
      <td><strong>${u.username}</strong></td>
      <td>${roleLabel}</td>
      <td>${deleteButton}</td>
    `;
    usersTableBody.appendChild(tr);
  });
}

async function deleteUser(id, username) {
  if (!confirm(`هل أنت متأكد من حذف المستخدم "${username}"؟`)) return;

  try {
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) {
      showToast('تم حذف المستخدم بنجاح');
      fetchUsers();
    } else {
      showToast(data.error || 'فشل حذف المستخدم', true);
    }
  } catch (error) {
    showToast('خطأ في الاتصال بالخادم', true);
  }
}

// Make globally accessible for HTML bindings
window.deleteUser = deleteUser;

// INITIALIZATION
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  
  // Verify user session
  const authenticated = await checkAuth();
  if (!authenticated) return;
  
  initUserInterface();
  setupUserManagement();
  await fetchCustomColumns();
  fetchDevices();
  setupEventListeners();
  setupRealTimeUpdates();
});

// REAL-TIME UPDATES via Server-Sent Events (SSE)
let sseConnection = null;
let sseReconnectTimer = null;

function setupRealTimeUpdates() {
  if (sseConnection) {
    sseConnection.close();
  }

  sseConnection = new EventSource('/api/events');

  sseConnection.onopen = () => {
    console.log('[SSE] Connected to real-time updates.');
    if (sseReconnectTimer) {
      clearTimeout(sseReconnectTimer);
      sseReconnectTimer = null;
    }
  };

  sseConnection.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'devices_updated') {
        const actionLabel = {
          'add': 'إضافة جهاز',
          'edit': 'تعديل جهاز',
          'delete': 'حذف جهاز',
          'import': 'استيراد بيانات'
        }[data.action] || 'تحديث';
        showToast(`📡 ${actionLabel} بواسطة ${data.by || 'مستخدم آخر'} — جاري تحديث البيانات...`);
        // Refresh data silently
        fetchCustomColumns().then(() => fetchDevices());
      }
    } catch (e) {
      console.warn('[SSE] Could not parse message:', event.data);
    }
  };

  sseConnection.onerror = () => {
    console.warn('[SSE] Connection lost. Reconnecting in 5 seconds...');
    sseConnection.close();
    sseReconnectTimer = setTimeout(() => {
      setupRealTimeUpdates();
    }, 5000);
  };
}

async function fetchCustomColumns() {
  try {
    const res = await fetch('/api/columns');
    if (!res.ok) throw new Error('فشل جلب الأعمدة المخصصة');
    customColumns = await res.json();
  } catch (error) {
    console.error("Error fetching custom columns:", error);
  }
}

// THEME SYSTEM
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark-theme';
  document.body.className = savedTheme;
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.body.className;
  const newTheme = currentTheme === 'dark-theme' ? 'light-theme' : 'dark-theme';
  document.body.className = newTheme;
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
  
  // Re-render charts with correct font colors
  renderCharts();
}

function updateThemeIcon(theme) {
  if (theme === 'dark-theme') {
    themeIcon.className = 'bi bi-sun-fill';
  } else {
    themeIcon.className = 'bi bi-moon-stars-fill';
  }
}

// FETCH DATA
async function fetchDevices() {
  showTableLoading();
  try {
    const res = await fetch('/api/devices');
    if (!res.ok) throw new Error('فشل جلب البيانات من الخادم');
    devices = await res.json();
    filteredDevices = [...devices];
    
    populateDeptFilter();
    renderTable();
    updateStats();
    renderCharts();
    renderComparisons();
  } catch (error) {
    showToast(error.message, true);
    devicesTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="loading-cell" style="color: var(--color-danger)">
          <i class="bi bi-exclamation-octagon-fill" style="font-size: 2rem"></i><br>
          <span>خطأ في تحميل البيانات: ${error.message}</span>
        </td>
      </tr>
    `;
  }
}

// RENDER TABLE
function renderTable() {
  const customKeys = getUniqueCustomKeys();
  const totalCols = 8 + customKeys.length;
  
  // Update header first
  const tableHead = document.querySelector('#devicesTable thead');
  if (tableHead) {
    let headHtml = `
      <tr>
        <th>الموظف</th>
        <th>الإدارة / القسم / الوحدة</th>
        <th>موديل الجهاز</th>
        <th>نوع/حجم الهاردسك</th>
        <th>الرام</th>
        <th>السيريال (Service Tag)</th>
    `;
    customKeys.forEach(k => {
      headHtml += `<th>${k}</th>`;
    });
    headHtml += `
        <th>الحالة التقنية</th>
        <th class="admin-only-element">الإجراءات</th>
      </tr>
    `;
    tableHead.innerHTML = headHtml;
  }

  if (filteredDevices.length === 0) {
    devicesTableBody.innerHTML = `
      <tr>
        <td colspan="${totalCols}" class="loading-cell">
          <i class="bi bi-inbox" style="font-size: 2rem; color: var(--text-muted)"></i><br>
          <span>لا توجد أجهزة مطابقة لخيارات البحث والتصفية.</span>
        </td>
      </tr>
    `;
    return;
  }

  devicesTableBody.innerHTML = '';
  filteredDevices.forEach(d => {
    const tr = document.createElement('tr');
    
    // Status Badge
    const status = d.technicalStatus || 'سليم';
    let statusClass = 'badge-success';
    let statusIcon = 'bi-check-circle-fill';
    if (status === 'بحاجة لصيانة') {
      statusClass = 'badge-danger';
      statusIcon = 'bi-tools';
    } else if (status === 'تحت الصيانة') {
      statusClass = 'badge-warning';
      statusIcon = 'bi-gear-wide-connected';
    }
    const statusBadge = `<span class="badge ${statusClass}"><i class="bi ${statusIcon}"></i> ${status}</span>`;

    // RAM spec clean view
    const ramSpec = d.ram || 'لا يوجد';
    
    // Storage spec clean view
    const storageSpec = `${d.storageType} ${d.storageSize}`;

    let rowHtml = `
      <td>
        <div class="employee-cell">
          <span class="emp-name">${d.employeeName}</span>
          <span class="emp-details">${d.section || 'بدون قسم'} (${d.unit || 'بدون وحدة'})</span>
        </div>
      </td>
      <td>
        <span class="badge badge-info" style="margin-bottom: 2px;">${d.department}</span>
        <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500;">
          ${d.section || 'لا يوجد'} / ${d.unit || 'لا يوجد'}
        </div>
      </td>
      <td>
        <div style="font-weight: 600">${d.deviceModel}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted)">طبيعة الجهاز: ${translateNature(d.deviceNature)}</div>
      </td>
      <td>${storageSpec}</td>
      <td>${ramSpec}</td>
      <td><code>${d.serviceTag}</code></td>
    `;
    
    // Custom keys cells
    customKeys.forEach(k => {
      const field = d.customFields ? d.customFields.find(cf => cf.label === k) : null;
      rowHtml += `<td>${field ? field.value : '—'}</td>`;
    });

    rowHtml += `
      <td>${statusBadge}</td>
      <td class="admin-only-element">
        <div class="actions-cell">
          <button class="action-icon-btn btn-view" onclick="viewDeviceDetails(${d.id})" title="عرض التفاصيل والبطاقة التقنية">
            <i class="bi bi-file-earmark-text"></i>
          </button>
          <button class="action-icon-btn btn-edit" onclick="openEditModal(${d.id})" title="تعديل">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="action-icon-btn btn-delete" onclick="openDeleteModal(${d.id}, '${d.employeeName}')" title="حذف">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    `;
    tr.innerHTML = rowHtml;
    devicesTableBody.appendChild(tr);
  });
}

// HELPERS
function checkDeviceHasIssues(device) {
  const issues = String(device.recurringIssues || '').trim().toLowerCase();
  return issues !== '' && 
         issues !== 'لا توجد مشاكل حالياً' && 
         issues !== 'لايوجد' && 
         issues !== 'لا يوجد' && 
         issues !== 'none' && 
         issues !== 'لايجد' && 
         issues !== 'سليم';
}

function translateNature(nature) {
  if (nature === 'Desktop') return 'مكتبي';
  if (nature === 'Laptop') return 'محمول';
  return nature;
}

function showTableLoading() {
  devicesTableBody.innerHTML = `
    <tr>
      <td colspan="8" class="loading-cell">
        <div class="spinner"></div>
        <span>جاري تحميل البيانات...</span>
      </td>
    </tr>
  `;
}

// POPULATE DEPARTMENT FILTER DYNAMICALLY
function populateDeptFilter() {
  const depts = [...new Set(devices.map(d => d.department))].filter(Boolean);
  const currentSelection = filterDept.value;
  
  filterDept.innerHTML = '<option value="all">الكل</option>';
  depts.forEach(dept => {
    const opt = document.createElement('option');
    opt.value = dept;
    opt.textContent = dept;
    filterDept.appendChild(opt);
  });
  
  if (depts.includes(currentSelection)) {
    filterDept.value = currentSelection;
  } else {
    filterDept.value = 'all';
  }
}

// UPDATE STATISTICS
function updateStats() {
  statTotalDevices.textContent = devices.length;
  statDesktops.textContent = devices.filter(d => d.deviceNature === 'Desktop').length;
  statLaptops.textContent = devices.filter(d => d.deviceNature === 'Laptop').length;
  statIssueDevices.textContent = devices.filter(d => (d.technicalStatus || 'سليم') !== 'سليم').length;
}

// CHARTS SYSTEM
function renderCharts() {
  const isDark = document.body.classList.contains('dark-theme');
  const textColor = isDark ? '#94a3b8' : '#475569';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(15, 23, 42, 0.04)';
  const fontConfig = { family: "'Cairo', 'Outfit', sans-serif", weight: '700' };
  
  // 1. Department Chart (Pie)
  if (deptChartInstance) deptChartInstance.destroy();
  
  const deptsData = {};
  devices.forEach(d => {
    deptsData[d.department] = (deptsData[d.department] || 0) + 1;
  });
  
  const deptLabels = Object.keys(deptsData);
  const deptValues = Object.values(deptsData);
  
  const ctxDept = document.getElementById('deptChart').getContext('2d');
  deptChartInstance = new Chart(ctxDept, {
    type: 'doughnut',
    data: {
      labels: deptLabels,
      datasets: [{
        data: deptValues,
        backgroundColor: [
          '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#f43f5e'
        ],
        borderWidth: isDark ? 2 : 1,
        borderColor: isDark ? '#0f172a' : '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'right',
          rtl: true,
          labels: {
            font: { family: "'Cairo', 'Outfit', sans-serif", size: 12, weight: '700' },
            color: textColor,
            padding: 15,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        }
      }
    }
  });

  // 2. Status Chart (Bar)
  if (statusChartInstance) statusChartInstance.destroy();
  
  const cleanCount = devices.filter(d => (d.technicalStatus || 'سليم') === 'سليم').length;
  const issueCount = devices.filter(d => (d.technicalStatus || 'سليم') !== 'سليم').length;
  
  const ctxStatus = document.getElementById('statusChart').getContext('2d');
  statusChartInstance = new Chart(ctxStatus, {
    type: 'bar',
    data: {
      labels: ['سليم', 'به مشاكل تقنية'],
      datasets: [{
        label: 'عدد الأجهزة',
        data: [cleanCount, issueCount],
        backgroundColor: [
          'rgba(16, 185, 129, 0.18)', 
          'rgba(244, 63, 94, 0.18)'
        ],
        borderColor: [
          '#10b981', 
          '#f43f5e'
        ],
        borderWidth: 1.5,
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { family: "'Cairo', 'Outfit', sans-serif", size: 12, weight: '700' },
            color: textColor
          }
        },
        y: {
          grid: { color: gridColor },
          ticks: {
            font: { family: "'Cairo', 'Outfit', sans-serif", size: 12, weight: '700' },
            color: textColor,
            stepSize: 1
          }
        }
      }
    }
  });
}

// ADVANCED CUSTODY COMPARISONS (2026 UI Upgrade)
function renderComparisons() {
  const comparisonGrid = document.getElementById('comparisonGrid');
  if (!comparisonGrid) return;

  // 1. Group devices by employeeName
  const employeeData = {};
  
  devices.forEach(d => {
    if (!d.employeeName) return;
    const name = d.employeeName.trim();
    if (!employeeData[name]) {
      employeeData[name] = {
        name: name,
        devices: [],
        totalMonitors: 0,
        totalComputers: 0,
        laptopsCount: 0,
        desktopsCount: 0
      };
    }
    
    employeeData[name].devices.push(d);
    
    // Monitors Count
    const monitors = parseInt(d.monitorsCount) || 0;
    employeeData[name].totalMonitors += monitors;
    
    // Computer check
    const nature = (d.deviceNature || '').trim();
    if (nature === 'Desktop') {
      employeeData[name].totalComputers += 1;
      employeeData[name].desktopsCount += 1;
    } else if (nature === 'Laptop') {
      employeeData[name].totalComputers += 1;
      employeeData[name].laptopsCount += 1;
    }
  });

  const uniqueEmployees = Object.values(employeeData);
  const totalEmployees = uniqueEmployees.length;

  if (totalEmployees === 0) {
    comparisonGrid.innerHTML = `
      <div class="loading-cell">لا توجد بيانات عهد لحساب المقارنات.</div>
    `;
    return;
  }

  // 2. Calculate comparison groups and lists
  const listOneMonitor = [];
  const listTwoMonitors = [];
  const listNoComputer = [];
  const listOneComputer = [];
  const listTwoComputers = [];
  const listLaptopAndDesktop = [];
  const listTwoLaptops = [];

  uniqueEmployees.forEach(emp => {
    // Monitors
    if (emp.totalMonitors === 1) listOneMonitor.push(emp.name);
    else if (emp.totalMonitors >= 2) listTwoMonitors.push(emp.name);

    // Computers count
    if (emp.totalComputers === 0) listNoComputer.push(emp.name);
    else if (emp.totalComputers === 1) listOneComputer.push(emp.name);
    else if (emp.totalComputers >= 2) listTwoComputers.push(emp.name);

    // Laptop & Desktop combo
    if (emp.desktopsCount >= 1 && emp.laptopsCount >= 1) listLaptopAndDesktop.push(emp.name);

    // Two Laptops combo
    if (emp.laptopsCount >= 2) listTwoLaptops.push(emp.name);
  });

  // Store lists in global state for modal reference
  window.comparisonLists = {
    'one_monitor': { title: 'الموظفون الذين لديهم شاشة واحدة', list: listOneMonitor },
    'two_monitors': { title: 'الموظفون الذين لديهم شاشتان أو أكثر', list: listTwoMonitors },
    'no_computer': { title: 'الموظفون بدون كمبيوتر (عهدة أخرى)', list: listNoComputer },
    'one_computer': { title: 'الموظفون الذين لديهم جهاز كمبيوتر واحد', list: listOneComputer },
    'two_computers': { title: 'الموظفون الذين لديهم جهازان أو أكثر', list: listTwoComputers },
    'laptop_and_desktop': { title: 'الموظفون الذين لديهم لابتوب ومكتبي معاً', list: listLaptopAndDesktop },
    'two_laptops': { title: 'الموظفون الذين لديهم لابتوبان أو أكثر', list: listTwoLaptops }
  };

  // Helper to generate progress bar HTML
  const makeBar = (key, title, count, colorClass, iconClass) => {
    const pct = totalEmployees > 0 ? ((count / totalEmployees) * 100).toFixed(1) : 0;
    return `
      <div class="comp-card" onclick="showCategoryEmployees('${key}')" title="انقر لعرض قائمة الموظفين" style="cursor: pointer;">
        <div class="comp-info">
          <span class="comp-title"><i class="bi ${iconClass}"></i> ${title}</span>
          <span class="comp-badge badge-${colorClass}">${count} ${count >= 3 && count <= 10 ? 'موظفين' : 'موظف'} (${pct}%)</span>
        </div>
        <div class="comp-progress-bg">
          <div class="comp-progress-bar progress-${colorClass}" style="width: ${pct}%"></div>
        </div>
      </div>
    `;
  };

  comparisonGrid.innerHTML = `
    ${makeBar('one_monitor', 'لديه شاشة واحدة', listOneMonitor.length, 'info', 'bi-display')}
    ${makeBar('two_monitors', 'لديه شاشتان أو أكثر', listTwoMonitors.length, 'success', 'bi-display-fill')}
    ${makeBar('no_computer', 'لا يملك جهاز كمبيوتر (عهدة أخرى)', listNoComputer.length, 'danger', 'bi-person-x-fill')}
    ${makeBar('one_computer', 'لديه جهاز كمبيوتر واحد', listOneComputer.length, 'warning', 'bi-laptop')}
    ${makeBar('two_computers', 'لديه جهازان أو أكثر', listTwoComputers.length, 'primary', 'bi-pc-display-horizontal')}
    ${makeBar('laptop_and_desktop', 'لديه لابتوب ومكتبي معاً', listLaptopAndDesktop.length, 'secondary', 'bi-arrow-left-right')}
    ${makeBar('two_laptops', 'لديه لابتوبان أو أكثر', listTwoLaptops.length, 'success', 'bi-laptop-fill')}
  `;
}

// Show category employees modal
function showCategoryEmployees(key) {
  const categoryData = window.comparisonLists ? window.comparisonLists[key] : null;
  if (!categoryData) return;

  const titleEl = document.getElementById('categoryEmployeesTitle');
  const listEl = document.getElementById('categoryEmployeesList');
  
  if (titleEl) titleEl.textContent = categoryData.title;
  if (listEl) {
    if (categoryData.list.length === 0) {
      listEl.innerHTML = `
        <li style="text-align: center; color: var(--text-muted); font-size: 0.9rem; padding: 1.5rem 0; width: 100%;">
          <i class="bi bi-info-circle-fill" style="font-size: 2rem; color: var(--color-primary); display: inline-block; margin-bottom: 0.5rem;"></i><br>
          <span>لا يوجد موظفون في هذه الفئة حالياً.</span>
        </li>
      `;
    } else {
      listEl.innerHTML = categoryData.list.map(name => {
        // Find employee department/section for detailed view
        const empDevices = devices.filter(d => d.employeeName && d.employeeName.trim() === name);
        const deptInfo = empDevices.length > 0 ? empDevices[0].department : '';
        const sectInfo = empDevices.length > 0 && empDevices[0].section ? ` / ${empDevices[0].section}` : '';
        
        return `
          <li style="display: flex; justify-content: space-between; align-items: center; padding: 0.85rem 1.15rem; background-color: var(--bg-input); border: 1px solid var(--border-color); border-radius: var(--border-radius-md); transition: all var(--transition-speed);">
            <div style="display: flex; flex-direction: column;">
              <span style="font-weight: 700; font-size: 0.95rem; color: var(--text-main);">${name}</span>
              <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; margin-top: 0.15rem;">${deptInfo}${sectInfo}</span>
            </div>
            <div>
              <button class="action-btn btn-secondary" onclick="filterTableByEmployee('${name}')" style="padding: 0.45rem 1rem; font-size: 0.8rem; font-weight: 700; border-radius: var(--border-radius-sm); border: 1px solid var(--border-color);" title="تصفية الجدول">
                <i class="bi bi-funnel-fill"></i> عرض الأجهزة
              </button>
            </div>
          </li>
        `;
      }).join('');
    }
  }

  openModal('categoryEmployeesModal');
}

function filterTableByEmployee(name) {
  closeModal('categoryEmployeesModal');
  
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.value = name;
    
    // Apply search and filter
    applySearchAndFilters();
    
    // Scroll to inventory section
    const invSection = document.querySelector('.inventory-section');
    if (invSection) {
      invSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

// SEARCH & FILTERS IMPLEMENTATION
function applySearchAndFilters() {
  const query = searchInput.value.toLowerCase().trim();
  const deptVal = filterDept.value;
  const natureVal = filterNature.value;
  const statusVal = filterStatus.value;

  filteredDevices = devices.filter(d => {
    // Search filter
    const matchQuery = !query || 
      String(d.employeeName || '').toLowerCase().includes(query) ||
      String(d.department || '').toLowerCase().includes(query) ||
      String(d.section || '').toLowerCase().includes(query) ||
      String(d.unit || '').toLowerCase().includes(query) ||
      String(d.deviceModel || '').toLowerCase().includes(query) ||
      String(d.deviceNature || '').toLowerCase().includes(query) ||
      String(d.ram || '').toLowerCase().includes(query) ||
      String(d.storageType || '').toLowerCase().includes(query) ||
      String(d.storageSize || '').toLowerCase().includes(query) ||
      String(d.serviceTag || '').toLowerCase().includes(query) ||
      String(d.technicalStatus || '').toLowerCase().includes(query) ||
      String(d.recurringIssues || '').toLowerCase().includes(query) ||
      String(d.notes || '').toLowerCase().includes(query) ||
      String(d.systemsUsed || '').toLowerCase().includes(query) ||
      String(d.phone || '').toLowerCase().includes(query) ||
      String(d.monitorsCount || '').toLowerCase().includes(query) ||
      (d.customFields && d.customFields.some(cf => 
        String(cf.label).toLowerCase().includes(query) || 
        String(cf.value).toLowerCase().includes(query)
      ));

    // Dept filter
    const matchDept = deptVal === 'all' || d.department === deptVal;

    // Nature filter
    const matchNature = natureVal === 'all' || d.deviceNature === natureVal;

    // Status filter
    const status = d.technicalStatus || 'سليم';
    const matchStatus = statusVal === 'all' || 
      (statusVal === 'clean' && status === 'سليم') || 
      (statusVal === 'issues' && status !== 'سليم');

    return matchQuery && matchDept && matchNature && matchStatus;
  });

  renderTable();
}

// TOAST NOTIFICATIONS
function showToast(message, isError = false) {
  toastMessage.textContent = message;
  if (isError) {
    toast.className = 'toast show toast-error';
    toastIcon.className = 'bi bi-x-circle-fill toast-icon';
  } else {
    toast.className = 'toast show';
    toastIcon.className = 'bi bi-check-circle-fill toast-icon';
  }
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

// EVENT LISTENERS
function setupEventListeners() {
  // Theme Toggle
  themeToggleBtn.addEventListener('click', toggleTheme);

  // Live Filtering
  searchInput.addEventListener('input', applySearchAndFilters);
  filterDept.addEventListener('change', applySearchAndFilters);
  filterNature.addEventListener('change', applySearchAndFilters);
  filterStatus.addEventListener('change', applySearchAndFilters);

  // Add Device modal trigger
  openAddModalBtn.addEventListener('click', openAddModal);

  // Add Column modal trigger
  document.getElementById('openAddColumnModalBtn').addEventListener('click', () => openModal('columnModal'));

  // Form submission
  deviceForm.addEventListener('submit', handleFormSubmit);

  // Add Custom Field trigger inside the form opens the column modal
  document.getElementById('addCustomFieldBtn').addEventListener('click', () => openModal('columnModal'));

  // Column form submission
  document.getElementById('columnForm').addEventListener('submit', handleColumnSubmit);

  // Delete confirm trigger
  confirmDeleteBtn.addEventListener('click', handleDeviceDelete);

  // Excel Import modal triggers
  openImportModalBtn.addEventListener('click', () => openModal('importModal'));
  excelFileInput.addEventListener('change', handleFileSelect);
  importForm.addEventListener('submit', handleImportSubmit);

  // Drag & drop excel
  dropZone.addEventListener('click', () => excelFileInput.click());
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });
  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      excelFileInput.files = e.dataTransfer.files;
      handleFileSelect();
    }
  });
}

// MODAL CONTROLLERS
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = 'flex';
  setTimeout(() => modal.classList.add('show'), 10);
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.remove('show');
  setTimeout(() => {
    modal.style.display = 'none';
    if (modalId === 'deviceModal') {
      deviceForm.reset();
      document.getElementById('deviceId').value = '';
      document.getElementById('customFieldsContainer').innerHTML = '';
    } else if (modalId === 'importModal') {
      importForm.reset();
      selectedFileName.textContent = '';
      startImportBtn.disabled = true;
    }
  }, 250);
}

// ADD DEVICE MODAL
function openAddModal() {
  document.getElementById('modalTitle').textContent = 'إضافة جهاز جديد';
  document.getElementById('deviceId').value = '';
  deviceForm.reset();
  document.getElementById('technicalStatus').value = 'سليم';
  renderFormCustomFields(null);
  openModal('deviceModal');
}

// EDIT DEVICE MODAL
function openEditModal(id) {
  const d = devices.find(x => x.id === id);
  if (!d) return;

  document.getElementById('modalTitle').textContent = 'تعديل بيانات الجهاز للعهدة';
  document.getElementById('deviceId').value = d.id;
  
  document.getElementById('employeeName').value = d.employeeName || '';
  document.getElementById('department').value = d.department || '';
  document.getElementById('section').value = d.section || '';
  document.getElementById('unit').value = d.unit || '';
  
  document.getElementById('deviceNature').value = d.deviceNature || 'Desktop';
  document.getElementById('deviceModel').value = d.deviceModel || '';
  document.getElementById('serviceTag').value = d.serviceTag || '';
  document.getElementById('ram').value = d.ram || '';
  document.getElementById('storageType').value = d.storageType || 'SSD';
  document.getElementById('storageSize').value = d.storageSize || '';
  document.getElementById('monitorsCount').value = d.monitorsCount || 1;
  document.getElementById('phone').value = d.phone || '';
  
  document.getElementById('systemsUsed').value = d.systemsUsed || '';
  document.getElementById('recurringIssues').value = d.recurringIssues || '';
  document.getElementById('notes').value = d.notes || '';
  document.getElementById('technicalStatus').value = d.technicalStatus || 'سليم';

  // Load custom fields
  renderFormCustomFields(d);

  openModal('deviceModal');
}

// DELETE DEVICE MODAL
function openDeleteModal(id, employeeName) {
  document.getElementById('deleteDeviceId').value = id;
  document.getElementById('deleteTargetName').textContent = `جهاز الموظف: ${employeeName}`;
  openModal('deleteModal');
}

// SUBMIT ADD/EDIT FORM
async function handleFormSubmit(e) {
  e.preventDefault();
  
  const idVal = document.getElementById('deviceId').value;
  const isEdit = idVal !== '';
  
  // Collect custom fields
  const customFieldInputs = document.querySelectorAll('.custom-field-value-input');
  const customFields = [];
  customFieldInputs.forEach(input => {
    const label = input.getAttribute('data-label');
    const value = input.value.trim();
    if (value) {
      customFields.push({ label, value });
    }
  });
  
  const payload = {
    employeeName: document.getElementById('employeeName').value.trim(),
    department: document.getElementById('department').value.trim(),
    section: document.getElementById('section').value.trim(),
    unit: document.getElementById('unit').value.trim(),
    deviceNature: document.getElementById('deviceNature').value,
    deviceModel: document.getElementById('deviceModel').value.trim(),
    serviceTag: document.getElementById('serviceTag').value.trim(),
    ram: document.getElementById('ram').value.trim(),
    storageType: document.getElementById('storageType').value,
    storageSize: document.getElementById('storageSize').value.trim(),
    monitorsCount: parseInt(document.getElementById('monitorsCount').value) || 1,
    phone: document.getElementById('phone').value.trim(),
    systemsUsed: document.getElementById('systemsUsed').value.trim(),
    recurringIssues: document.getElementById('recurringIssues').value.trim(),
    notes: document.getElementById('notes').value.trim(),
    technicalStatus: document.getElementById('technicalStatus').value,
    customFields: customFields
  };

  const saveBtn = document.getElementById('saveDeviceBtn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'جاري الحفظ...';

  try {
    const url = isEdit ? `/api/devices/${idVal}` : '/api/devices';
    const method = isEdit ? 'PUT' : 'POST';
    
    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('حدث خطأ أثناء الاتصال بالخادم لحفظ البيانات');
    
    showToast(isEdit ? 'تم تحديث بيانات العهدة بنجاح!' : 'تم إضافة الجهاز للعهدة بنجاح!');
    closeModal('deviceModal');
    fetchDevices(); // Refresh
  } catch (error) {
    showToast(error.message, true);
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'حفظ البيانات';
  }
}

// CONFIRM DELETE
async function handleDeviceDelete() {
  const idVal = document.getElementById('deleteDeviceId').value;
  if (!idVal) return;

  confirmDeleteBtn.disabled = true;
  confirmDeleteBtn.textContent = 'جاري الحذف...';

  try {
    const res = await fetch(`/api/devices/${idVal}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('فشل حذف العهدة من الخادم');
    
    showToast('تم حذف الجهاز من العهدة نهائياً');
    closeModal('deleteModal');
    fetchDevices();
  } catch (error) {
    showToast(error.message, true);
  } finally {
    confirmDeleteBtn.disabled = false;
    confirmDeleteBtn.textContent = 'حذف نهائي';
  }
}

// VIEW DETAILS CARD
function viewDeviceDetails(id) {
  const d = devices.find(x => x.id === id);
  if (!d) return;

  const hasIssues = checkDeviceHasIssues(d);
  
  // Systems formatting as pills
  let systemsHtml = '';
  if (d.systemsUsed && d.systemsUsed !== 'لا يوجد' && d.systemsUsed !== 'لايوجد') {
    const systemsList = d.systemsUsed.split(/[,/،\+]/).map(s => s.trim()).filter(Boolean);
    systemsHtml = systemsList.map(s => `<span class="sys-pill">${s}</span>`).join('');
  } else {
    systemsHtml = `<span class="sys-pill" style="color: var(--text-muted)">لا توجد أنظمة خاصة مسجلة</span>`;
  }

  // Custom fields formatting
  let customFieldsHtml = '';
  if (d.customFields && Array.isArray(d.customFields) && d.customFields.length > 0) {
    customFieldsHtml = `
      <div class="tech-section full-width">
        <h5>بيانات مخصصة إضافية</h5>
        <div class="tech-detail-grid">
    `;
    d.customFields.forEach(cf => {
      customFieldsHtml += `
        <div class="tech-item">
          <span class="tech-label">${cf.label}:</span>
          <span class="tech-val">${cf.value}</span>
        </div>
      `;
    });
    customFieldsHtml += `
        </div>
      </div>
    `;
  }

  // Issue card display
  const issuesHtml = hasIssues
    ? `<div class="issue-alert-box">
         <i class="bi bi-exclamation-triangle-fill"></i>
         <div>
           <strong>تقرير الأعطال/المشاكل:</strong><br>
           <span>${d.recurringIssues}</span>
         </div>
       </div>`
    : `<div class="issue-alert-box no-issues">
         <i class="bi bi-check-circle-fill"></i>
         <span>سليم - لا توجد أي مشاكل تقنية مسجلة حالياً على هذا الجهاز</span>
       </div>`;

  // General Notes display
  const notesHtml = d.notes && d.notes !== 'لا يوجد' && d.notes !== 'لايوجد'
    ? `<div class="notes-alert-box" style="background: var(--bg-hover); padding: 0.75rem 1rem; border-right: 4px solid var(--color-primary); border-radius: var(--border-radius-sm); font-size: 0.85rem; line-height: 1.5;">
         <span>${d.notes}</span>
       </div>`
    : `<div class="notes-alert-box no-issues" style="font-size: 0.85rem; color: var(--text-muted); font-style: italic;">
         <span>لا توجد ملاحظات مسجلة على هذا الجهاز</span>
       </div>`;

  detailBody.innerHTML = `
    <div class="tech-card">
      <div class="tech-card-header">
        <div class="tech-card-title">
          <h4>بطاقة مواصفات العهدة التقنية</h4>
          <span>اسم الموظف: ${d.employeeName}</span>
        </div>
        <div class="tech-card-badge">ID: #${d.id}</div>
      </div>
      
      <div class="tech-card-details">
        <div class="tech-card-sections">
          <!-- القسم الأول: جهة الموظف -->
          <div class="tech-section">
            <h5>بيانات الجهة والموظف</h5>
            <div class="tech-detail-grid">
              <div class="tech-item"><span class="tech-label">الإدارة:</span> <span class="tech-val">${d.department}</span></div>
              <div class="tech-item"><span class="tech-label">القسم:</span> <span class="tech-val">${d.section || 'لا يوجد'}</span></div>
              <div class="tech-item"><span class="tech-label">الوحدة:</span> <span class="tech-val">${d.unit || 'لا يوجد'}</span></div>
              <div class="tech-item"><span class="tech-label">المستلم:</span> <span class="tech-val">${d.employeeName}</span></div>
            </div>
          </div>

          <!-- القسم الثاني: مواصفات الجهاز -->
          <div class="tech-section">
            <h5>المواصفات التقنية الفنية</h5>
            <div class="tech-detail-grid">
              <div class="tech-item"><span class="tech-label">الموديل:</span> <span class="tech-val">${d.deviceModel}</span></div>
              <div class="tech-item"><span class="tech-label">طبيعة الجهاز:</span> <span class="tech-val">${translateNature(d.deviceNature)}</span></div>
              <div class="tech-item"><span class="tech-label">الذاكرة العشوائية:</span> <span class="tech-val">${d.ram || 'غير متوفر'}</span></div>
              <div class="tech-item"><span class="tech-label">سعة التخزين:</span> <span class="tech-val">${d.storageType} ${d.storageSize}</span></div>
              <div class="tech-item"><span class="tech-label">عدد الشاشات:</span> <span class="tech-val">${d.monitorsCount} شاشات</span></div>
              <div class="tech-item"><span class="tech-label">Service Tag:</span> <span class="tech-val"><code>${d.serviceTag}</code></span></div>
            </div>
          </div>

          <!-- الهاتف -->
          <div class="tech-section full-width">
            <h5>بيانات الاتصال والملحقات الفنية</h5>
            <div class="tech-detail-grid">
              <div class="tech-item" style="grid-column: span 2;">
                <span class="tech-label">الهاتف الأرضي / Cisco IP Phone:</span>
                <span class="tech-val" style="color: var(--color-primary)">${d.phone || 'لا يوجد'}</span>
              </div>
            </div>
          </div>

          <!-- الأنظمة -->
          <div class="tech-section full-width">
            <h5>البرمجيات والأنظمة المستعملة</h5>
            <div class="systems-pill-box">
              ${systemsHtml}
            </div>
          </div>

          <!-- البيانات المخصصة الإضافية -->
          ${customFieldsHtml}

          <!-- الملاحظات العامة -->
          <div class="tech-section full-width">
            <h5>الملاحظات العامة</h5>
            ${notesHtml}
          </div>

          <!-- الأعطال والمشاكل -->
          <div class="tech-section full-width">
            <h5>الحالة الأمنية والفنية (الأمن السيبراني)</h5>
            <div style="margin-bottom: 0.75rem; display: flex; gap: 0.5rem; align-items: center;">
              <span class="tech-label" style="font-weight: bold;">الحالة الفنية للجهاز:</span>
              <span class="badge ${d.technicalStatus === 'بحاجة لصيانة' ? 'badge-danger' : d.technicalStatus === 'تحت الصيانة' ? 'badge-warning' : 'badge-success'}">${d.technicalStatus || 'سليم'}</span>
            </div>
            ${issuesHtml}
          </div>
        </div>
      </div>
    </div>
  `;

  openModal('detailsModal');
}

// PRINT CARD
function printDetailCard() {
  window.print();
}

// EXCEL IMPORT CONTROLS
function handleFileSelect() {
  if (excelFileInput.files.length > 0) {
    const file = excelFileInput.files[0];
    selectedFileName.textContent = `الملف المختار: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    startImportBtn.disabled = false;
  }
}

async function handleImportSubmit(e) {
  e.preventDefault();
  
  if (excelFileInput.files.length === 0) return;
  
  const formData = new FormData();
  formData.append('file', excelFileInput.files[0]);

  startImportBtn.disabled = true;
  startImportBtn.textContent = 'جاري رفع واستيراد البيانات...';

  try {
    const res = await fetch('/api/import', {
      method: 'POST',
      body: formData
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'حدث خطأ غير معروف أثناء الاستيراد');

    showToast(result.message || 'تم استيراد ملف الإكسل بنجاح!');
    closeModal('importModal');
    fetchDevices();
  } catch (error) {
    showToast(error.message, true);
  } finally {
    startImportBtn.disabled = false;
    startImportBtn.textContent = 'ابدأ الاستيراد';
  }
}

async function handleColumnSubmit(e) {
  e.preventDefault();
  const nameInput = document.getElementById('newColumnName');
  const name = nameInput.value.trim();
  if (!name) return;

  const saveBtn = document.getElementById('saveColumnBtn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'جاري الإضافة...';

  try {
    const res = await fetch('/api/columns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'فشل إضافة العمود');

    showToast('تم إضافة العمود المخصص بنجاح!');
    nameInput.value = '';
    closeModal('columnModal');
    
    // Reload state
    await fetchCustomColumns();
    
    // If the deviceModal is open, re-render the custom fields in it
    const isDeviceModalOpen = document.getElementById('deviceModal').style.display === 'flex' || 
                              document.getElementById('deviceModal').classList.contains('show');
    if (isDeviceModalOpen) {
      const devId = document.getElementById('deviceId').value;
      if (devId) {
        const d = devices.find(x => x.id === parseInt(devId));
        renderFormCustomFields(d);
      } else {
        renderFormCustomFields(null);
      }
    }
    
    // Refresh table and stats
    fetchDevices();
  } catch (error) {
    showToast(error.message, true);
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'إضافة العمود';
  }
}

// CUSTOM FIELDS HELPERS
function getUniqueCustomKeys() {
  const keys = [...customColumns];
  devices.forEach(d => {
    if (d.customFields && Array.isArray(d.customFields)) {
      d.customFields.forEach(cf => {
        if (cf.label && !keys.includes(cf.label)) {
          keys.push(cf.label);
        }
      });
    }
  });
  return keys;
}

function renderFormCustomFields(device = null) {
  const container = document.getElementById('customFieldsContainer');
  container.innerHTML = '';
  const keys = getUniqueCustomKeys();
  
  if (keys.length === 0) {
    container.innerHTML = `
      <div style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 0.5rem; border: 1px dashed var(--border-color); border-radius: var(--border-radius-sm);">
        لا توجد حقول إضافية حالياً. اضغط على أيقونة (+) لإنشاء حقل مخصص جديد للمنظومة.
      </div>
    `;
    return;
  }
  
  keys.forEach(key => {
    const field = device && device.customFields ? device.customFields.find(cf => cf.label === key) : null;
    const value = field ? field.value : '';
    
    const row = document.createElement('div');
    row.className = 'form-group';
    row.style.display = 'flex';
    row.style.flexDirection = 'column';
    row.style.gap = '0.4rem';
    
    row.innerHTML = `
      <label>${key}</label>
      <input type="text" class="custom-field-value-input" data-label="${key}" placeholder="القيمة..." value="${value}">
    `;
    container.appendChild(row);
  });
}
