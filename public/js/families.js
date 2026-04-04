/* ========================================
   Church Check-In — Families Page
   ======================================== */

// --- Mock Data ---
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

let families = JSON.parse(JSON.stringify(mockFamilies));
let editingFamilyId = null;

// --- Init ---
function initFamilies() {
  if (!requirePairing()) return;

  updateSessionInfo('Sunday AM Service', 8);
  renderFamilyList();
  bindEvents();
}

// --- Render Family List ---
function renderFamilyList(filter) {
  const container = document.getElementById('family-list');
  if (!container) return;

  let filtered = families;
  if (filter) {
    const q = filter.toLowerCase();
    filtered = families.filter((f) => {
      if (f.lastName.toLowerCase().includes(q)) return true;
      if (f.phone.includes(q)) return true;
      return f.members.some((m) => m.firstName.toLowerCase().includes(q));
    });
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.4">
            <circle cx="17" cy="13" r="6"/>
            <path d="M4 40v-3c0-5.5 4.5-10 10-10h6c5.5 0 10 4.5 10 10v3"/>
            <circle cx="35" cy="15" r="5"/>
            <path d="M35 27c4.4 0 8 3.6 8 8v5"/>
          </svg>
        </div>
        <div class="empty-state-title">${filter ? 'No families found' : 'No families yet'}</div>
        <div class="empty-state-text">${filter ? 'Try a different search term' : 'Add your first family to get started'}</div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="card-body no-padding">
      <table class="table">
        <thead>
          <tr>
            <th>Family Name</th>
            <th>Members</th>
            <th>Phone</th>
            <th>Children</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map((f) => {
            const children = f.members.filter((m) => m.role === 'Child');
            const parents = f.members.filter((m) => m.role !== 'Child');
            return `
            <tr class="family-row" data-family-id="${escHtml(f.id)}" style="cursor: pointer;">
              <td style="font-weight: 600;">${escHtml(f.lastName)}</td>
              <td>
                <span class="text-muted text-sm">${parents.map((p) => escHtml(p.firstName)).join(', ')}</span>
              </td>
              <td>${escHtml(f.phone)}</td>
              <td>
                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                  ${children.map((c) => `
                    <span class="badge badge-primary">${escHtml(c.firstName)}${c.age != null ? ' (' + c.age + ')' : ''}</span>
                  `).join('')}
                  ${children.length === 0 ? '<span class="text-muted text-sm">None</span>' : ''}
                </div>
              </td>
              <td style="text-align: right;">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity="0.35">
                  <path d="M6 3l5 5-5 5"/>
                </svg>
              </td>
            </tr>
          `;}).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// --- Bind Events ---
function bindEvents() {
  // Search
  const searchInput = document.getElementById('familySearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderFamilyList(searchInput.value.trim());
    });
  }

  // Add Family button
  const addBtn = document.getElementById('addFamilyBtn');
  if (addBtn) {
    addBtn.addEventListener('click', () => openFamilyModal(null));
  }

  // Close modal
  const closeBtn = document.getElementById('modalCloseBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  // Overlay click to close
  const overlay = document.getElementById('familyModal');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
  }

  // Event delegation for family row clicks
  document.addEventListener('click', (e) => {
    const row = e.target.closest('.family-row');
    if (row) {
      const fid = row.getAttribute('data-family-id');
      openFamilyModal(fid);
    }
  });
}

// --- Modal ---
function openFamilyModal(familyId) {
  editingFamilyId = familyId;
  const family = familyId ? families.find((f) => f.id === familyId) : null;
  const isNew = !family;

  const titleEl = document.getElementById('modalTitle');
  titleEl.textContent = isNew ? 'Add Family' : escHtml(family.lastName) + ' Family';

  renderModalBody(family);
  renderModalFooter(isNew);

  const overlay = document.getElementById('familyModal');
  overlay.classList.add('visible');
}

function closeModal() {
  const overlay = document.getElementById('familyModal');
  overlay.classList.remove('visible');
  editingFamilyId = null;
}

