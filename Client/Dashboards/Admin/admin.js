/* ══════════════════════════════════════
   ADMIN DASHBOARD — admin.js
   Full logic: tabs, CRUD, modals, assignments
══════════════════════════════════════ */

/* ── TAB SWITCHER ── */
const titles = {
  dashboard:   'Dashboard',
  students:    'Students',
  supervisors: 'Supervisors',
  teams:       'Teams',
  assignments: 'Assignments',
  reports:     'Reports & Evaluation',
};
const subs = {
  dashboard:   'Overview of FYP system activity',
  students:    'View all registered students',
  supervisors: 'Manage faculty supervisors',
  teams:       'View and manage all FYP teams',
  assignments: 'Assign supervisors to teams',
  reports:     'Weekly reports and evaluations (monitor only)',
};

function switchTab(tab, clickedEl) {
  document.querySelectorAll('.dash-subpage').forEach(el => el.classList.remove('active'));
  const target = document.getElementById('tab-' + tab);
  if (target) target.classList.add('active');
  document.querySelectorAll('.sb-item').forEach(el => el.classList.remove('active'));
  if (clickedEl) clickedEl.classList.add('active');
  document.getElementById('page-title').textContent = titles[tab] || tab;
  document.getElementById('page-sub').textContent   = subs[tab]   || '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ══════════════════════════════════════
   FAKE DATABASE
══════════════════════════════════════ */
let STUDENTS = [
  { id: 'STD20260001', name: 'Ahmed Saeed',  email: 'ahmed.saeed@awkum.edu.pk',  teamID: 'TEAM20260001', initials: 'AS' },
  { id: 'STD20260002', name: 'Bilal Khan',   email: 'bilal.khan@awkum.edu.pk',   teamID: 'TEAM20260001', initials: 'BK' },
  { id: 'STD20260003', name: 'Sana Malik',   email: 'sana.malik@awkum.edu.pk',   teamID: 'TEAM20260001', initials: 'SM' },
  { id: 'STD20260004', name: 'Usman Raza',   email: 'usman.raza@awkum.edu.pk',   teamID: 'TEAM20260002', initials: 'UR' },
  { id: 'STD20260005', name: 'Ayesha Tariq', email: 'ayesha.tariq@awkum.edu.pk', teamID: 'TEAM20260002', initials: 'AT' },
  { id: 'STD20260006', name: 'Hamza Ali',    email: 'hamza.ali@awkum.edu.pk',    teamID: 'TEAM20260003', initials: 'HA' },
  { id: 'STD20260007', name: 'Zara Noor',    email: 'zara.noor@awkum.edu.pk',    teamID: 'TEAM20260003', initials: 'ZN' },
  { id: 'STD20260008', name: 'Farhan Sheikh',email: 'farhan.sheikh@awkum.edu.pk',teamID: null,           initials: 'FS' },
  { id: 'STD20260009', name: 'Laiba Javed',  email: 'laiba.javed@awkum.edu.pk',  teamID: null,           initials: 'LJ' },
];

let SUPERVISORS = [
  { id: 'SUP20260001', name: 'Dr. Aftab Ahmad',   email: 'aftab.ahmad@awkum.edu.pk',   department: 'Computer Science', initials: 'AA' },
  { id: 'SUP20260002', name: 'Dr. Nadeem Iqbal',  email: 'nadeem.iqbal@awkum.edu.pk',  department: 'Computer Science', initials: 'NI' },
  { id: 'SUP20260003', name: 'Dr. Farooq Ahmed',  email: 'farooq.ahmed@awkum.edu.pk',  department: 'Software Eng.',    initials: 'FA' },
  { id: 'SUP20260004', name: 'Ms. Rabia Kamran',  email: 'rabia.kamran@awkum.edu.pk',  department: 'Computer Science', initials: 'RK' },
  { id: 'SUP20260005', name: 'Mr. Tariq Hussain', email: 'tariq.hussain@awkum.edu.pk', department: 'Info. Systems',    initials: 'TH' },
];

let TEAMS = [
  { id: 'TEAM20260001', name: 'Alpha Coders',    leader: 'STD20260001', members: ['STD20260002','STD20260003'], project: 'AI-Based Exam Proctoring System',    supervisorID: 'SUP20260001' },
  { id: 'TEAM20260002', name: 'Binary Bros',     leader: 'STD20260004', members: ['STD20260005'],               project: 'Smart Campus Navigation App',         supervisorID: 'SUP20260002' },
  { id: 'TEAM20260003', name: 'Code Crafters',   leader: 'STD20260006', members: ['STD20260007'],               project: 'Blockchain-Based Voting System',      supervisorID: null },
  { id: 'TEAM20260004', name: 'Data Dynamos',    leader: 'STD20260008', members: [],                            project: 'IoT Smart Irrigation System',         supervisorID: null },
];

let REPORTS = [
  { week: 1, teamID: 'TEAM20260001', supervisorID: 'SUP20260001', marks: 8.5, feedback: 'Good progress on proposal.',        submitted: '12 Feb 2026' },
  { week: 2, teamID: 'TEAM20260001', supervisorID: 'SUP20260001', marks: 9.0, feedback: 'Excellent literature review work.', submitted: '19 Feb 2026' },
  { week: 1, teamID: 'TEAM20260002', supervisorID: 'SUP20260002', marks: 7.5, feedback: 'On track, needs more references.',  submitted: '13 Feb 2026' },
  { week: 3, teamID: 'TEAM20260001', supervisorID: 'SUP20260001', marks: 8.0, feedback: 'System design looking solid.',      submitted: '26 Feb 2026' },
  { week: 2, teamID: 'TEAM20260002', supervisorID: 'SUP20260002', marks: 8.0, feedback: 'Good technical depth.',             submitted: '20 Feb 2026' },
  { week: 1, teamID: 'TEAM20260003', supervisorID: null,          marks: null,feedback: '',                                   submitted: '14 Feb 2026' },
];

/* ══════════════════════════════════════
   HELPERS
══════════════════════════════════════ */
function findStudent(id)    { return STUDENTS.find(s => s.id === id); }
function findSupervisor(id) { return SUPERVISORS.find(s => s.id === id); }
function findTeam(id)       { return TEAMS.find(t => t.id === id); }
function supTeamCount(id)   { return TEAMS.filter(t => t.supervisorID === id).length; }

function genID(prefix) {
  const year = new Date().getFullYear();
  let maxNum = 0;
  const pool = prefix === 'STD' ? STUDENTS : prefix === 'SUP' ? SUPERVISORS : TEAMS;
  pool.forEach(item => {
    const num = parseInt(item.id.slice(-4), 10);
    if (num > maxNum) maxNum = num;
  });
  return `${prefix}${year}${String(maxNum + 1).padStart(4, '0')}`;
}

function initials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

/* ══════════════════════════════════════
   MODAL SYSTEM
══════════════════════════════════════ */
function showModal(html) {
  const ov = document.getElementById('modal-overlay');
  document.getElementById('modal-box').innerHTML = html;
  ov.style.display = 'flex';
}
function closeModal() { document.getElementById('modal-overlay').style.display = 'none'; }
document.addEventListener('click', e => { if (e.target.id === 'modal-overlay') closeModal(); });

/* ══════════════════════════════════════
   DASHBOARD TAB
══════════════════════════════════════ */
function renderDashboard() {
  const assigned   = TEAMS.filter(t => t.supervisorID).length;
  const unassigned = TEAMS.length - assigned;

  document.getElementById('admin-stats').innerHTML = `
    <div class="dstat-card" style="--card-accent:var(--primary);--card-icon-bg:rgba(0,75,45,.08);--card-icon-color:var(--primary);">
      <div class="dstat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg></div>
      <div><div class="dstat-label">Total Students</div><div class="dstat-value">${STUDENTS.length}</div><div class="dstat-sub">Registered</div></div>
    </div>
    <div class="dstat-card" style="--card-accent:var(--gold);--card-icon-bg:rgba(191,161,74,.1);--card-icon-color:var(--gold);">
      <div class="dstat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
      <div><div class="dstat-label">Supervisors</div><div class="dstat-value">${SUPERVISORS.length}</div><div class="dstat-sub">Faculty members</div></div>
    </div>
    <div class="dstat-card" style="--card-accent:#3b82f6;--card-icon-bg:rgba(59,130,246,.08);--card-icon-color:#3b82f6;">
      <div class="dstat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
      <div><div class="dstat-label">Total Teams</div><div class="dstat-value">${TEAMS.length}</div><div class="dstat-sub">FYP groups</div></div>
    </div>
    <div class="dstat-card" style="--card-accent:#198754;--card-icon-bg:rgba(25,135,84,.08);--card-icon-color:#198754;">
      <div class="dstat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
      <div><div class="dstat-label">Assigned Teams</div><div class="dstat-value">${assigned}</div><div class="dstat-sub">With supervisors</div></div>
    </div>
    <div class="dstat-card" style="--card-accent:#dc2626;--card-icon-bg:rgba(220,38,38,.08);--card-icon-color:#dc2626;">
      <div class="dstat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
      <div><div class="dstat-label">Unassigned</div><div class="dstat-value">${unassigned}</div><div class="dstat-sub">Need supervisor</div></div>
    </div>
  `;

  // Unassigned preview
  const un = TEAMS.filter(t => !t.supervisorID);
  document.getElementById('unassigned-preview').innerHTML = un.length === 0
    ? `<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><p>All teams have supervisors assigned.</p></div>`
    : un.map(t => {
        const leader = findStudent(t.leader);
        return `
          <div class="sup-preview-row">
            <div class="sup-preview-av">${initials(t.name)}</div>
            <div class="sup-preview-info">
              <strong>${t.name}</strong>
              <span>${t.id} · Leader: ${leader ? leader.name : '—'}</span>
            </div>
            <button class="btn-assign-sm" onclick="openAssignSupervisor('${t.id}')">Assign</button>
          </div>`;
      }).join('');

  // Top supervisors
  const sorted = [...SUPERVISORS].sort((a, b) => supTeamCount(b.id) - supTeamCount(a.id)).slice(0, 5);
  document.getElementById('top-supervisors').innerHTML = sorted.map(s => `
    <div class="sup-preview-row">
      <div class="sup-preview-av">${s.initials}</div>
      <div class="sup-preview-info">
        <strong>${s.name}</strong>
        <span>${s.department}</span>
      </div>
      <span class="sup-team-count">${supTeamCount(s.id)} team${supTeamCount(s.id) !== 1 ? 's' : ''}</span>
    </div>
  `).join('');
}

/* ══════════════════════════════════════
   STUDENTS TAB
══════════════════════════════════════ */
function renderStudents() {
  const q = (document.getElementById('student-search').value || '').toLowerCase().trim();
  const list = STUDENTS.filter(s =>
    !q || s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
  );
  const tbody = document.getElementById('students-tbody');
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="padding:32px;text-align:center;color:var(--text-mute);">No students found.</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(s => {
    const teamBadge = s.teamID
      ? `<span class="status-badge s-approved">${s.teamID}</span>`
      : `<span class="status-badge s-none">No team</span>`;
    return `
      <tr>
        <td class="id-cell">${s.id}</td>
        <td class="name-cell">
          <div class="row-avatar">
            <div class="row-av-circle">${s.initials}</div>
            <span>${s.name}</span>
          </div>
        </td>
        <td class="email-cell">${s.email}</td>
        <td>${teamBadge}</td>
        <td>
          <div class="act-row">
            <button class="act-btn primary" title="View details" onclick="viewStudent('${s.id}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

function viewStudent(id) {
  const s = findStudent(id);
  if (!s) return;
  const team = s.teamID ? findTeam(s.teamID) : null;
  const sup  = team && team.supervisorID ? findSupervisor(team.supervisorID) : null;

  showModal(`
    <div class="modal-header">
      <div class="modal-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg></div>
      <h2>Student Details</h2>
      <p>Read-only view of student record</p>
    </div>
    <div class="modal-body">
      <div class="detail-row"><span class="detail-key">Student ID</span><span class="detail-val" style="font-family:monospace;color:var(--primary);font-weight:700;">${s.id}</span></div>
      <div class="detail-row"><span class="detail-key">Full Name</span><span class="detail-val">${s.name}</span></div>
      <div class="detail-row"><span class="detail-key">Email</span><span class="detail-val">${s.email}</span></div>
      <div class="detail-row"><span class="detail-key">Team</span><span class="detail-val">${team ? team.name + ' (' + team.id + ')' : '<span style="color:var(--text-mute);">Not assigned to any team</span>'}</span></div>
      ${team ? `<div class="detail-row"><span class="detail-key">Role</span><span class="detail-val">${team.leader === s.id ? '<span class="status-badge s-approved">Team Leader</span>' : '<span class="status-badge s-none">Member</span>'}</span></div>` : ''}
      ${team ? `<div class="detail-row"><span class="detail-key">Project</span><span class="detail-val">${team.project}</span></div>` : ''}
      ${sup  ? `<div class="detail-row"><span class="detail-key">Supervisor</span><span class="detail-val">${sup.name}</span></div>` : ''}
    </div>
    <div class="modal-footer">
      <button class="m-btn-ghost" onclick="closeModal()">Close</button>
    </div>
  `);
}

/* ══════════════════════════════════════
   SUPERVISORS TAB
══════════════════════════════════════ */
function renderSupervisors() {
  const q = (document.getElementById('sup-search').value || '').toLowerCase().trim();
  const list = SUPERVISORS.filter(s =>
    !q || s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.department.toLowerCase().includes(q)
  );
  const tbody = document.getElementById('supervisors-tbody');
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="padding:32px;text-align:center;color:var(--text-mute);">No supervisors found.</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(s => `
    <tr>
      <td class="id-cell">${s.id}</td>
      <td class="name-cell">
        <div class="row-avatar">
          <div class="row-av-circle">${s.initials}</div>
          <span>${s.name}</span>
        </div>
      </td>
      <td class="email-cell">${s.email}</td>
      <td>${s.department}</td>
      <td style="text-align:center;"><span class="status-badge s-approved">${supTeamCount(s.id)}</span></td>
      <td>
        <div class="act-row">
          <button class="act-btn primary" title="Edit" onclick="openEditSupervisor('${s.id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
          </button>
          <button class="act-btn danger" title="Delete" onclick="openDeleteSupervisor('${s.id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openAddSupervisor() {
  showModal(`
    <div class="modal-header">
      <div class="modal-icon" style="background:rgba(191,161,74,.15);border-color:rgba(191,161,74,.3);"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--gold);"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>
      <h2>Add New Supervisor</h2>
      <p>A unique Supervisor ID will be auto-generated.</p>
    </div>
    <div class="modal-body">
      <div class="m-fg"><label>Full Name</label><input type="text" class="m-input" id="sup-name" placeholder="e.g. Dr. Kamran Shah"/><div class="m-err" id="e-sup-name"></div></div>
      <div class="m-fg"><label>Email</label><input type="email" class="m-input" id="sup-email" placeholder="e.g. kamran.shah@awkum.edu.pk"/><div class="m-err" id="e-sup-email"></div></div>
      <div class="m-fg"><label>Department</label>
        <select class="m-select" id="sup-dept">
          <option value="Computer Science">Computer Science</option>
          <option value="Software Eng.">Software Engineering</option>
          <option value="Info. Systems">Information Systems</option>
          <option value="Data Science">Data Science</option>
        </select>
      </div>
    </div>
    <div class="modal-footer">
      <button class="m-btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="m-btn-primary" onclick="submitAddSupervisor()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        Add Supervisor
      </button>
    </div>
  `);
}

function submitAddSupervisor() {
  const name  = document.getElementById('sup-name').value.trim();
  const email = document.getElementById('sup-email').value.trim();
  const dept  = document.getElementById('sup-dept').value;
  let ok = true;
  if (!name)  { document.getElementById('e-sup-name').textContent  = 'Name is required'; ok = false; }
  if (!email || !email.includes('@')) { document.getElementById('e-sup-email').textContent = 'Valid email required'; ok = false; }
  if (SUPERVISORS.find(s => s.email.toLowerCase() === email.toLowerCase())) {
    document.getElementById('e-sup-email').textContent = 'Email already exists'; ok = false;
  }
  if (!ok) return;

  SUPERVISORS.push({
    id: genID('SUP'),
    name, email, department: dept,
    initials: initials(name)
  });
  closeModal();
  renderSupervisors();
  renderDashboard();
}

function openEditSupervisor(id) {
  const s = findSupervisor(id);
  if (!s) return;
  showModal(`
    <div class="modal-header">
      <div class="modal-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg></div>
      <h2>Edit Supervisor</h2>
      <p>Update supervisor details below.</p>
    </div>
    <div class="modal-body">
      <div class="m-info-box"><strong>ID:</strong> ${s.id} &nbsp;·&nbsp; Assigned teams: ${supTeamCount(s.id)}</div>
      <div class="m-fg"><label>Full Name</label><input type="text" class="m-input" id="sup-name" value="${s.name}"/><div class="m-err" id="e-sup-name"></div></div>
      <div class="m-fg"><label>Email</label><input type="email" class="m-input" id="sup-email" value="${s.email}"/><div class="m-err" id="e-sup-email"></div></div>
      <div class="m-fg"><label>Department</label>
        <select class="m-select" id="sup-dept">
          ${['Computer Science','Software Eng.','Info. Systems','Data Science'].map(d => `<option value="${d}" ${d===s.department?'selected':''}>${d}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="modal-footer">
      <button class="m-btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="m-btn-primary" onclick="submitEditSupervisor('${s.id}')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        Save Changes
      </button>
    </div>
  `);
}

function submitEditSupervisor(id) {
  const s = findSupervisor(id);
  if (!s) return;
  const name  = document.getElementById('sup-name').value.trim();
  const email = document.getElementById('sup-email').value.trim();
  const dept  = document.getElementById('sup-dept').value;
  let ok = true;
  if (!name)  { document.getElementById('e-sup-name').textContent  = 'Name is required'; ok = false; }
  if (!email || !email.includes('@')) { document.getElementById('e-sup-email').textContent = 'Valid email required'; ok = false; }
  if (SUPERVISORS.find(x => x.id !== id && x.email.toLowerCase() === email.toLowerCase())) {
    document.getElementById('e-sup-email').textContent = 'Email already taken'; ok = false;
  }
  if (!ok) return;

  s.name = name;
  s.email = email;
  s.department = dept;
  s.initials = initials(name);
  closeModal();
  renderSupervisors();
  renderDashboard();
}

function openDeleteSupervisor(id) {
  const s = findSupervisor(id);
  if (!s) return;
  const teams = supTeamCount(s.id);
  showModal(`
    <div class="modal-header">
      <div class="modal-icon" style="background:rgba(220,38,38,.1);border-color:rgba(220,38,38,.25);"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#dc2626;"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg></div>
      <h2>Delete Supervisor?</h2>
      <p>This action cannot be undone.</p>
    </div>
    <div class="modal-body">
      <div class="m-info-box"><strong>${s.name}</strong> (${s.id}) will be permanently removed.</div>
      ${teams > 0 ? `<div class="m-info-box" style="background:#fff4e5;border-color:#fbc978;color:#a16207;">⚠ This supervisor is currently assigned to <strong>${teams} team${teams !== 1 ? 's' : ''}</strong>. Those teams will become unassigned.</div>` : ''}
    </div>
    <div class="modal-footer">
      <button class="m-btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="m-btn-danger" onclick="confirmDeleteSupervisor('${s.id}')">Yes, Delete</button>
    </div>
  `);
}

function confirmDeleteSupervisor(id) {
  TEAMS.forEach(t => { if (t.supervisorID === id) t.supervisorID = null; });
  SUPERVISORS = SUPERVISORS.filter(s => s.id !== id);
  closeModal();
  renderSupervisors();
  renderDashboard();
  renderTeams();
  renderAssignments();
}

/* ══════════════════════════════════════
   TEAMS TAB
══════════════════════════════════════ */
function renderTeams() {
  const q = (document.getElementById('team-search').value || '').toLowerCase().trim();
  const list = TEAMS.filter(t =>
    !q || t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || t.project.toLowerCase().includes(q)
  );
  const tbody = document.getElementById('teams-tbody');
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="padding:32px;text-align:center;color:var(--text-mute);">No teams found.</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(t => {
    const leader = findStudent(t.leader);
    const sup    = t.supervisorID ? findSupervisor(t.supervisorID) : null;
    const supBadge = sup
      ? `<span class="status-badge s-approved">${sup.name}</span>`
      : `<span class="status-badge s-pending">Unassigned</span>`;
    return `
      <tr>
        <td class="id-cell">${t.id}</td>
        <td class="name-cell">${leader ? leader.name : '—'}</td>
        <td>${t.members.length + 1} <span style="color:var(--text-mute);font-size:.72rem;">(incl. leader)</span></td>
        <td>${t.project}</td>
        <td>${supBadge}</td>
        <td>
          <div class="act-row">
            <button class="act-btn primary" title="View" onclick="viewTeam('${t.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
            <button class="act-btn" title="Edit" onclick="openEditTeam('${t.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg></button>
            <button class="act-btn danger" title="Delete" onclick="openDeleteTeam('${t.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg></button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

function viewTeam(id) {
const t = findTeam(id);
if (!t) return;

const leader = findStudent(t.leader);
const sup = t.supervisorID ? findSupervisor(t.supervisorID) : null;

// Ensure members array exists
const membersArray = t.members || [];

const memberList = [t.leader, ...membersArray]
  .map(mid => {
    const m = findStudent(mid);

    // Skip if student not found
    if (!m) return '';

    return `
      <div style="display:flex;align-items:center;gap:8px;padding:4px 0;">
        <div class="row-av-circle" style="width:26px;height:26px;font-size:.6rem;">
          ${m.initials || ''}
        </div>
        <span style="font-size:.8rem;">
          ${m.name || 'Unknown'} 
          <span style="color:var(--text-mute);">— ${m.id || ''}</span>
          ${
            mid === t.leader
              ? '<span class="status-badge s-approved" style="margin-left:6px;font-size:.6rem;">Leader</span>'
              : ''
          }
        </span>
      </div>
    `;
  })
  .join('');
  showModal(`
    <div class="modal-header">
      <div class="modal-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
      <h2>Team Details</h2>
      <p>Full record of ${t.name}</p>
    </div>
    <div class="modal-body">
      <div class="detail-row"><span class="detail-key">Team ID</span><span class="detail-val" style="font-family:monospace;color:var(--primary);font-weight:700;">${t.id}</span></div>
      <div class="detail-row"><span class="detail-key">Team Name</span><span class="detail-val">${t.name}</span></div>
      <div class="detail-row"><span class="detail-key">Project</span><span class="detail-val">${t.project}</span></div>
      <div class="detail-row"><span class="detail-key">Supervisor</span><span class="detail-val">${sup ? sup.name + ' — ' + sup.id : '<span class="status-badge s-pending">Unassigned</span>'}</span></div>
      <div class="detail-row" style="display:block;"><span class="detail-key" style="display:block;margin-bottom:6px;">Members (${t.members.length + 1})</span><div>${memberList}</div></div>
    </div>
    <div class="modal-footer">
      <button class="m-btn-ghost" onclick="closeModal()">Close</button>
    </div>
  `);
}

function openEditTeam(id) {
  const t = findTeam(id); if (!t) return;
  showModal(`
    <div class="modal-header">
      <div class="modal-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg></div>
      <h2>Edit Team</h2>
      <p>${t.id}</p>
    </div>
    <div class="modal-body">
      <div class="m-fg"><label>Team Name</label><input type="text" class="m-input" id="team-name" value="${t.name}"/></div>
      <div class="m-fg"><label>Project Title</label><input type="text" class="m-input" id="team-proj" value="${t.project}"/></div>
    </div>
    <div class="modal-footer">
      <button class="m-btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="m-btn-primary" onclick="submitEditTeam('${t.id}')">Save Changes</button>
    </div>
  `);
}

function submitEditTeam(id) {
  const t = findTeam(id); if (!t) return;
  const name = document.getElementById('team-name').value.trim();
  const proj = document.getElementById('team-proj').value.trim();
  if (!name || !proj) return;
  t.name = name;
  t.project = proj;
  closeModal();
  renderTeams();
  renderAssignments();
  renderDashboard();
}

function openDeleteTeam(id) {
  const t = findTeam(id); if (!t) return;
  showModal(`
    <div class="modal-header">
      <div class="modal-icon" style="background:rgba(220,38,38,.1);border-color:rgba(220,38,38,.25);"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#dc2626;"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg></div>
      <h2>Delete Team?</h2>
      <p>This action cannot be undone.</p>
    </div>
    <div class="modal-body">
      <div class="m-info-box"><strong>${t.name}</strong> (${t.id}) and its supervisor assignment will be removed. Students will be marked as teamless.</div>
    </div>
    <div class="modal-footer">
      <button class="m-btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="m-btn-danger" onclick="confirmDeleteTeam('${t.id}')">Yes, Delete</button>
    </div>
  `);
}

function confirmDeleteTeam(id) {
  STUDENTS.forEach(s => { if (s.teamID === id) s.teamID = null; });
  TEAMS = TEAMS.filter(t => t.id !== id);
  REPORTS = REPORTS.filter(r => r.teamID !== id);
  closeModal();
  renderTeams();
  renderStudents();
  renderAssignments();
  renderDashboard();
  renderReports();
}

/* ══════════════════════════════════════
   ASSIGNMENTS TAB
══════════════════════════════════════ */
function renderAssignments() {
  const un = TEAMS.filter(t => !t.supervisorID);
  const as = TEAMS.filter(t => t.supervisorID);

  document.getElementById('unassigned-count').textContent = un.length + ' team' + (un.length !== 1 ? 's' : '');
  document.getElementById('assigned-count').textContent   = as.length + ' assigned';

  document.getElementById('unassigned-list').innerHTML = un.length === 0
    ? `<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><p>All teams have supervisors.</p></div>`
    : un.map(t => {
        const leader = findStudent(t.leader);
        return `
          <div class="asgn-row">
            <div class="row-av-circle">${initials(t.name)}</div>
            <div class="asgn-info">
              <strong>${t.name}</strong>
              <span><span class="asgn-id">${t.id}</span> · ${leader ? leader.name : '—'}</span>
            </div>
            <button class="btn-assign-sm" onclick="openAssignSupervisor('${t.id}')">Assign</button>
          </div>`;
      }).join('');

  document.getElementById('assigned-list').innerHTML = as.length === 0
    ? `<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/></svg><p>No assignments yet.</p></div>`
    : as.map(t => {
        const sup = findSupervisor(t.supervisorID);
        return `
          <div class="asgn-row">
            <div class="row-av-circle">${initials(t.name)}</div>
            <div class="asgn-info">
              <strong>${t.name}</strong>
              <span><span class="asgn-id">${t.id}</span> → <span class="asgn-sup-chip">${sup ? sup.name : '—'}</span></span>
            </div>
            <div style="display:flex;gap:6px;">
              <button class="btn-change-sm" onclick="openAssignSupervisor('${t.id}')">Change</button>
              <button class="btn-change-sm" style="color:#dc2626;" onclick="removeAssignment('${t.id}')">Remove</button>
            </div>
          </div>`;
      }).join('');
}

function openAssignSupervisor(teamID) {
  const t = findTeam(teamID); if (!t) return;
  const currentSup = t.supervisorID;

  const options = SUPERVISORS.map(s => `
    <option value="${s.id}" ${s.id === currentSup ? 'selected' : ''}>${s.name} — ${s.department} (${supTeamCount(s.id)} teams)</option>
  `).join('');

  showModal(`
    <div class="modal-header">
      <div class="modal-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></div>
      <h2>${currentSup ? 'Change' : 'Assign'} Supervisor</h2>
      <p>${t.name} · ${t.id}</p>
    </div>
    <div class="modal-body">
      <div class="m-info-box"><strong>Project:</strong> ${t.project}</div>
      <div class="m-fg">
        <label>Select Supervisor</label>
        <select class="m-select" id="asgn-sup">
          ${!currentSup ? '<option value="">— Select a supervisor —</option>' : ''}
          ${options}
        </select>
      </div>
    </div>
    <div class="modal-footer">
      <button class="m-btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="m-btn-primary" onclick="submitAssignment('${t.id}')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        ${currentSup ? 'Update' : 'Assign'}
      </button>
    </div>
  `);
}

function submitAssignment(teamID) {
  const t = findTeam(teamID); if (!t) return;
  const supID = document.getElementById('asgn-sup').value;
  if (!supID) return;
  t.supervisorID = supID;
  closeModal();
  renderAssignments();
  renderTeams();
  renderDashboard();
}

function removeAssignment(teamID) {
  const t = findTeam(teamID); if (!t) return;
  t.supervisorID = null;
  renderAssignments();
  renderTeams();
  renderDashboard();
}

/* ══════════════════════════════════════
   REPORTS TAB
══════════════════════════════════════ */
function renderReports() {
  const tbody = document.getElementById('reports-tbody');
  const marked = REPORTS.filter(r => r.marks !== null);
  const avg    = marked.length ? (marked.reduce((sum, r) => sum + r.marks, 0) / marked.length).toFixed(1) : '0.0';
  const withFb = REPORTS.filter(r => r.feedback && r.feedback.length > 0).length;

  document.getElementById('total-reports').textContent = REPORTS.length;
  document.getElementById('avg-marks').textContent     = avg;
  document.getElementById('with-feedback').textContent = withFb;

  if (REPORTS.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="padding:32px;text-align:center;color:var(--text-mute);">No reports submitted yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = REPORTS.map(r => {
    const t = findTeam(r.teamID);
    const s = r.supervisorID ? findSupervisor(r.supervisorID) : null;
    const marksBadge = r.marks !== null
      ? `<span class="status-badge ${r.marks >= 8 ? 's-approved' : r.marks >= 6 ? 's-pending' : 's-danger'}">${r.marks} / 10</span>`
      : `<span class="status-badge s-none">Not graded</span>`;
    return `
      <tr>
        <td style="font-weight:700;color:var(--primary);">Week ${r.week}</td>
        <td>${t ? t.name : '—'}<br><span style="font-size:.7rem;color:var(--text-mute);font-family:monospace;">${r.teamID}</span></td>
        <td>${s ? s.name : '<span style="color:var(--text-mute);">—</span>'}</td>
        <td style="text-align:center;">${marksBadge}</td>
        <td style="font-size:.8rem;color:var(--text-soft);max-width:260px;">${r.feedback || '<span style="color:var(--text-mute);">No feedback</span>'}</td>
        <td style="color:var(--text-mute);font-size:.78rem;">${r.submitted}</td>
      </tr>`;
  }).join('');
}

/* ══════════════════════════════════════
   INIT
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  renderDashboard();
  renderStudents();
  renderSupervisors();
  renderTeams();
  renderAssignments();
  renderReports();
});