/* ========================================
   Grace Gate Check-In — Pickup Verification
   ======================================== */

// --- Session ---
// Reads from the same sessionStorage as the check-in page.
function loadCheckinSession() {
  try {
    const raw = sessionStorage.getItem('cci_checkins');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveCheckinSession(session) {
  sessionStorage.setItem('cci_checkins', JSON.stringify(session));
}

let checkinSession = loadCheckinSession();
let resetTimer = null;

// --- Init ---
function initPickup() {
  if (!requirePairing()) return;

  const count = Object.keys(checkinSession).length;
  updateSessionInfo('Sunday AM Service', count);
  renderPickupForm();
}

// --- Render ---
function renderPickupForm() {
  const app = document.getElementById('pickup-app');
  if (!app) return;

  app.innerHTML = `
    <div class="pickup-heading">
      <h1>Pickup Verification</h1>
      <p>Enter the 4-character security code to release children</p>
    </div>

    <div class="code-input-wrapper">
      <input type="text" class="code-input" id="pickupCodeInput" maxlength="4" placeholder="----" autocomplete="off" autocapitalize="characters" spellcheck="false">
    </div>

    <div class="pickup-results" id="pickup-results"></div>
  `;

  const input = document.getElementById('pickupCodeInput');
  if (input) {
    input.focus();
    input.addEventListener('input', onCodeInput);
  }
}

function onCodeInput(e) {
  const input = e.target;
  input.value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');

  const code = input.value;
  const resultsEl = document.getElementById('pickup-results');
  if (!resultsEl) return;

  if (code.length < 4) {
    resultsEl.innerHTML = '';
    return;
  }

  // Refresh session in case check-in page added records
  checkinSession = loadCheckinSession();

  // Find matches
  const matches = [];
  for (const [memberId, session] of Object.entries(checkinSession)) {
    if (session.code === code) {
      matches.push({ memberId, ...session });
    }
  }

  if (matches.length === 0) {
    resultsEl.innerHTML = `
      <div class="card" style="text-align: center; padding: 32px;">
        <div style="font-size: 18px; font-weight: 600; color: var(--color-danger); margin-bottom: 6px;">Code Not Found</div>
        <div class="text-muted text-sm">No children checked in with code "${escHtml(code)}"</div>
      </div>
    `;
    return;
  }

  resultsEl.innerHTML = `
    ${matches.map((m) => `
      <div class="pickup-child-card">
        <div class="pickup-child-info">
          <div class="pickup-child-name">${escHtml(m.memberName)}</div>
          <div class="pickup-child-detail">
            ${m.classroom ? `<span>${escHtml(m.classroom)}</span>` : ''}
            ${m.checkedInAt ? `<span>Checked in ${formatTime(new Date(m.checkedInAt))}</span>` : ''}
            ${m.allergies ? `<span class="badge badge-danger" style="margin-left: 2px;">${escHtml(m.allergies)}</span>` : ''}
            ${m.medicalNotes ? `<span class="badge badge-info" style="margin-left: 2px;">${escHtml(m.medicalNotes)}</span>` : ''}
          </div>
        </div>
        <div>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--color-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="10" cy="10" r="8"/>
            <path d="M6 10.5l2.5 2.5 5.5-5.5"/>
          </svg>
        </div>
      </div>
    `).join('')}
    <div style="text-align: center; margin-top: 20px;">
      <button class="btn btn-primary btn-lg" id="releaseAllBtn">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 9l-6 6-6-6"/>
          <path d="M9 15V3"/>
        </svg>
        Release All (${matches.length} ${matches.length === 1 ? 'child' : 'children'})
      </button>
    </div>
  `;

  const releaseBtn = document.getElementById('releaseAllBtn');
  if (releaseBtn) {
    releaseBtn.addEventListener('click', () => releaseChildren(code, matches));
  }
}

function releaseChildren(code, matches) {
  // Remove from session
  const names = matches.map((m) => m.memberName);
  for (const m of matches) {
    delete checkinSession[m.memberId];
  }
  saveCheckinSession(checkinSession);
  updateSessionInfo('Sunday AM Service', Object.keys(checkinSession).length);

  // Show success
  const app = document.getElementById('pickup-app');
  if (!app) return;

  app.innerHTML = `
    <div class="pickup-success">
      <div class="pickup-success-icon">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 21l7 7 13-15"/>
        </svg>
      </div>
      <h2>Goodbye!</h2>
      <p>The following children have been released:</p>
      <div class="names">${names.map((n) => escHtml(n)).join(', ')}</div>
    </div>
  `;

  // Auto-reset after 5 seconds
  if (resetTimer) clearTimeout(resetTimer);
  resetTimer = setTimeout(() => {
    renderPickupForm();
  }, 5000);
}

// --- Init ---
document.addEventListener('DOMContentLoaded', initPickup);
