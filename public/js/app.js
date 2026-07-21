// APP STATE
let devices = [];
let filteredDevices = [];
let deptChartInstance = null;
let statusChartInstance = null;
let customColumns = [];

const orgStructure = {
  "مجلس الإدارة": {
    "مكتب المراجعة الداخلية": {
      "قسم المراجعة الادارية والمالية": {},
      "قسم المراجعة الفنية وضمان الدخل": {}
    },
    "المكتب القانوني": {
      "وحدة العقود والاتفاقيات القانونية": {},
      "وحدة الشؤون القانونية": {}
    },
    "مكتب المخاطر والامتثال": {},
    "مكتب الاستراتيجيات": {},
    "مكتب شؤون مجلس الادارة": {
      "وحدة التقارير والمعلومات": {},
      "وحدة المتابعة وشؤون مجلس الادارة": {},
      "وحدة الاعلام": {},
      "وحدة العلاقات العامة": {}
    },
    "المدير العام": {
      "مكتب امن المعلومات والامن السيبراني": {
        "وحدة المتابعة والجودة والسكرتارية": {},
        "قسم سياسات واجراءات امن المعلومات": {},
        "قسم امن المعلومات والامن السيبراني": {},
        "قسم ادارة المخاطر واستمرارية الاعمال": {}
      },
      "مكتب ضمان الجودة": {},
      "مكتب البرامج والمشروعات": {},
      "مكتب شؤون المدير العام": {
        "وحدة المتابعة والتقارير": {},
        "وحدة التوتيق والارشفة الالكترونية": {}
      },
      "الإدارة الفنية": {
        "دائرة التشغيل والصيانة": {
          "محطة درنة": {},
          "قسم القوى والتكييف": {
            "وحدة القوى": {},
            "وحدة التكييف": {}
          },
          "قسم الدعم الفني": {
            "وحدة شبكة البيانات": {},
            "وحدة المقسمات الدولية": {},
            "وحدة التراسل والكوابل والتركيبات": {}
          },
          "قسم تخطيط وإدارة موارد الشبكة": {}
        },
        "مركز عمليات الشبكة": {
          "قسم نظم معلومات مركز عمليات الشبكة": {},
          "قسم الدعم الفني لمركز عمليات الشبكة": {
            "وحدة متابعة جودة مؤشرات أداء الشبكة": {}
          }
        }
      },
      "إدارة تقنية المعلومات": {
        "قسم الدعم الفني لتقنية المعلومات": {},
        "قسم البنية التحتية لتقنية المعلومات": {},
        "قسم التطبيقات": {
          "وحدة الحلول المعلوماتية والتطوير": {}
        }
      },
      "إدارة الخدمات": {
        "قسم الخدمات": {
          "وحدة الحركة والمندوبين": {},
          "وحدة الخدمات المساندة": {},
          "وحدة الأمن والسلامة المهنية": {}
        },
        "قسم المخازن": {},
        "قسم المشتريات والعقود": {
          "وحدة المشتريات الداخلية والخارجية": {},
          "وحدة العقود والموردين": {}
        }
      },
      "إدارة الموارد": {
        "قسم عمليات الموارد البشرية": {
          "وحدة شؤون العاملين": {},
          "وحدة المرتبات والمزايا": {},
          "وحدة الرعاية الصحية": {}
        },
        "قسم تخطيط الموارد": {},
        "قسم التطوير والتقييم": {
          "وحدة التدريب": {},
          "وحدة تقييم الأداء": {}
        }
      },
      "الإدارة المالية": {
        "قسم الاعتمادات المستندية ومتابعة المشاريع": {},
        "قسم المقبوضات": {},
        "قسم المدفوعات": {},
        "قسم المحاسبة والميزانيات والتقارير": {
          "وحدة الميزانيات والتقارير": {},
          "وحدة المحاسبة": {}
        }
      },
      "الإدارة التجارية": {
        "دائرة المنتجات": {
          "قسم دعم وتحليل المنتجات": {},
          "قسم تطوير المنتجات": {
            "وحدة مراقبة المنتجات": {}
          }
        },
        "دائرة التسويق والمبيعات": {
          "قسم الحركة الهاتفية": {},
          "قسم الدعم التجاري": {},
          "قسم البيانات والمنتجات المضافة": {}
        }
      }
    }
  }
};;;

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
      roleInput.addEventListener('change', (e) => {
        const permsDiv = document.getElementById('userPermissionsDiv');
        if (permsDiv) {
          permsDiv.style.opacity = e.target.value === 'Admin' ? '0.5' : '1';
          permsDiv.style.pointerEvents = e.target.value === 'Admin' ? 'none' : 'auto';
        }
      });
  

      try {
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: usernameInput.value,
            password: passwordInput.value,
            role: roleInput.value,
            permissions: {
              canAdd: document.getElementById('permAdd') ? document.getElementById('permAdd').checked : false,
              canEdit: document.getElementById('permEdit') ? document.getElementById('permEdit').checked : false,
              canDelete: document.getElementById('permDelete') ? document.getElementById('permDelete').checked : false
            }
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
  const isDark = document.body.classList.contains('dark-theme');
  const newTheme = isDark ? 'light-theme' : 'dark-theme';
  
  document.body.classList.remove('dark-theme', 'light-theme');
  document.body.classList.add(newTheme);
  
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
  
  // Re-render charts with correct font colors
  if (typeof renderCharts === 'function') renderCharts();
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
    const res = await fetch(`/api/devices?_t=${Date.now()}`);
    if (!res.ok) throw new Error('فشل جلب البيانات من الخادم');
    devices = await res.json();
    filteredDevices = [...devices];
    
    populateDeptFilter();
    populateEmployeeDatalist();
    restoreSearchAndFilters();
    applySearchAndFilters();
    updateStats();
    if (typeof populateComparisonOrgFilter === "function") populateComparisonOrgFilter();
    renderCharts();
    renderComparisons();
  } catch (error) {
    showToast(error.message, true);
    devicesTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="loading-cell" style="color: var(--color-danger)">
          <i class="bi bi-exclamation-octagon-fill" style="font-size: 2rem"></i><br>
          <span>${window.t ? window.t('fetch_error') : 'خطأ في تحميل البيانات:'} ${error.message}</span>
        </td>
      </tr>
    `;
  }
}

// RENDER TABLE
function renderTable() {
  const customKeys = getUniqueCustomKeys();
  const totalCols = 5;
  
  // Update header first
  const tableHead = document.querySelector('#devicesTable thead');
  if (tableHead) {
    let headHtml = `
      <tr>
        <th>الرقم الوظيفي</th>
        <th>${window.t ? window.t('th_employee') : 'اسم الموظف'}</th>
        <th>${window.t ? window.t('th_department') : 'المسمى الوظيفي'}</th>
        <th>${window.t ? window.t('th_status') : 'الحالة التقنية'}</th>
        <th>${window.t ? window.t('th_actions') : 'الإجراءات'}</th>
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
    let statusDisplay = window.t ? window.t('status_clean') : status;
    
    if (status === 'بحاجة لصيانة') {
      statusClass = 'badge-danger';
      statusIcon = 'bi-tools';
      statusDisplay = window.t ? window.t('status_need_maint') : status;
    } else if (status === 'تحت الصيانة') {
      statusClass = 'badge-warning';
      statusIcon = 'bi-gear-wide-connected';
      statusDisplay = window.t ? window.t('status_in_maint') : status;
    }
    const statusBadge = `<span class="badge ${statusClass}"><i class="bi ${statusIcon}"></i> ${statusDisplay}</span>`;

    // RAM spec clean view
    const ramSpec = d.deviceNature === 'Printer' ? `<span class="text-muted">${window.t ? window.t('not_applicable') : 'لا ينطبق'}</span>` : (d.ram || (window.t ? window.t('dept_none') : 'لا يوجد'));
    
    // Storage spec clean view
    let storageSpec = `${d.storageType} ${d.storageSize}`;
    if (d.deviceNature === 'Printer') {
      const conn = d.connectionType || 'USB';
      const connIcon = conn === 'Wireless' ? 'bi-wifi' : (conn === 'Network' ? 'bi-hdd-network' : 'bi-usb-symbol');
      storageSpec = `<i class="bi ${connIcon}"></i> ${conn}`;
    }

    let rowHtml = `
      <td>
        <div class="employee-cell">
          <span class="emp-name">${d.employeeId || '—'}</span>
        </div>
      </td>
      <td>
        <div class="employee-cell">
          <span class="emp-name">${d.employeeName}</span>
        </div>
      </td>
      <td>
        <span style="font-weight: 500; display: block; margin-bottom: 4px; color: var(--primary-color);">${d.orgPath ? d.orgPath.split('||').pop() : '-'}</span>
        <span style="font-size: 0.85rem; color: var(--text-muted);" title="${d.orgPath ? d.orgPath.replace(/\|\|/g, ' > ') : ''}">${d.orgPath ? d.orgPath.replace(/\|\|/g, ' > ') : '-'}</span>
      </td>
      <td>${statusBadge}</td>
    `;
    rowHtml += `
      <td>
        <div class="actions-cell">
          <button class="action-icon-btn btn-view" onclick="viewDeviceHistory(${d.id})" title="سجل حركات الجهاز">
            <i class="bi bi-clock-history"></i>
          </button>
          <button class="action-icon-btn btn-view" onclick="viewDeviceDetails(${d.id})" title="عرض التفاصيل والبطاقة التقنية">
            <i class="bi bi-file-earmark-text"></i>
          </button>
          ${(currentUser && (currentUser.role === 'Admin' || (currentUser.permissions && currentUser.permissions.canEdit))) ? `<button class="action-icon-btn btn-edit" onclick="openEditModal(${d.id})" title="تعديل"><i class="bi bi-pencil"></i></button>` : ''}
          ${(currentUser && (currentUser.role === 'Admin' || (currentUser.permissions && currentUser.permissions.canDelete))) ? `<button class="action-icon-btn btn-delete" onclick="openDeleteModal(${d.id}, '${d.employeeName}')" title="حذف"><i class="bi bi-trash"></i></button>` : ''}
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
  if (typeof window.t === 'function') {
    if (nature === 'Desktop') return window.t('desktop_pc') || 'مكتبي';
    if (nature === 'Laptop') return window.t('laptop_pc') || 'محمول';
    if (nature === 'Printer') return window.t('printer_device') || 'طابعة';
  }
  if (nature === 'Desktop') return 'مكتبي';
  if (nature === 'Laptop') return 'محمول';
  if (nature === 'Printer') return 'طابعة';
  return nature;
}

function showTableLoading() {
  devicesTableBody.innerHTML = `
    <tr>
      <td colspan="8" class="loading-cell">
        <div class="spinner"></div>
        <span><span data-i18n="loading">جاري تحميل البيانات...</span></span>
      </td>
    </tr>
  `;
}

// POPULATE DEPARTMENT FILTER DYNAMICALLY
function populateDeptFilter() {
  const filterDept = document.getElementById('filterDept');
  if (!filterDept) return;
  
  const savedVal = filterDept.value;
  filterDept.innerHTML = '<option value="all">الكل</option>';
  
  const allDepts = new Set();
  
  function traverse(obj, path) {
    if (!obj) return;
    for (const key in obj) {
      if (key !== 'الكل' && key !== 'لايوجد') {
        const fullPath = path ? path + ' || ' + key : key;
        allDepts.add(fullPath);
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          traverse(obj[key], fullPath);
        }
      }
    }
  }
  
  traverse(orgStructure, '');
  
  Array.from(allDepts).sort().forEach(deptPath => {
    const displayName = deptPath.replace(/\|\|/g, ' > ');
    filterDept.add(new Option(displayName, deptPath));
  });

  if (Array.from(allDepts).includes(savedVal)) {
    filterDept.value = savedVal;
  }
}

// POPULATE EMPLOYEE DATALIST FOR AUTO-COMPLETE
function populateEmployeeDatalist() {
  const datalist = document.getElementById('employeeNamesList');
  if (!datalist) return;
  
  const uniqueEmps = new Map();
  devices.forEach(d => {
    if (d.employeeName && !uniqueEmps.has(d.employeeName)) {
      uniqueEmps.set(d.employeeName, true);
    }
  });
  
  datalist.innerHTML = '';
  uniqueEmps.forEach((_, name) => {
    const opt = document.createElement('option');
    opt.value = name;
    datalist.appendChild(opt);
  });
}

// Animated number counter for premium 2026 UI feel
function animateCounter(element, targetValue, duration = 700) {
  if (!element) return;
  const start = parseInt(element.textContent) || 0;
  const end = targetValue;
  if (start === end) return;
  const startTime = performance.now();
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    element.textContent = Math.round(start + (end - start) * easeOut(progress));
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// UPDATE STATISTICS
function updateStats() {
  animateCounter(statTotalDevices, devices.length);
  animateCounter(statDesktops, devices.filter(d => d.deviceNature === 'Desktop').length);
  animateCounter(statLaptops, devices.filter(d => d.deviceNature === 'Laptop').length);
  animateCounter(statIssueDevices, devices.filter(d => (d.technicalStatus || 'سليم') !== 'سليم').length);
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
    let chartDept = 'أخرى';
    if (d.orgPath) {
      const paths = d.orgPath.split('||');
      if (paths.length > 2 && paths[0] === 'مجلس الإدارة' && paths[1] === 'المدير العام') {
         chartDept = paths[2];
      } else if (paths.length > 1 && paths[0] === 'مجلس الإدارة' && paths[1] !== 'المدير العام') {
         chartDept = paths[1];
      } else {
         chartDept = paths[0] || d.department;
      }
    } else {
      chartDept = d.department;
    }
    deptsData[chartDept] = (deptsData[chartDept] || 0) + 1;
  });
  
  const deptLabels = Object.keys(deptsData).map(translateLabel);
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
          position: 'bottom',
          rtl: true,
          labels: {
            font: { family: "'Cairo', 'Outfit', sans-serif", size: 11, weight: '700' },
            color: textColor,
            padding: 10,
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
      labels: [translateLabel('سليم'), translateLabel('به مشاكل تقنية')],
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


function populateComparisonOrgFilter() {
  const orgPathInput = document.getElementById('compOrgPath');
  if (!orgPathInput) return;
  // Initialize with empty array to show the first dropdown
  if (!orgPathInput.value) {
    renderDynamicCompOrgDropdowns([""]);
  }
}

function renderComparisons() {
  const comparisonGrid = document.getElementById('comparisonGrid');
  if (!comparisonGrid) return;
  
  // If grid is hidden (user hasn't clicked Run), don't render yet
  if (comparisonGrid.style.display === 'none' || comparisonGrid.style.display === '') {
    return;
  }

  const orgPathInput = document.getElementById('compOrgPath');
  const orgFilterVal = orgPathInput ? orgPathInput.value : '';
  
  const checkboxes = document.querySelectorAll('.comp-metric-cb');
  const metrics = {
    has_computer: true,
    has_monitor: true
  };
  if (checkboxes.length > 0) {
    checkboxes.forEach(cb => {
      metrics[cb.value] = cb.checked;
    });
  }

  // 1. Filter and group devices
  const employeeData = {};
  
  devices.forEach(d => {
    if (!d.employeeName) return;
    
    // Apply Org Filter
    if (orgFilterVal && d.orgPath) {
      const normalizedPath = d.orgPath.replace(/\s*\|\|\s*/g, '||');
      const normalizedFilter = orgFilterVal.replace(/\s*\|\|\s*/g, '||');
      if (!normalizedPath.includes(normalizedFilter)) return;
    } else if (orgFilterVal && !d.orgPath) {
      return; 
    }

    const name = d.employeeName.trim();
    if (!employeeData[name]) {
      employeeData[name] = { 
        name: name,
        totalMonitors: 0, 
        totalComputers: 0,
        desktopsCount: 0,
        laptopsCount: 0 
      };
    }
    
    const nature = d.deviceNature || 'Desktop';
    if (d.assetType === 'Monitor' || nature === 'Monitor' || d.monitorsCount > 0) {
      employeeData[name].totalMonitors += (parseInt(d.monitorsCount) || 1);
    }
    
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
    comparisonGrid.innerHTML = '<div class="loading-cell">لا توجد أجهزة مطابقة للمقارنة بناءً على الإدارة المحددة.</div>';
    comparisonGrid.style.display = 'grid';
    return;
  }

  // 2. Calculate comparison groups and lists
  const listHasComputer = [];
  const listHasMonitor = [];

  uniqueEmployees.forEach(emp => {
    if (emp.totalComputers >= 1) listHasComputer.push(emp.name);
    if (emp.totalMonitors >= 2) listHasMonitor.push(emp.name);
  });

  // Store lists in global state for modal reference
  window.comparisonLists = {
    'has_computer': { title: 'الموظفون الذين لديهم جهاز كمبيوتر أو أكثر', list: listHasComputer },
    'has_monitor': { title: 'الموظفون الذين لديهم أكثر من شاشة', list: listHasMonitor }
  };
  
  let gridHtml = '';
  
  if (metrics.has_computer) {
    gridHtml += `
      <div class="comparison-card" onclick="showCategoryEmployees('has_computer')">
        <div class="card-icon"><i class="bi bi-pc-display"></i></div>
        <div class="card-info">
          <h4>من لديه جهاز كمبيوتر أو أكثر</h4>
          <div class="progress-bar-container">
            <div class="progress-bar bg-warning" style="width: ${(listHasComputer.length/totalEmployees)*100}%"></div>
          </div>
          <p class="count-text">${listHasComputer.length} ${window.t ? window.t('comp_employee') : 'موظف'} (${((listHasComputer.length/totalEmployees)*100).toFixed(1)}%)</p>
        </div>
      </div>
    `;
  }
  
  if (metrics.has_monitor) {
    gridHtml += `
      <div class="comparison-card" onclick="showCategoryEmployees('has_monitor')">
        <div class="card-icon"><i class="bi bi-display"></i></div>
        <div class="card-info">
          <h4>من لديه أكثر من شاشة</h4>
          <div class="progress-bar-container">
            <div class="progress-bar bg-success" style="width: ${(listHasMonitor.length/totalEmployees)*100}%"></div>
          </div>
          <p class="count-text">${listHasMonitor.length} ${window.t ? window.t('comp_employee') : 'موظف'} (${((listHasMonitor.length/totalEmployees)*100).toFixed(1)}%)</p>
        </div>
      </div>
    `;
  }
  
  if (!gridHtml) {
    gridHtml = '<div class="loading-cell">الرجاء تحديد نوع مقارنة واحد على الأقل.</div>';
  }
  comparisonGrid.innerHTML = gridHtml;
  comparisonGrid.style.display = 'grid';
}

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

  // Save state to localStorage for persistence
  localStorage.setItem('ui_search', searchInput.value);
  localStorage.setItem('ui_dept', deptVal);
  localStorage.setItem('ui_nature', natureVal);
  localStorage.setItem('ui_status', statusVal);

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

function restoreSearchAndFilters() {
  const savedSearch = localStorage.getItem('ui_search');
  if (savedSearch !== null) searchInput.value = savedSearch;

  const savedDept = localStorage.getItem('ui_dept');
  if (savedDept !== null) {
    const options = Array.from(filterDept.options).map(o => o.value);
    if (options.includes(savedDept)) filterDept.value = savedDept;
  }

  const savedNature = localStorage.getItem('ui_nature');
  if (savedNature !== null) filterNature.value = savedNature;

  const savedStatus = localStorage.getItem('ui_status');
  if (savedStatus !== null) filterStatus.value = savedStatus;
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

// INIT ORG STRUCTURE SELECTS
function initOrgStructureSelects() {
  const container = document.getElementById('dynamic-org-container');
  if (!container) return;
  renderDynamicOrgDropdowns([""]);
}

function renderDynamicOrgDropdowns(selectedPathArray) {
  const container = document.getElementById('dynamic-org-container');
  const orgPathInput = document.getElementById('orgPath');
  if (!container) return;
  
  container.innerHTML = '';
  let currentNode = orgStructure;
  let currentPath = [];
  
  for (let i = 0; i < selectedPathArray.length; i++) {
    const selectedValue = selectedPathArray[i];
    
    // Create select element
    const select = document.createElement('select');
    select.className = 'dynamic-org-select';
    select.dataset.level = i;
    
    // Default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    const labelNames = ['الجهة الرئيسية', 'التفرع الأول', 'التفرع الثاني', 'التفرع الثالث', 'التفرع الرابع', 'التفرع الخامس'];
    const label = labelNames[i] || ('التفرع ' + (i+1));
    defaultOption.textContent = '-- اختر ' + label + ' --';
    select.appendChild(defaultOption);
    
    // Populate options
    let hasChildren = false;
    if (currentNode && typeof currentNode === 'object') {
      Object.keys(currentNode).forEach(key => {
        hasChildren = true;
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key;
        if (key === selectedValue) {
          option.selected = true;
        }
        select.appendChild(option);
      });
    }
    
    if (hasChildren || i === 0) {
      container.appendChild(select);
      
      select.addEventListener('change', function() {
        const newSelectedValue = this.value;
        const newPathArray = selectedPathArray.slice(0, i);
        if (newSelectedValue) {
          newPathArray.push(newSelectedValue);
          // If the newly selected node has children, add an empty selection for the next level
          let nextNode = orgStructure;
          for(let p of newPathArray) { nextNode = nextNode[p]; }
          if (nextNode && typeof nextNode === 'object' && Object.keys(nextNode).length > 0) {
             newPathArray.push("");
          }
        }
        renderDynamicOrgDropdowns(newPathArray);
      });
    }
    
    if (selectedValue && currentNode[selectedValue]) {
      currentPath.push(selectedValue);
      currentNode = currentNode[selectedValue];
    } else {
      break;
    }
  }
  
  // Update hidden input
  orgPathInput.value = currentPath.join('||');
}

// EVENT LISTENERS
function setupEventListeners() {
  initOrgStructureSelects();

  const runComparisonsBtn = document.getElementById('runComparisonsBtn');
  if (runComparisonsBtn) {
    runComparisonsBtn.addEventListener('click', () => {
      const grid = document.getElementById('comparisonGrid');
      if (grid) grid.style.display = 'grid';
      renderComparisons();
    });
  }

  
  // Theme Toggle
  themeToggleBtn.addEventListener('click', toggleTheme);

  // Live Filtering
  searchInput.addEventListener('input', applySearchAndFilters);
  filterDept.addEventListener('change', applySearchAndFilters);
  filterNature.addEventListener('change', applySearchAndFilters);
  filterStatus.addEventListener('change', applySearchAndFilters);

  // Form Modals
  openAddModalBtn.addEventListener('click', openAddModal);

  // Employee Auto-Complete Event Listener
  const empInput = document.getElementById('employeeName');
  if (empInput) {
    empInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      const match = devices.find(d => d.employeeName === val);
      if (match) {
        setOrgSelectValue('department', match.department);
        setOrgSelectValue('circle', match.circle);
        setOrgSelectValue('section', match.section);
        setOrgSelectValue('unit', match.unit);
      }
    });
  }

  // Add Column modal trigger
  document.getElementById('openAddColumnModalBtn').addEventListener('click', () => {
    openModal('columnModal');
    renderExistingColumns();
  });

  // Form submission
  deviceForm.addEventListener('submit', handleFormSubmit);

  // Add Custom Field triggers inside the form opens the column modal
  document.querySelectorAll('.addCustomFieldBtn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const section = e.currentTarget.getAttribute('data-section');
      const targetSectionInput = document.getElementById('targetSection');
      if (targetSectionInput) targetSectionInput.value = section;
      openModal('columnModal');
      renderExistingColumns();
    });
  });

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

// HELPER TO SET ORG SELECT VALUE AND TRIGGER CASCADING
function setOrgSelectValue(pathString) {
  if (!pathString) {
    renderDynamicOrgDropdowns([""]);
    return;
  }
  let pathArray = pathString.split('||');
  
  // Check if the last node has children, if so, append empty string to show next dropdown
  let nextNode = orgStructure;
  let validPath = [];
  for(let p of pathArray) { 
    if (nextNode && nextNode[p]) {
      validPath.push(p);
      nextNode = nextNode[p]; 
    } else {
      break;
    }
  }
  
  if (nextNode && typeof nextNode === 'object' && Object.keys(nextNode).length > 0) {
    validPath.push("");
  }
  
  renderDynamicOrgDropdowns(validPath);
}

// ADD DEVICE MODAL
function openAddModal() {
  document.getElementById('modalTitle').textContent = 'إضافة جهاز جديد';
  document.getElementById('deviceId').value = '';
  deviceForm.reset();
  
  // Reset org dropdowns
  setOrgSelectValue('');

  document.getElementById('technicalStatus').value = 'سليم';
  document.getElementById('assetType').value = 'Computer';
  document.getElementById('deviceNature').value = 'Desktop';
  document.getElementById('connectionType').value = 'USB';
  toggleDeviceFields();
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
  document.getElementById('employeeId').value = d.employeeId || '';
  
  setOrgSelectValue(d.orgPath);
  
  if (d.deviceNature === 'Printer') {
    document.getElementById('assetType').value = 'Printer';
    document.getElementById('deviceNature').value = 'Desktop';
  } else if (d.deviceNature === 'Fingerprint') {
    document.getElementById('assetType').value = 'Fingerprint';
    document.getElementById('deviceNature').value = 'Desktop';
  } else if (d.deviceNature === 'AccessPoint') {
    document.getElementById('assetType').value = 'AccessPoint';
    document.getElementById('deviceNature').value = 'Desktop';
  } else if (d.deviceNature === 'None') {
    document.getElementById('assetType').value = 'None';
    document.getElementById('deviceNature').value = 'Desktop';
  } else {
    document.getElementById('assetType').value = 'Computer';
    document.getElementById('deviceNature').value = d.deviceNature || 'Desktop';
  }
  document.getElementById('connectionType').value = d.connectionType || 'USB';
  document.getElementById('ipAddress').value = d.ipAddress || '';
  document.getElementById('deviceModel').value = d.deviceModel || '';
  document.getElementById('serviceTag').value = d.serviceTag || '';
  document.getElementById('ram').value = d.ram || '';
  document.getElementById('storageType').value = d.storageType || 'SSD';
  document.getElementById('storageSize').value = d.storageSize || '';
  document.getElementById('monitorsCount').value = d.monitorsCount || 1;
  document.getElementById('phone').value = d.phone || '';
  document.getElementById('osVersion').value = d.osVersion || '';
  
  document.getElementById('systemsUsed').value = d.systemsUsed || '';
  document.getElementById('recurringIssues').value = d.recurringIssues || '';
  document.getElementById('notes').value = d.notes || '';
  document.getElementById('technicalStatus').value = d.technicalStatus || 'سليم';

  // Load custom fields
  renderFormCustomFields(d);

  toggleDeviceFields();
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
    employeeId: document.getElementById('employeeId').value.trim(),
    orgPath: document.getElementById('orgPath').value.trim(),
    deviceNature: document.getElementById('assetType').value === 'Computer' ? document.getElementById('deviceNature').value : document.getElementById('assetType').value,
    deviceModel: document.getElementById('deviceModel').value.trim(),
    serviceTag: document.getElementById('serviceTag').value.trim(),
    ram: document.getElementById('ram').value.trim(),
    storageType: document.getElementById('storageType').value,
    storageSize: document.getElementById('storageSize').value.trim(),
    monitorsCount: parseInt(document.getElementById('monitorsCount').value) || 1,
    connectionType: document.getElementById('connectionType').value,
    ipAddress: document.getElementById('ipAddress').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    osVersion: document.getElementById('osVersion').value.trim(),
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

  // Custom fields logic per section
  const getCustomFieldsHtmlBySection = (sectionName) => {
    if (!d.customFields || !Array.isArray(d.customFields)) return '';
    const sectionCols = customColumns.filter(c => c.section === sectionName).map(c => c.name);
    
    // Fallback: any column not explicitly defined goes to 'specs'
    const legacyKeys = [];
    if (sectionName === 'specs') {
       const allKnownCols = new Set(customColumns.map(c => c.name));
       d.customFields.forEach(cf => {
         if (!allKnownCols.has(cf.label)) legacyKeys.push(cf.label);
       });
    }

    const fieldsToShow = d.customFields.filter(cf => sectionCols.includes(cf.label) || legacyKeys.includes(cf.label));
    
    if (fieldsToShow.length === 0) return '';
    
    return `
      <div class="tech-detail-grid" style="margin-top: 10px; border-top: 1px dashed var(--border-color); padding-top: 10px;">
        ${fieldsToShow.map(cf => `
          <div class="tech-item" style="flex: 1 1 100%;">
            <span class="tech-label" style="color: var(--color-primary)">${cf.label}:</span>
            <span class="tech-val">${cf.value}</span>
          </div>
        `).join('')}
      </div>
    `;
  };

  const customFieldsEmployeeHtml = getCustomFieldsHtmlBySection('employee');
  const customFieldsSpecsHtml = getCustomFieldsHtmlBySection('specs');
  const customFieldsNotesHtml = getCustomFieldsHtmlBySection('notes');

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
          <span>اسم الموظف: ${d.employeeName} ${d.employeeId ? ' (' + d.employeeId + ')' : ''}</span>
        </div>
        <div class="tech-card-badge">ID: #${d.id}</div>
      </div>
      
      <div class="tech-card-details">
        <div class="tech-card-sections">
          <!-- القسم الأول: جهة الموظف -->
          <div class="tech-section">
            <h5>بيانات الجهة والموظف</h5>
            <div class="tech-detail-grid">
              <div class="tech-item" style="grid-column: 1 / -1;"><span class="tech-label">مكان الوظيفة:</span> <span class="tech-val">${d.orgPath ? d.orgPath.split('||').join(' <i class="bi bi-chevron-left" style="font-size:0.75rem;margin:0 4px;"></i> ') : 'لا يوجد'}</span></div>
              <div class="tech-item"><span class="tech-label">المستلم:</span> <span class="tech-val">${d.employeeName} ${d.employeeId ? ' (' + d.employeeId + ')' : ''}</span></div>
            </div>
            ${customFieldsEmployeeHtml}
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
            ${customFieldsSpecsHtml}
          </div>

          <!-- الهاتف ونظام التشغيل -->
          <div class="tech-section full-width">
            <h5>بيانات الاتصال ونظام التشغيل</h5>
            <div class="tech-detail-grid">
              <div class="tech-item">
                <span class="tech-label">الهاتف الأرضي / Cisco IP Phone:</span>
                <span class="tech-val" style="color: var(--color-primary)">${d.phone || 'لا يوجد'}</span>
              </div>
              <div class="tech-item">
                <span class="tech-label">نظام التشغيل (OS):</span>
                <span class="tech-val" style="color: var(--color-primary)">${d.osVersion || 'لا يوجد'}</span>
              </div>
              <div class="tech-item">
                <span class="tech-label">طريقة التوصيل:</span>
                <span class="tech-val">${d.connectionType === 'Network' ? 'شبكة سلكية' : d.connectionType === 'Wireless' ? 'شبكة لاسلكية' : 'USB'}</span>
              </div>
              ${d.ipAddress ? `
              <div class="tech-item">
                <span class="tech-label">عنوان الـ IP:</span>
                <span class="tech-val" style="color: var(--color-primary); font-family: monospace;">${d.ipAddress}</span>
              </div>
              ` : ''}
            </div>
          </div>

          <!-- الأنظمة -->
          <div class="tech-section full-width">
            <h5>البرمجيات والأنظمة المستعملة</h5>
            <div class="systems-pill-box">
              ${systemsHtml}
            </div>
          </div>

          <!-- الملاحظات العامة -->
          <div class="tech-section full-width">
            <h5>الملاحظات العامة</h5>
            ${notesHtml}
            ${customFieldsNotesHtml}
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
function renderExistingColumns() {
  const list = document.getElementById('existingColumnsList');
  if (!list) return;
  list.innerHTML = '';
  
  const targetSectionInput = document.getElementById('targetSection');
  const currentSection = targetSectionInput ? targetSectionInput.value : 'specs';

  const colsForSection = customColumns ? customColumns.filter(c => c.section === currentSection || (!c.section && currentSection === 'specs')) : [];

  if (colsForSection.length === 0) {
    list.innerHTML = `<li style="color: var(--text-muted); font-size: 0.85rem; text-align: center;">لا توجد حقول مخصصة في هذا القسم.</li>`;
    return;
  }

  colsForSection.forEach(col => {
    const li = document.createElement('li');
    li.style.display = 'flex';
    li.style.justifyContent = 'space-between';
    li.style.alignItems = 'center';
    li.style.padding = '0.4rem 0';
    li.style.borderBottom = '1px solid var(--border-color)';
    
    const nameSpan = document.createElement('span');
    nameSpan.textContent = col.name;
    
    const actionsDiv = document.createElement('div');
    actionsDiv.style.display = 'flex';
    actionsDiv.style.gap = '0.5rem';
    
    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'action-btn icon-btn';
    editBtn.innerHTML = '<i class="bi bi-pencil-square" style="color: var(--primary-color);"></i>';
    editBtn.title = 'تعديل الحقل';
    editBtn.onclick = () => editColumn(col.id, col.name);
    
    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'action-btn icon-btn';
    delBtn.innerHTML = '<i class="bi bi-trash" style="color: var(--danger-color);"></i>';
    delBtn.title = 'حذف الحقل';
    delBtn.onclick = () => deleteColumn(col.id, col.name);
    
    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(delBtn);
    
    li.appendChild(nameSpan);
    li.appendChild(actionsDiv);
    list.appendChild(li);
  });
}

async function editColumn(id, currentName) {
  const newName = prompt('أدخل الاسم الجديد للحقل:', currentName);
  if (!newName || newName.trim() === '' || newName.trim() === currentName) return;

  try {
    const res = await fetch(`/api/columns/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل تعديل الحقل');
    
    showToast('تم تعديل الحقل بنجاح!');
    await fetchCustomColumns();
    renderExistingColumns();
    fetchDevices();
  } catch (error) {
    showToast(error.message, true);
  }
}

