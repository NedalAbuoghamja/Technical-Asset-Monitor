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
const statEmployees = document.getElementById('statEmployees');
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
      window.location.href = '/login.html' + window.location.search;
      return false;
    }
    const data = await res.json();
    if (!data.authenticated) {
      window.location.href = '/login.html' + window.location.search;
      return false;
    }
    let fetchedUser = data.user;
    if (typeof fetchedUser.permissions === 'string') {
      try {
        fetchedUser.permissions = JSON.parse(fetchedUser.permissions);
      } catch(e) {
        fetchedUser.permissions = {};
      }
    }
    currentUser = fetchedUser;
    localStorage.setItem('user', JSON.stringify(currentUser));
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
  
  if (currentUser.role !== 'Admin') {
    const btn = document.getElementById('openUserManagementBtn');
    if (btn) btn.style.display = 'none';
    const userManagementModal = document.getElementById('userManagementModal');
    if (userManagementModal) userManagementModal.style.display = 'none';
  } else {
    const btn = document.getElementById('openUserManagementBtn');
    if (btn) btn.style.display = 'inline-flex';
  }

  
  // Hide Add Device and Import buttons if they don't have permission
  
  // Show add column buttons for everyone
  const addColsBtns = document.querySelectorAll('.addCustomFieldBtn, .delete-col-btn');
  addColsBtns.forEach(btn => {
    btn.style.display = 'inline-flex';
  });

  const addBtn = document.getElementById('openAddModalBtn');
  const importBtn = document.getElementById('openImportModalBtn');
  
  if (currentUser.role === 'Admin' || (currentUser.permissions && currentUser.permissions.canAdd)) {
    if (addBtn) addBtn.style.display = 'inline-flex';
    if (importBtn) importBtn.style.display = 'inline-flex';
  } else {
    if (addBtn) addBtn.style.display = 'none';
    if (importBtn) importBtn.style.display = 'none';
  }

  const recycleBinBtn = document.getElementById('openRecycleBinBtn');
  if (recycleBinBtn) {
    if (currentUser.role === 'Admin' || currentUser.role === 'Supervisor' || (currentUser.permissions && currentUser.permissions.canDelete)) {
      recycleBinBtn.style.display = 'inline-flex';
    } else {
      recycleBinBtn.style.display = 'none';
    }
  }

  const comparisonSection = document.getElementById('comparisonContainerSection');
  if (comparisonSection) {
    if (currentUser.role === 'Admin' || (currentUser.permissions && currentUser.permissions.canViewComparisons)) {
      comparisonSection.style.display = '';
    } else {
      comparisonSection.style.display = 'none';
    }
  }

  const statsSection = document.getElementById('statsRowSection');
  if (statsSection) {
    if (currentUser.role === 'Admin' || (currentUser.permissions && currentUser.permissions.canViewStats)) {
      statsSection.style.display = '';
    } else {
      statsSection.style.display = 'none';
    }
  }

  const notificationsWrapper = document.getElementById('notificationsWrapper');
  if (notificationsWrapper) {
    notificationsWrapper.style.display = 'block'; // Show for EVERYONE so they can see their own logs
  }

  const analyticsSection = document.getElementById('analyticsSection');
  if (analyticsSection) {
    if (currentUser.role === 'Admin' || (currentUser.permissions && currentUser.permissions.canViewStats)) {
      analyticsSection.style.display = '';
    } else {
      analyticsSection.style.display = 'none';
    }
  }

  // Populate username
  const userNameText = document.getElementById('userNameText');
  if (userNameText) {
    userNameText.textContent = currentUser.username;
  }
  
  // Populate role badge
  const userRoleBadge = document.getElementById('userRoleBadge');
  if (userRoleBadge) {
    let roleText = 'مدخل بيانات';
    let roleIcon = 'bi-person-fill';
    let roleClass = 'role-user';

    if (currentUser.role === 'Admin') {
      roleText = 'مدير النظام';
      roleIcon = 'bi-shield-lock-fill';
      roleClass = 'role-admin';
    } else if (currentUser.role === 'Supervisor') {
      roleText = 'مشرف';
      roleIcon = 'bi-star-fill';
      roleClass = 'role-supervisor';
    }

    userRoleBadge.className = `user-role-badge ${roleClass}`;
    userRoleBadge.innerHTML = `<i class="bi ${roleIcon}"></i> ${roleText}`;
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
  if (!currentUser || (currentUser.role !== 'Admin' && !(currentUser.permissions && currentUser.permissions.canViewLogs))) return;

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
  
      const submitBtn = addUserForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      const newPass = passwordInput.value;
      if (newPass.length < 8) {
        showToast('يجب أن لا تقل كلمة المرور عن 8 خانات لأسباب أمنية', true);
        if (submitBtn) submitBtn.disabled = false;
        return;
      }

      try {
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: usernameInput.value,
            password: passwordInput.value,
            role: roleInput.value,
            mustChangePassword: document.getElementById('newUserMustChangePassword') ? document.getElementById('newUserMustChangePassword').checked : true,
            permissions: {
              canAdd: document.getElementById('permAdd') ? document.getElementById('permAdd').checked : false,
              canEdit: document.getElementById('permEdit') ? document.getElementById('permEdit').checked : false,
              canDelete: document.getElementById('permDelete') ? document.getElementById('permDelete').checked : false,
              canViewComparisons: document.getElementById('permComparisons') ? document.getElementById('permComparisons').checked : false,
              canViewStats: document.getElementById('permStats') ? document.getElementById('permStats').checked : false,
              canViewLogs: document.getElementById('permLogs') ? document.getElementById('permLogs').checked : false
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
          showToast(data.error || 'حدث خطأ', true);
        }
      } catch (error) {
        showToast('حدث خطأ في الاتصال', true);
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  const editUserForm = document.getElementById('editUserForm');
  if (editUserForm) {
    const editRoleInput = document.getElementById('editUserRole');
    editRoleInput.addEventListener('change', (e) => {
      const permsDiv = document.getElementById('editUserPermissionsDiv');
      if (permsDiv) {
        permsDiv.style.opacity = e.target.value === 'Admin' ? '0.5' : '1';
        permsDiv.style.pointerEvents = e.target.value === 'Admin' ? 'none' : 'auto';
      }
    });

    editUserForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const userId = document.getElementById('editUserId').value;
      const passwordInput = document.getElementById('editUserPassword').value;
      const roleInput = document.getElementById('editUserRole').value;
      const mustChangePassword = document.getElementById('editUserMustChangePassword') ? document.getElementById('editUserMustChangePassword').checked : false;
      
      const permissions = {
        canAdd: document.getElementById('editPermAdd') ? document.getElementById('editPermAdd').checked : false,
        canEdit: document.getElementById('editPermEdit') ? document.getElementById('editPermEdit').checked : false,
        canDelete: document.getElementById('editPermDelete') ? document.getElementById('editPermDelete').checked : false,
        canViewComparisons: document.getElementById('editPermComparisons') ? document.getElementById('editPermComparisons').checked : false,
        canViewStats: document.getElementById('editPermStats') ? document.getElementById('editPermStats').checked : false,
        canViewLogs: document.getElementById('editPermLogs') ? document.getElementById('editPermLogs').checked : false
      };

      try {
        const res = await fetch(`/api/admin/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            password: passwordInput,
            role: roleInput,
            mustChangePassword,
            permissions
          })
        });

        const data = await res.json();
        if (res.ok) {
          showToast('تم تعديل المستخدم بنجاح');
          closeModal('editUserModal');
          fetchUsers();
        } else {
          showToast(data.error || 'فشل تعديل المستخدم', true);
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
    
    const isMainAdmin = u.username === 'admin';
    const isSelfOrAdmin = isMainAdmin || (currentUser && u.username === currentUser.username);
    const deleteButton = isSelfOrAdmin 
      ? `<span class="badge badge-info" style="opacity: 0.6;">محمي</span>`
      : `<button class="action-icon-btn btn-delete" onclick="deleteUser('${u.id}', '${u.username}')" title="حذف">
           <i class="bi bi-trash"></i>
         </button>`;

    const editButton = isMainAdmin
      ? ``
      : `<button class="action-icon-btn btn-edit" onclick="openEditUserModal('${u.id}')" title="تعديل">
           <i class="bi bi-pencil-square"></i>
         </button>`;

    let roleLabel = 'مستخدم غير معروف';
    if (u.role === 'Admin') roleLabel = 'مدير النظام';
    else if (u.role === 'Supervisor') roleLabel = 'مشرف';
    else if (u.role === 'DataEntry' || u.role === 'User') roleLabel = 'مدخل بيانات';

    tr.innerHTML = `
      <td><strong>${u.username}</strong></td>
      <td>${roleLabel}</td>
      <td style="display: flex; gap: 0.5rem; justify-content: center;">${editButton}${deleteButton}</td>
    `;
    usersTableBody.appendChild(tr);
  });
}

async function openEditUserModal(id) {
  try {
    const res = await fetch('/api/admin/users');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل جلب البيانات');

    const users = Array.isArray(data) ? data : [];
    const u = users.find(x => x.id === id);
    if (!u) return showToast('المستخدم غير موجود', true);

    document.getElementById('editUserId').value = u.id;
    document.getElementById('editUsername').value = u.username;
    document.getElementById('editUserPassword').value = '';
    document.getElementById('editUserRole').value = u.role || 'DataEntry';
    
    // Check permissions
    let perms = {};
    if (u.permissions) {
      try {
        const parsed = typeof u.permissions === 'string' ? JSON.parse(u.permissions) : u.permissions;
        if (parsed && typeof parsed === 'object') {
          perms = parsed;
        }
      } catch(e){}
    }
    document.getElementById('editPermAdd').checked = !!perms.canAdd;
    document.getElementById('editPermEdit').checked = !!perms.canEdit;
    document.getElementById('editPermDelete').checked = !!perms.canDelete;
    if (document.getElementById('editPermComparisons')) {
      document.getElementById('editPermComparisons').checked = !!perms.canViewComparisons;
    }
    if (document.getElementById('editPermStats')) {
      document.getElementById('editPermStats').checked = !!perms.canViewStats;
    }
    if (document.getElementById('editPermLogs')) {
      document.getElementById('editPermLogs').checked = !!perms.canViewLogs;
    }

    // Must change password
    document.getElementById('editUserMustChangePassword').checked = !!u.mustChangePassword;

    // Toggle permissions visibility
    const permsDiv = document.getElementById('editUserPermissionsDiv');
    if (permsDiv) {
      permsDiv.style.opacity = u.role === 'Admin' ? '0.5' : '1';
      permsDiv.style.pointerEvents = u.role === 'Admin' ? 'none' : 'auto';
    }

    openModal('editUserModal');
  } catch (error) {
    showToast(error.message, true);
  }
}
window.openEditUserModal = openEditUserModal;

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

  // Auto-append GB to RAM and Storage Size
  const ramInput = document.getElementById('ram');
  if (ramInput) {
    ramInput.addEventListener('blur', function() {
      let val = this.value.trim().toUpperCase();
      if (val && !val.includes('GB') && !val.includes('TB') && !val.includes('MB')) {
        this.value = val + ' GB';
      }
    });
  }

  const storageInput = document.getElementById('storageSize');
  if (storageInput) {
    storageInput.addEventListener('blur', function() {
      let val = this.value.trim().toUpperCase();
      if (val && !val.includes('GB') && !val.includes('TB') && !val.includes('MB')) {
        this.value = val + ' GB';
      }
    });
  }

  // Auto-fetch Intune details when Service Tag is entered
  const serviceTagInput = document.getElementById('serviceTag');
  if (serviceTagInput) {
    const handleTagLookup = async function() {
      const rawTag = this.value.trim().replace(/[\u200E\u200F\u202A-\u202E\uFEFF]/g, '');
      if (!rawTag || rawTag.length < 3 || rawTag === 'لا يوجد' || rawTag.toUpperCase() === 'NONE') return;

      try {
        const res = await fetch(`/api/intune/lookup/${encodeURIComponent(rawTag)}`);
        const json = await res.json();
        if (json.found && json.data) {
          const d = json.data;
          const devNameEl = document.getElementById('deviceName');
          const engNameEl = document.getElementById('englishName');
          const emailEl = document.getElementById('email');
          const modelEl = document.getElementById('deviceModel');

          let filled = 0;
          if (devNameEl && !devNameEl.value.trim() && d.deviceName) {
            devNameEl.value = d.deviceName;
            filled++;
          }
          if (engNameEl && !engNameEl.value.trim() && d.englishName) {
            engNameEl.value = d.englishName;
            filled++;
          }
          if (emailEl && !emailEl.value.trim() && d.email) {
            emailEl.value = d.email;
            filled++;
          }
          if (modelEl && (!modelEl.value.trim() || modelEl.value.trim() === 'لا يوجد') && d.model) {
            modelEl.value = d.model;
            filled++;
          }

          if (filled > 0) {
            showToast(`تم التعرف على الجهاز من Intune: ${d.deviceName || d.serviceTag}`);
          }
        }
      } catch (err) {
        // Silent catch
      }
    };

    serviceTagInput.addEventListener('blur', handleTagLookup);
    serviceTagInput.addEventListener('change', handleTagLookup);
  }

  
  // Verify user session
  const authenticated = await checkAuth();
  if (!authenticated) return;
  
  initUserInterface();



  setupUserManagement();
  await fetchCustomColumns();
  fetchDevices();
  fetchSystemLogs();
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
        showToast('تم ' + actionLabel + ' بواسطة ' + (data.by || 'مستخدم آخر') + ' - جاري جلب التحديثات...');
        // Refresh data silently
        fetchCustomColumns().then(() => fetchDevices());
            } else if (data.type === 'user_updated' && currentUser && currentUser.id === data.userId) {
        checkAuth().then(auth => {
          if (auth) {
            showToast('تم تحديث صلاحياتك من قبل الإدارة', false);
            initUserInterface();



            setupUserManagement();
            fetchDevices();
          }
        });
      } else if (data.type === 'user_deleted' && currentUser && currentUser.id === data.userId) {
        showToast('تم حذف حسابك من قبل الإدارة', true);
        setTimeout(() => window.location.href = '/login.html', 1500);
} else if (data.type === 'new_log') {
        if (currentUser && (currentUser.role === 'Admin' || (currentUser.permissions && currentUser.permissions.canViewLogs))) {
          handleNewLogEvent(data);
        }
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
  // Fetch system network info for local mobile QR code scanning
  fetch('/api/system/info')
    .then(r => r.json())
    .then(info => {
      if (info && info.localUrl) {
        window.serverLocalUrl = info.localUrl;
        window.serverLocalIp = info.localIp;
      }
    })
    .catch(() => {});

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
    
    // Auto-open device card if viewCard query param is present
    const urlParams = new URLSearchParams(window.location.search);
    const viewCardId = urlParams.get('viewCard');
    if (viewCardId && !window.hasViewedCard) {
      window.hasViewedCard = true;
      setTimeout(() => viewDeviceDetails(viewCardId), 500);
    }
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
  const totalCols = 6;
  
  // Update header first
  const tableHead = document.querySelector('#devicesTable thead');
  if (tableHead) {
    let headHtml = `
      <tr>
        <th>الرقم الوظيفي</th>
        <th>${window.t ? window.t('th_employee') : 'اسم الموظف'}</th>
        <th>${window.t ? window.t('th_department') : 'المسمى الوظيفي'}</th>
        <th>${window.t ? window.t('th_status') : 'الحالة التقنية'}</th>
        <th>${window.t ? window.t('th_has_device') : 'امتلاك جهاز'}</th>
        <th>${window.t ? window.t('th_actions') : 'الإجراءات'}</th>
      </tr>
    `;
    tableHead.innerHTML = headHtml;
  }

  if (filteredDevices.length === 0) {
    devicesTableBody.innerHTML = `
      <tr>
        <td colspan="${totalCols}" class="loading-cell" style="padding: 2.5rem 1rem;">
          <i class="bi bi-inbox" style="font-size: 2.5rem; color: var(--tx-muted, #94a3b8)"></i><br>
          <span style="display:block; margin: 10px 0; font-size: 1rem; font-weight: 600;">لا توجد أجهزة مطابقة لخيارات البحث والتصفية المحددة.</span>
          <button type="button" class="action-btn btn-secondary" onclick="resetSearchAndFilters()" style="margin: 8px auto 0; font-size: 0.85rem; padding: 6px 16px; gap: 6px;">
            <i class="bi bi-arrow-counterclockwise"></i> إعادة ضبط الفلاتر والبحث
          </button>
        </td>
      </tr>
    `;
    return;
  }

  devicesTableBody.innerHTML = '';
  filteredDevices.forEach(d => {
    const tr = document.createElement('tr');
    
    // Device Possession Badge (لديه جهاز أو لا)
    const hasDevice = hasRealDevice(d);
    let deviceBadge = '';
    if (hasDevice) {
      const rawNat = String(d.deviceNature || '').toLowerCase();
      const rawMod = String(d.deviceModel || '').toLowerCase();
      const isLaptop = rawNat === 'laptop' || rawNat === 'محمول' || /laptop|probook|latitude|macbook/i.test(rawMod);
      const isDesktop = rawNat === 'desktop' || rawNat === 'مكتبي' || (!isLaptop && (d.assetType === 'Computer' || rawNat === 'desktop'));
      let label = 'لديه جهاز';
      let icon = 'bi-check-circle-fill';
      if (isLaptop) {
        label = 'لديه جهاز (محمول)';
        icon = 'bi-laptop';
      } else if (isDesktop) {
        label = 'لديه جهاز (مكتبي)';
        icon = 'bi-pc-display';
      } else if (d.assetType === 'Printer') {
        label = 'لديه طابعة';
        icon = 'bi-printer';
      }
      deviceBadge = `<span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.35); font-weight: 600; padding: 4px 10px; border-radius: 6px; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;"><i class="bi ${icon}"></i> ${label}</span>`;
    } else {
      deviceBadge = `<span class="badge" style="background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.35); font-weight: 600; padding: 4px 10px; border-radius: 6px; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;"><i class="bi bi-x-circle-fill"></i> ليس لديه جهاز</span>`;
    }

    // Status Badge
    let statusBadge = '<span style="color: var(--text-muted); font-size: 0.85rem;">—</span>';
    if (hasDevice) {
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
      statusBadge = `<span class="badge ${statusClass}"><i class="bi ${statusIcon}"></i> ${statusDisplay}</span>`;
    }

    let rowHtml = `
      <td data-label="الرقم الوظيفي">
        <div class="employee-cell">
          <span class="emp-name">${d.employeeId || '—'}</span>
        </div>
      </td>
      <td>
        <div class="employee-cell">
          <span class="emp-name">${d.employeeName}</span>
          ${(d.englishName || d.email) ? `<span style="font-size: 0.78rem; color: var(--text-muted); display: block; direction: ltr; text-align: right; margin-top: 2px;">${[d.englishName, d.email].filter(Boolean).join(' &bull; ')}</span>` : ''}
        </div>
      </td>
      <td>
        <span style="font-weight: 500; display: block; margin-bottom: 4px; color: var(--primary-color);">${d.orgPath ? d.orgPath.split('||').pop() : '-'}</span>
        <span style="font-size: 0.85rem; color: var(--text-muted);" title="${d.orgPath ? d.orgPath.replace(/\|\|/g, ' > ') : ''}">${d.orgPath ? d.orgPath.replace(/\|\|/g, ' > ') : '-'}</span>
      </td>
      <td>${statusBadge}</td>
      <td>
        ${deviceBadge}
        ${d.deviceName ? `<div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 3px; font-family: monospace; direction: ltr; text-align: right;"><i class="bi bi-display" style="font-size:0.75rem; margin-left:3px;"></i>${d.deviceName}</div>` : ''}
      </td>
      <td>
        <div class="actions-cell">
          <button class="action-icon-btn btn-view" onclick="viewDeviceHistory('${d.id}')" title="سجل حركات الجهاز">
            <i class="bi bi-clock-history"></i>
          </button>
          <button class="action-icon-btn btn-view" onclick="viewDeviceDetails('${d.id}')" title="عرض التفاصيل والبطاقة التقنية">
            <i class="bi bi-file-earmark-text"></i>
          </button>
          ${(currentUser && (currentUser.role === 'Admin' || (currentUser.permissions && currentUser.permissions.canEdit))) ? `<button class="action-icon-btn btn-edit" onclick="openEditModal('${d.id}')" title="تعديل"><i class="bi bi-pencil"></i></button>` : ''}
          ${(currentUser && (currentUser.role === 'Admin' || (currentUser.permissions && currentUser.permissions.canDelete))) ? `<button class="action-icon-btn btn-delete" onclick="openDeleteModal('${d.id}', '${d.employeeName ? d.employeeName.replace(/'/g, "\\'") : ''}')" title="حذف"><i class="bi bi-trash"></i></button>` : ''}
        </div>
      </td>
    `;
    tr.innerHTML = rowHtml;
    devicesTableBody.appendChild(tr);
  });
}

// HELPERS
function hasRealDevice(d) {
  if (!d) return false;
  const nature = String(d.deviceNature || '').trim();
  const asset = String(d.assetType || '').trim();
  const model = String(d.deviceModel || '').trim();
  const tag = String(d.serviceTag || '').trim();
  const name = String(d.employeeName || '').trim();

  // If nature is None and asset is None -> Definitely no device
  if ((!nature || nature === 'None') && (!asset || asset === 'None')) {
    return false;
  }
  
  // Placeholder employees: "اسم (لا يوجد بيانات)"
  if (name.includes('(لا يوجد بيانات)') && (model === 'لا يوجد' || !model) && (tag === 'لا يوجد' || !tag)) {
    return false;
  }
  
  // Explicit "لا يوجد" with None
  if (nature === 'None' && (model === 'لا يوجد' || !model) && (tag === 'لا يوجد' || !tag)) {
    return false;
  }
  if (asset === 'None' && (model === 'لا يوجد' || !model) && (tag === 'لا يوجد' || !tag)) {
    return false;
  }
  if (model === 'لا يوجد' && tag === 'لا يوجد' && (nature === 'None' || asset === 'None')) {
    return false;
  }

  // If nature is Desktop or Laptop, or asset is Computer/Printer/etc.
  if (nature === 'Desktop' || nature === 'Laptop' || asset === 'Computer') {
    return true;
  }
  
  if (model && model !== 'لا يوجد' && model !== '—') return true;
  if (tag && tag !== 'لا يوجد' && tag !== '—') return true;

  return false;
}

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
  filterDept.innerHTML = '<option value="all">الكل (كافة الإدارات)</option>';
  
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

  // Also include any actual department from loaded devices
  devices.forEach(d => {
    if (d.department && d.department !== 'لا يوجد' && d.department !== 'لايوجد' && d.department.trim() !== '') {
      allDepts.add(d.department.trim());
    }
    if (d.orgPath && d.orgPath !== 'مجلس الإدارة' && d.orgPath.trim() !== '') {
      const cleanPath = d.orgPath.replace(/\s*\|\|\s*/g, ' || ');
      allDepts.add(cleanPath);
    }
  });
  
  Array.from(allDepts).sort((a, b) => a.localeCompare(b, 'ar')).forEach(deptPath => {
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
  const realDevices = devices.filter(d => hasRealDevice(d));

  const realLaptops = realDevices.filter(d => {
    const nat = String(d.deviceNature || '').toLowerCase();
    const mod = String(d.deviceModel || '').toLowerCase();
    return nat === 'laptop' || nat === 'محمول' || /laptop|probook|latitude|macbook/i.test(mod);
  });
  const realDesktops = realDevices.filter(d => !realLaptops.includes(d));

  const uniqueEmployees = new Set();
  devices.forEach(d => {
    const rawName = String(d.employeeName || '').trim();
    if (!rawName) return;
    const cleanName = rawName.replace(/\(لا يوجد بيانات\)/g, '').trim();
    const key = (d.employeeId && String(d.employeeId).trim() !== '') ? ('ID_' + String(d.employeeId).trim()) : ('NAME_' + cleanName);
    uniqueEmployees.add(key);
  });

  animateCounter(statTotalDevices, realDevices.length);
  if (statEmployees) animateCounter(statEmployees, uniqueEmployees.size);
  animateCounter(statDesktops, realDesktops.length);
  animateCounter(statLaptops, realLaptops.length);
  animateCounter(statIssueDevices, realDevices.filter(d => (d.technicalStatus || 'سليم') !== 'سليم').length);
}

// CHARTS SYSTEM
function renderCharts() {
  const isDark = document.body.classList.contains('dark-theme');
  const textColor = isDark ? '#94a3b8' : '#475569';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(15, 23, 42, 0.04)';
  const fontConfig = { family: "'Cairo', 'Outfit', sans-serif", weight: '700' };
  
  // 1. Department Chart (PolarArea / Doughnut with Distinct Rich Colors)
  if (deptChartInstance) deptChartInstance.destroy();
  
  const realDevicesForChart = devices.filter(hasRealDevice);
  const deptsData = {};
  realDevicesForChart.forEach(d => {
    let chartDept = 'غير محدد';
    if (d.orgPath && d.orgPath.trim()) {
      const paths = d.orgPath.split('||').map(p => p.trim()).filter(Boolean);
      if (paths.length > 2 && paths[0] === 'مجلس الإدارة' && paths[1] === 'المدير العام') {
         chartDept = paths[2];
      } else if (paths.length > 1 && paths[0] === 'مجلس الإدارة' && paths[1] !== 'المدير العام') {
         chartDept = paths[1];
      } else if (paths.length > 0) {
         chartDept = paths[0];
      }
    } else if (d.department && d.department.trim()) {
      chartDept = d.department.trim();
    }
    deptsData[chartDept] = (deptsData[chartDept] || 0) + 1;
  });
  
  // Sort descending by device count for clearer visualization
  const sortedEntries = Object.entries(deptsData).sort((a, b) => b[1] - a[1]);
  const deptLabels = sortedEntries.map(e => translateLabel(e[0]));
  const deptValues = sortedEntries.map(e => e[1]);

  // Distinct, high-contrast vibrant color palette (18 distinguishable colors)
  const distinctColors = [
    '#3b82f6', // Royal Blue
    '#10b981', // Emerald Green
    '#f59e0b', // Amber / Gold
    '#ef4444', // Crimson Red
    '#8b5cf6', // Violet / Purple
    '#06b6d4', // Cyan
    '#ec4899', // Hot Pink
    '#f97316', // Orange
    '#14b8a6', // Teal
    '#6366f1', // Indigo
    '#84cc16', // Lime Green
    '#d946ef', // Fuchsia
    '#0284c7', // Sky Blue
    '#e11d48', // Rose
    '#a855f7', // Lavender
    '#eab308', // Yellow
    '#64748b', // Slate Gray
    '#475569'  // Dark Slate
  ];
  
  const ctxDept = document.getElementById('deptChart').getContext('2d');
  deptChartInstance = new Chart(ctxDept, {
    type: 'doughnut',
    data: {
      labels: deptLabels,
      datasets: [{
        data: deptValues,
        backgroundColor: distinctColors.slice(0, deptValues.length),
        borderWidth: isDark ? 2 : 2,
        borderColor: isDark ? '#1e293b' : '#ffffff',
        hoverOffset: 12,
        spacing: 3,
        borderRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '45%',
      layout: {
        padding: 10
      },
      plugins: {
        legend: {
          position: 'bottom',
          rtl: true,
          labels: {
            font: { family: "'Cairo', 'Outfit', sans-serif", size: 11, weight: '700' },
            color: textColor,
            padding: 12,
            usePointStyle: true,
            pointStyle: 'rectRounded'
          }
        },
        tooltip: {
          rtl: true,
          titleFont: { family: "'Cairo', sans-serif", size: 13 },
          bodyFont: { family: "'Cairo', sans-serif", size: 12 },
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              const val = context.raw || 0;
              const total = deptValues.reduce((a, b) => a + b, 0);
              const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
              return ` ${context.label}: ${val} جهاز (${pct}%)`;
            }
          }
        }
      }
    }
  });

  // 2. Status Chart (Doughnut - دائري متناسق مع المخطط الأول)
  if (statusChartInstance) statusChartInstance.destroy();
  
  const realDevices = devices.filter(hasRealDevice);
  const cleanCount = realDevices.filter(d => (d.technicalStatus || 'سليم') === 'سليم').length;
  const issueCount = realDevices.filter(d => (d.technicalStatus || 'سليم') !== 'سليم').length;
  const totalStatus = cleanCount + issueCount;
  
  const ctxStatus = document.getElementById('statusChart').getContext('2d');
  statusChartInstance = new Chart(ctxStatus, {
    type: 'doughnut',
    data: {
      labels: [translateLabel('سليم'), translateLabel('به مشاكل تقنية')],
      datasets: [{
        data: [cleanCount, issueCount],
        backgroundColor: [
          '#10b981', // أخضر زمردي جذاب وسلس للسليم
          '#ef4444'  // أحمر قرمزي ناصع للمشاكل التقنية
        ],
        borderWidth: 2,
        borderColor: isDark ? '#1e293b' : '#ffffff',
        hoverOffset: 12,
        spacing: 4,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '45%',
      layout: {
        padding: 10
      },
      plugins: {
        legend: {
          position: 'bottom',
          rtl: true,
          labels: {
            font: { family: "'Cairo', 'Outfit', sans-serif", size: 12, weight: '700' },
            color: textColor,
            padding: 16,
            usePointStyle: true,
            pointStyle: 'rectRounded'
          }
        },
        tooltip: {
          rtl: true,
          titleFont: { family: "'Cairo', sans-serif", size: 13 },
          bodyFont: { family: "'Cairo', sans-serif", size: 12 },
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              const val = context.raw || 0;
              const pct = totalStatus > 0 ? ((val / totalStatus) * 100).toFixed(1) : 0;
              return ` ${context.label}: ${val} جهاز (${pct}%)`;
            }
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
    has_monitor: true,
    no_device: true
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
        maxMonitors: 0,
        totalComputers: 0,
        desktopsCount: 0,
        laptopsCount: 0,
        hasAnyRealDevice: false
      };
    }
    
    const isReal = hasRealDevice(d);
    if (isReal) {
      employeeData[name].hasAnyRealDevice = true;
      const rawNat = String(d.deviceNature || '').toLowerCase();
      const rawMod = String(d.deviceModel || '').toLowerCase();
      const isLaptop = rawNat === 'laptop' || rawNat === 'محمول' || /laptop|probook|latitude|macbook/i.test(rawMod);
      if (isLaptop) {
        employeeData[name].totalComputers += 1;
        employeeData[name].laptopsCount += 1;
      } else {
        employeeData[name].totalComputers += 1;
        employeeData[name].desktopsCount += 1;
      }

      // Check the monitors count specifically configured on this device (عدد الشاشات المرفقة)
      const mc = parseInt(d.monitorsCount) || 1;
      if (mc > employeeData[name].maxMonitors) {
        employeeData[name].maxMonitors = mc;
      }
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
  const listHasMultiple = [];
  const listHasMonitor = [];
  const listNoDevice = [];

  uniqueEmployees.forEach(emp => {
    if (emp.totalComputers >= 1) listHasComputer.push(emp.name);
    if (emp.totalComputers >= 2) listHasMultiple.push(emp.name);
    if (emp.maxMonitors >= 2) listHasMonitor.push(emp.name);
    if (!emp.hasAnyRealDevice) listNoDevice.push(emp.name);
  });

  // Store lists in global state for modal reference
  window.comparisonLists = {
    'has_computer': { title: 'الموظفون الذين بحوزتهم جهاز حاسوب (جهاز واحد فما فوق)', list: listHasComputer },
    'has_multiple': { title: 'الموظفون الذين بحوزتهم أكثر من جهاز (جهازان فأكثر)', list: listHasMultiple },
    'has_monitor': { title: 'الموظفون الذين لديهم أكثر من شاشة', list: listHasMonitor },
    'no_device': { title: 'الموظفون الذين ليس لديهم أي جهاز', list: listNoDevice }
  };
  
  let gridHtml = '';
  
  if (metrics.has_computer) {
    gridHtml += `
      <div class="comparison-card" onclick="showCategoryEmployees('has_computer')">
        <div class="card-icon"><i class="bi bi-pc-display"></i></div>
        <div class="card-info">
          <h4>من يملك جهاز حاسوب</h4>
          <div class="progress-bar-container">
            <div class="progress-bar bg-warning" style="width: ${(listHasComputer.length/totalEmployees)*100}%"></div>
          </div>
          <p class="count-text">${listHasComputer.length} ${window.t ? window.t('comp_employee') : 'موظف'} (${((listHasComputer.length/totalEmployees)*100).toFixed(1)}%)</p>
        </div>
      </div>
    `;
  }

  if (metrics.has_multiple) {
    gridHtml += `
      <div class="comparison-card" onclick="showCategoryEmployees('has_multiple')">
        <div class="card-icon"><i class="bi bi-layers-fill" style="color: #6366f1;"></i></div>
        <div class="card-info">
          <h4>من لديه أكثر من جهاز (جهازان فأكثر)</h4>
          <div class="progress-bar-container">
            <div class="progress-bar" style="background: #6366f1; width: ${(listHasMultiple.length/totalEmployees)*100}%"></div>
          </div>
          <p class="count-text">${listHasMultiple.length} ${window.t ? window.t('comp_employee') : 'موظف'} (${((listHasMultiple.length/totalEmployees)*100).toFixed(1)}%)</p>
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
  
  if (metrics.no_device) {
    gridHtml += `
      <div class="comparison-card" onclick="showCategoryEmployees('no_device')">
        <div class="card-icon"><i class="bi bi-x-circle" style="color: var(--clr-danger, #f43f5e);"></i></div>
        <div class="card-info">
          <h4>من ليس لديه أي جهاز</h4>
          <div class="progress-bar-container">
            <div class="progress-bar bg-danger" style="width: ${(listNoDevice.length/totalEmployees)*100}%"></div>
          </div>
          <p class="count-text">${listNoDevice.length} ${window.t && typeof window.t === 'function' ? window.t('comp_employee') || 'موظف' : 'موظف'} (${((listNoDevice.length/totalEmployees)*100).toFixed(1)}%)</p>
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
        // Find employee department/section and device count for detailed view
        const empAll = devices.filter(d => d.employeeName && d.employeeName.trim() === name);
        const empRealDevices = empAll.filter(d => hasRealDevice(d));
        const deptInfo = empAll.length > 0 ? (empAll[0].department || '') : '';
        const sectInfo = empAll.length > 0 && empAll[0].section ? ` / ${empAll[0].section}` : '';
        
        let countBadge = '';
        if (empRealDevices.length > 1) {
          countBadge = `<span class="badge" style="background: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3); font-size: 0.75rem; padding: 2px 8px; border-radius: 12px; margin-right: 8px;"><i class="bi bi-layers-fill"></i> ${empRealDevices.length} أجهزة</span>`;
        } else if (empRealDevices.length === 1) {
          countBadge = `<span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); font-size: 0.75rem; padding: 2px 8px; border-radius: 12px; margin-right: 8px;"><i class="bi bi-check-circle-fill"></i> جهاز واحد</span>`;
        } else {
          countBadge = `<span class="badge" style="background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); font-size: 0.75rem; padding: 2px 8px; border-radius: 12px; margin-right: 8px;"><i class="bi bi-x-circle-fill"></i> لا يملك جهاز</span>`;
        }

        return `
          <li style="display: flex; justify-content: space-between; align-items: center; padding: 0.85rem 1.15rem; background-color: var(--bg-input); border: 1px solid var(--border-color); border-radius: var(--border-radius-md); transition: all var(--transition-speed);">
            <div style="display: flex; flex-direction: column;">
              <div style="display: flex; align-items: center;">
                <span style="font-weight: 700; font-size: 0.95rem; color: var(--text-main);">${name}</span>
                ${countBadge}
              </div>
              <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; margin-top: 0.25rem;">${deptInfo}${sectInfo}</span>
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
    
    // Reset dropdown filters so the employee isn't filtered out
    const filterDept = document.getElementById('filterDept');
    const filterNature = document.getElementById('filterNature');
    const filterStatus = document.getElementById('filterStatus');
    if (filterDept) filterDept.value = 'all';
    if (filterNature) filterNature.value = 'all';
    if (filterStatus) filterStatus.value = 'all';

    // Apply search and filter
    applySearchAndFilters();
    
    // Scroll to inventory section
    const invSection = document.querySelector('.inventory-section');
    if (invSection) {
      invSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

// ==========================================
// ARABIC NORMALIZATION & SMART SEARCH HELPERS
// ==========================================

function normalizeArabic(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '') // remove Arabic diacritics / tashkeel
    .replace(/[أإآءئؤ]/g, 'ا')              // normalize alef and hamza variants
    .replace(/ة/g, 'ه')                      // normalize teh marbuta
    .replace(/[ىي]/g, 'ي')                   // normalize alef maqsura and yaa
    .replace(/[\u0600-\u0605]/g, '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSurname(employeeName) {
  if (!employeeName) return '';
  let cleanName = employeeName.replace(/\([^)]*\)/g, '').replace(/[-–—]/g, '').trim();
  const words = cleanName.split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  if (words.length === 1) return words[0];
  
  if (words.length >= 2) {
    const prevWord = words[words.length - 2];
    const lastWord = words[words.length - 1];
    const normPrev = normalizeArabic(prevWord);
    if (['بن', 'ابن', 'ابو', 'بو', 'ال', 'اولاد'].includes(normPrev)) {
      return prevWord + ' ' + lastWord;
    }
  }
  return words[words.length - 1];
}

function getWordVariants(word) {
  if (!word) return [];
  const norm = normalizeArabic(word);
  if (!norm) return [];
  const variants = new Set([norm]);
  
  // Strip or add 'ال' (Definite Article)
  if (norm.startsWith('ال') && norm.length > 3) {
    variants.add(norm.substring(2));
  } else if (!norm.startsWith('ال') && norm.length >= 2) {
    variants.add('ال' + norm);
  }
  
  // Handle 'ابو' / 'بو'
  if (norm.startsWith('ابو ') || norm.startsWith('ابو')) {
    const base = norm.replace(/^ابو\s*/, '');
    variants.add('ابوراس');
    variants.add('ابو ' + base);
    variants.add('بو' + base);
    variants.add('بو ' + base);
    variants.add(base);
  } else if (norm.startsWith('بو ') || norm.startsWith('بو')) {
    const base = norm.replace(/^بو\s*/, '');
    variants.add('ابو' + base);
    variants.add('ابو ' + base);
    variants.add('بو' + base);
    variants.add(base);
  }

  // Handle 'عبد'
  if (norm.startsWith('عبد ') || norm.startsWith('عبد')) {
    const base = norm.replace(/^عبد\s*/, '');
    variants.add('عبد' + base);
    variants.add('عبد ' + base);
  }

  // Handle 'بن' / 'ابن'
  if (norm.startsWith('بن ') || norm.startsWith('بن')) {
    const base = norm.replace(/^بن\s*/, '');
    variants.add('ابن ' + base);
    variants.add('بن ' + base);
    variants.add('بن' + base);
  }

  return Array.from(variants);
}

function matchDeviceSearch(device, query) {
  if (!query) return true;
  const normQuery = normalizeArabic(query);
  const queryTokens = normQuery.split(' ').filter(Boolean);
  if (queryTokens.length === 0) return true;

  // Extract surname and build surname variants
  const surname = extractSurname(device.employeeName);
  const surnameVariants = getWordVariants(surname);

  // Compile all searchable fields
  const haystack = [
    device.employeeName,
    surname,
    ...surnameVariants,
    device.employeeId,
    device.englishName,
    device.email,
    device.deviceName,
    device.orgPath,
    device.department,
    device.section,
    device.unit,
    device.sharedUsers,
    device.deviceModel,
    device.deviceNature,
    device.assetType,
    device.serviceTag,
    device.ram,
    device.storageType,
    device.storageSize,
    device.technicalStatus,
    device.recurringIssues,
    device.notes,
    device.systemsUsed,
    device.phone,
    device.ipAddress,
    device.osVersion,
    device.connectionType,
    device.monitorsCount ? `${device.monitorsCount} شاشة` : '',
    device.monitorsCount ? `${device.monitorsCount} monitors` : ''
  ];

  // Also add variants for all words in employee name
  if (device.employeeName) {
    const empWords = device.employeeName.split(/\s+/).filter(Boolean);
    empWords.forEach(w => {
      const wVars = getWordVariants(w);
      wVars.forEach(v => haystack.push(v));
    });
  }

  if (Array.isArray(device.customFields)) {
    device.customFields.forEach(cf => {
      if (cf) {
        if (cf.label) haystack.push(cf.label);
        if (cf.value) haystack.push(cf.value);
      }
    });
  }

  if (Array.isArray(device.monitorsDetails)) {
    device.monitorsDetails.forEach(m => {
      if (m) {
        if (m.manufacturer) haystack.push(m.manufacturer);
        if (m.serviceTag) haystack.push(m.serviceTag);
        if (m.size) haystack.push(m.size);
      }
    });
  }

  if (Array.isArray(device.dockingDetails)) {
    device.dockingDetails.forEach(doc => {
      if (doc && doc.serviceTag) haystack.push(doc.serviceTag);
    });
  }

  const normHaystack = normalizeArabic(haystack.filter(Boolean).join(' '));
  const rawAlphaHaystack = normHaystack.replace(/[^a-z0-9\u0621-\u064A]/g, '');

  return queryTokens.every(token => {
    const tokenVariants = getWordVariants(token);
    return tokenVariants.some(v => {
      if (normHaystack.includes(v)) return true;
      const cleanV = v.replace(/[^a-z0-9\u0621-\u064A]/g, '');
      if (cleanV && rawAlphaHaystack.includes(cleanV)) return true;
      return false;
    });
  });
}

function matchDeviceDept(device, deptVal) {
  if (!deptVal || deptVal === 'all') return true;

  const normDeptVal = normalizeArabic(deptVal).replace(/\s*\|\|\s*/g, '||').replace(/\s*>\s*/g, '||');
  const dOrg = normalizeArabic(device.orgPath || '').replace(/\s*\|\|\s*/g, '||');
  const dDept = normalizeArabic(device.department || '');
  const dSec = normalizeArabic(device.section || '');
  const dUnit = normalizeArabic(device.unit || '');

  // Split selected path into segments
  const selectedSegments = normDeptVal.split('||').map(s => s.trim()).filter(Boolean);
  if (selectedSegments.length === 0) return true;

  // The most specific target node selected by the user (the last item in the selected path)
  const targetLeaf = selectedSegments[selectedSegments.length - 1];
  const stripPrefix = s => s.replace(/^(الاداره|اداره|قسم|مكتب|وحده|دائره)\s+/, '').trim();
  const strippedTarget = stripPrefix(targetLeaf);

  // 1. Direct check: the employee must belong to this specific leaf node or lower
  if (dOrg && dOrg.includes(targetLeaf)) return true;
  if (dUnit && (dUnit === targetLeaf || dUnit.includes(targetLeaf))) return true;
  if (dSec && (dSec === targetLeaf || dSec.includes(targetLeaf))) return true;
  if (dDept && (dDept === targetLeaf || dDept.includes(targetLeaf))) return true;

  // 2. Prefix-flexible check (e.g. "المقسمات الدولية" matches "وحدة المقسمات الدولية")
  if (strippedTarget && strippedTarget.length >= 3) {
    if (dOrg && dOrg.includes(strippedTarget)) return true;
    if (dUnit && stripPrefix(dUnit).includes(strippedTarget)) return true;
    if (dSec && stripPrefix(dSec).includes(strippedTarget)) return true;
    if (dDept && stripPrefix(dDept).includes(strippedTarget)) return true;
  }

  // 3. Or employee's full orgPath starts with or includes the full selected path
  if (dOrg && dOrg.includes(normDeptVal)) return true;

  return false;
}

function matchDeviceNature(device, natureVal) {
  if (!natureVal || natureVal === 'all') return true;

  const target = natureVal.trim().toLowerCase();

  if (target === 'has_device') {
    return hasRealDevice(device);
  }

  if (target === 'no_device') {
    return !hasRealDevice(device);
  }

  const rawNature = String(device.deviceNature || '').trim().toLowerCase();
  const rawAsset = String(device.assetType || '').trim().toLowerCase();
  const rawModel = String(device.deviceModel || '').trim().toLowerCase();

  if (target === 'desktop') {
    return rawNature === 'desktop' || 
           rawNature === 'مكتبي' || 
           rawNature.includes('desktop') || 
           rawNature.includes('مكتبي') ||
           ((!rawNature || rawNature === 'computer') && rawAsset === 'computer');
  }

  if (target === 'laptop') {
    return rawNature === 'laptop' || 
           rawNature === 'محمول' || 
           rawNature.includes('laptop') || 
           rawNature.includes('محمول') || 
           rawModel.includes('probook') || 
           rawModel.includes('latitude') || 
           rawModel.includes('macbook');
  }

  if (target === 'printer') {
    return rawNature === 'printer' || 
           rawAsset === 'printer' || 
           rawNature.includes('طابعة') || 
           rawNature.includes('printer') || 
           rawModel.includes('laserjet') || 
           rawModel.includes('printer') || 
           rawModel.includes('hp laser');
  }

  if (target === 'fingerprint') {
    return rawNature === 'fingerprint' || 
           rawAsset === 'fingerprint' || 
           rawNature.includes('بصمة') || 
           rawModel.includes('fingerprint') || 
           rawModel.includes('zkteco');
  }

  if (target === 'accesspoint') {
    return rawNature === 'accesspoint' || 
           rawAsset === 'accesspoint' || 
           rawNature.includes('access') || 
           rawNature.includes('بوينت') || 
           rawNature.includes('ap') || 
           rawModel.includes('access point') || 
           rawModel.includes('unifi');
  }

  return rawNature === target || rawAsset === target;
}

function matchDeviceStatus(device, statusVal) {
  if (!statusVal || statusVal === 'all') return true;

  const rawStatus = String(device.technicalStatus || '').trim();
  const rawIssues = String(device.recurringIssues || '').trim();

  const hasIssueDescription = rawIssues && 
    rawIssues !== 'لا توجد مشاكل حالياً' && 
    rawIssues !== 'لا توجد مشاكل حاليا' && 
    rawIssues !== 'لا توجد مشاكل' && 
    rawIssues !== 'لا يوجد' && 
    rawIssues !== 'لايوجد' && 
    rawIssues !== 'سليم' && 
    rawIssues.length > 2;

  const isFaulty = rawStatus.includes('صيانة') || rawStatus.includes('عطل') || rawStatus.includes('مشكل') || hasIssueDescription;

  if (statusVal === 'clean') {
    return (rawStatus === 'سليم' || rawStatus === '' || !device.technicalStatus) && !hasIssueDescription;
  }

  if (statusVal === 'issues') {
    return isFaulty;
  }

  if (statusVal === 'need_maint') {
    return rawStatus.includes('بحاجة لصيانة') || rawStatus.includes('بحاجة');
  }

  if (statusVal === 'in_maint') {
    return rawStatus.includes('تحت الصيانة') || rawStatus.includes('تحت');
  }

  return true;
}

// SEARCH & FILTERS IMPLEMENTATION
function applySearchAndFilters() {
  const query = searchInput ? searchInput.value.trim() : '';
  const deptVal = filterDept ? filterDept.value : 'all';
  const natureVal = filterNature ? filterNature.value : 'all';
  const statusVal = filterStatus ? filterStatus.value : 'all';

  // Toggle clear search button visibility
  const clearBtn = document.getElementById('clearSearchBtn');
  if (clearBtn) {
    clearBtn.style.display = query ? 'block' : 'none';
  }

  // Save state to localStorage for persistence
  localStorage.setItem('ui_search', query);
  localStorage.setItem('ui_dept', deptVal);
  localStorage.setItem('ui_nature', natureVal);
  localStorage.setItem('ui_status', statusVal);

  filteredDevices = devices.filter(d => {
    return matchDeviceSearch(d, query) &&
           matchDeviceDept(d, deptVal) &&
           matchDeviceNature(d, natureVal) &&
           matchDeviceStatus(d, statusVal);
  });

  // Sort by Employee ID (الرقم الوظيفي)
  filteredDevices.sort((a, b) => {
    const numA = parseInt(a.employeeId, 10);
    const numB = parseInt(b.employeeId, 10);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    return String(a.employeeId || '').localeCompare(String(b.employeeId || ''), 'ar');
  });

  // Update counter badge
  const countBadge = document.getElementById('devicesFilterCount');
  if (countBadge) {
    const realTotal = devices.filter(hasRealDevice).length;
    const realFiltered = filteredDevices.filter(hasRealDevice).length;

    if (query || deptVal !== 'all' || natureVal !== 'all' || statusVal !== 'all') {
      countBadge.textContent = `${filteredDevices.length} سجل (${realFiltered} جهاز فعلي)`;
    } else {
      countBadge.textContent = `${realTotal} جهاز فعلي (من إجمالي ${devices.length} موظف)`;
    }
  }

  renderTable();
}

function resetSearchAndFilters() {
  if (searchInput) searchInput.value = '';
  if (filterDept) filterDept.value = 'all';
  if (filterNature) filterNature.value = 'all';
  if (filterStatus) filterStatus.value = 'all';

  const clearBtn = document.getElementById('clearSearchBtn');
  if (clearBtn) clearBtn.style.display = 'none';

  localStorage.removeItem('ui_search');
  localStorage.removeItem('ui_dept');
  localStorage.removeItem('ui_nature');
  localStorage.removeItem('ui_status');

  applySearchAndFilters();
  showToast('تمت إعادة ضبط خيارات البحث والتصفية');
}

function restoreSearchAndFilters() {
  const savedSearch = localStorage.getItem('ui_search');
  if (savedSearch !== null && searchInput) {
    searchInput.value = savedSearch;
    const clearBtn = document.getElementById('clearSearchBtn');
    if (clearBtn) clearBtn.style.display = savedSearch ? 'block' : 'none';
  }

  const savedDept = localStorage.getItem('ui_dept');
  if (savedDept !== null && filterDept) {
    const options = Array.from(filterDept.options).map(o => o.value);
    if (options.includes(savedDept)) filterDept.value = savedDept;
  }

  const savedNature = localStorage.getItem('ui_nature');
  if (savedNature !== null && filterNature) filterNature.value = savedNature;

  const savedStatus = localStorage.getItem('ui_status');
  if (savedStatus !== null && filterStatus) filterStatus.value = savedStatus;
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

  // Live Filtering with Debounce
  if (searchInput) {
    let searchDebounceTimeout = null;
    searchInput.addEventListener('input', () => {
      clearTimeout(searchDebounceTimeout);
      searchDebounceTimeout = setTimeout(applySearchAndFilters, 120);
    });
  }
  if (filterDept) filterDept.addEventListener('change', applySearchAndFilters);
  if (filterNature) filterNature.addEventListener('change', applySearchAndFilters);
  if (filterStatus) filterStatus.addEventListener('change', applySearchAndFilters);

  // Clear Search button trigger
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        applySearchAndFilters();
        searchInput.focus();
      }
    });
  }

  // Form Modals
  openAddModalBtn.addEventListener('click', openAddModal);

  // Employee Auto-Complete Event Listener
  const empInput = document.getElementById('employeeName');
  if (empInput) {
    empInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      const match = devices.find(d => d.employeeName === val);
      if (match) {
        if (match.orgPath) {
          setOrgSelectValue(match.orgPath);
        }
        const empIdInput = document.getElementById('employeeId');
        if (empIdInput && match.employeeId) empIdInput.value = match.employeeId;
      }
    });
  }

  // Add Column modal trigger
  const addColBtn = document.getElementById('openAddColumnModalBtn');
  if (addColBtn) {
    addColBtn.addEventListener('click', () => {
      openModal('columnModal');
      renderExistingColumns();
    });
  }

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
  document.getElementById('monitorsCount').value = 1;
  generateMonitorForms();
  document.getElementById('dockingCount').value = 0;
  generateDockingForms();
  openModal('deviceModal');
}

// EDIT DEVICE MODAL
function openEditModal(id) {
  const d = devices.find(x => String(x.id) === String(id));
  if (!d) return;

  document.getElementById('modalTitle').textContent = 'تعديل بيانات الجهاز للعهدة';
  document.getElementById('deviceId').value = d.id;
  
  document.getElementById('employeeName').value = d.employeeName || '';
  document.getElementById('employeeId').value = d.employeeId || '';
  const engInput = document.getElementById('englishName');
  if (engInput) engInput.value = d.englishName || '';
  const emailInput = document.getElementById('email');
  if (emailInput) emailInput.value = d.email || '';
  const devNameInput = document.getElementById('deviceName');
  if (devNameInput) devNameInput.value = d.deviceName || '';
  const sharedUsersInput = document.getElementById('sharedUsers');
  if (sharedUsersInput) sharedUsersInput.value = d.sharedUsers || '';
  
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
  generateMonitorForms();
  if (d.monitorsDetails && Array.isArray(d.monitorsDetails)) {
    d.monitorsDetails.forEach((mon, i) => {
      const mfg = document.getElementById(`monitor_mfg_${i}`);
      if (mfg) {
        mfg.value = mon.manufacturer || '';
        document.getElementById(`monitor_size_${i}`).value = mon.size || '';
        document.getElementById(`monitor_tag_${i}`).value = mon.serviceTag || '';
      }
    });
  }
  document.getElementById('dockingCount').value = d.dockingCount || 0;
  generateDockingForms();
  if (d.dockingDetails && Array.isArray(d.dockingDetails)) {
    d.dockingDetails.forEach((dock, i) => {
      const mfg = document.getElementById(`docking_mfg_${i}`);
      if (mfg) {
        mfg.value = dock.manufacturer || '';
        document.getElementById(`docking_model_${i}`).value = dock.model || '';
        document.getElementById(`docking_tag_${i}`).value = dock.serviceTag || '';
      }
    });
  }
  document.getElementById('phone').value = d.phone || '';
  document.getElementById('osVersion').value = d.osVersion || '';
  
  document.getElementById('systemsUsed').value = d.systemsUsed || '';
  document.getElementById('recurringIssues').value = d.recurringIssues || '';
  document.getElementById('notes').value = d.notes || '';
  document.getElementById('technicalStatus').value = d.technicalStatus || 'سليم';

  // Load custom fields
  renderFormCustomFields(d);

  toggleDeviceFields();
  document.getElementById('monitorsCount').value = 1;
  generateMonitorForms();
  document.getElementById('dockingCount').value = 0;
  generateDockingForms();
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
  
  const monitorsDetails = [];
  const mc = parseInt(document.getElementById('monitorsCount').value) || 0;
  for (let i = 0; i < mc; i++) {
    const mfg = document.getElementById(`monitor_mfg_${i}`);
    if (mfg) {
      monitorsDetails.push({
        manufacturer: mfg.value.trim(),
        size: document.getElementById(`monitor_size_${i}`).value.trim(),
        serviceTag: document.getElementById(`monitor_tag_${i}`).value.trim()
      });
    }
  }

  const dockingDetails = [];
  const dc = parseInt(document.getElementById('dockingCount').value) || 0;
  for (let i = 0; i < dc; i++) {
    const tag = document.getElementById(`docking_tag_${i}`);
    if (tag) {
      dockingDetails.push({
        serviceTag: tag.value.trim()
      });
    }
  }

  const payload = {
    monitorsDetails: monitorsDetails,
    dockingDetails: dockingDetails,
    dockingCount: dc,
    employeeName: document.getElementById('employeeName').value.trim(),
    employeeId: document.getElementById('employeeId').value.trim(),
    englishName: document.getElementById('englishName') ? document.getElementById('englishName').value.trim() : '',
    email: document.getElementById('email') ? document.getElementById('email').value.trim() : '',
    deviceName: document.getElementById('deviceName') ? document.getElementById('deviceName').value.trim() : '',
    sharedUsers: document.getElementById('sharedUsers').value.trim(),
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

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'حدث خطأ أثناء الاتصال بالخادم لحفظ البيانات');
    
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

// Helper to build offline text representation of device card for standalone QR Code scanning
function buildDeviceCardText(d) {
  const lines = [];
  lines.push('📋 بطاقة مواصفات العهدة التقنية (LITC)');
  lines.push('━━━━━━━━━━━━━━━━━━━━');
  lines.push(`المستلم: ${d.employeeName || 'غير معروف'}`);
  lines.push(`المعرف: #${d.employeeId || d.id}`);
  if (d.orgPath) {
    const cleanOrg = d.orgPath.split('||').map(s => s.trim()).filter(Boolean).join(' > ');
    lines.push(`الجهة: ${cleanOrg}`);
  }
  if (d.englishName) lines.push(`الاسم (EN): ${d.englishName}`);
  if (d.email) lines.push(`الإيميل: ${d.email}`);
  lines.push('━━━━━━━━━━━━━━━━━━━━');
  lines.push(`الموديل: ${d.deviceModel || 'لا يوجد'}`);
  if (d.deviceName) lines.push(`اسم الجهاز: ${d.deviceName}`);
  lines.push(`النوع: ${translateNature(d.deviceNature)}`);
  lines.push(`Service Tag: ${d.serviceTag || 'لا يوجد'}`);
  lines.push(`الذاكرة (RAM): ${d.ram || 'غير متوفر'}`);
  lines.push(`التخزين: ${d.storageType || 'SSD'} ${d.storageSize || ''}`.trim());
  lines.push(`عدد الشاشات: ${d.monitorsCount || 1}`);

  if (d.customFields && Array.isArray(d.customFields)) {
    d.customFields.forEach(cf => {
      if (cf && cf.label && cf.value) lines.push(`${cf.label}: ${cf.value}`);
    });
  }

  lines.push('━━━━━━━━━━━━━━━━━━━━');
  if (d.osVersion) lines.push(`نظام التشغيل: ${d.osVersion}`);
  if (d.ipAddress) lines.push(`عنوان IP: ${d.ipAddress}`);
  if (d.phone) lines.push(`الهاتف: ${d.phone}`);
  if (d.systemsUsed && d.systemsUsed !== 'لا يوجد' && d.systemsUsed !== 'لايوجد') {
    lines.push(`الأنظمة: ${d.systemsUsed}`);
  }
  lines.push('━━━━━━━━━━━━━━━━━━━━');
  lines.push(`الحالة الفنية: ${d.technicalStatus || 'سليم'}`);
  if (d.recurringIssues && d.recurringIssues !== 'لا توجد مشاكل حالياً' && d.recurringIssues !== 'لايوجد' && d.recurringIssues !== 'لا يوجد' && d.recurringIssues.trim() !== '') {
    lines.push(`تقرير الأعطال: ${d.recurringIssues}`);
  }
  if (d.notes && d.notes !== 'لا يوجد' && d.notes !== 'لايوجد' && d.notes.trim() !== '') {
    lines.push(`الملاحظات: ${d.notes}`);
  }

  return lines.join('\n');
}

// VIEW DETAILS CARD
function viewDeviceDetails(id) {
  const d = devices.find(x => String(x.id) === String(id));
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
          <span>اسم الموظف: ${d.employeeName}</span>
        </div>
        <div class="tech-card-badge">ID: #${d.employeeId ? d.employeeId : d.id}</div>
      </div>
      
      <div class="tech-card-details">
        <div class="tech-card-sections">
          <!-- القسم الأول: جهة الموظف -->
          <div class="tech-section">
            <h5>بيانات الجهة والموظف</h5>
            <div class="tech-detail-grid">
              <div class="tech-item" style="grid-column: 1 / -1;"><span class="tech-label">مكان الوظيفة:</span> <span class="tech-val">${d.orgPath ? d.orgPath.split('||').join(' <i class="bi bi-chevron-left" style="font-size:0.75rem;margin:0 4px;"></i> ') : 'لا يوجد'}</span></div>
              <div class="tech-item"><span class="tech-label">المستلم:</span> <span class="tech-val">${d.employeeName}</span></div>
              <div class="tech-item"><span class="tech-label">الرقم الوظيفي:</span> <span class="tech-val" style="font-weight: 700; color: var(--primary-color);">${d.employeeId || 'لا يوجد'}</span></div>
              <div class="tech-item"><span class="tech-label">الاسم بالإنجليزية:</span> <span class="tech-val" style="direction: ltr; text-align: right;">${d.englishName || 'لا يوجد'}</span></div>
              <div class="tech-item" style="grid-column: 1 / -1;"><span class="tech-label">البريد الإلكتروني:</span> <span class="tech-val" style="direction: ltr; text-align: right;">${d.email ? `<a href="mailto:${d.email}" style="color: var(--primary-color); text-decoration: underline;">${d.email}</a>` : 'لا يوجد'}</span></div>
            </div>
            ${customFieldsEmployeeHtml}
          </div>

          <!-- القسم الثاني: مواصفات الجهاز -->
          <div class="tech-section">
            <h5>المواصفات التقنية الفنية</h5>
            <div class="tech-detail-grid">
              <div class="tech-item"><span class="tech-label">الموديل:</span> <span class="tech-val">${d.deviceModel}</span></div>
              <div class="tech-item"><span class="tech-label">اسم الجهاز (Computer Name):</span> <span class="tech-val" style="direction: ltr; text-align: right;"><code>${d.deviceName || 'لا يوجد'}</code></span></div>
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
              ${d.deviceNature === 'Printer' ? `
              <div class="tech-item">
                <span class="tech-label">طريقة التوصيل:</span>
                <span class="tech-val">${d.connectionType === 'Network' ? 'شبكة سلكية' : d.connectionType === 'Wireless' ? 'شبكة لاسلكية' : 'USB'}</span>
              </div>` : ''}
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

  // Dedicated Cloud URL for the Standalone Technical Card:
  // Short URL (~55 chars) -> produces large, crisp, ultra-scannable QR blocks (Version 3)
  // Scans instantly in 0.05s on any mobile phone camera (iPhone / Android) without needing local Wi-Fi or IP!
  let cardBaseUrl = 'https://technical-asset-monitor.vercel.app';
  if (window.location.hostname && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1') && !window.location.hostname.startsWith('172.') && !window.location.hostname.startsWith('192.')) {
    cardBaseUrl = window.location.origin;
  }
  const cardUrl = `${cardBaseUrl}/card.html?id=${encodeURIComponent(d.id)}`;
  const qrFallbackSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(cardUrl)}`;
  
  const qrHtml = `
    <div style="text-align: center; margin-top: 1.5rem; padding: 1.25rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px;" class="print-qr-code">
      <div style="font-weight: 800; font-size: 0.95rem; margin-bottom: 0.75rem; color: #a5b4fc;">
        <i class="bi bi-qr-code-scan"></i> رمز QR للبطاقة التقنية المعتمدة
      </div>
      <div id="deviceCardQrContainer" style="display: inline-flex; align-items: center; justify-content: center; padding: 12px; background: #ffffff; border-radius: 14px; box-shadow: 0 4px 20px rgba(0,0,0,0.35); min-width: 194px; min-height: 194px;">
        <img id="deviceCardQrImg" src="${qrFallbackSrc}" alt="QR Code" style="width: 170px; height: 170px; display: block; border-radius: 4px;">
      </div>
      <div style="font-size: 0.82rem; color: var(--tx-muted, #94a3b8); margin-top: 0.65rem; font-weight: 600; line-height: 1.5;">
        امسح الرمز بكاميرا الهاتف لفتح البطاقة التقنية كاملة للجهاز فوراً (تعمل على أي هاتف وشبكة 4G/5G بدون الحاجة لـ Wi-Fi أو IP)
      </div>
      <div style="display: flex; gap: 0.5rem; justify-content: center; margin-top: 0.75rem; flex-wrap: wrap;">
        <a href="${cardUrl}" target="_blank" class="btn btn-sm btn-outline-primary" style="font-size: 0.8rem; text-decoration: none; display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.35rem 0.75rem; border-radius: 8px;">
          <i class="bi bi-box-arrow-up-right"></i> فتح البطاقة في صفحة مستقلة
        </a>
        <button type="button" onclick="navigator.clipboard.writeText('${cardUrl}').then(() => showToast('تم نسخ رابط البطاقة بنجاح'))" class="btn btn-sm btn-outline-secondary" style="font-size: 0.8rem; display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.35rem 0.75rem; border-radius: 8px;">
          <i class="bi bi-link-45deg"></i> نسخ رابط البطاقة
        </button>
      </div>
    </div>
  `;
  
  detailBody.innerHTML = detailBody.innerHTML.replace('</div>\n    </div>', qrHtml + '\n      </div>\n    </div>');

  openModal('detailsModal');

  // Generate offline QR Code locally via client-side QRCode library
  setTimeout(() => {
    const container = document.getElementById('deviceCardQrContainer');
    if (container && typeof QRCode !== 'undefined') {
      try {
        container.innerHTML = '';
        new QRCode(container, {
          text: cardUrl,
          width: 170,
          height: 170,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.M
        });
      } catch (e) {
        container.innerHTML = `<img src="${qrFallbackSrc}" alt="QR Code" style="width: 170px; height: 170px; display: block; border-radius: 4px;">`;
      }
    }
  }, 100);
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
              <button class="action-icon-btn btn-edit" onclick="openHistoryRecordModal('${h.id}')" title="تعديل"><i class="bi bi-pencil-square"></i></button>
              <button class="action-icon-btn btn-delete" onclick="deleteHistoryRecord('${h.id}')" title="حذف"><i class="bi bi-trash"></i></button>
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
  const h = currentHistoryData.find(x => String(x.id) === String(historyId));
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
  
  const monitorsDetails = [];
  const mc = parseInt(document.getElementById('monitorsCount').value) || 0;
  for (let i = 0; i < mc; i++) {
    const mfg = document.getElementById(`monitor_mfg_${i}`);
    if (mfg) {
      monitorsDetails.push({
        manufacturer: mfg.value.trim(),
        size: document.getElementById(`monitor_size_${i}`).value.trim(),
        serviceTag: document.getElementById(`monitor_tag_${i}`).value.trim()
      });
    }
  }

  const dockingDetails = [];
  const dc = parseInt(document.getElementById('dockingCount').value) || 0;
  for (let i = 0; i < dc; i++) {
    const tag = document.getElementById(`docking_tag_${i}`);
    if (tag) {
      dockingDetails.push({
        serviceTag: tag.value.trim()
      });
    }
  }

  const payload = {
    monitorsDetails: monitorsDetails,
    dockingDetails: dockingDetails,
    dockingCount: dc,
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


// ==========================================
// SYSTEM LOGS & NOTIFICATIONS
// ==========================================
let systemLogs = [];
let unreadLogsCount = 0;

async function fetchSystemLogs() {
  if (!currentUser || (currentUser.role !== 'Admin' && !(currentUser.permissions && currentUser.permissions.canViewLogs))) return;
  try {
    const res = await fetch('/api/logs', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
    if (res.ok) {
      systemLogs = await res.json();
      renderNotificationsDropdown();
    }
  } catch (error) {
    console.error('Failed to fetch system logs:', error);
  }
}

function handleNewLogEvent(logData) {
  systemLogs.unshift(logData);
  if (systemLogs.length > 100) systemLogs.pop();
  unreadLogsCount++;
  updateNotificationDot();
  renderNotificationsDropdown();
  showToast('نشاط جديد: ' + getLogActionText(logData));
}

function updateNotificationDot() {
  const dot = document.getElementById('notifDot');
  if (dot) {
    dot.style.display = unreadLogsCount > 0 ? 'block' : 'none';
  }
}

function getLogActionText(log) {
  let actionText = '';
  if (log.action === 'add') actionText = 'إضافة';
  else if (log.action === 'edit') actionText = 'تعديل';
  else if (log.action === 'delete') actionText = 'حذف';
  else if (log.action === 'import') actionText = 'استيراد';
  else if (log.action === 'restore') actionText = 'استعادة';
  else if (log.action === 'permanent_delete') actionText = 'حذف نهائي';
  else if (log.action === 'edit_permissions') actionText = 'تعديل صلاحيات';
  else if (log.action === 'delete_user') actionText = 'حذف حساب';
  
  let typeText = '';
  if (log.entityType === 'device') typeText = 'جهاز';
  else if (log.entityType === 'user') typeText = 'مستخدم';
  
  return actionText + ' ' + typeText + ' (' + log.entityName + ')';
}

function getLogIcon(action) {
  if (action === 'add') return '<i class="bi bi-plus-circle-fill notif-add"></i>';
  if (action === 'edit') return '<i class="bi bi-pencil-fill notif-edit"></i>';
  if (action === 'delete') return '<i class="bi bi-trash-fill notif-delete"></i>';
  if (action === 'import') return '<i class="bi bi-file-earmark-spreadsheet-fill notif-import"></i>';
  if (action === 'restore') return '<i class="bi bi-arrow-counterclockwise" style="color:var(--color-success)"></i>';
  if (action === 'permanent_delete') return '<i class="bi bi-x-octagon-fill" style="color:var(--color-danger)"></i>';
  if (action === 'edit_permissions') return '<i class="bi bi-person-gear" style="color:var(--color-warning)"></i>';
  if (action === 'delete_user') return '<i class="bi bi-person-x-fill" style="color:var(--color-danger)"></i>';
  return '<i class="bi bi-info-circle-fill"></i>';
}

function renderNotificationsDropdown() {
  const list = document.getElementById('notificationsList');
  if (!list) return;
  
  if (systemLogs.length === 0) {
    list.innerHTML = '<div style="padding: 10px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">لا توجد نشاطات مسجلة</div>';
    return;
  }
  
  let html = '';
  const displayLogs = systemLogs.slice(0, 10);
  displayLogs.forEach(log => {
    const date = new Date(log.timestamp).toLocaleString('ar-LY', { hour12: true, month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    html += '<div class="notif-item">' +
      '<div class="notif-icon">' + getLogIcon(log.action) + '</div>' +
      '<div class="notif-content">' +
        '<div>' + getLogActionText(log) + ' بواسطة <strong>' + log.username + '</strong></div>' +
        '<span class="notif-time">' + date + '</span>' +
      '</div>' +
    '</div>';
  });
  list.innerHTML = html;
}

function renderSystemLogsTable() {
  const tbody = document.getElementById('systemLogsTableBody');
  if (!tbody) return;
  
  if (systemLogs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">لا توجد نشاطات مسجلة</td></tr>';
    return;
  }
  
  let html = '';
  systemLogs.forEach(log => {
    const date = new Date(log.timestamp).toLocaleString('ar-LY');
    let actionHtml = '';
    if (log.action === 'add') actionHtml = '<span class="badge bg-success">إضافة</span>';
    else if (log.action === 'edit') actionHtml = '<span class="badge bg-warning text-dark">تعديل</span>';
    else if (log.action === 'delete') actionHtml = '<span class="badge bg-danger">حذف</span>';
    else if (log.action === 'import') actionHtml = '<span class="badge bg-info">استيراد</span>';
    else if (log.action === 'restore') actionHtml = '<span class="badge bg-success">استعادة</span>';
    else if (log.action === 'permanent_delete') actionHtml = '<span class="badge bg-danger">حذف نهائي</span>';
    else if (log.action === 'edit_permissions') actionHtml = '<span class="badge bg-warning text-dark">تعديل صلاحيات</span>';
    else if (log.action === 'delete_user') actionHtml = '<span class="badge bg-danger">حذف حساب</span>';
    
    let typeHtml = log.entityType === 'device' ? 'جهاز' : 'مستخدم';
    
    html += '<tr>' +
      '<td dir="ltr" style="text-align: right;">' + date + '</td>' +
      '<td>' + actionHtml + '</td>' +
      '<td>' + typeHtml + '</td>' +
      '<td>' + log.entityName + '</td>' +
      '<td>' + log.username + '</td>' +
    '</tr>';
  });
  tbody.innerHTML = html;
}

const notifBtn = document.getElementById('notificationsBtn');
const dropdown = document.getElementById('notificationsDropdown');
const viewAllBtn = document.getElementById('viewAllLogsBtn');
const closeNotifBtn = document.getElementById('closeNotifDropdownBtn');

function openDropdown() {
  if (!dropdown) return;
  dropdown.classList.add('notif-open');
  if (typeof unreadLogsCount !== 'undefined') {
    unreadLogsCount = 0;
    updateNotificationDot();
  }
}

function closeDropdown() {
  if (!dropdown) return;
  dropdown.classList.remove('notif-open');
}

if (notifBtn && dropdown) {
  notifBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (dropdown.classList.contains('notif-open')) {
      closeDropdown();
    } else {
      openDropdown();
    }
  });

  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && !notifBtn.contains(e.target)) {
      closeDropdown();
    }
  });
}

if (closeNotifBtn) {
  closeNotifBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeDropdown();
  });
}

if (viewAllBtn) {
  viewAllBtn.addEventListener('click', () => {
    closeDropdown();
    renderSystemLogsTable();
    openModal('systemLogsModal');
  });
}



// ==========================================
// RECYCLE BIN (SOFT DELETE) LOGIC
// ==========================================

const openRecycleBinBtn = document.getElementById('openRecycleBinBtn');
if (openRecycleBinBtn) {
  openRecycleBinBtn.addEventListener('click', () => {
    openModal('recycleBinModal');
    fetchRecycleBin();
  });
}

async function fetchRecycleBin() {
  const tbody = document.getElementById('recycleBinTableBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">جاري التحميل...</td></tr>';
  
  try {
    const res = await fetch('/api/devices/recycle-bin');
    if (!res.ok) {
      if (res.status === 403) throw new Error('غير مصرح');
      throw new Error('حدث خطأ أثناء جلب سلة المهملات');
    }
    const devices = await res.json();
    
    if (devices.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">سلة المهملات فارغة</td></tr>';
      return;
    }
    
    let html = '';
    devices.forEach(d => {
      const deletedAt = d.deletedAt ? new Date(d.deletedAt).toLocaleString('ar-LY') : 'غير معروف';
      html += '<tr>' +
        '<td dir="ltr" style="text-align: right;">' + deletedAt + '</td>' +
        '<td>' + (d.deletedBy || 'غير معروف') + '</td>' +
        '<td>' + (d.employeeName || '') + '</td>' +
        '<td>' + ((d.orgPath && d.orgPath.split('||')[0]) || d.department || '') + '</td>' +
        '<td>' +
          '<button class="action-btn btn-success" style="padding: 4px 8px; margin-left: 5px;" onclick="restoreDevice(\'' + d.id + '\')" title="استرجاع الجهاز"><i class="bi bi-arrow-counterclockwise"></i></button>' +
          (currentUser && currentUser.role === 'Admin' ? '<button class="action-btn btn-danger" style="padding: 4px 8px;" onclick="permanentDeleteDevice(\'' + d.id + '\')" title="حذف نهائي"><i class="bi bi-trash-fill"></i></button>' : '') +
        '</td>' +
      '</tr>';
    });
    tbody.innerHTML = html;
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--danger-color);">' + error.message + '</td></tr>';
  }
}

window.restoreDevice = async function(id) {
  if (!confirm('هل أنت متأكد من استرجاع هذا الجهاز؟')) return;
  try {
    const res = await fetch('/api/devices/' + id + '/restore', { method: 'POST' });
    const data = await res.json();

    if (res.ok) {
      showToast(data.message);
      fetchRecycleBin();
      fetchDevices();
    } else {
      alert(data.error);
    }
  } catch (error) {
    alert('حدث خطأ أثناء الاسترجاع');
  }
};

window.permanentDeleteDevice = async function(id) {
  if (!confirm('تحذير: سيتم مسح هذا الجهاز وتاريخه نهائياً ولا يمكن التراجع عن ذلك! هل أنت متأكد؟')) return;
  try {
    const res = await fetch('/api/devices/' + id + '/permanent', { method: 'DELETE' });
    const data = await res.json();

    if (res.ok) {
      showToast(data.message);
      fetchRecycleBin();
    } else {
      alert(data.error);
    }
  } catch (error) {
    alert('حدث خطأ أثناء الحذف النهائي');
  }
};


function generateMonitorForms() {
  const count = parseInt(document.getElementById('monitorsCount').value) || 0;
  const container = document.getElementById('monitorsDetailsContainer');
  if (!container) return;
  
  const existingData = [];
  const currentForms = container.querySelectorAll('.monitor-form');
  currentForms.forEach((form, index) => {
    existingData.push({
      manufacturer: document.getElementById(`monitor_mfg_${index}`).value,
      size: document.getElementById(`monitor_size_${index}`).value,
      serviceTag: document.getElementById(`monitor_tag_${index}`).value
    });
  });

  container.innerHTML = '';
  if (count <= 0) return;

  for (let i = 0; i < count; i++) {
    const data = existingData[i] || { manufacturer: '', size: '', serviceTag: '' };
    const div = document.createElement('div');
    div.className = 'monitor-form form-group';
    div.style.background = 'var(--bg-card)';
    div.style.padding = '10px';
    div.style.borderRadius = '6px';
    div.style.border = '1px solid var(--border)';
    
    div.innerHTML = `
      <h5 style="margin-top: 0; margin-bottom: 10px; font-size: 0.9rem; color: var(--text-muted);">تفاصيل الشاشة رقم ${i + 1}</h5>
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
        <div>
          <label style="font-size: 0.8rem; margin-bottom: 4px;">الشركة المصنعة</label>
          <input type="text" id="monitor_mfg_${i}" placeholder="مثال: Dell" value="${data.manufacturer}" style="padding: 6px; font-size: 0.85rem;">
        </div>
        <div>
          <label style="font-size: 0.8rem; margin-bottom: 4px;">الحجم</label>
          <input type="text" id="monitor_size_${i}" placeholder="مثال: 24 بوصة" value="${data.size}" style="padding: 6px; font-size: 0.85rem;">
        </div>
        <div>
          <label style="font-size: 0.8rem; margin-bottom: 4px;">السيرفز تاق</label>
          <input type="text" id="monitor_tag_${i}" placeholder="SN أو Service Tag" value="${data.serviceTag}" style="padding: 6px; font-size: 0.85rem;">
        </div>
      </div>
    `;
    container.appendChild(div);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const m = document.getElementById('monitorsCount');
  if (m) m.addEventListener('input', generateMonitorForms);
});


function generateDockingForms() {
  const count = parseInt(document.getElementById('dockingCount').value) || 0;
  const container = document.getElementById('dockingDetailsContainer');
  if (!container) return;
  
  const existingData = [];
  const currentForms = container.querySelectorAll('.docking-form');
  currentForms.forEach((form, index) => {
    existingData.push({
      
      
      serviceTag: document.getElementById(`docking_tag_${index}`).value
    });
  });

  container.innerHTML = '';
  if (count <= 0) return;

  for (let i = 0; i < count; i++) {
    const data = existingData[i] || { serviceTag: '' };
    const div = document.createElement('div');
    div.className = 'docking-form form-group';
    div.style.background = 'var(--bg-card)';
    div.style.padding = '10px';
    div.style.borderRadius = '6px';
    div.style.border = '1px solid var(--border)';
    
    div.innerHTML = `
      <h5 style="margin-top: 0; margin-bottom: 10px; font-size: 0.9rem; color: var(--text-muted);">تفاصيل الدوك ستيشن رقم ${i + 1}</h5>
      <div style="display: flex; flex-direction: column; gap: 5px;">
        <label style="font-size: 0.8rem; margin-bottom: 4px;">السيرفز تاق</label>
        <input type="text" id="docking_tag_${i}" placeholder="SN أو Service Tag" value="${data.serviceTag}" style="padding: 6px; font-size: 0.85rem; width: 100%;">
      </div>
    `;
    container.appendChild(div);
  }
}


const d_global = document.getElementById('dockingCount');
if (d_global) {
  d_global.addEventListener('input', generateDockingForms);
  d_global.addEventListener('change', generateDockingForms);
}

// ==========================================
// 2FA SETUP (Microsoft Authenticator)
// ==========================================
let current2FASecret = '';

async function openTwoFactorModal() {
  openModal('twoFactorModal');
  const activeView = document.getElementById('twoFactorActiveView');
  const setupView = document.getElementById('twoFactorSetupView');
  const badge = document.getElementById('twoFactorStatusBadge');

  badge.innerHTML = '<span class="badge" style="background: rgba(99,102,241,0.15); color: #818cf8;">جاري التحقق من حالة الأمان...</span>';

  try {
    const res = await fetch('/api/auth/2fa/setup', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل جلب إعدادات الأمان');

    if (data.alreadyEnabled) {
      activeView.style.display = 'block';
      setupView.style.display = 'none';
      badge.innerHTML = '<span class="badge" style="background: rgba(16,185,129,0.15); color: #10b981; font-weight: bold; font-size: 0.9rem; padding: 6px 12px;"><i class="bi bi-shield-check"></i> التحقق بخطوتين: مفعل</span>';
    } else {
      activeView.style.display = 'none';
      setupView.style.display = 'block';
      badge.innerHTML = '<span class="badge" style="background: rgba(239,68,68,0.15); color: #ef4444; font-weight: bold; font-size: 0.9rem; padding: 6px 12px;"><i class="bi bi-shield-exclamation"></i> التحقق بخطوتين: غير مفعل</span>';

      current2FASecret = data.secret;
      document.getElementById('twoFactorQrCode').src = data.qrCodeUrl;
      document.getElementById('twoFactorSecretCode').textContent = data.secret;
      document.getElementById('verify2FAToken').value = '';
    }
  } catch (err) {
    showToast(err.message, true);
  }
}

function init2FAHandlers() {
  const btn = document.getElementById('open2FAModalBtn');
  if (btn) btn.addEventListener('click', openTwoFactorModal);

  const verifyForm = document.getElementById('verify2FAForm');
  if (verifyForm) {
    verifyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const token = document.getElementById('verify2FAToken').value.trim();
      if (token.length !== 6) return showToast('الرجاء إدخال رمز الـ 6 أرقام بالكامل', true);

      const confirmBtn = document.getElementById('confirm2FABtn');
      confirmBtn.disabled = true;

      try {
        const res = await fetch('/api/auth/2fa/enable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ secret: current2FASecret, token })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'فشل التفعيل');

        showToast(data.message || 'تم تفعيل الحماية بنجاح!');
        openTwoFactorModal(); // Refresh view
      } catch (err) {
        showToast(err.message, true);
      } finally {
        confirmBtn.disabled = false;
      }
    });
  }

  const disableBtn = document.getElementById('disable2FABtn');
  if (disableBtn) {
    disableBtn.addEventListener('click', async () => {
      if (!confirm('هل أنت متأكد من رغبتك في إلغاء التحقق بخطوتين؟ سيقل مستوى أمان حسابك.')) return;
      try {
        const res = await fetch('/api/auth/2fa/disable', { method: 'POST' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'فشل الإلغاء');

        showToast('تم إلغاء تفعيل التحقق بخطوتين بنجاح');
        openTwoFactorModal();
      } catch (err) {
        showToast(err.message, true);
      }
    });
  }
}

// Call on init
document.addEventListener('DOMContentLoaded', init2FAHandlers);
