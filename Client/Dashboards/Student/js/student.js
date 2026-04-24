
const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  window.location.href = "../login.html";
}

const STATE = {
  studentId: user.student_code,
  studentName: user.name,
  teamId: null,
  projectTitle: null,
  members: [],
  selectedSupervisor: null,
  teamCreated: false,
  uploadedFiles: [],
  unreadNotifs: 2,
  proposalState: 'idle', // idle | pending | approved | rejected
  proposalFile: null,
  selectedEvalStudent: 0, // index into allStudents array
};

/* ── Fake user database ── */
const FAKE_USERS = [
  { id:'STD20261234', name:'Bilal Khan',   initials:'BK' },
  { id:'STD20265678', name:'Sara Noor',    initials:'SN' },
  { id:'STD20269012', name:'Usman Tariq',  initials:'UT' },
  { id:'STD20263456', name:'Ayesha Malik', initials:'AM' },
  { id:'STD20267890', name:'Hassan Raza',  initials:'HR' },
  { id:'STD20262345', name:'Fatima Zaidi', initials:'FZ' },
  { id:'STD20266789', name:'Zain Ahmed',   initials:'ZA' },
  { id:'STD20260123', name:'Nadia Iqbal',  initials:'NI' },
];

/* ── Supervisors ── */
const SUPERVISORS = [
  { id:'SUP-001', name:'Dr. Aftab Ahmad',    dept:'FYP Coordinator · Dept. of Computer Science', tags:['AI','Machine Learning','Computer Vision','NLP'] },
  { id:'SUP-002', name:'Dr. Nadeem Iqbal',   dept:'Head, CS Department', tags:['Networks','Security','IoT'] },
  { id:'SUP-003', name:'Dr. Sara Khan',      dept:'Assistant Professor', tags:['Web Dev','Cloud','Software Eng'] },
  { id:'SUP-004', name:'Dr. Bilal Hussain',  dept:'Associate Professor', tags:['Data Science','Big Data','Analytics'] },
  { id:'SUP-005', name:'Dr. Zara Mahmood',   dept:'Lecturer, CS',        tags:['Mobile Dev','Flutter','Android'] },
  { id:'SUP-006', name:'Dr. Faisal Mehmood', dept:'Associate Professor', tags:['Cybersecurity','Cryptography'] },
];

/* ══════════════════════════════════
   MARKS DATA (per student)
   Total = 200 marks
   Components:
   - Monthly Meetings: Oct(5), Nov(5), Dec(5), Feb(5), Mar(5), Apr(5), May(5) = 35
   - Proposal: 15
   - Progress Report: 20
   - Internal Viva 1: 25
   - Internal Viva 2: 25
   - External Viva: 50
   - Documentation: 30
   TOTAL = 200
══════════════════════════════════ */
const MARKS_TEMPLATE = [
  // Section: Monthly Meetings
  { section: 'Monthly Meetings', component: 'October',   max: 10 },
  { section: 'Monthly Meetings', component: 'November',  max: 10 },
  { section: 'Monthly Meetings', component: 'December',  max: 10 },
  { section: 'Monthly Meetings', component: 'February',  max: 10 },
  { section: 'Monthly Meetings', component: 'March',     max: 10 },
  // Section: Submissions
  { section: 'Submissions', component: 'Proposal Submission', max: 10 },
  { section: 'Submissions', component: 'Progress Report',  max: 20 },
  // Section: Viva
  { section: 'Viva', component: 'Internal Viva 1', max: 25 },
  { section: 'Viva', component: 'Internal Viva 2', max: 25 },
  { section: 'Viva', component: 'External Viva',   max: 50 },
];

// Generate sample marks for a student (some pending)
function generateMarks(seed) {
  const rng = (min, max) => {
    seed = (seed * 9301 + 49297) % 233280;
    return Math.floor(min + (seed / 233280) * (max - min + 1));
  };
  return MARKS_TEMPLATE.map((item, i) => {
    // First 5 months evaluated, rest pending
    if (item.section === 'Monthly Meetings') {
      const monthIdx = i; // 0-6
      if (monthIdx < 5) {
        return { ...item, marks: rng(Math.floor(item.max * 0.6), item.max) };
      }
      return { ...item, marks: null };
    }
    if (item.component === 'Proposal') return { ...item, marks: rng(10, 14) };
    if (item.component === 'Progress Report') return { ...item, marks: rng(12, 18) };
    // Rest pending
    return { ...item, marks: null };
  });
}