async function deleteColumn(id, name) {
  if (!confirm(`هل أنت متأكد من رغبتك في حذف الحقل "${name}" نهائياً؟
سيتم إزالة هذا الحقل من جميع الأجهزة المرتبطة به!`)) return;

  try {
    const res = await fetch(`/api/columns/${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل حذف الحقل');
    
    showToast('تم حذف الحقل بنجاح!');
    await fetchCustomColumns();
    renderExistingColumns();
    fetchDevices();
  } catch (error) {
    showToast(error.message, true);
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
    const targetSectionInput = document.getElementById('targetSection');
    const section = targetSectionInput ? targetSectionInput.value : 'specs';

    const res = await fetch('/api/columns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, section })
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'فشل إضافة العمود');

    showToast('تم إضافة العمود المخصص بنجاح!');
    nameInput.value = '';
    
    // Reload state
    await fetchCustomColumns();
    renderExistingColumns();
    
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
  const keys = [...customColumns.map(c => c.name)];
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
  const containers = {
    employee: document.getElementById('customFields_employee'),
    specs: document.getElementById('customFields_specs'),
    notes: document.getElementById('customFields_notes')
  };
  
  // Clear all
  Object.values(containers).forEach(c => {
    if(c) c.innerHTML = '';
  });

  const keysSet = new Set(customColumns.map(c => c.name));
  let legacyKeys = [];
  
  if (device && device.customFields && Array.isArray(device.customFields)) {
    device.customFields.forEach(cf => {
      if (cf.label && !keysSet.has(cf.label)) {
        legacyKeys.push(cf.label);
      }
    });
  }

  const allColumns = [
    ...customColumns, 
    ...legacyKeys.map(k => ({ name: k, section: 'specs' }))
  ];

  if (allColumns.length === 0) {
    if (containers.specs) {
      containers.specs.innerHTML = `
        <div style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 0.5rem; border: 1px dashed var(--border-color); border-radius: var(--border-radius-sm);">
          لا توجد حقول إضافية حالياً. اضغط على أيقونة (+) لإنشاء حقل مخصص.
        </div>
      `;
    }
    return;
  }

  allColumns.forEach(col => {
    const field = device && device.customFields ? device.customFields.find(cf => cf.label === col.name) : null;
    const value = field ? field.value : '';
    
    const row = document.createElement('div');
    row.className = 'form-group';
    row.style.display = 'flex';
    row.style.flexDirection = 'column';
    row.style.gap = '0.4rem';
    
    row.innerHTML = `
      <label>${col.name}</label>
      <input type="text" class="custom-field-value-input" data-label="${col.name}" placeholder="القيمة..." value="${value}">
    `;
    
    const targetContainer = containers[col.section] || containers.specs;
    if (targetContainer) targetContainer.appendChild(row);
  });
}

// Re-render when language changes
window.addEventListener('languageChanged', () => {
  if (typeof renderTable === 'function') renderTable();
  if (typeof updateStats === 'function') updateStats();
  if (typeof renderCharts === 'function') renderCharts();
  if (typeof renderComparisons === 'function') renderComparisons();
});


async function viewDeviceHistory(id) {
  try {
    currentHistoryDeviceId = id;
    const res = await fetch(`/api/devices/${id}/history`);
    if (!res.ok) throw new Error('Failed to fetch history');
    const history = await res.json();
    const tbody = document.getElementById('historyTableBody');
    if (history.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align: center" data-i18n="history_empty">لا توجد حركات سابقة لهذا الجهاز</td></tr>`;
    } else {
      let periodsHtml = '';
      let returnDate = 'الآن (العهدة الحالية)';
      
      // We assume history is sorted by timestamp DESC
      currentHistoryData = history;
      history.forEach((h, index) => {
         const receiveDate = new Date(h.timestamp).toLocaleString('ar-LY');
         
         // Admin actions HTML
         const actionsHtml = (currentUser && currentUser.role === 'Admin') ? `
            <td class="admin-only-element">
              <button class="action-icon-btn btn-edit" onclick="openHistoryRecordModal(${h.id})" title="تعديل"><i class="bi bi-pencil-square"></i></button>
              <button class="action-icon-btn btn-delete" onclick="deleteHistoryRecord(${h.id})" title="حذف"><i class="bi bi-trash"></i></button>
            </td>
         ` : '';

         if (index === 0) {
             periodsHtml += `
             <tr>
               <td><strong style="color:var(--primary-color)">${h.new_employee || '-'}</strong></td>
               <td><strong style="color:var(--primary-color)">${h.new_orgPath ? h.new_orgPath.replace(/\|\|/g, ' / ') : (h.new_department || '-')}</strong></td>
               <td>${receiveDate}</td>
               <td><span class="badge badge-success">${returnDate}</span></td>
               ${actionsHtml}
             </tr>`;
         }
         
         returnDate = receiveDate;
         const prevReceiveDate = index < history.length - 1 ? new Date(history[index+1].timestamp).toLocaleString('ar-LY') : (window.t ? window.t('history_unknown') : 'غير معروف (أول استلام)');
         
         periodsHtml += `
             <tr>
               <td>${h.previous_employee || '-'}</td>
               <td>${h.previous_orgPath ? h.previous_orgPath.replace(/\|\|/g, ' / ') : (h.previous_department || '-')}</td>
               <td>${prevReceiveDate}</td>
               <td>${returnDate}</td>
               ${actionsHtml}
             </tr>`;
      });
      tbody.innerHTML = periodsHtml;
    }
    // Apply translations if i18n loaded
    if (window.applyTranslations) window.applyTranslations();
    openModal('historyModal');
  } catch(e) {
    showToast(e.message, true);
  }
}

