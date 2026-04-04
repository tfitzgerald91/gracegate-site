/* ========================================
   Grace Gate Check-In — Check In Page
   ======================================== */

// --- Mock Families (same data as families page) ---
const mockFamilies = [
  { id: '1', lastName: 'Smith', phone: '555-0101', members: [
    { id: 'm1', firstName: 'John', lastName: 'Smith', role: 'Parent' },
    { id: 'm2', firstName: 'Sarah', lastName: 'Smith', role: 'Parent' },
    { id: 'm3', firstName: 'Emma', lastName: 'Smith', role: 'Child', classroom: 'K-2nd Grade', allergies: 'Peanuts', age: 7 },
    { id: 'm4', firstName: 'Liam', lastName: 'Smith', role: 'Child', classroom: 'Preschool', age: 4 },
  ]},
  { id: '2', lastName: 'Johnson', phone: '555-0102', members: [
    { id: 'm5', firstName: 'Mike', lastName: 'Johnson', role: 'Parent' },
    { id: 'm6', firstName: 'Olivia', lastName: 'Johnson', role: 'Child', classroom: '3rd-5th Grade', age: 10 },
    { id: 'm7', firstName: 'Noah', lastName: 'Johnson', role: 'Child', classroom: 'Nursery', age: 3, medicalNotes: 'Needs inhaler' },
  ]},
  { id: '3', lastName: 'Williams', phone: '555-0103', members: [
    { id: 'm8', firstName: 'David', lastName: 'Williams', role: 'Parent' },
    { id: 'm9', firstName: 'Lisa', lastName: 'Williams', role: 'Parent' },
    { id: 'm10', firstName: 'Ava', lastName: 'Williams', role: 'Child', classroom: 'K-2nd Grade', age: 6 },
    { id: 'm11', firstName: 'Mia', lastName: 'Williams', role: 'Child', classroom: 'Nursery', age: 2, allergies: 'Dairy' },
    { id: 'm12', firstName: 'Ethan', lastName: 'Williams', role: 'Child', classroom: '3rd-5th Grade', age: 9 },
  ]},
  { id: '4', lastName: 'Garcia', phone: '555-0104', members: [
    { id: 'm13', firstName: 'Maria', lastName: 'Garcia', role: 'Parent' },
    { id: 'm14', firstName: 'Sofia', lastName: 'Garcia', role: 'Child', classroom: 'K-2nd Grade', age: 5 },
  ]},
  { id: '5', lastName: 'Davis', phone: '555-0105', members: [
    { id: 'm15', firstName: 'James', lastName: 'Davis', role: 'Parent' },
    { id: 'm16', firstName: 'Amy', lastName: 'Davis', role: 'Guardian' },
    { id: 'm17', firstName: 'Lucas', lastName: 'Davis', role: 'Child', classroom: '3rd-5th Grade', age: 8 },
    { id: 'm18', firstName: 'Ella', lastName: 'Davis', role: 'Child', classroom: 'Nursery', age: 1 },
  ]},
];

// --- Session State (tracks who is checked in) ---
// Stored in sessionStorage so it persists across page navigations but not browser close.
// In production this would be CloudKit records.
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

// session: { memberId: { code, checkedInAt, memberName, classroom } }
let checkinSession = loadCheckinSession();

// --- Helpers ---
function generateSecurityCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function getFamilyCode(familyId) {
  // Check if any child in the family already has a code this session
  const family = mockFamilies.find((f) => f.id === familyId);
  if (!family) return generateSecurityCode();

  const children = family.members.filter((m) => m.role === 'Child');
  for (const child of children) {
    if (checkinSession[child.id]) {
      return checkinSession[child.id].code;
    }
  }
  return generateSecurityCode();
}

// --- Init ---
function initCheckin() {
  if (!requirePairing()) return;

  const count = Object.keys(checkinSession).length;
  updateSessionInfo('Sunday AM Service', count);
  renderResults('');
  bindEvents();
}