// Per-student marks storage
let STUDENT_MARKS = {};

function getAllStudents() {
  const students = [
    { id: STATE.studentId, name: STATE.studentName, initials: initials(STATE.studentName) },
    ...STATE.members.map(m => ({ id: m.id, name: m.name, initials: m.initials })),
  ];
  return students;
}

function ensureMarksExist() {
  const students = getAllStudents();
  students.forEach((s, i) => {
    if (!STUDENT_MARKS[s.id]) {
      STUDENT_MARKS[s.id] = generateMarks(s.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) + i * 1000);
    }
  });
}

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
  supervisor: 'Supervisor information and contact details',
  progress:   'Marks breakdown, charts, and evaluation progress',
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
  if (tab === 'progress') renderEvaluation();
  if (tab === 'project')  setProposalState(STATE.proposalState);
  closeNotifDropdown();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ══════════════════════════════════
   NOTIFICATION DROPDOWN
══════════════════════════════════ */
function toggleNotifDropdown(e) {
  e.stopPropagation();
  document.getElementById('notif-dropdown').classList.toggle('open');
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

document.addEventListener('click', function(e) {
  const wrap = document.getElementById('notif-btn')?.closest('.nav-notif-wrap');
  if (wrap && !wrap.contains(e.target)) closeNotifDropdown();
});

/* ══════════════════════════════════
   PROPOSAL SUBMISSION (simplified)
══════════════════════════════════ */
function setProposalState(state) {
  STATE.proposalState = state;
  const area = document.getElementById('proposal-state-area');
  const badge = document.getElementById('proposal-status-badge');
  if (!area) return;

  if (state === 'idle') {
    badge.textContent = 'Not Submitted';
    badge.className = 'status-badge s-none';
    area.innerHTML = `
      <div class="proposal-upload-zone" id="proposal-drop-zone"
           onclick="document.getElementById('proposal-file-input').click()"
           ondragover="event.preventDefault();this.classList.add('drag-over')"
           ondragleave="this.classList.remove('drag-over')"
           ondrop="handleProposalDrop(event)">
        <div class="puz-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        </div>
        <div class="puz-text">Drag & drop your proposal or <span style="color:var(--primary);text-decoration:underline;font-weight:700">browse</span></div>
        <div class="puz-hint">PDF or DOCX · Max 20 MB</div>
        <input type="file" id="proposal-file-input" hidden accept=".pdf,.docx,.doc" onchange="handleProposalUpload(this.files)">
      </div>`;
  } else if (state === 'pending') {
    badge.textContent = 'Pending Review';
    badge.className = 'status-badge s-pending';
    area.innerHTML = `
      <div class="proposal-pending-state">
        <div class="pstate-icon pending">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <div class="pstate-info">
          <strong>Proposal Under Review</strong>
          <span>Your proposal has been submitted and is awaiting approval from your supervisor.</span>
          ${STATE.proposalFile ? `<div class="proposal-filename">${STATE.proposalFile}</div>` : ''}
        </div>
      </div>`;
  } else if (state === 'approved') {
    badge.textContent = 'Approved';
    badge.className = 'status-badge s-approved';
    badge.style.background = 'rgba(0,75,45,.1)';
    badge.style.color = 'var(--primary)';
    area.innerHTML = `
      <div class="proposal-approved-state">
        <div class="pstate-icon approved">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div class="pstate-info">
          <strong>Proposal Approved</strong>
          <span>Your FYP proposal has been officially approved by your supervisor.</span>
          ${STATE.proposalFile ? `<div class="proposal-filename">${STATE.proposalFile}</div>` : ''}
        </div>
      </div>`;
  } else if (state === 'rejected') {
    badge.textContent = 'Rejected';
    badge.className = 'status-badge s-rejected';
    area.innerHTML = `
      <div class="proposal-rejected-state">
        <div style="display:flex;gap:14px;align-items:center">
          <div class="pstate-icon rejected">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </div>
          <div class="pstate-info">
            <strong>Proposal Rejected</strong>
            <span>Your proposal was not approved. Please revise and re-upload.</span>
          </div>
        </div>
        <div class="proposal-upload-zone" style="margin-top:12px"
             onclick="document.getElementById('proposal-file-input-re').click()"
             ondragover="event.preventDefault();this.classList.add('drag-over')"
             ondragleave="this.classList.remove('drag-over')"
             ondrop="handleProposalDrop(event)">
          <div class="puz-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
          <div class="puz-text">Re-upload revised proposal</div>
          <div class="puz-hint">PDF or DOCX · Max 20 MB</div>
          <input type="file" id="proposal-file-input-re" hidden accept=".pdf,.docx,.doc" onchange="handleProposalUpload(this.files)">
        </div>
      </div>`;
  }
}

function handleProposalUpload(files) {
  if (!files.length) return;
  const file = files[0];
  const ext = file.name.split('.').pop().toLowerCase();
  if (!['pdf','docx','doc'].includes(ext)) {
    toast('Only PDF and DOCX files are accepted', 'red');
    return;
  }
  if (file.size > 20 * 1024 * 1024) {
    toast('File exceeds 20 MB limit', 'red');
    return;
  }
  STATE.proposalFile = file.name;
  STATE.proposalState = 'pending';
  setProposalState('pending');
  toast('Proposal uploaded successfully ✓', 'gold');
}

function handleProposalDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  if (e.dataTransfer.files.length) handleProposalUpload(e.dataTransfer.files);
}

