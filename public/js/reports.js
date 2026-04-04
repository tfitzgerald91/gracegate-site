/* ========================================
   Grace Gate Check-In — Reports
   ======================================== */

// --- Mock Data ---
const mockHistory = [
  { id: 's1', name: 'Sunday AM Service', date: new Date(2026, 2, 29), records: [
    { memberName: 'Emma Smith', classroom: 'K-2nd Grade', checkedInAt: new Date(2026, 2, 29, 9, 15) },
    { memberName: 'Liam Smith', classroom: 'Preschool', checkedInAt: new Date(2026, 2, 29, 9, 15) },
    { memberName: 'Olivia Johnson', classroom: '3rd-5th Grade', checkedInAt: new Date(2026, 2, 29, 9, 22) },
    { memberName: 'Ava Williams', classroom: 'K-2nd Grade', checkedInAt: new Date(2026, 2, 29, 9, 30) },
  ]},
  { id: 's2', name: 'Wednesday Night', date: new Date(2026, 2, 26), records: [
    { memberName: 'Emma Smith', classroom: 'K-2nd Grade', checkedInAt: new Date(2026, 2, 26, 18, 30) },
    { memberName: 'Noah Johnson', classroom: 'Nursery', checkedInAt: new Date(2026, 2, 26, 18, 35) },
    { memberName: 'Lucas Davis', classroom: '3rd-5th Grade', checkedInAt: new Date(2026, 2, 26, 18, 40) },
  ]},
  { id: 's3', name: 'Sunday AM Service', date: new Date(2026, 2, 22), records: [
    { memberName: 'Emma Smith', classroom: 'K-2nd Grade', checkedInAt: new Date(2026, 2, 22, 9, 10) },
    { memberName: 'Liam Smith', classroom: 'Preschool', checkedInAt: new Date(2026, 2, 22, 9, 10) },
    { memberName: 'Olivia Johnson', classroom: '3rd-5th Grade', checkedInAt: new Date(2026, 2, 22, 9, 18) },
    { memberName: 'Noah Johnson', classroom: 'Nursery', checkedInAt: new Date(2026, 2, 22, 9, 20) },
    { memberName: 'Ava Williams', classroom: 'K-2nd Grade', checkedInAt: new Date(2026, 2, 22, 9, 25) },
    { memberName: 'Mia Williams', classroom: 'Nursery', checkedInAt: new Date(2026, 2, 22, 9, 25) },
    { memberName: 'Sofia Garcia', classroom: 'K-2nd Grade', checkedInAt: new Date(2026, 2, 22, 9, 32) },
  ]},
  { id: 's4', name: 'Sunday AM Service', date: new Date(2026, 2, 15), records: [
    { memberName: 'Emma Smith', classroom: 'K-2nd Grade', checkedInAt: new Date(2026, 2, 15, 9, 12) },
    { memberName: 'Olivia Johnson', classroom: '3rd-5th Grade', checkedInAt: new Date(2026, 2, 15, 9, 20) },
    { memberName: 'Ethan Williams', classroom: '3rd-5th Grade', checkedInAt: new Date(2026, 2, 15, 9, 28) },
  ]},
];

// --- State ---
let activeFilter = 'month'; // 'week' | 'month' | 'all'
let expandedSessionId = null;

// --- Filter Logic ---
function filteredSessions() {
  const now = new Date();
  return mockHistory.filter((s) => {
    if (activeFilter === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return s.date >= weekAgo;
    }
    if (activeFilter === 'month') {
      const monthAgo = new Date(now);
      monthAgo.setDate(monthAgo.getDate() - 30);
      return s.date >= monthAgo;
    }
    return true; // 'all'
  });
}

// --- Family Attendance Computation ---
function computeFamilyAttendance(sessions) {
  // Extract last name from "First Last" → family key
  const familyMap = {};
  sessions.forEach((session) => {
    const seenFamilies = new Set();
    session.records.forEach((r) => {
      const parts = r.memberName.trim().split(' ');
      const lastName = parts.length > 1 ? parts[parts.length - 1] : parts[0];
      seenFamilies.add(lastName);
    });
    seenFamilies.forEach((lastName) => {
      if (!familyMap[lastName]) {
        familyMap[lastName] = { visits: 0, lastSeen: null };
      }
      familyMap[lastName].visits += 1;
      if (!familyMap[lastName].lastSeen || session.date > familyMap[lastName].lastSeen) {
        familyMap[lastName].lastSeen = session.date;
      }
    });
  });

  return Object.entries(familyMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.lastSeen - a.lastSeen);
}

