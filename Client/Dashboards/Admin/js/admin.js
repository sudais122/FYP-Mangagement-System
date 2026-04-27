/* ════════════════════════════════════
   DATA
══════════════════════════════════════ */
const supervisors = [
  { id: 'SUP20261201', name: 'Dr. Sajid Ali',     email: 'sajid.ali@awkum.edu.pk',     teams: 5, capacity: 6 },
  { id: 'SUP20261202', name: 'Dr. Naila Khan',    email: 'naila.khan@awkum.edu.pk',    teams: 4, capacity: 6 },
  { id: 'SUP20261203', name: 'Dr. Faisal Ahmed',  email: 'faisal.ahmed@awkum.edu.pk',  teams: 3, capacity: 6 },
  { id: 'SUP20261204', name: 'Dr. Sana Iqbal',    email: 'sana.iqbal@awkum.edu.pk',    teams: 2, capacity: 6 },
  { id: 'SUP20261205', name: 'Dr. Imran Yousaf',  email: 'imran.y@awkum.edu.pk',       teams: 6, capacity: 6 },
  { id: 'SUP20261206', name: 'Dr. Aliya Hussain', email: 'aliya.h@awkum.edu.pk',       teams: 1, capacity: 6 }
];

const teams = [
  { id:'TEAM20261284', members:4, supId:'SUP20261201'    },
  { id:'TEAM20261283',    members:3, supId:'SUP20261202'    },
  { id:'TEAM20261282',    members:4, supId:'SUP20261203'   },
  { id:'TEAM20261281',     members:3, supId:'SUP20261201'    },
  { id:'TEAM20261280',    members:4, supId:'SUP20261204'    },
  { id:'TEAM20261279', members:3, supId:'SUP20261205'   },
  { id:'TEAM20261278',    members:4, supId:'SUP20261202'    },
  { id:'TEAM20261277',    members:3, supId:'SUP20261206'   }
];

const students = [
  { id:'STD20261001', name:'Ali Hassan',     teamId:'TEAM20261284', total:178 },
  { id:'STD20261002', name:'Mariam Khan',    teamId:'TEAM20261284', total:185 },
  { id:'STD20261003', name:'Usman Tariq',    teamId:'TEAM20261284', total:172 },
  { id:'STD20261004', name:'Ayesha Malik',   teamId:'TEAM20261284', total:191 },
  { id:'STD20261005', name:'Bilal Ahmed',    teamId:'TEAM20261283', total:155 },
  { id:'STD20261006', name:'Fatima Noor',    teamId:'TEAM20261283', total:148 },
  { id:'STD20261007', name:'Hamza Sheikh',   teamId:'TEAM20261283', total:160 },
  { id:'STD20261008', name:'Zara Hussain',   teamId:'TEAM20261282', total:118 },
  { id:'STD20261009', name:'Omar Latif',     teamId:'TEAM20261282', total:112 },
  { id:'STD20261010', name:'Iqra Rashid',    teamId:'TEAM20261281', total:182 },
  { id:'STD20261011', name:'Saad Munir',     teamId:'TEAM20261281', total:175 },
  { id:'STD20261012', name:'Hira Aslam',     teamId:'TEAM20261280', total:128 }
];

/* ════════════════════════════════════
   ICONS
══════════════════════════════════════ */
const ICONS = {
  'sup-add':  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M16 21v-2a4 4 0 0 0-8 0v2"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>',
  'team':     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
  'marks':    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  'reassign': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  'students': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/></svg>',
  'login':    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>'
};

const AVATAR_VARIANTS = ['', 'gold', 'dark'];

/* ════════════════════════════════════
   HELPERS
══════════════════════════════════════ */
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);
const initials = s => s.split(' ').filter(p => p && /[A-Za-z]/.test(p[0])).slice(-2).map(p => p[0].toUpperCase()).join('');
const supById = id => supervisors.find(s => s.id === id) || { name: '—' };
const teamById = id => teams.find(t => t.id === id) || { name: '—' };

