/* ========================================
   Church Check-In — Dashboard
   ======================================== */

// --- Mock Data ---
const mockSession = {
  name: 'Sunday AM Service',
  records: [
    {
      memberName: 'Emma Smith',
      classroom: 'K-2nd Grade',
      securityCode: 'AB7K',
      checkedInAt: new Date(Date.now() - 3 * 60000),
      allergies: 'Peanuts',
    },
    {
      memberName: 'Liam Smith',
      classroom: 'Preschool',
      securityCode: 'AB7K',
      checkedInAt: new Date(Date.now() - 3 * 60000),
    },
    {
      memberName: 'Olivia Johnson',
      classroom: '3rd-5th Grade',
      securityCode: 'M3RT',
      checkedInAt: new Date(Date.now() - 8 * 60000),
    },
    {
      memberName: 'Noah Johnson',
      classroom: 'Nursery',
      securityCode: 'M3RT',
      checkedInAt: new Date(Date.now() - 8 * 60000),
      medicalNotes: 'Needs inhaler',
    },
    {
      memberName: 'Ava Williams',
      classroom: 'K-2nd Grade',
      securityCode: 'P9WX',
      checkedInAt: new Date(Date.now() - 15 * 60000),
    },
    {
      memberName: 'Sophia Davis',
      classroom: '3rd-5th Grade',
      securityCode: 'J2BN',
      checkedInAt: new Date(Date.now() - 22 * 60000),
      allergies: 'Dairy',
    },
    {
      memberName: 'Mason Brown',
      classroom: 'Nursery',
      securityCode: 'T6FQ',
      checkedInAt: new Date(Date.now() - 30 * 60000),
    },
    {
      memberName: 'Isabella Miller',
      classroom: 'Preschool',
      securityCode: 'R4DL',
      checkedInAt: new Date(Date.now() - 45 * 60000),
    },
  ],
};

// --- Dashboard Rendering ---
function initDashboard() {
  if (!requirePairing()) return;

  updateSessionInfo(mockSession.name, mockSession.records.length);
  renderStatCards();
  renderRoomBreakdown();
  renderCodeLookup();
  renderActivityFeed();
}

function renderStatCards() {
  const records = mockSession.records;
  const rooms = new Set(records.map((r) => r.classroom));

  const container = document.getElementById('stat-cards');
  if (!container) return;

  container.innerHTML = `
    <div class="stat-card">
      <div class="stat-card-icon">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="9" r="7.5"/>
          <path d="M5.5 9.5l2 2 5-5"/>
        </svg>
      </div>
      <div class="stat-card-value">${records.length}</div>
      <div class="stat-card-label">Checked In</div>
    </div>
    <div class="stat-card gold">
      <div class="stat-card-icon">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="4" width="14" height="11" rx="1.5"/>
          <path d="M2 7.5h14"/>
        </svg>
      </div>
      <div class="stat-card-value">${rooms.size}</div>
      <div class="stat-card-label">Rooms Active</div>
    </div>
    <div class="stat-card coral">
      <div class="stat-card-icon">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="6.5" cy="5" r="2.5"/>
          <path d="M1.5 15.5v-1c0-2.2 1.8-4 4-4h2c2.2 0 4 1.8 4 4v1"/>
          <circle cx="13" cy="6" r="2"/>
          <path d="M13 10.5c1.7 0 3 1.3 3 3v2"/>
        </svg>
      </div>
      <div class="stat-card-value">${records.length}</div>
      <div class="stat-card-label">Total Today</div>
    </div>
  `;
}

