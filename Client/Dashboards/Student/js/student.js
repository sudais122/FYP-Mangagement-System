/* ══════════════════════════════════
   STATE
══════════════════════════════════ */
const STATE = {
  studentId: 'STD-2026-' + (Math.floor(Math.random() * 9000) + 1000),
  studentName: 'Ahmed Saeed',
  teamId: null,
  teamName: null,
  projectTitle: null,
  members: [],
  requestedSupervisor: null,
  teamCreated: false,
  uploadedFiles: [],
  sentMessages: [],
  unreadNotifs: 3,
};

/* ── Fake user database ── */
const FAKE_USERS = [
  { id:'STD-2026-1234', name:'Bilal Khan',   initials:'BK' },
  { id:'STD-2026-5678', name:'Sara Noor',    initials:'SN' },
  { id:'STD-2026-9012', name:'Usman Tariq',  initials:'UT' },
  { id:'STD-2026-3456', name:'Ayesha Malik', initials:'AM' },
  { id:'STD-2026-7890', name:'Hassan Raza',  initials:'HR' },
  { id:'STD-2026-2345', name:'Fatima Zaidi', initials:'FZ' },
  { id:'STD-2026-6789', name:'Zain Ahmed',   initials:'ZA' },
  { id:'STD-2026-0123', name:'Nadia Iqbal',  initials:'NI' },
];

/* ── Supervisors ── */
const SUPERVISORS = [
  { id:'SUP-001', name:'Dr. Aftab Ahmad',    dept:'FYP Coordinator',     tags:['AI','Machine Learning','Computer Vision'], slots:3 },
  { id:'SUP-002', name:'Dr. Nadeem Iqbal',   dept:'Head, CS Department', tags:['Networks','Security','IoT'],               slots:2 },
  { id:'SUP-003', name:'Dr. Sara Khan',      dept:'Assistant Professor', tags:['Web Dev','Cloud','Software Eng'],          slots:4 },
  { id:'SUP-004', name:'Dr. Bilal Hussain',  dept:'Associate Professor', tags:['Data Science','Big Data','Analytics'],     slots:2 },
  { id:'SUP-005', name:'Dr. Zara Mahmood',   dept:'Lecturer, CS',        tags:['Mobile Dev','Flutter','Android'],          slots:3 },
  { id:'SUP-006', name:'Dr. Faisal Mehmood', dept:'Associate Professor', tags:['Cybersecurity','Cryptography'],            slots:1 },
];

/* ── Weekly marks data ── */
const WEEKLY_MARKS = [
  { week:1, date:'Mar 8, 2026',  status:'submitted', marks:8, feedback:'Good start, clear project objectives defined.' },
  { week:2, date:'Mar 15, 2026', status:'submitted', marks:7, feedback:'Improve documentation quality and add more details.' },
  { week:3, date:'Mar 22, 2026', status:'submitted', marks:9, feedback:'Excellent progress this week! Great work on literature review.' },
  { week:4, date:'Mar 29, 2026', status:'submitted', marks:7, feedback:'Focus more on system architecture design.' },
  { week:5, date:'Apr 5, 2026',  status:'pending',   marks:null, feedback:null },
];

/* ══════════════════════════════════
   TAB NAVIGATION
══════════════════════════════════ */
const TITLES = {
  home:       'Home',
  team:       'My Team',
  project:    'My Project',
  supervisor: 'Supervisor',
  progress:   'Progress & Evaluation',
};
const SUBS = {
  home:       "Welcome back — here's your project overview",
  team:       'Manage your FYP team and members',
  project:    'Submit proposal, upload files, and track deadlines',
  supervisor: 'Dr. Aftab Ahmad — FYP Coordinator',
  progress:   'Weekly reports, marks, and phase progress',
};