function generateSupId() {
  const max = Math.max(...supervisors.map(s => parseInt(s.id.replace('SUP2026', ''))));
  return 'SUP2026' + String(max + 1).padStart(4, '0');
}

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const symbols = '!@#$%&*';
  let pwd = '';
  for (let i = 0; i < 9; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  pwd += symbols[Math.floor(Math.random() * symbols.length)];
  $('#supPassword').value = pwd;
  $('#pwdHelp').textContent = '✓ Strong password generated · Will be emailed to supervisor';
  $('#pwdHelp').className = 'form-help success';
}

function toast(message, subtitle, type = 'success') {
  const wrap = $('#toastWrap');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  const icons = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>',
    error:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    warn:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>'
  };
  t.innerHTML = `<div class="toast-icon">${icons[type] || icons.success}</div><div class="toast-text"><strong>${message}</strong><span>${subtitle}</span></div>`;
  wrap.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 3500);
}

/* ════════════════════════════════════
   VIEW ROUTING
══════════════════════════════════════ */
function switchView(view) {
  $$('.view').forEach(v => v.classList.remove('active'));
  $$('.nav-item').forEach(n => n.classList.remove('active'));
  $(`#view-${view}`).classList.add('active');
  $$(`.nav-item[data-view="${view}"]`).forEach(n => n.classList.add('active'));
  // close mobile sidebar
  $('#sidebar').classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

$$('.nav-item').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    const view = item.dataset.view;
    if (view) switchView(view);
  });
});

$('#mobileMenuBtn')?.addEventListener('click', () => {
  $('#sidebar').classList.toggle('open');
});

/* ════════════════════════════════════
   RENDER: SUPERVISORS
══════════════════════════════════════ */
function renderSupervisors() {
  const grid = $('#supervisorCards');
  grid.innerHTML = supervisors.map((s, i) => {
    const pct = Math.round((s.teams / s.capacity) * 100);
    const avatarClass = i % 2 === 0 ? '' : 'gold';
    const tagClass = pct >= 100 ? 'danger' : pct >= 70 ? 'warning' : 'success';
    const tagText  = pct >= 100 ? 'Full' : pct >= 70 ? 'Heavy' : 'Available';
    return `
    <div class="entity-card">
      <div class="entity-card-head">
        <div class="entity-info">
          <strong>${s.name}</strong>
          <p>${s.email}</p>
        </div>
      </div>
      <div style="margin-bottom:10px"><span class="id-pill">${s.id}</span></div>
      <div class="entity-stats">
        <div class="entity-stat-cell"><strong>${s.teams}</strong><span>Teams</span></div>
        <div class="entity-stat-cell"><strong>${s.capacity - s.teams}</strong><span>Available</span></div>
      </div>
    </div>`;
  }).join('');
}