function renderRoomBreakdown() {
  const container = document.getElementById('room-breakdown');
  if (!container) return;

  // Group by classroom
  const rooms = {};
  mockSession.records.forEach((r) => {
    if (!rooms[r.classroom]) rooms[r.classroom] = [];
    rooms[r.classroom].push(r);
  });

  const roomNames = Object.keys(rooms).sort();

  container.innerHTML = `
    <div class="card-header">
      <h2>Room Breakdown</h2>
      <span class="card-count">${roomNames.length} rooms</span>
    </div>
    <div class="card-body">
      <div class="room-cards">
        ${roomNames
          .map(
            (name) => `
          <div class="room-card">
            <div class="room-card-header">
              <span class="room-card-name">${escHtml(name)}</span>
              <span class="room-card-count">${rooms[name].length}</span>
            </div>
            <div class="room-card-body">
              ${rooms[name]
                .map(
                  (child) => `
                <div class="room-child">
                  <span class="room-child-name">${escHtml(child.memberName)}</span>
                  <div class="room-child-badges">
                    ${
                      child.allergies
                        ? `<span class="badge badge-danger">${escHtml(child.allergies)}</span>`
                        : ''
                    }
                    ${
                      child.medicalNotes
                        ? `<span class="badge badge-info">${escHtml(child.medicalNotes)}</span>`
                        : ''
                    }
                    <span class="badge badge-muted">${escHtml(child.securityCode)}</span>
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `;
}

function renderCodeLookup() {
  const container = document.getElementById('code-lookup');
  if (!container) return;

  container.innerHTML = `
    <div class="card-header">
      <h2>Security Code Lookup</h2>
    </div>
    <div class="card-body">
      <div class="search-bar">
        <span class="search-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="7" cy="7" r="5"/>
            <path d="M14 14l-3.5-3.5"/>
          </svg>
        </span>
        <input type="text" id="codeSearchInput" placeholder="Enter security code to find children..." autocomplete="off" autocapitalize="characters" spellcheck="false">
      </div>
      <div id="codeSearchResults" class="code-lookup-results"></div>
    </div>
  `;

  // Search handler
  const input = document.getElementById('codeSearchInput');
  input.addEventListener('input', () => {
    const query = input.value.toUpperCase().trim();
    input.value = query;
    const resultsEl = document.getElementById('codeSearchResults');

    if (!query) {
      resultsEl.innerHTML = '';
      return;
    }

    const matches = mockSession.records.filter((r) =>
      r.securityCode.includes(query)
    );

    if (matches.length === 0) {
      resultsEl.innerHTML = `
        <div class="empty-state" style="padding: 24px 0;">
          <div class="empty-state-text">No children found with code "${escHtml(query)}"</div>
        </div>
      `;
      return;
    }

    resultsEl.innerHTML = `
      <table class="table" style="margin-top: 12px;">
        <thead>
          <tr>
            <th>Name</th>
            <th>Classroom</th>
            <th>Code</th>
            <th>Checked In</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          ${matches
            .map(
              (r) => `
            <tr>
              <td style="font-weight: 500;">${escHtml(r.memberName)}</td>
              <td>${escHtml(r.classroom)}</td>
              <td><span class="badge badge-primary">${escHtml(r.securityCode)}</span></td>
              <td>${formatTime(r.checkedInAt)}</td>
              <td>
                ${r.allergies ? `<span class="badge badge-danger">${escHtml(r.allergies)}</span>` : ''}
                ${r.medicalNotes ? `<span class="badge badge-info">${escHtml(r.medicalNotes)}</span>` : ''}
                ${!r.allergies && !r.medicalNotes ? '<span class="text-muted text-sm">None</span>' : ''}
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `;
  });
}

function renderActivityFeed() {
  const container = document.getElementById('activity-feed');
  if (!container) return;

  // Sort by check-in time descending
  const sorted = [...mockSession.records].sort(
    (a, b) => b.checkedInAt - a.checkedInAt
  );

  container.innerHTML = `
    <div class="card-header">
      <h2>Recent Activity</h2>
      <span class="card-count">${sorted.length} events</span>
    </div>
    <div class="card-body">
      ${sorted
        .map(
          (r) => `
        <div class="activity-item">
          <div class="activity-dot checkin"></div>
          <div class="activity-text">
            <div class="activity-name">${escHtml(r.memberName)}</div>
            <div class="activity-detail">Checked in to ${escHtml(r.classroom)}</div>
          </div>
          <div class="activity-time">${relativeTime(r.checkedInAt)}</div>
        </div>
      `
        )
        .join('')}
    </div>
  `;
}

// --- Init ---
document.addEventListener('DOMContentLoaded', initDashboard);