function switchTab(tab, el) {
  document.querySelectorAll('.dash-subpage').forEach(p => p.classList.remove('active'));
  const t = document.getElementById('tab-' + tab);
  if (t) t.classList.add('active');
  document.querySelectorAll('.sb-item').forEach(i => i.classList.remove('active'));
  if (el) el.classList.add('active');
  document.getElementById('page-title').textContent = TITLES[tab] || tab;
  document.getElementById('page-sub').textContent   = SUBS[tab]   || '';
  if (tab === 'team')     renderTeamTab();
  if (tab === 'progress') renderWeeklyMarks();
  closeNotifDropdown();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ══════════════════════════════════
   NOTIFICATION DROPDOWN
══════════════════════════════════ */
function toggleNotifDropdown(e) {
  e.stopPropagation();
  const dd = document.getElementById('notif-dropdown');
  dd.classList.toggle('open');
}

function closeNotifDropdown() {
  document.getElementById('notif-dropdown').classList.remove('open');
}

function markAllRead() {
  STATE.unreadNotifs = 0;
  document.getElementById('notif-dot').classList.add('hidden');
  document.querySelectorAll('.nd-item.nd-unread').forEach(el => el.classList.remove('nd-unread'));
  toast('All notifications marked as read');
  closeNotifDropdown();
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
  const wrap = document.getElementById('notif-btn')?.closest('.nav-notif-wrap');
  if (wrap && !wrap.contains(e.target)) {
    closeNotifDropdown();
  }
});

/* ══════════════════════════════════
   WEEKLY MARKS TABLE
══════════════════════════════════ */
function renderWeeklyMarks() {
  const tbody = document.getElementById('marks-tbody');
  if (!tbody) return;

  tbody.innerHTML = WEEKLY_MARKS.map(w => {
    if (w.status === 'pending') {
      return `<tr class="week-pending">
        <td><span class="week-num">Week ${w.week}</span></td>
        <td>${w.date}</td>
        <td><span class="report-pending">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="11" height="11"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Pending
        </span></td>
        <td><span style="color:var(--text-mute);font-weight:600">— / 10</span></td>
        <td><span style="color:var(--text-mute);font-size:.78rem">Not yet evaluated</span></td>
      </tr>`;
    }
    const pct = (w.marks / 10) * 100;
    const markColor = w.marks >= 9 ? 'var(--secondary)' : w.marks >= 7 ? 'var(--primary)' : '#ca8a04';
    return `<tr>
      <td><span class="week-num">Week ${w.week}</span></td>
      <td>${w.date}</td>
      <td><span class="report-submitted">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="11" height="11"><polyline points="20 6 9 17 4 12"/></svg>
        Submitted
      </span></td>
      <td>
        <div class="marks-val">
          <span class="marks-num" style="color:${markColor}">${w.marks}</span>
          <span class="marks-out">/ 10</span>
          <span class="marks-bar-wrap"><span class="marks-bar-fill" style="width:${pct}%;background:${markColor}"></span></span>
        </div>
      </td>
      <td><span class="marks-feedback-text">${w.feedback}</span></td>
    </tr>`;
  }).join('');
}

/* ══════════════════════════════════
   FILE UPLOAD
══════════════════════════════════ */
function handleDragOver(e) {
  e.preventDefault();
  document.getElementById('upload-area').classList.add('drag-over');
}

function handleDragLeave(e) {
  document.getElementById('upload-area').classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  document.getElementById('upload-area').classList.remove('drag-over');
  const files = e.dataTransfer.files;
  if (files.length) processFiles(files);
}

function handleFileSelect(files) {
  if (files.length) processFiles(files);
}