function toggleDeviceFields() {
  const assetType = document.getElementById('assetType').value;
  const pcFields = document.querySelectorAll('.pc-only-fields');
  const computerOnlyFields = document.querySelectorAll('.computer-only-fields');
  const printerFields = document.querySelectorAll('.printer-only-fields');
  const generalDeviceFields = document.querySelectorAll('.general-device-field');
  const sharedBtn = document.getElementById('sharedPrinterBtn');
  
  if (assetType === 'Printer' || assetType === 'Fingerprint' || assetType === 'AccessPoint') {
    pcFields.forEach(el => el.style.display = 'none');
    computerOnlyFields.forEach(el => el.style.display = 'none');
    generalDeviceFields.forEach(el => el.style.display = 'block');
    printerFields.forEach(el => el.style.display = 'block'); // Shows connectionType which applies to all these
    if (sharedBtn) sharedBtn.style.display = assetType === 'Printer' ? 'block' : 'none';
  } else if (assetType === 'None') {
    pcFields.forEach(el => el.style.display = 'none');
    computerOnlyFields.forEach(el => el.style.display = 'none');
    generalDeviceFields.forEach(el => el.style.display = 'none');
    printerFields.forEach(el => el.style.display = 'none');
    if (sharedBtn) sharedBtn.style.display = 'none';
  } else {
    pcFields.forEach(el => el.style.display = 'block');
    computerOnlyFields.forEach(el => el.style.display = 'block');
    generalDeviceFields.forEach(el => el.style.display = 'block');
    printerFields.forEach(el => el.style.display = 'none');
    if (sharedBtn) sharedBtn.style.display = 'none';
  }
  toggleIpAddressField();
}

