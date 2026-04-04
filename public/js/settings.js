/* ========================================
   Church Check-In — Settings
   ======================================== */

// --- Defaults ---
const defaultPresets = ['Sunday AM Service', 'Sunday PM Service', 'Wednesday Night', 'Special Event', 'VBS'];
const defaultClassrooms = ['Nursery', 'Preschool', 'K-2nd Grade', '3rd-5th Grade'];

const LS_PRESETS = 'ck_sessionPresets';
const LS_CLASSROOMS = 'ck_classrooms';

// --- Persistence ---
function loadPresets() {
  try {
    const stored = localStorage.getItem(LS_PRESETS);
    return stored ? JSON.parse(stored) : [...defaultPresets];
  } catch {
    return [...defaultPresets];
  }
}

function savePresets(presets) {
  localStorage.setItem(LS_PRESETS, JSON.stringify(presets));
}

function loadClassrooms() {
  try {
    const stored = localStorage.getItem(LS_CLASSROOMS);
    return stored ? JSON.parse(stored) : [...defaultClassrooms];
  } catch {
    return [...defaultClassrooms];
  }
}

function saveClassrooms(classrooms) {
  localStorage.setItem(LS_CLASSROOMS, JSON.stringify(classrooms));
}

// --- Render Connection Section ---
function renderConnectionSection() {
  const container = document.getElementById('connection-section');
  if (!container) return;

  const kioskName = state.kioskName || '—';
  const pairingCode = state.pairingCode || '——————';
  const deviceId = state.kioskDeviceId || '—';

  container.innerHTML = `
    <div class="card-header">
      <h2>Connected Kiosk</h2>
      <span class="badge badge-success">Connected</span>
    </div>
    <div class="card-body">
      <div class="settings-row" style="margin-bottom: 24px;">
        <div class="settings-label">Kiosk Name</div>
        <div class="settings-value" style="font-size: 18px; font-weight: var(--font-weight-semibold); color: var(--color-text);">
          ${escHtml(kioskName)}
        </div>
      </div>
      <div class="settings-row" style="margin-bottom: 24px;">
        <div class="settings-label">Pairing Code</div>
        <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap;">
          <div class="pairing-code-display">${escHtml(pairingCode)}</div>
          <button class="btn btn-secondary btn-sm" id="copyCodeBtn">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4.5" y="4.5" width="7" height="7" rx="1"/>
              <path d="M1.5 8.5V2.5A1 1 0 0 1 2.5 1.5h6"/>
            </svg>
            Copy
          </button>
        </div>
      </div>
      <div class="settings-row" style="margin-bottom: 0;">
        <div class="settings-label">Device ID</div>
        <div style="font-size: 12px; font-family: monospace; color: var(--color-text-muted);">${escHtml(deviceId)}</div>
      </div>
      <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--color-border-light);">
        <button class="btn btn-danger btn-sm" id="disconnectBtn">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9.5 4.5L13 7l-3.5 2.5"/>
            <path d="M13 7H5"/>
            <path d="M5 2H2.5A1.5 1.5 0 0 0 1 3.5v7A1.5 1.5 0 0 0 2.5 12H5"/>
          </svg>
          Disconnect Kiosk
        </button>
        <p class="text-sm text-muted" style="margin-top: 10px;">Disconnecting will clear your pairing and return you to the pair screen.</p>
      </div>
    </div>
  `;

  document.getElementById('copyCodeBtn')?.addEventListener('click', () => {
    navigator.clipboard.writeText(state.pairingCode || '').then(() => {
      const btn = document.getElementById('copyCodeBtn');
      if (btn) {
        btn.textContent = 'Copied!';
        setTimeout(() => {
          btn.innerHTML = `
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4.5" y="4.5" width="7" height="7" rx="1"/>
              <path d="M1.5 8.5V2.5A1 1 0 0 1 2.5 1.5h6"/>
            </svg>
            Copy
          `;
        }, 1800);
      }
    });
  });

  document.getElementById('disconnectBtn')?.addEventListener('click', () => {
    const confirmed = confirm('Are you sure you want to disconnect from this kiosk? You will need to re-enter a pairing code.');
    if (!confirmed) return;
    clearPairing();
    window.location.href = '/pair.html';
  });
}