function renderModalBody(family) {
  const body = document.getElementById('modalBody');
  if (!body) return;

  const lastName = family ? family.lastName : '';
  const phone = family ? family.phone : '';
  const members = family ? family.members : [];

  body.innerHTML = `
    <div class="grid-2" style="margin-bottom: 18px;">
      <div class="form-field" style="margin-bottom: 0;">
        <label>Last Name</label>
        <input type="text" id="familyLastName" value="${escHtml(lastName)}" placeholder="Family last name">
      </div>
      <div class="form-field" style="margin-bottom: 0;">
        <label>Phone</label>
        <input type="tel" id="familyPhone" value="${escHtml(phone)}" placeholder="555-0100">
      </div>
    </div>

    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
      <h3 style="font-size: 15px; font-weight: 600;">Members</h3>
      <button class="btn btn-secondary btn-sm" id="addMemberBtn">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M6 1v10M1 6h10"/>
        </svg>
        Add Member
      </button>
    </div>

    <div id="membersList">
      ${members.length === 0
        ? '<div class="text-muted text-sm" style="padding: 12px 0;">No members yet. Add the first member below.</div>'
        : members.map((m) => renderMemberRow(m)).join('')}
    </div>

    <div id="addMemberForm" style="display: none; margin-top: 12px; padding: 16px; background: var(--color-bg); border-radius: var(--radius-sm);">
      <div class="grid-2" style="margin-bottom: 12px;">
        <div class="form-field" style="margin-bottom: 0;">
          <label>First Name</label>
          <input type="text" id="newMemberFirst" placeholder="First name">
        </div>
        <div class="form-field" style="margin-bottom: 0;">
          <label>Role</label>
          <select id="newMemberRole">
            <option value="Child">Child</option>
            <option value="Parent">Parent</option>
            <option value="Guardian">Guardian</option>
          </select>
        </div>
      </div>
      <div class="grid-2" style="margin-bottom: 12px;">
        <div class="form-field" style="margin-bottom: 0;">
          <label>Classroom</label>
          <select id="newMemberClassroom">
            <option value="">Not applicable</option>
            <option value="Nursery">Nursery</option>
            <option value="Preschool">Preschool</option>
            <option value="K-2nd Grade">K-2nd Grade</option>
            <option value="3rd-5th Grade">3rd-5th Grade</option>
          </select>
        </div>
        <div class="form-field" style="margin-bottom: 0;">
          <label>Age</label>
          <input type="number" id="newMemberAge" placeholder="Age" min="0" max="18">
        </div>
      </div>
      <div class="form-field" style="margin-bottom: 12px;">
        <label>Allergies</label>
        <input type="text" id="newMemberAllergies" placeholder="e.g., Peanuts, Dairy">
      </div>
      <div class="form-field" style="margin-bottom: 12px;">
        <label>Medical Notes</label>
        <input type="text" id="newMemberMedical" placeholder="e.g., Needs inhaler">
      </div>
      <div style="display: flex; gap: 8px; justify-content: flex-end;">
        <button class="btn btn-secondary btn-sm" id="cancelMemberBtn">Cancel</button>
        <button class="btn btn-primary btn-sm" id="saveMemberBtn">Add Member</button>
      </div>
    </div>
  `;

  // Bind member form events
  const addMemberBtn = document.getElementById('addMemberBtn');
  const addMemberForm = document.getElementById('addMemberForm');
  const cancelMemberBtn = document.getElementById('cancelMemberBtn');
  const saveMemberBtn = document.getElementById('saveMemberBtn');

  if (addMemberBtn) {
    addMemberBtn.addEventListener('click', () => {
      addMemberForm.style.display = 'block';
      addMemberBtn.style.display = 'none';
      document.getElementById('newMemberFirst').focus();
    });
  }

  if (cancelMemberBtn) {
    cancelMemberBtn.addEventListener('click', () => {
      addMemberForm.style.display = 'none';
      addMemberBtn.style.display = '';
      clearMemberForm();
    });
  }

  if (saveMemberBtn) {
    saveMemberBtn.addEventListener('click', () => addMemberToFamily());
  }

  // Bind delete member buttons via delegation
  const membersList = document.getElementById('membersList');
  if (membersList) {
    membersList.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('[data-delete-member]');
      if (deleteBtn) {
        const mid = deleteBtn.getAttribute('data-delete-member');
        deleteMember(mid);
      }
    });
  }
}

function renderMemberRow(member) {
  const roleBadgeClass = member.role === 'Child' ? 'badge-primary' : (member.role === 'Guardian' ? 'badge-secondary' : 'badge-muted');

  return `
    <div class="member-row" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--color-border-light);">
      <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
        <span style="font-weight: 500; font-size: 14px;">${escHtml(member.firstName)} ${escHtml(member.lastName)}</span>
        <span class="badge ${roleBadgeClass}">${escHtml(member.role)}</span>
        ${member.classroom ? `<span class="badge badge-primary" style="background: rgba(41,185,187,0.12); color: #1FA3A5;">${escHtml(member.classroom)}</span>` : ''}
        ${member.age != null ? `<span class="text-muted text-sm">Age ${member.age}</span>` : ''}
        ${member.allergies ? `<span class="badge badge-danger">${escHtml(member.allergies)}</span>` : ''}
        ${member.medicalNotes ? `<span class="badge badge-info">${escHtml(member.medicalNotes)}</span>` : ''}
      </div>
      <button class="btn btn-sm" data-delete-member="${escHtml(member.id)}" style="color: var(--color-danger); padding: 4px 8px;" title="Remove member">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
          <path d="M2 3.5h10M5.5 3.5V2.5a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1M11 3.5l-.5 8a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5L3 3.5"/>
        </svg>
      </button>
    </div>
  `;
}