function processFiles(files) {
  Array.from(files).forEach(file => {
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      toast(`${file.name} exceeds 20 MB limit`, 'red');
      return;
    }
    const allowed = ['pdf','docx','doc','zip','png','jpg','jpeg','xlsx','pptx','txt','py','js'];
    const ext = file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
      toast(`${ext.toUpperCase()} files are not supported`, 'red');
      return;
    }
    const id = Date.now() + Math.random();
    STATE.uploadedFiles.push({ id, name: file.name, size: file.size, ext, status: 'Uploaded' });
    renderUploadedFiles();
    toast(file.name + ' uploaded ✓');
  });
  document.getElementById('file-input').value = '';
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function getFileIconSvg(ext) {
  const pdf  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>`;
  const zip  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`;
  const img  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;
  const code = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`;
  const def  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;
  if (ext === 'pdf') return pdf;
  if (['zip','rar'].includes(ext)) return zip;
  if (['png','jpg','jpeg','gif','webp'].includes(ext)) return img;
  if (['py','js','ts','cpp','java','html','css'].includes(ext)) return code;
  return def;
}

function renderUploadedFiles() {
  const list = document.getElementById('uploaded-files-list');
  if (!STATE.uploadedFiles.length) { list.innerHTML = ''; return; }
  list.innerHTML = STATE.uploadedFiles.map(f => `
    <div class="file-item" id="fi-${f.id}">
      <div class="file-icon">${getFileIconSvg(f.ext)}</div>
      <div class="file-name" title="${f.name}">${f.name}</div>
      <span class="file-size">${formatSize(f.size)}</span>
      <span class="file-status">${f.status}</span>
      <button class="file-remove" onclick="removeFile(${f.id})" title="Remove">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>`).join('');
}

function removeFile(id) {
  STATE.uploadedFiles = STATE.uploadedFiles.filter(f => f.id !== id);
  renderUploadedFiles();
  toast('File removed');
}

/* ══════════════════════════════════
   PROPOSAL SUBMISSION
══════════════════════════════════ */
function submitProposal() {
  const title    = document.getElementById('prop-title').value.trim();
  const abstract = document.getElementById('prop-abstract').value.trim();
  if (!title || !abstract) {
    toast('Please fill in the required fields', 'red');
    return;
  }
  document.getElementById('proposal-submit-view').style.display = 'none';
  document.getElementById('proposal-approved-view').style.display = 'block';
  document.getElementById('proposal-status-badge').textContent = 'Submitted — Pending Review';
  document.getElementById('proposal-status-badge').className = 'status-badge s-pending';
  toast('Proposal submitted successfully ✓', 'gold');
}

/* ══════════════════════════════════
   SUPERVISOR MESSAGES
══════════════════════════════════ */
function sendMessage() {
  const subject = document.getElementById('msg-subject').value.trim();
  const body    = document.getElementById('msg-body').value.trim();
  if (!subject || !body) {
    toast('Please fill in both subject and message', 'red');
    return;
  }
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' }) +
               ' · ' + now.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
  STATE.sentMessages.unshift({ subject, body, time });
  renderSentMessages();
  clearMessage();
  toast('Message sent to Dr. Aftab Ahmad ✓', 'gold');
}

function clearMessage() {
  document.getElementById('msg-subject').value = '';
  document.getElementById('msg-body').value = '';
}

function renderSentMessages() {
  const list = document.getElementById('sent-messages-list');
  if (!STATE.sentMessages.length) { list.innerHTML = ''; return; }
  list.innerHTML = '<div style="margin-top:16px;font-size:.72rem;font-weight:700;color:var(--text-mute);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Sent Messages</div>' +
    STATE.sentMessages.map(m => `
      <div class="sent-msg-item">
        <div class="sent-msg-subject">${m.subject}</div>
        <div class="sent-msg-body">${m.body}</div>
        <div class="sent-msg-time">${m.time}</div>
      </div>`).join('');
}

/* ══════════════════════════════════
   SETUP FLOW (3 steps)
══════════════════════════════════ */
function openSetup() {
  document.getElementById('setup-overlay').style.display = 'flex';
  document.getElementById('display-student-id').textContent = STATE.studentId;
  document.getElementById('leader-std-id').textContent = STATE.studentId;
  document.getElementById('leader-name').textContent   = STATE.studentName;
  document.getElementById('leader-av').textContent     = initials(STATE.studentName);
  showStep(1);
}

function closeSteup() {
  document.getElementById('setup-overlay').style.display = 'none';
  renderTeamTab();
  updateBannerForTeam();
}

function showStep(n) {
  [1, 2, 3, 'done'].forEach(s => {
    document.getElementById('setup-step-' + s).style.display = 'none';
  });
  document.getElementById('setup-step-' + n).style.display = 'block';
}

function goStep2() {
  const proj = document.getElementById('s1-proj').value.trim();
  const team = document.getElementById('s1-team').value.trim();
  if (!proj || !team) { toast('Please fill in Project Title and Team Name', 'red'); return; }
  STATE.projectTitle = proj;
  STATE.teamName = team;
  STATE.teamId = 'TEAM-' + new Date().getFullYear() + '-' + (Math.floor(Math.random() * 9000) + 1000);
  document.getElementById('display-team-id').textContent = STATE.teamId;
  STATE.members = [];
  renderMemberSlots();
  clearSearch();
  showStep(2);
}

function backStep1() { showStep(1); }

function goStep3() {
  renderSupervisors('');
  showStep(3);
}

function backStep2() { showStep(2); }

function finishSetup() {
  STATE.teamCreated = true;
  const reqSup = SUPERVISORS.find(s => s.id === STATE.requestedSupervisor);
  const chips = [
    { icon:'team',    text:'Team: ' + STATE.teamName },
    { icon:'id',      text:STATE.teamId },
    { icon:'proj',    text:STATE.projectTitle.length > 28 ? STATE.projectTitle.slice(0,28) + '…' : STATE.projectTitle },
    { icon:'members', text:(STATE.members.length + 1) + ' member' + (STATE.members.length !== 0 ? 's' : '') },
  ];
  if (reqSup) chips.push({ icon:'sup', text:'Requested: ' + reqSup.name });
  const svgMap = {
    team:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>`,
    id:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/></svg>`,
    proj:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>`,
    members:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>`,
    sup:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  };
  document.getElementById('summary-chips').innerHTML = chips.map(c =>
    `<div class="s-chip">${svgMap[c.icon]}${c.text}</div>`
  ).join('');
  showStep('done');
}

/* ══ Member search ══ */
let searchDebounce;
function searchMember(val) {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => _doSearch(val.trim()), 220);
}

function _doSearch(val) {
  const res = document.getElementById('search-result');
  if (!val) { res.classList.remove('show'); return; }
  if (!val.startsWith('STD-')) {
    res.innerHTML = '<div class="sr-error">⚠ Format must be STD-YEAR-####</div>';
    res.classList.add('show'); return;
  }
  if (val === STATE.studentId) {
    res.innerHTML = '<div class="sr-error">This is your own ID</div>';
    res.classList.add('show'); return;
  }
  if (STATE.members.find(m => m.id === val)) {
    res.innerHTML = '<div class="sr-error">Member already added</div>';
    res.classList.add('show'); return;
  }
  const user = FAKE_USERS.find(u => u.id === val);
  if (!user) {
    res.innerHTML = '<div class="sr-empty">No student found with this ID</div>';
    res.classList.add('show'); return;
  }
  if (STATE.members.length >= 2) {
    res.innerHTML = '<div class="sr-error">Team is full (max 2 additional members)</div>';
    res.classList.add('show'); return;
  }
  res.innerHTML = `<div class="sr-item">
    <div class="sr-avatar">${user.initials}</div>
    <div class="sr-info"><strong>${user.name}</strong><small>${user.id}</small></div>
    <button class="sr-add" onclick="addMember('${user.id}','${user.name}','${user.initials}')">+ Add</button>
  </div>`;
  res.classList.add('show');
}

function addMember(id, name, ini) {
  if (STATE.members.length >= 2) { toast('Team is full — max 2 additional members', 'red'); return; }
  STATE.members.push({ id, name, initials: ini });
  document.getElementById('member-search').value = '';
  document.getElementById('search-result').classList.remove('show');
  renderMemberSlots();
  toast(name + ' added to team ✓');
}

function removeMember(idx) {
  const removed = STATE.members[idx].name;
  STATE.members.splice(idx, 1);
  renderMemberSlots();
  toast(removed + ' removed');
}

function clearSearch() {
  document.getElementById('member-search').value = '';
  document.getElementById('search-result').classList.remove('show');
}

function renderMemberSlots() {
  const list = document.getElementById('members-list');
  const leaderHTML = `<div class="tm-item">
    <div class="tm-av" id="leader-av">${initials(STATE.studentName)}</div>
    <div><div class="tm-name">${STATE.studentName}</div><div class="tm-id">${STATE.studentId}</div></div>
    <span class="tm-role tm-lead">Team Leader</span>
  </div>`;
  const membersHTML = STATE.members.map((m, i) => `
    <div class="tm-item" style="margin-top:8px">
      <div class="tm-av">${m.initials}</div>
      <div><div class="tm-name">${m.name}</div><div class="tm-id">${m.id}</div></div>
      <span class="tm-role tm-member">Member</span>
      <button class="tm-remove" onclick="removeMember(${i})">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>`).join('');
  list.innerHTML = leaderHTML + membersHTML;
  document.getElementById('slot-1').style.display = STATE.members.length < 1 ? 'flex' : 'none';
  document.getElementById('slot-2').style.display = STATE.members.length < 2 ? 'flex' : 'none';
}

/* ══ Supervisor rendering ══ */
function renderSupervisors(filter) {
  const list = document.getElementById('sup-list');
  let sups = SUPERVISORS;
  if (filter) sups = SUPERVISORS.filter(s => s.tags.some(t => t.toLowerCase().includes(filter.toLowerCase())));
  list.innerHTML = sups.map(s => {
    const isReq  = STATE.requestedSupervisor === s.id;
    const hasReq = !!STATE.requestedSupervisor;
    return `<div class="sup-list-item ${isReq ? 'requested' : ''}">
      <div class="sl-avatar">${initials(s.name)}</div>
      <div class="sl-info">
        <div class="sl-name">${s.name}</div>
        <div class="sl-dept">${s.dept}</div>
        <div class="sl-tags">${s.tags.map(t => `<span class="sl-tag">${t}</span>`).join('')}</div>
        <div class="sl-slots">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          ${s.slots} slot${s.slots !== 1 ? 's' : ''} available
        </div>
      </div>
      <button class="btn-request ${isReq ? 'sent' : ''}"
        ${isReq ? 'disabled' : ''} ${hasReq && !isReq ? 'disabled' : ''}
        onclick="requestSupervisor('${s.id}','${s.name}')">
        ${isReq ? '✓ Requested' : 'Send Request'}
      </button>
    </div>`;
  }).join('') || '<div style="padding:24px;text-align:center;color:var(--text-mute)">No supervisors match this filter</div>';
}

function filterSupervisors(val) { renderSupervisors(val); }

function requestSupervisor(id, name) {
  if (STATE.requestedSupervisor && STATE.requestedSupervisor !== id) {
    toast('You already sent a request — wait for response', 'red'); return;
  }
  STATE.requestedSupervisor = id;
  renderSupervisors('');
  toast('Request sent to ' + name + ' ✓', 'gold');
}

/* ══ Render team tab ══ */
function renderTeamTab() {
  const tn = document.getElementById('team-tab-name');
  const ti = document.getElementById('team-tab-id');
  const tp = document.getElementById('team-tab-proj');
  if (STATE.teamName) {
    tn.textContent = STATE.teamName;
    ti.textContent = STATE.teamId;
    tp.textContent = STATE.projectTitle;
  }

  const display = document.getElementById('team-members-display');
  if (!STATE.teamCreated) {
    display.innerHTML = `<div style="text-align:center;padding:36px 20px">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="48" height="48" style="margin:0 auto 16px;color:var(--border)"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      <h4 style="font-size:1rem;font-weight:700;color:var(--text-soft);margin-bottom:8px">No Team Created Yet</h4>
      <p style="font-size:.84rem;color:var(--text-mute);margin-bottom:20px">Create your team to start your FYP journey.</p>
      <button class="btn btn-primary" onclick="openSetup()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Create Team
      </button>
    </div>`;
    return;
  }

  const allMembers = [
    { id: STATE.studentId, name: STATE.studentName, initials: initials(STATE.studentName), role: 'Team Leader' },
    ...STATE.members.map(m => ({ ...m, role: 'Member' })),
  ];
  display.innerHTML = allMembers.map(m => `
    <div class="tm-item" style="margin-bottom:8px">
      <div class="tm-av">${m.initials}</div>
      <div>
        <div class="tm-name">${m.name}${m.role === 'Team Leader' ? ' (You)' : ''}</div>
        <div class="tm-id">${m.id}</div>
      </div>
      <span class="tm-role ${m.role === 'Team Leader' ? 'tm-lead' : 'tm-member'}">${m.role}</span>
    </div>`).join('');
}

function updateBannerForTeam() {
  if (STATE.teamName) {
    document.getElementById('banner-team-name').textContent  = STATE.teamName;
    document.getElementById('banner-team-id').textContent    = STATE.teamId;
    document.getElementById('ov-team-name').textContent      = STATE.teamName;
    document.getElementById('ov-team-id').textContent        = STATE.teamId;
    document.getElementById('team-tab-name').textContent     = STATE.teamName;
    document.getElementById('team-tab-id').textContent       = STATE.teamId;
    document.getElementById('team-tab-proj').textContent     = STATE.projectTitle;
    document.getElementById('home-team-name').textContent    = STATE.teamName;
  }
}

/* ══════════════════════════════════
   HELPERS
══════════════════════════════════ */
function initials(name) {
  return (name || '').split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

let toastTimer;
function toast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast' + (type === 'red' ? ' red' : type === 'gold' ? ' gold' : '') + ' show';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

/* ══════════════════════════════════
   INIT
══════════════════════════════════ */
// Set student ID in navbar
document.getElementById('nav-std-id').textContent = STATE.studentId;

// Render weekly marks on load (so data is ready when tab is opened)
renderWeeklyMarks();

// Show setup on first load (simulate first-time login)
setTimeout(() => openSetup(), 500);