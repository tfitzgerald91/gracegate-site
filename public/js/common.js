/* ========================================
   Church Check-In — Shared JavaScript
   ======================================== */

// --- State ---
const state = {
  kioskDeviceId: localStorage.getItem('ck_kioskDeviceId') || null,
  kioskName: localStorage.getItem('ck_kioskName') || null,
  pairingCode: localStorage.getItem('ck_pairingCode') || null,
};

// --- Pairing ---
function isPaired() {
  return !!(state.kioskDeviceId && state.kioskName && state.pairingCode);
}

function requirePairing() {
  if (!isPaired() && !window.location.pathname.includes('pair')) {
    window.location.href = '/pair.html';
    return false;
  }
  return true;
}

function redirectIfPaired() {
  if (isPaired() && window.location.pathname.includes('pair')) {
    window.location.href = '/dashboard';
    return true;
  }
  return false;
}

function clearPairing() {
  localStorage.removeItem('ck_kioskDeviceId');
  localStorage.removeItem('ck_kioskName');
  localStorage.removeItem('ck_pairingCode');
  state.kioskDeviceId = null;
  state.kioskName = null;
  state.pairingCode = null;
}

// --- CloudKit (placeholder) ---
// Will be replaced with real CloudKit JS SDK initialization once
// the iCloud.com.churchcheckin.app container is provisioned.
const CloudKitService = {
  _initialized: false,

  init() {
    if (this._initialized) return;
    this._initialized = true;
    console.log('[CloudKit] Stub initialized — container: iCloud.com.churchcheckin.app (Production)');
  },

  // Stub: query records
  async query(recordType, filters) {
    console.log(`[CloudKit] Stub query: ${recordType}`, filters);
    return [];
  },

  // Stub: save record
  async save(recordType, fields) {
    console.log(`[CloudKit] Stub save: ${recordType}`, fields);
    return { recordName: 'stub-' + Date.now() };
  },
};

// --- HTML Escaping ---
function escHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// --- Date / Time Formatting ---
function relativeTime(date) {
  if (!(date instanceof Date)) date = new Date(date);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);

  if (diffSec < 10) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr}h ago`;

  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return 'Yesterday';
  return `${diffDay}d ago`;
}

function formatDate(date) {
  if (!(date instanceof Date)) date = new Date(date);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(date) {
  if (!(date instanceof Date)) date = new Date(date);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// --- Polling ---
let _pollingInterval = null;

function startPolling(fn, intervalMs) {
  stopPolling();
  fn(); // Run immediately
  _pollingInterval = setInterval(fn, intervalMs);
}

function stopPolling() {
  if (_pollingInterval) {
    clearInterval(_pollingInterval);
    _pollingInterval = null;
  }
}

// Pause polling when tab is hidden
document.addEventListener('visibilitychange', () => {
  // Subclasses should handle resume via their own startPolling call
  if (document.hidden) {
    stopPolling();
  }
});

// --- Utility ---
function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return document.querySelectorAll(selector);
}

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

// Get today's date key in YYYY-MM-DD format (local timezone)
function todayDateKey() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