function renderModalFooter(isNew) {
  const footer = document.getElementById('modalFooter');
  if (!footer) return;

  if (isNew) {
    footer.innerHTML = `
      <button class="btn btn-secondary" id="modalCancelBtn">Cancel</button>
      <button class="btn btn-primary" id="modalSaveBtn">Save Family</button>
    `;
  } else {
    footer.innerHTML = `
      <button class="btn btn-danger btn-sm" id="modalDeleteBtn">Delete Family</button>
      <div style="flex: 1;"></div>
      <button class="btn btn-secondary" id="modalCancelBtn">Cancel</button>
      <button class="btn btn-primary" id="modalSaveBtn">Save Changes</button>
    `;
  }

  // Bind footer buttons
  const cancelBtn = document.getElementById('modalCancelBtn');
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  const saveBtn = document.getElementById('modalSaveBtn');
  if (saveBtn) saveBtn.addEventListener('click', saveFamily);

  const deleteBtn = document.getElementById('modalDeleteBtn');
  if (deleteBtn) deleteBtn.addEventListener('click', deleteFamily);
}

// --- CRUD Operations ---
function saveFamily() {
  const lastNameInput = document.getElementById('familyLastName');
  const phoneInput = document.getElementById('familyPhone');

  const lastName = lastNameInput.value.trim();
  const phone = phoneInput.value.trim();

  if (!lastName) {
    lastNameInput.focus();
    lastNameInput.style.borderColor = 'var(--color-danger)';
    return;
  }

  if (editingFamilyId) {
    // Update existing family
    const family = families.find((f) => f.id === editingFamilyId);
    if (family) {
      family.lastName = lastName;
      family.phone = phone;
      // Update member last names to match
      family.members.forEach((m) => { m.lastName = lastName; });
    }
  } else {
    // Create new family
    const newFamily = {
      id: generateId(),
      lastName: lastName,
      phone: phone,
      members: [],
    };
    families.push(newFamily);
    // Immediately open the new family for editing
    editingFamilyId = newFamily.id;
  }

  closeModal();
  renderFamilyList(document.getElementById('familySearchInput').value.trim());
}

function deleteFamily() {
  if (!editingFamilyId) return;

  const family = families.find((f) => f.id === editingFamilyId);
  if (!family) return;

  if (!confirm('Delete the ' + family.lastName + ' family? This cannot be undone.')) return;

  families = families.filter((f) => f.id !== editingFamilyId);
  closeModal();
  renderFamilyList(document.getElementById('familySearchInput').value.trim());
}

function addMemberToFamily() {
  const firstNameInput = document.getElementById('newMemberFirst');
  const roleSelect = document.getElementById('newMemberRole');
  const classroomSelect = document.getElementById('newMemberClassroom');
  const ageInput = document.getElementById('newMemberAge');
  const allergiesInput = document.getElementById('newMemberAllergies');
  const medicalInput = document.getElementById('newMemberMedical');

  const firstName = firstNameInput.value.trim();
  if (!firstName) {
    firstNameInput.focus();
    firstNameInput.style.borderColor = 'var(--color-danger)';
    return;
  }

  // Get the current family last name from the form
  const familyLastName = document.getElementById('familyLastName').value.trim() || 'Unknown';

  const newMember = {
    id: 'm' + generateId(),
    firstName: firstName,
    lastName: familyLastName,
    role: roleSelect.value,
  };

  if (classroomSelect.value) newMember.classroom = classroomSelect.value;
  if (ageInput.value) newMember.age = parseInt(ageInput.value, 10);
  if (allergiesInput.value.trim()) newMember.allergies = allergiesInput.value.trim();
  if (medicalInput.value.trim()) newMember.medicalNotes = medicalInput.value.trim();

  if (editingFamilyId) {
    const family = families.find((f) => f.id === editingFamilyId);
    if (family) {
      family.members.push(newMember);
    }
  }

  // Re-render modal body to show updated members
  const family = editingFamilyId ? families.find((f) => f.id === editingFamilyId) : null;
  if (family) {
    renderModalBody(family);
  }
}

function deleteMember(memberId) {
  if (!editingFamilyId) return;

  const family = families.find((f) => f.id === editingFamilyId);
  if (!family) return;

  const member = family.members.find((m) => m.id === memberId);
  if (!member) return;

  if (!confirm('Remove ' + member.firstName + ' from this family?')) return;

  family.members = family.members.filter((m) => m.id !== memberId);
  renderModalBody(family);
}

function clearMemberForm() {
  const fields = ['newMemberFirst', 'newMemberAllergies', 'newMemberMedical', 'newMemberAge'];
  fields.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const roleSelect = document.getElementById('newMemberRole');
  if (roleSelect) roleSelect.value = 'Child';
  const classSelect = document.getElementById('newMemberClassroom');
  if (classSelect) classSelect.value = '';
}

// --- Init ---
document.addEventListener('DOMContentLoaded', initFamilies);
