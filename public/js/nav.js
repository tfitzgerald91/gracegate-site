/* ========================================
   Church Check-In — Sidebar Navigation
   ======================================== */

function navItem(href, label, iconId, currentPath) {
  // Normalize paths for comparison
  const isActive =
    (href === '/' && (currentPath === '/' || currentPath === '/index.html')) ||
    (href !== '/' && currentPath.startsWith(href));

  const activeClass = isActive ? ' active' : '';
  const icon = navIcon(iconId);

  return `<a href="${href}" class="nav-item${activeClass}">
    <span class="nav-icon">${icon}</span>
    <span>${label}</span>
  </a>`;
}

function navIcon(id) {
  const icons = {
    'grid-2x2': `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <rect x="1.5" y="1.5" width="6" height="6" rx="1.2"/>
      <rect x="10.5" y="1.5" width="6" height="6" rx="1.2"/>
      <rect x="1.5" y="10.5" width="6" height="6" rx="1.2"/>
      <rect x="10.5" y="10.5" width="6" height="6" rx="1.2"/>
    </svg>`,
    'people': `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="6.5" cy="5" r="2.5"/>
      <path d="M1.5 15.5v-1c0-2.2 1.8-4 4-4h2c2.2 0 4 1.8 4 4v1"/>
      <circle cx="13" cy="6" r="2"/>
      <path d="M13 10.5c1.7 0 3 1.3 3 3v2"/>
    </svg>`,
    'checkmark-circle': `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="9" cy="9" r="7.5"/>
      <path d="M5.5 9.5l2 2 5-5"/>
    </svg>`,
    'key': `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11.5" cy="6.5" r="4"/>
      <path d="M8.5 9.5L3 15"/>
      <path d="M3 15l2.5 0"/>
      <path d="M3 15l0-2.5"/>
      <path d="M6 12l1.5 0"/>
    </svg>`,
    'chart-bar': `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="9" width="3" height="7" rx="0.8"/>
      <rect x="7.5" y="5" width="3" height="11" rx="0.8"/>
      <rect x="13" y="2" width="3" height="14" rx="0.8"/>
    </svg>`,
    'gear': `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="9" cy="9" r="2.5"/>
      <path d="M9 1.5l.9 2.1a5.5 5.5 0 0 1 1.8 1l2.1-.3 1.5 2.6-1.2 1.8a5.5 5.5 0 0 1 0 2.1l1.2 1.8-1.5 2.6-2.1-.3a5.5 5.5 0 0 1-1.8 1L9 16.5l-.9-2.1a5.5 5.5 0 0 1-1.8-1l-2.1.3-1.5-2.6 1.2-1.8a5.5 5.5 0 0 1 0-2.1L2.7 5.4l1.5-2.6 2.1.3a5.5 5.5 0 0 1 1.8-1L9 1.5z"/>
    </svg>`,
  };
  return icons[id] || '';
}

function renderNav() {
  const nav = document.getElementById('nav-container');
  if (!nav) return;

  const currentPath = window.location.pathname;

  nav.innerHTML = `
    <div class="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white" stroke="none">
            <path d="M12 2L8 8H4l8 14 8-14h-4L12 2zM12 4.5L14.5 8h-5L12 4.5z"/>
            <rect x="11" y="16" width="2" height="4" rx="0.5"/>
            <rect x="7" y="20" width="10" height="2" rx="0.5"/>
          </svg>
        </div>
        <div class="sidebar-title">Check-In</div>
      </div>
      <nav class="sidebar-nav">
        ${navItem('/', 'Dashboard', 'grid-2x2', currentPath)}
        ${navItem('/families', 'Families', 'people', currentPath)}
        ${navItem('/checkin', 'Check In', 'checkmark-circle', currentPath)}
        ${navItem('/pickup', 'Pickup', 'key', currentPath)}
        ${navItem('/reports', 'Reports', 'chart-bar', currentPath)}
        ${navItem('/settings', 'Settings', 'gear', currentPath)}
      </nav>
      <div class="session-info" id="session-info">
        <div class="session-dot" id="session-dot"></div>
        <div class="session-text">
          <div class="session-name" id="session-name">No active session</div>
          <div class="session-count" id="session-count">0 checked in</div>
        </div>
      </div>
    </div>
  `;
}

function updateSessionInfo(name, count) {
  const dot = document.getElementById('session-dot');
  const nameEl = document.getElementById('session-name');
  const countEl = document.getElementById('session-count');
  if (!dot || !nameEl || !countEl) return;

  if (name) {
    dot.classList.add('active');
    nameEl.textContent = name;
    countEl.textContent = `${count || 0} checked in`;
  } else {
    dot.classList.remove('active');
    nameEl.textContent = 'No active session';
    countEl.textContent = '0 checked in';
  }
}

// Auto-render on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  renderNav();
});