/* ══════════════════════════════════
   EVALUATION & MARKS RENDERING
══════════════════════════════════ */
let marksChart = null;

function renderEvaluation() {
  ensureMarksExist();
  renderStudentTabs();
  renderMarksForStudent(STATE.selectedEvalStudent);
}

function renderStudentTabs() {
  const tabs = document.getElementById('student-tabs');
  if (!tabs) return;
  const students = getAllStudents();
  tabs.innerHTML = students.map((s, i) => `
    <button class="student-tab-btn ${i === STATE.selectedEvalStudent ? 'active' : ''}"
            onclick="selectEvalStudent(${i})">
      <div class="stb-av">${s.initials}</div>
      ${s.name}
    </button>`).join('');
}

function selectEvalStudent(idx) {
  STATE.selectedEvalStudent = idx;
  renderStudentTabs();
  renderMarksForStudent(idx);
}

function renderMarksForStudent(idx) {
  const students = getAllStudents();
  const student = students[idx];
  if (!student) return;
  const marks = STUDENT_MARKS[student.id];
  if (!marks) return;

  // Calculate total
  let totalObtained = 0;
  let totalMax = 0;
  marks.forEach(m => {
    totalMax += m.max;
    if (m.marks !== null) totalObtained += m.marks;
  });
  const pct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;

  // Update total card
  document.getElementById('eval-total-val').textContent = totalObtained;
  document.getElementById('eval-pct-ring').innerHTML = pct + '<small>%</small>';
  document.getElementById('eval-student-name-label').textContent = student.name;

  // Update progress bar
  document.getElementById('prog-bar-pct').textContent = pct + '%';
  document.getElementById('eval-prog-fill').style.width = pct + '%';

  // Render marks table
  renderMarksTable(marks, totalObtained, totalMax);

  // Render charts
  renderPieChart(marks);
  renderBreakdown(marks, totalObtained, totalMax);
}

function getMarkColor(marks, max) {
  if (marks === null) return 'mark-pending';
  const pct = (marks / max) * 100;
  if (pct >= 75) return 'mark-green';
  if (pct >= 50) return 'mark-yellow';
  return 'mark-red';
}