// --- Render Filter Pills ---
function renderFilterBar() {
  const container = document.getElementById('filter-bar');
  if (!container) return;

  const filters = [
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'all', label: 'All Time' },
  ];

  container.innerHTML = filters.map((f) => `
    <button
      class="filter-pill${activeFilter === f.id ? ' active' : ''}"
      data-filter="${escHtml(f.id)}"
    >${escHtml(f.label)}</button>
  `).join('');

  container.querySelectorAll('.filter-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter;
      expandedSessionId = null;
      renderAll();
    });
  });
}

// --- Render Summary Stats ---
function renderSummaryStats(sessions) {
  const container = document.getElementById('summary-stats');
  if (!container) return;

  const totalSessions = sessions.length;
  const totalCheckIns = sessions.reduce((sum, s) => sum + s.records.length, 0);
  const avgPerSession = totalSessions > 0 ? Math.round(totalCheckIns / totalSessions) : 0;

  container.innerHTML = `
    <div class="stat-card">
      <div class="stat-card-icon">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="4" width="14" height="11" rx="1.5"/>
          <path d="M2 7.5h14"/>
          <path d="M6 2v3M12 2v3"/>
        </svg>
      </div>
      <div class="stat-card-value">${totalSessions}</div>
      <div class="stat-card-label">Total Sessions</div>
    </div>
    <div class="stat-card gold">
      <div class="stat-card-icon">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="9" r="7.5"/>
          <path d="M5.5 9.5l2 2 5-5"/>
        </svg>
      </div>
      <div class="stat-card-value">${totalCheckIns}</div>
      <div class="stat-card-label">Total Check-Ins</div>
    </div>
    <div class="stat-card success">
      <div class="stat-card-icon">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="9" width="3" height="7" rx="0.8"/>
          <rect x="7.5" y="5" width="3" height="11" rx="0.8"/>
          <rect x="13" y="2" width="3" height="14" rx="0.8"/>
        </svg>
      </div>
      <div class="stat-card-value">${avgPerSession}</div>
      <div class="stat-card-label">Avg per Session</div>
    </div>
  `;
}