function toggleIpAddressField() {
  const assetType = document.getElementById('assetType').value;
  const connectionType = document.getElementById('connectionType').value;
  const ipGroup = document.getElementById('ipAddressGroup');
  
  if ((assetType === 'Printer' || assetType === 'Fingerprint' || assetType === 'AccessPoint') && 
      (connectionType === 'Network' || connectionType === 'Wireless')) {
    if (ipGroup) ipGroup.style.display = 'block';
  } else {
    if (ipGroup) ipGroup.style.display = 'none';
  }
}

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
    'الإدارة الهندسية': 'dept_engineering',
    'إدارة المشتريات': 'dept_purchasing',
    'التسويق والمبيعات': 'dept_marketing_sales',
    'إدارة العمليات': 'dept_operations',
    'الإدارة القانونية': 'dept_legal',
    'المراجعة الداخلية': 'dept_internal_audit',
    'خدمات المشتركين': 'dept_customer_service',
    'الموارد البشرية': 'dept_hr',
    'الدعم التجاري': 'sec_commercial_support',
    'قسم الاتصالات': 'sec_communications',
    'قسم المشتريات الخارجية': 'sec_foreign_purchasing',
    'قسم التسويق الرقمي': 'sec_digital_marketing',
    'قسم الصيانة': 'sec_maintenance',
    'قسم الاستشارات': 'sec_consulting',
    'قسم تطوير البرمجيات': 'sec_software_dev',
    'قسم المشتريات المحلية': 'sec_local_purchasing',
    'قسم المراجعة الإدارية': 'sec_admin_audit',
    'قسم التشغيل': 'sec_operations',
    'قسم البنية التحتية': 'sec_infrastructure',
    'قسم الطاقة': 'sec_power',
    'قسم الشبكات': 'sec_networks',
    'قسم الدعم': 'sec_support',
    'قسم الدعم الفني': 'sec_tech_support',
    'قسم التحقيقات': 'sec_investigations',
    'قسم المخازن': 'sec_stores',
    'قسم العلاقات العامة': 'sec_pr',
    'قسم المراجعة المالية': 'sec_finance_audit',
    'قسم العقود': 'sec_contracts',
    'قسم المبيعات المباشرة': 'sec_direct_sales',
    'قسم التوظيف': 'sec_recruitment',
    'قسم التخطيط': 'sec_planning',
    'قسم الحسابات': 'sec_accounts',
    'قسم التدريب': 'sec_training',
    'قسم الشكاوى': 'sec_complaints',
    'قسم الخزينة': 'sec_treasury',
    'قسم الميزانية': 'sec_budget',
    'قسم شؤون الموظفين': 'sec_personnel',
    'قسم الجودة': 'sec_quality',
    'دعم وتحليل المنتجات': 'unit_product_support',
    'لا يوجد': 'dept_no_dept',
    'بدون وحدة': 'dept_no_unit',
    'سليم': 'status_clean',
    'به مشاكل تقنية': 'status_issues'
  };
  const key = map[arabicLabel];
  if (key) return window.t(key);
  return arabicLabel;
}