function renderMarksTable(marks, totalObtained, totalMax) {
  const tbody = document.getElementById('marks-comp-tbody');
  if (!tbody) return;

  let html = '';
  let currentSection = '';

  marks.forEach(m => {
    if (m.section !== currentSection) {
      currentSection = m.section;
      html += `<tr class="section-header"><td colspan="3">${currentSection}</td></tr>`;
    }
    const color = getMarkColor(m.marks, m.max);
    const pctW = m.marks !== null ? Math.round((m.marks / m.max) * 100) : 0;

    html += `<tr>
      <td>${m.component}</td>
      <td style="text-align:right">${m.max}</td>
      <td>
        ${m.marks !== null ? `
          <div class="mc-marks-cell ${color}">
            <div class="mc-mark-bar"><div class="mc-mark-fill" style="width:${pctW}%"></div></div>
            <span class="mc-mark-num">${m.marks}</span>
            <span class="mc-mark-out">/ ${m.max}</span>
          </div>` : `
          <div class="mc-marks-cell mark-pending" style="justify-content:flex-end">
            <span class="mc-pending-badge">Pending</span>
          </div>`}
      </td>
    </tr>`;
  });

  // Total row
  const totalPct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
  const totalColor = totalPct >= 75 ? 'mark-green' : totalPct >= 50 ? 'mark-yellow' : 'mark-red';
  html += `<tr class="total-row">
    <td>GRAND TOTAL</td>
    <td style="text-align:right">${totalMax}</td>
    <td>
      <div class="mc-marks-cell ${totalColor}">
        <span class="mc-mark-num" style="font-size:1.2rem">${totalObtained}</span>
        <span class="mc-mark-out">/ ${totalMax}</span>
      </div>
    </td>
  </tr>`;

  tbody.innerHTML = html;
}

function renderPieChart(marks) {
  const canvas = document.getElementById('marksChart');
  if (!canvas) return;

  // Group by section
  const sections = {};
  marks.forEach(m => {
    if (!sections[m.section]) sections[m.section] = { obtained: 0, max: 0 };
    sections[m.section].max += m.max;
    if (m.marks !== null) sections[m.section].obtained += m.marks;
  });

  const labels = Object.keys(sections);
  const data = labels.map(l => sections[l].obtained);
  const colors = ['#004b2d', '#1f7a5c', '#bfa14a', '#2a9670', '#d4b96b'];

  if (marksChart) marksChart.destroy();

  marksChart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 2,
        borderColor: '#fff',
        hoverOffset: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '55%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#003520',
          titleFont: { family: "'DM Sans', sans-serif", size: 12, weight: '700' },
          bodyFont: { family: "'DM Sans', sans-serif", size: 11 },
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: function(ctx) {
              const section = labels[ctx.dataIndex];
              return ` ${section}: ${ctx.parsed} / ${sections[section].max}`;
            }
          }
        }
      }
    }
  });

  // Legend
  const legend = document.getElementById('chart-legend');
  if (legend) {
    legend.innerHTML = labels.map((l, i) => `
      <div class="cl-item">
        <div class="cl-dot" style="background:${colors[i]}"></div>
        ${l}: <strong>${data[i]}</strong> / ${sections[l].max}
      </div>`).join('');
  }
}