// --- Render Session History Table ---
function renderSessionHistory(sessions) {
  const container = document.getElementById('session-history');
  if (!container) return;

  if (sessions.length === 0) {
    container.innerHTML = `
      <div class="card-header">
        <h2>Session History</h2>
        <span class="card-count">0 sessions</span>
      </div>
      <div class="card-body">
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <div class="empty-state-title">No sessions found</div>
          <div class="empty-state-text">No sessions match the selected time period.</div>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="card-header">
      <h2>Session History</h2>
      <span class="card-count">${sessions.length} session${sessions.length !== 1 ? 's' : ''}</span>
    </div>
    <div class="card-body no-padding">
      <table class="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Session Name</th>
            <th>Headcount</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${sessions.map((s) => {
            const isExpanded = expandedSessionId === s.id;
            return `
              <tr
                class="session-row${isExpanded ? ' session-row-expanded' : ''}"
                data-session-id="${escHtml(s.id)}"
                style="cursor: pointer;"
              >
                <td style="font-weight: 500;">${escHtml(formatDate(s.date))}</td>
                <td>${escHtml(s.name)}</td>
                <td>
                  <span class="badge badge-primary">${s.records.length} children</span>
                </td>
                <td style="text-align: right; color: var(--color-text-muted);">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
                    style="transform: rotate(${isExpanded ? '180' : '0'}deg); transition: transform 0.2s ease;">
                    <path d="M3 5l4 4 4-4"/>
                  </svg>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  container.querySelectorAll('.session-row').forEach((row) => {
    row.addEventListener('click', () => {
      const sid = row.dataset.sessionId;
      expandedSessionId = expandedSessionId === sid ? null : sid;
      renderAll();
      if (expandedSessionId) {
        setTimeout(() => {
          document.getElementById('session-detail')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 50);
      }
    });
  });
}

// --- Render Session Detail Panel ---
function renderSessionDetail(sessions) {
  const container = document.getElementById('session-detail');
  if (!container) return;

  const session = sessions.find((s) => s.id === expandedSessionId);
  if (!session) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';

  // Group records by classroom
  const rooms = {};
  session.records.forEach((r) => {
    if (!rooms[r.classroom]) rooms[r.classroom] = [];
    rooms[r.classroom].push(r);
  });
  const roomNames = Object.keys(rooms).sort();

  container.innerHTML = `
    <div class="card">
      <div class="card-header" style="background: var(--color-primary-light);">
        <div>
          <h2 style="color: var(--color-primary-dark);">${escHtml(session.name)}</h2>
          <div style="font-size: 13px; color: var(--color-primary-dark); opacity: 0.8; margin-top: 2px;">
            ${escHtml(formatDate(session.date))} &mdash; ${session.records.length} children
          </div>
        </div>
        <button class="btn btn-sm btn-secondary" id="closeDetailBtn">Close</button>
      </div>
      <div class="card-body">
        <div class="room-cards">
          ${roomNames.map((roomName) => `
            <div class="room-card">
              <div class="room-card-header">
                <span class="room-card-name">${escHtml(roomName)}</span>
                <span class="room-card-count">${rooms[roomName].length}</span>
              </div>
              <div class="room-card-body">
                ${rooms[roomName].map((child) => `
                  <div class="room-child">
                    <span class="room-child-name">${escHtml(child.memberName)}</span>
                    <span class="text-muted text-sm">${escHtml(formatTime(child.checkedInAt))}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  document.getElementById('closeDetailBtn')?.addEventListener('click', () => {
    expandedSessionId = null;
    renderAll();
  });
}

// --- Render Family Attendance ---
function renderFamilyAttendance(sessions) {
  const container = document.getElementById('family-attendance');
  if (!container) return;

  const families = computeFamilyAttendance(sessions);

  if (families.length === 0) {
    container.innerHTML = `
      <div class="card-header">
        <h2>Family Attendance</h2>
      </div>
      <div class="card-body">
        <div class="empty-state">
          <div class="empty-state-icon">👨‍👩‍👧</div>
          <div class="empty-state-title">No families found</div>
          <div class="empty-state-text">No family data for the selected time period.</div>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="card-header">
      <h2>Family Attendance</h2>
      <span class="card-count">${families.length} families</span>
    </div>
    <div class="card-body no-padding">
      <table class="table">
        <thead>
          <tr>
            <th>Family Name</th>
            <th>Total Visits</th>
            <th>Last Seen</th>
          </tr>
        </thead>
        <tbody>
          ${families.map((f) => `
            <tr>
              <td style="font-weight: 500;">${escHtml(f.name)} Family</td>
              <td>
                <span class="badge badge-${f.visits >= 3 ? 'success' : f.visits >= 2 ? 'secondary' : 'muted'}">${f.visits} session${f.visits !== 1 ? 's' : ''}</span>
              </td>
              <td class="text-muted">${escHtml(formatDate(f.lastSeen))}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// --- CSV Export ---
function exportCsv() {
  const sessions = filteredSessions();
  const rows = [['Date', 'Session', 'Child Name', 'Classroom', 'Check-In Time']];

  sessions.forEach((session) => {
    session.records.forEach((r) => {
      rows.push([
        formatDate(session.date),
        session.name,
        r.memberName,
        r.classroom,
        formatTime(r.checkedInAt),
      ]);
    });
  });

  const csvContent = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `attendance-${activeFilter}-${todayDateKey()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// --- Render All ---
function renderAll() {
  const sessions = filteredSessions();
  renderFilterBar();
  renderSummaryStats(sessions);
  renderSessionHistory(sessions);
  renderSessionDetail(sessions);
  renderFamilyAttendance(sessions);
}

// --- Init ---
function initReports() {
  if (!requirePairing()) return;

  // Inject filter pill styles (not in common.css yet)
  if (!document.getElementById('reports-styles')) {
    const style = document.createElement('style');
    style.id = 'reports-styles';
    style.textContent = `
      .filter-pill {
        padding: 7px 18px;
        font-size: 13px;
        font-weight: var(--font-weight-semibold);
        border-radius: 20px;
        border: 1.5px solid var(--color-border);
        background: var(--color-surface);
        color: var(--color-text-secondary);
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .filter-pill:hover {
        border-color: var(--color-primary);
        color: var(--color-primary-dark);
      }
      .filter-pill.active {
        background: var(--color-primary);
        border-color: var(--color-primary);
        color: white;
        box-shadow: 0 2px 6px rgba(41, 185, 187, 0.35);
      }
      .session-row-expanded td {
        background: var(--color-primary-light) !important;
        color: var(--color-primary-dark);
      }
    `;
    document.head.appendChild(style);
  }

  renderAll();

  document.getElementById('exportCsvBtn')?.addEventListener('click', exportCsv);
}

document.addEventListener('DOMContentLoaded', initReports);