/* Org Tree Picker Logic */
window.openOrgTreeModal = function() { 
  renderOrgTree();
  openModal('orgTreeModal');
}

function renderOrgTree() {
  const container = document.getElementById('orgTreeContainer');
  container.innerHTML = '';
  const ul = document.createElement('ul');
  ul.className = 'org-tree-list root-list';
  
  function buildNode(data, parentUl, path) {
    if (!data || typeof data !== 'object') return;
    
    Object.keys(data).forEach(key => {
      const li = document.createElement('li');
      li.className = 'org-tree-item';
      
      const currentPath = path.length > 0 ? path.join('||') + '||' + key : key;
      const hasChildren = Object.keys(data[key]).length > 0;
      
      if (!hasChildren) {
         li.innerHTML = `<div class="org-tree-node" onclick="selectOrgPath('${currentPath}')" style="display: flex; justify-content: space-between; width: 100%;">
           <span><i class="bi bi-check2-circle"></i> ${key}</span>
           <button class="action-btn btn-success" style="padding: 2px 8px; font-size: 0.8rem;">اختيار</button>
         </div>`;
      } else {
         const btnId = 'tree-' + Math.random().toString(36).substr(2, 9);
         const contentId = 'content-' + btnId;
         li.innerHTML = `
           <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
             <button class="org-tree-toggle" onclick="toggleOrgTree('${btnId}', '${contentId}')" id="${btnId}" style="flex: 1; text-align: right;">
               <i class="bi bi-chevron-left org-tree-icon"></i> ${key}
             </button>
             <button class="action-btn btn-primary" onclick="selectOrgPath('${currentPath}')" style="padding: 2px 8px; font-size: 0.8rem;" title="اختيار هذا المستوى">اختيار</button>
           </div>
           <ul class="org-tree-list org-tree-children" id="${contentId}"></ul>
         `;
      }
      parentUl.appendChild(li);
      if (hasChildren) {
        buildNode(data[key], li.querySelector('.org-tree-children'), [...path, key]);
      }
    });
  }
  
  buildNode(orgStructure, ul, []);
  container.appendChild(ul);
}