// --- Render List Section (shared for presets + classrooms) ---
function renderListSection({ containerId, title, subtitle, items, onAdd, onRemove }) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="card-header">
      <div>
        <h2>${escHtml(title)}</h2>
        ${subtitle ? `<div style="font-size: 13px; color: var(--color-text-muted); margin-top: 2px;">${escHtml(subtitle)}</div>` : ''}
      </div>
      <span class="card-count">${items.length} item${items.length !== 1 ? 's' : ''}</span>
    </div>
    <div class="card-body">
      <ul class="settings-list" id="${escHtml(containerId)}-list">
        ${items.map((item, index) => `
          <li class="settings-list-item" data-index="${index}">
            <span class="settings-list-item-label">${escHtml(item)}</span>
            <button class="settings-list-remove-btn" data-index="${index}" aria-label="Remove ${escHtml(item)}">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 2l10 10M12 2L2 12"/>
              </svg>
            </button>
          </li>
        `).join('')}
      </ul>
      ${items.length === 0 ? `
        <div class="empty-state" style="padding: 20px 0;">
          <div class="empty-state-text">No items yet. Add one below.</div>
        </div>
      ` : ''}
      <div class="settings-add-row" style="margin-top: ${items.length > 0 ? '16px' : '0'};">
        <input
          type="text"
          id="${escHtml(containerId)}-input"
          class="settings-add-input"
          placeholder="Add new…"
          maxlength="60"
        >
        <button class="btn btn-primary btn-sm" id="${escHtml(containerId)}-add-btn">Add</button>
      </div>
    </div>
  `;

  // Remove buttons
  container.querySelectorAll('.settings-list-remove-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index, 10);
      onRemove(index);
    });
  });

  // Add button + Enter key
  const input = document.getElementById(`${containerId}-input`);
  const addBtn = document.getElementById(`${containerId}-add-btn`);

  function handleAdd() {
    const value = input.value.trim();
    if (!value) return;
    onAdd(value);
    input.value = '';
    input.focus();
  }

  addBtn?.addEventListener('click', handleAdd);
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleAdd();
  });
}

// --- Render Presets Section ---
function renderPresetsSection() {
  const presets = loadPresets();
  renderListSection({
    containerId: 'presets-section',
    title: 'Session Presets',
    subtitle: 'Quick-select names when starting a new session',
    items: presets,
    onAdd(value) {
      const updated = loadPresets();
      if (!updated.includes(value)) {
        updated.push(value);
        savePresets(updated);
      }
      renderPresetsSection();
    },
    onRemove(index) {
      const updated = loadPresets();
      updated.splice(index, 1);
      savePresets(updated);
      renderPresetsSection();
    },
  });
}

// --- Render Classrooms Section ---
function renderClassroomsSection() {
  const classrooms = loadClassrooms();
  renderListSection({
    containerId: 'classrooms-section',
    title: 'Classrooms',
    subtitle: 'Available rooms for assigning children during check-in',
    items: classrooms,
    onAdd(value) {
      const updated = loadClassrooms();
      if (!updated.includes(value)) {
        updated.push(value);
        saveClassrooms(updated);
      }
      renderClassroomsSection();
    },
    onRemove(index) {
      const updated = loadClassrooms();
      updated.splice(index, 1);
      saveClassrooms(updated);
      renderClassroomsSection();
    },
  });
}

// --- Render About Section ---
function renderAboutSection() {
  const container = document.getElementById('about-section');
  if (!container) return;

  container.innerHTML = `
    <div class="card-header">
      <h2>About</h2>
    </div>
    <div class="card-body">
      <div class="settings-row" style="margin-bottom: 16px;">
        <div class="settings-label">App Version</div>
        <div class="settings-value">1.0.0 (POC)</div>
      </div>
      <div class="settings-row" style="margin-bottom: 16px;">
        <div class="settings-label">Platform</div>
        <div class="settings-value">Web Dashboard</div>
      </div>
      <div class="settings-row" style="margin-bottom: 0;">
        <div class="settings-label">Links</div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <a href="#" class="settings-link">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="7" cy="7" r="5.5"/>
              <path d="M7 4.5v3l2 1"/>
            </svg>
            Support &amp; Documentation
          </a>
          <a href="#" class="settings-link">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M7 1L8.5 4.5l3.5.5-2.5 2.5.5 3.5L7 9.5 4 11l.5-3.5L2 5l3.5-.5L7 1z"/>
            </svg>
            Rate the App
          </a>
          <a href="#" class="settings-link">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="1" y="1" width="12" height="12" rx="2"/>
              <path d="M4.5 7h5M7 4.5v5"/>
            </svg>
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  `;
}

// --- Init ---
function initSettings() {
  if (!requirePairing()) return;

  // Inject settings-specific styles
  if (!document.getElementById('settings-styles')) {
    const style = document.createElement('style');
    style.id = 'settings-styles';
    style.textContent = `
      .pairing-code-display {
        font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
        font-size: 28px;
        font-weight: var(--font-weight-bold);
        letter-spacing: 6px;
        color: var(--color-primary-dark);
        background: var(--color-primary-light);
        padding: 10px 20px;
        border-radius: var(--radius-md);
        user-select: all;
      }

      .settings-row {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        flex-wrap: wrap;
      }

      .settings-label {
        font-size: 12px;
        font-weight: var(--font-weight-semibold);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--color-text-muted);
        min-width: 120px;
        padding-top: 3px;
        flex-shrink: 0;
      }

      .settings-value {
        font-size: 15px;
        color: var(--color-text);
      }

      .settings-list {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 0;
        border: 1.5px solid var(--color-border-light);
        border-radius: var(--radius-sm);
        overflow: hidden;
      }

      .settings-list-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 14px;
        border-bottom: 1px solid var(--color-border-light);
        background: var(--color-surface);
        transition: background 0.12s ease;
      }

      .settings-list-item:last-child {
        border-bottom: none;
      }

      .settings-list-item:hover {
        background: var(--color-surface-hover);
      }

      .settings-list-item-label {
        font-size: 14px;
        color: var(--color-text);
      }

      .settings-list-remove-btn {
        width: 28px;
        height: 28px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-text-muted);
        transition: all 0.12s ease;
        flex-shrink: 0;
      }

      .settings-list-remove-btn:hover {
        background: var(--color-danger-light);
        color: var(--color-danger);
      }

      .settings-add-row {
        display: flex;
        gap: 10px;
        align-items: center;
      }

      .settings-add-input {
        flex: 1;
        padding: 9px 13px;
        border: 1.5px solid var(--color-border);
        border-radius: var(--radius-sm);
        font-size: 14px;
        color: var(--color-text);
        background: var(--color-surface);
        outline: none;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
      }

      .settings-add-input:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(41, 185, 187, 0.15);
      }

      .settings-add-input::placeholder {
        color: var(--color-text-muted);
      }

      .settings-link {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        font-size: 14px;
        color: var(--color-primary-dark);
        font-weight: var(--font-weight-medium);
        text-decoration: underline;
        text-underline-offset: 3px;
      }

      .settings-link:hover {
        opacity: 0.75;
      }
    `;
    document.head.appendChild(style);
  }

  renderConnectionSection();
  renderPresetsSection();
  renderClassroomsSection();
  renderAboutSection();
}

document.addEventListener('DOMContentLoaded', initSettings);