// --- Search & Render ---
function bindEvents() {
  const searchInput = document.getElementById('checkinSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderResults(searchInput.value.trim());
    });
    // Auto-focus search input
    searchInput.focus();
  }

  // Event delegation for check-in buttons
  document.addEventListener('click', (e) => {
    const checkinBtn = e.target.closest('[data-checkin-member]');
    if (checkinBtn) {
      const memberId = checkinBtn.getAttribute('data-checkin-member');
      const familyId = checkinBtn.getAttribute('data-family-id');
      checkInChild(memberId, familyId);
      return;
    }

    const checkinAllBtn = e.target.closest('[data-checkin-all]');
    if (checkinAllBtn) {
      const familyId = checkinAllBtn.getAttribute('data-checkin-all');
      checkInAllChildren(familyId);
      return;
    }

    const printBtn = e.target.closest('[data-print-label]');
    if (printBtn) {
      printLabel(printBtn.getAttribute('data-print-label'));
      return;
    }
  });
}

function renderResults(query) {
  const container = document.getElementById('checkin-results');
  if (!container) return;

  if (!query) {
    // Show prompt to search
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.4">
            <circle cx="21" cy="21" r="14"/>
            <path d="M42 42l-10-10"/>
          </svg>
        </div>
        <div class="empty-state-title">Search for a family</div>
        <div class="empty-state-text">Type a last name or phone number to find families and check in children</div>
      </div>
    `;
    return;
  }

  const q = query.toLowerCase();
  const matches = mockFamilies.filter((f) => {
    if (f.lastName.toLowerCase().includes(q)) return true;
    if (f.phone.includes(q)) return true;
    return f.members.some((m) => m.firstName.toLowerCase().includes(q));
  });

  if (matches.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.4">
            <circle cx="17" cy="13" r="6"/>
            <path d="M4 40v-3c0-5.5 4.5-10 10-10h6c5.5 0 10 4.5 10 10v3"/>
            <path d="M36 18l8 8M44 18l-8 8"/>
          </svg>
        </div>
        <div class="empty-state-title">No families found</div>
        <div class="empty-state-text">No results for "${escHtml(query)}". Try a different name or phone number.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = matches.map((f) => renderFamilyCard(f)).join('');
}

function renderFamilyCard(family) {
  const children = family.members.filter((m) => m.role === 'Child');
  const parents = family.members.filter((m) => m.role !== 'Child');
  const uncheckedChildren = children.filter((c) => !checkinSession[c.id]);
  const hasUnchecked = uncheckedChildren.length > 0;
  const multipleUnchecked = uncheckedChildren.length > 1;

  return `
    <div class="checkin-family-card">
      <div class="checkin-family-header">
        <div>
          <div class="checkin-family-name">${escHtml(family.lastName)} Family</div>
          <div class="checkin-family-phone">${escHtml(family.phone)} &middot; ${parents.map((p) => escHtml(p.firstName)).join(', ')}</div>
        </div>
        ${multipleUnchecked ? `
          <button class="btn btn-primary btn-sm" data-checkin-all="${escHtml(family.id)}">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="7" cy="7" r="6"/>
              <path d="M4.5 7.5l2 2 4-4"/>
            </svg>
            Check In All
          </button>
        ` : ''}
      </div>
      ${children.length === 0 ? `
        <div style="padding: 20px; text-align: center;">
          <span class="text-muted text-sm">No children registered for this family</span>
        </div>
      ` : children.map((child) => renderChildRow(child, family.id)).join('')}
    </div>
  `;
}

function renderChildRow(child, familyId) {
  const session = checkinSession[child.id];
  const isCheckedIn = !!session;

  return `
    <div class="checkin-child-row">
      <div class="checkin-child-info">
        <span class="checkin-child-name">${escHtml(child.firstName)}</span>
        ${child.classroom ? `<span class="badge badge-primary" style="background: rgba(41,185,187,0.12); color: #1FA3A5;">${escHtml(child.classroom)}</span>` : ''}
        ${child.age != null ? `<span class="text-muted text-sm">Age ${child.age}</span>` : ''}
        ${child.allergies ? `<span class="badge badge-danger">${escHtml(child.allergies)}</span>` : ''}
        ${child.medicalNotes ? `<span class="badge badge-info">${escHtml(child.medicalNotes)}</span>` : ''}
      </div>
      <div class="checkin-child-actions">
        ${isCheckedIn ? `
          <div class="checked-in-indicator">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="8" cy="8" r="6.5"/>
              <path d="M5 8.5l2 2 4-4"/>
            </svg>
            Checked In
          </div>
          <span class="security-code">${escHtml(session.code)}</span>
          <button class="btn btn-secondary btn-sm" data-print-label="${escHtml(session.code)}" title="Print label">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="7" width="8" height="5" rx="0.5"/>
              <path d="M3 9H1.5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H11"/>
              <path d="M3 4V1.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5V4"/>
            </svg>
            Print
          </button>
        ` : `
          <button class="btn btn-primary btn-sm" data-checkin-member="${escHtml(child.id)}" data-family-id="${escHtml(familyId)}">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="7" cy="7" r="6"/>
              <path d="M4.5 7.5l2 2 4-4"/>
            </svg>
            Check In
          </button>
        `}
      </div>
    </div>
  `;
}

// --- Check-In Actions ---
function checkInChild(memberId, familyId) {
  if (checkinSession[memberId]) return; // Already checked in

  const family = mockFamilies.find((f) => f.id === familyId);
  if (!family) return;

  const member = family.members.find((m) => m.id === memberId);
  if (!member) return;

  const code = getFamilyCode(familyId);

  checkinSession[memberId] = {
    code: code,
    checkedInAt: new Date().toISOString(),
    memberName: member.firstName + ' ' + member.lastName,
    classroom: member.classroom || '',
    allergies: member.allergies || '',
    medicalNotes: member.medicalNotes || '',
  };

  saveCheckinSession(checkinSession);
  updateSessionInfo('Sunday AM Service', Object.keys(checkinSession).length);

  // Re-render results
  const searchInput = document.getElementById('checkinSearchInput');
  renderResults(searchInput ? searchInput.value.trim() : '');
}

function checkInAllChildren(familyId) {
  const family = mockFamilies.find((f) => f.id === familyId);
  if (!family) return;

  const code = getFamilyCode(familyId);
  const children = family.members.filter((m) => m.role === 'Child');

  children.forEach((child) => {
    if (!checkinSession[child.id]) {
      checkinSession[child.id] = {
        code: code,
        checkedInAt: new Date().toISOString(),
        memberName: child.firstName + ' ' + child.lastName,
        classroom: child.classroom || '',
        allergies: child.allergies || '',
        medicalNotes: child.medicalNotes || '',
      };
    }
  });

  saveCheckinSession(checkinSession);
  updateSessionInfo('Sunday AM Service', Object.keys(checkinSession).length);

  // Re-render results
  const searchInput = document.getElementById('checkinSearchInput');
  renderResults(searchInput ? searchInput.value.trim() : '');
}

function printLabel(code) {
  // For POC, open browser print dialog with a formatted label
  const matches = Object.values(checkinSession).filter((s) => s.code === code);
  if (matches.length === 0) return;

  const printWindow = window.open('', '_blank', 'width=400,height=300');
  if (!printWindow) return;

  const names = matches.map((m) => escHtml(m.memberName)).join(', ');
  const classrooms = [...new Set(matches.map((m) => m.classroom).filter(Boolean))].map((c) => escHtml(c)).join(', ');
  const allergies = matches.map((m) => m.allergies).filter(Boolean).map((a) => escHtml(a)).join(', ');

  printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Label - ${escHtml(code)}</title>
  <style>
    body { font-family: 'Inter', sans-serif; padding: 20px; text-align: center; }
    .code { font-size: 48px; font-weight: 700; letter-spacing: 6px; font-family: monospace; margin: 16px 0; }
    .names { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
    .detail { font-size: 14px; color: #666; margin-bottom: 4px; }
    .allergy { font-size: 14px; color: #E74C3C; font-weight: 600; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="names">${names}</div>
  ${classrooms ? '<div class="detail">' + classrooms + '</div>' : ''}
  <div class="code">${escHtml(code)}</div>
  ${allergies ? '<div class="allergy">ALLERGY: ' + allergies + '</div>' : ''}
  <script>window.print(); window.close();<\/script>
</body>
</html>`);
  printWindow.document.close();
}

// --- Init ---
document.addEventListener('DOMContentLoaded', initCheckin);