window.toggleOrgTree = function(btnId, contentId) {
  const btn = document.getElementById(btnId);
  const content = document.getElementById(contentId);
  const icon = btn.querySelector('.org-tree-icon');
  if (content.classList.contains('open')) {
    content.classList.remove('open');
    icon.classList.remove('open');
  } else {
    content.classList.add('open');
    icon.classList.add('open');
  }
}

window.selectOrgPath = function(pathStr) {
  setOrgSelectValue(pathStr);
  closeModal('orgTreeModal');
}


// ==========================================
// HISTORY CRUD OPERATIONS
// ==========================================

function openAddHistoryRecordModal() {
  document.getElementById('historyRecordForm').reset();
  document.getElementById('hr_deviceId').value = currentHistoryDeviceId;
  document.getElementById('hr_historyId').value = '';
  document.getElementById('historyRecordModalTitle').textContent = 'إضافة حركة جهاز';
  
  // Set current time as default
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  document.getElementById('hr_timestamp').value = now.toISOString().slice(0, 16);
  
  openModal('historyRecordModal');
}

function openHistoryRecordModal(historyId) {
  const h = currentHistoryData.find(x => x.id === historyId);
  if (!h) return;
  
  document.getElementById('historyRecordForm').reset();
  document.getElementById('hr_deviceId').value = currentHistoryDeviceId;
  document.getElementById('hr_historyId').value = historyId;
  document.getElementById('historyRecordModalTitle').textContent = 'تعديل حركة جهاز';
  
  document.getElementById('hr_prev_employee').value = h.previous_employee || '';
  document.getElementById('hr_prev_orgPath').value = h.previous_orgPath || h.previous_department || '';
  document.getElementById('hr_new_employee').value = h.new_employee || '';
  document.getElementById('hr_new_orgPath').value = h.new_orgPath || h.new_department || '';
  
  const d = new Date(h.timestamp);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  document.getElementById('hr_timestamp').value = d.toISOString().slice(0, 16);
  
  openModal('historyRecordModal');
}