function renderBreakdown(marks, totalObtained, totalMax) {
  const list = document.getElementById('breakdown-list');
  if (!list) return;

  // Group by section
  const sections = {};
  marks.forEach(m => {
    if (!sections[m.section]) sections[m.section] = { obtained: 0, max: 0 };
    sections[m.section].max += m.max;
    if (m.marks !== null) sections[m.section].obtained += m.marks;
  });

  const colors = { 'Monthly Meetings': '#004b2d', 'Submissions': '#1f7a5c', 'Viva': '#bfa14a' };

  list.innerHTML = Object.entries(sections).map(([name, s]) => {
    const pct = s.max > 0 ? Math.round((s.obtained / s.max) * 100) : 0;
    const color = colors[name] || '#004b2d';
    return `
      <div style="margin-bottom:4px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <span style="font-size:.78rem;font-weight:600;color:var(--text-soft)">${name}</span>
          <span style="font-size:.78rem;font-weight:800;color:${color}">${s.obtained} / ${s.max}</span>
        </div>
        <div style="height:8px;background:var(--border-soft);border-radius:4px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:${color};border-radius:4px;transition:width .8s ease"></div>
        </div>
      </div>`;
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
  if (e.dataTransfer.files.length) processFiles(e.dataTransfer.files);
}

function handleFileSelect(files) {
  if (files.length) processFiles(files);
}

function processFiles(files) {
  Array.from(files).forEach(file => {
    if (file.size > 20 * 1024 * 1024) {
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
  if (!proj) { toast('Please fill in Project Title', 'red'); return; }
  STATE.projectTitle = proj;
  STATE.teamId = 'TEAM2026' + (Math.floor(Math.random() * 9000) + 1000);
  document.getElementById('display-team-id').textContent = STATE.teamId;
  STATE.members = [];
  renderMemberSlots();
  clearSearch();
  showStep(2);
}

function backStep1() { showStep(1); }

function goStep3() {
  const sel = document.getElementById('sup-select');
  if (sel) sel.value = STATE.selectedSupervisor || '';
  updateSupPreview(STATE.selectedSupervisor);
  showStep(3);
}

function backStep2() { showStep(2); }

function selectSupervisor(id) {
  STATE.selectedSupervisor = id || null;
  updateSupPreview(id);
}

function updateSupPreview(id) {
  const preview = document.getElementById('sup-preview');
  if (!id || !preview) { if (preview) preview.style.display = 'none'; return; }
  const sup = SUPERVISORS.find(s => s.id === id);
  if (!sup) { preview.style.display = 'none'; return; }
  document.getElementById('sup-preview-av').textContent   = initials(sup.name);
  document.getElementById('sup-preview-name').textContent = sup.name;
  document.getElementById('sup-preview-dept').textContent = sup.dept;
  preview.style.display = 'flex';
}

function finishSetup() {
  if (!STATE.selectedSupervisor) {
    toast('Please select a supervisor to continue', 'red');
    return;
  }
  STATE.teamCreated = true;
  // Reset marks for new team
  STUDENT_MARKS = {};

  const selSup = SUPERVISORS.find(s => s.id === STATE.selectedSupervisor);
  const chips = [
    { icon:'id',      text: STATE.teamId },
    { icon:'proj',    text: STATE.projectTitle.length > 28 ? STATE.projectTitle.slice(0,28) + '…' : STATE.projectTitle },
    { icon:'members', text: (STATE.members.length + 1) + ' member' + (STATE.members.length !== 0 ? 's' : '') },
  ];
  if (selSup) chips.push({ icon:'sup', text: selSup.name });

  const svgMap = {
    id:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/></svg>`,
    proj:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>`,
    members:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>`,
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
  if (!val.startsWith('STD')) {
    res.innerHTML = '<div class="sr-error">Format must be STD20261234</div>';
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
  const foundUser = FAKE_USERS.find(u => u.id === val);
  if (!foundUser) {
    res.innerHTML = '<div class="sr-empty">No student found with this ID</div>';
    res.classList.add('show'); return;
  }
  if (STATE.members.length >= 2) {
    res.innerHTML = '<div class="sr-error">Team is full (max 2 additional members)</div>';
    res.classList.add('show'); return;
  }
  res.innerHTML = `<div class="sr-item">
    <div class="sr-avatar">${foundUser.initials}</div>
    <div class="sr-info"><strong>${foundUser.name}</strong><small>${foundUser.id}</small></div>
    <button class="sr-add" onclick="addMember('${foundUser.id}','${foundUser.name}','${foundUser.initials}')">+ Add</button>
  </div>`;
  res.classList.add('show');
}

function addMember(id, name, ini) {
  if (STATE.members.length >= 2) { toast('Team is full', 'red'); return; }
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
    <div class="tm-av">${initials(STATE.studentName)}</div>
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

/* ══ Render team tab ══ */
function renderTeamTab() {
  const ti = document.getElementById('team-tab-id');
  const tp = document.getElementById('team-tab-proj');
  if (ti && STATE.teamId) ti.textContent = STATE.teamId;
  if (tp && STATE.projectTitle) tp.textContent = STATE.projectTitle;

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
  if (STATE.teamId) {
    const bannerTeamId = document.getElementById('banner-team-id');
    if (bannerTeamId) bannerTeamId.textContent = STATE.teamId;
    const ovTeamId = document.getElementById('ov-team-id');
    if (ovTeamId) ovTeamId.textContent = STATE.teamId;
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
document.getElementById('nav-std-id').textContent = STATE.studentId;
document.getElementById('nav-name').textContent = STATE.studentName;
document.getElementById('nav-initials').textContent = initials(STATE.studentName);
document.getElementById('banner-name').textContent = STATE.studentName;
document.getElementById('student-id').textContent = STATE.studentId;

// Set initial proposal state
setProposalState('approved');

// Open setup on first visit
setTimeout(() => openSetup(), 500);