/* ════════════════════════════════════
   RENDER: TEAMS
══════════════════════════════════════ */
function renderTeams() {
  const tbody = $('#teamsTable tbody');
  tbody.innerHTML = teams.map((t, i) => {
    const sup = supById(t.supId);
    const statusClass = t.status === 'Active' ? 'success' : t.status === 'Pending' ? 'warning' : 'neutral';
    return `
    <tr>
      <td><span class="id-pill gold">${t.id}</span></td>
      <td>${t.members}</td>
      <td><span style="font-weight:600;color:var(--text)">${sup.name}</span></td>
      <td><span class="tag ${statusClass}">${t.status}</span></td>
      <td>
        <div class="action-row">
          <button class="icon-action" onclick="openReassignModal('${t.id}')" title="Reassign supervisor">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          </button>
          <button class="icon-action" title="View details">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

/* ════════════════════════════════════
   RENDER: STUDENTS
══════════════════════════════════════ */
function renderStudents() {
  const tbody = $('#studentsTable tbody');
  tbody.innerHTML = students.map((s, i) => {
    const team = teamById(s.teamId);
    const sup = supById(team.supId);
    return `
    <tr>
    <td>
      <div class="team-info"><strong>${s.name}</strong><span>Semester 7</span></div></td>
      <td><span class="id-pill">${s.id}</span></td>
      <td>${sup.name}</td>
      <td><strong style="color:var(--primary);font-family:monospace">${s.total}<span style="color:var(--text-mute);font-weight:500">/200</span></strong></td>
      <td><button class="icon-action" title="View profile"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button></td>
    </tr>`;
  }).join('');
}

/* ════════════════════════════════════
   RENDER: MARKS
══════════════════════════════════════ */
function renderMarks() {
  const tbody = $('#marksTable tbody');
  tbody.innerHTML = students.map((s, i) => {
    const team = teamById(s.teamId);
    return `
    <tr>
      <td><span class="id-pill">${s.id}</span></td>
      <td><span class="id-pill">${s.teamId}</span></td>
      <td><strong style="font-family:monospace;color:var(--primary)">${s.total}<span style="color:var(--text-mute);font-weight:500">/200</span></strong></td>
    </tr>`;
  }).join('');
}

/* ════════════════════════════════════
   RENDER: ACTIVITY
══════════════════════════════════════ */
function renderActivity() {
  const wrap = $('#fullActivity');
  wrap.innerHTML = allActivity.map(a => `
    <div class="activity-item">
      <div class="activity-icon" data-color="${a.color}">${ICONS[a.type] || ICONS.team}</div>
      <div class="activity-text"><p>${a.text}</p><time>${a.time}</time></div>
    </div>
  `).join('');
}

/* ════════════════════════════════════
   ADD SUPERVISOR MODAL
══════════════════════════════════════ */
function openSupervisorModal() {
  $('#generatedSupId').textContent = generateSupId();
  $('#supName').value = '';
  $('#supEmail').value = '';
  $('#supPassword').value = '';
  $('#forceChange').checked = true;
  $('#pwdHelp').textContent = 'Minimum 8 characters · Will be sent to supervisor via email';
  $('#pwdHelp').className = 'form-help';
  $('#supervisorModal').classList.add('open');
}
function closeSupervisorModal() { $('#supervisorModal').classList.remove('open'); }

function submitSupervisor() {
  const name = $('#supName').value.trim();
  const email = $('#supEmail').value.trim();
  const pwd = $('#supPassword').value.trim();
  const id = $('#generatedSupId').textContent;
  if (!name || !email || !pwd) {
    toast('Missing fields', 'Please fill in name, email, and password', 'error');
    return;
  }
  if (pwd.length < 8) {
    toast('Weak password', 'Password must be at least 8 characters', 'error');
    return;
  }
  supervisors.unshift({ id, name, email, teams: 0, capacity: 6 });
  closeSupervisorModal();
  renderSupervisors();
  toast('Supervisor created successfully', `${name} · ${id} · Email sent`, 'success');
}

/* ════════════════════════════════════
   REASSIGN MODAL
══════════════════════════════════════ */
let reassignTeamId = null;
function openReassignModal(teamId) {
  reassignTeamId = teamId;
  const team = teamById(teamId);
  const currentSupervisor = supById(team.supId);
  $('#reassignTeamName').textContent = team.id;
  $('#currentSup').value = `${currentSupervisor.name} (${currentSupervisor.id})`;
  const select = $('#newSup');
  select.innerHTML = '<option value="">— Choose a supervisor —</option>' +
    supervisors.filter(s => s.id !== team.supId)
      .map(s => `<option value="${s.id}">${s.name} · ${s.teams}/${s.capacity} teams</option>`).join('');
  $('#reassignModal').classList.add('open');
}
function closeReassignModal() { $('#reassignModal').classList.remove('open'); }
function confirmReassign() {
  const newSupId = $('#newSup').value;
  if (!newSupId) {
    toast('Select a supervisor', 'Please choose a new supervisor first', 'error');
    return;
  }
  const team = teamById(reassignTeamId);
  const oldSup = supById(team.supId);
  const newSup = supById(newSupId);
  oldSup.teams = Math.max(0, oldSup.teams - 1);
  newSup.teams += 1;
  team.supId = newSupId;
  closeReassignModal();
  renderTeams();
  renderSupervisors();
  toast('Supervisor reassigned', `${team.name} now under ${newSup.name}`, 'success');
}

/* ════════════════════════════════════
   CLOSE MODALS ON OVERLAY CLICK
══════════════════════════════════════ */
$$('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') $$('.modal-overlay.open').forEach(m => m.classList.remove('open'));
});

/* ════════════════════════════════════
   INIT
══════════════════════════════════════ */
renderSupervisors();
renderTeams();
renderStudents();
renderMarks();
renderActivity();