document.getElementById('historyRecordForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const deviceId = document.getElementById('hr_deviceId').value;
  const historyId = document.getElementById('hr_historyId').value;
  
  const payload = {
    previous_employee: document.getElementById('hr_prev_employee').value.trim(),
    previous_orgPath: document.getElementById('hr_prev_orgPath').value.trim(),
    new_employee: document.getElementById('hr_new_employee').value.trim(),
    new_orgPath: document.getElementById('hr_new_orgPath').value.trim(),
    timestamp: new Date(document.getElementById('hr_timestamp').value).toISOString()
  };
  
  const url = historyId ? `/api/devices/${deviceId}/history/${historyId}` : `/api/devices/${deviceId}/history`;
  const method = historyId ? 'PUT' : 'POST';
  
  try {
    const res = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.ok) {
      showToast(data.message);
      closeModal('historyRecordModal');
      viewDeviceHistory(deviceId); // refresh history modal
    } else {
      alert('خطأ: ' + (data.error || 'فشل في حفظ الحركة'));
    }
  } catch (err) {
    console.error(err);
    alert('حدث خطأ في الاتصال بالخادم');
  }
});

async function deleteHistoryRecord(historyId) {
  if (!confirm('هل أنت متأكد من حذف هذه الحركة؟ لا يمكن التراجع عن هذا الإجراء.')) return;
  
  try {
    const res = await fetch(`/api/devices/${currentHistoryDeviceId}/history/${historyId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    });
    const data = await res.json();
    if (res.ok) {
      showToast(data.message);
      viewDeviceHistory(currentHistoryDeviceId);
    } else {
      alert('خطأ: ' + (data.error || 'فشل في حذف الحركة'));
    }
  } catch (err) {
    console.error(err);
    alert('حدث خطأ في الاتصال بالخادم');
  }
}

// Add event listener to the Add Record Button if exists
const addHistoryRecordBtn = document.getElementById('addHistoryRecordBtn');
if (addHistoryRecordBtn) {
  addHistoryRecordBtn.addEventListener('click', openAddHistoryRecordModal);
}


function renderDynamicCompOrgDropdowns(selectedPathArray) {
  const container = document.getElementById('dynamic-comp-org-container');
  const orgPathInput = document.getElementById('compOrgPath');
  if (!container) return;
  
  container.innerHTML = '';
  let currentNode = orgStructure;
  let currentPath = [];
  
  for (let i = 0; i < selectedPathArray.length; i++) {
    const selectedValue = selectedPathArray[i];
    
    // Create select element
    const select = document.createElement('select');
    select.className = 'dynamic-org-select form-control';
    select.style.flex = '1';
    select.style.minWidth = '120px';
    select.style.background = 'var(--card-bg)';
    select.style.color = 'var(--text-color)';
    select.style.border = '1px solid var(--border-color)';
    select.dataset.level = i;
    
    // Default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    const labelNames = ['كل الإدارات (الكل)', 'التفرع الأول', 'التفرع الثاني', 'التفرع الثالث', 'التفرع الرابع', 'التفرع الخامس'];
    const label = labelNames[i] || ('التفرع ' + (i+1));
    defaultOption.textContent = '-- ' + label + ' --';
    select.appendChild(defaultOption);
    
    // Populate options
    let hasChildren = false;
    if (currentNode && typeof currentNode === 'object') {
      Object.keys(currentNode).forEach(key => {
        if (key === 'الكل' || key === 'لايوجد') return;
        hasChildren = true;
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key;
        if (key === selectedValue) option.selected = true;
        select.appendChild(option);
      });
    }
    
    if (hasChildren || i === 0) {
      container.appendChild(select);
      
      select.addEventListener('change', function() {
        const newSelectedValue = this.value;
        const newPathArray = selectedPathArray.slice(0, i);
        if (newSelectedValue) {
          newPathArray.push(newSelectedValue);
          // If the newly selected node has children, add an empty selection for the next level
          let nextNode = orgStructure;
          for(let p of newPathArray) { nextNode = nextNode[p]; }
          if (nextNode && typeof nextNode === 'object' && Object.keys(nextNode).length > 0) {
             newPathArray.push("");
          }
        }
        renderDynamicCompOrgDropdowns(newPathArray);
      });
      
      if (selectedValue) {
        currentPath.push(selectedValue);
        if (currentNode[selectedValue]) {
          currentNode = currentNode[selectedValue];
        } else {
          currentNode = null;
        }
      }
    }
  }
  
  if (orgPathInput) {
    orgPathInput.value = currentPath.join('||');
  }
}
