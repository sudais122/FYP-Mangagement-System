/* ══════════════════════════════════
   DATA — per-student marks model
══════════════════════════════════ */
const SUPERVISOR = {
  id:   'SUP20260001',
  name: 'Dr. Aftab Ahmad',
  dept: 'FYP Coordinator',
};

let TEAMS = [
  {
    teamId: 'TEAM20260001',
    name: 'AI Proctors',
    avatar: 'AP',
    projectTitle: 'AI-Based Exam Proctoring System',
    category: 'Artificial Intelligence',
    status: 'Approved',
    createdOn: 'Mar 1, 2026',
    students: [
      { id:'STD20260001', name:'Ahmed Saeed', role:'Leader', av:'AS' },
      { id:'STD20260002', name:'Bilal Khan',  role:'Member', av:'BK' },
      { id:'STD20260003', name:'Sara Noor',   role:'Member', av:'SN' },
    ],
    proposal: {
      file:'ai_proctors_proposal.pdf', size:'2.4 MB', submittedOn:'Mar 15, 2026', status:'Approved',
      abstract:'This system utilizes computer vision and machine learning to monitor students during online exams, detecting suspicious behaviors like face switching, multiple people in frame, and unusual eye movements. Built using Python, TensorFlow, and OpenCV.',
      tech:'Python, TensorFlow, OpenCV, React',
    },
    reports: [
      { week:1, date:'Mar 8, 2026',  file:'w1_ai_proctors.pdf', status:'Evaluated',
        studentMarks:{
          'STD20260001':{ marks:8, feedback:'Strong leadership in setting up project scope.' },
          'STD20260002':{ marks:7, feedback:'Good research effort, needs deeper reading.' },
          'STD20260003':{ marks:8, feedback:'Solid documentation support.' },
        }},
      { week:2, date:'Mar 15, 2026', file:'w2_ai_proctors.pdf', status:'Evaluated',
        studentMarks:{
          'STD20260001':{ marks:7, feedback:'Maintained good coordination.' },
          'STD20260002':{ marks:6, feedback:'Improve documentation quality.' },
          'STD20260003':{ marks:8, feedback:'Clear progress on literature review.' },
        }},
      { week:3, date:'Mar 22, 2026', file:'w3_ai_proctors.pdf', status:'Evaluated',
        studentMarks:{
          'STD20260001':{ marks:9, feedback:'Excellent overall contribution this week.' },
          'STD20260002':{ marks:8, feedback:'Much improved effort.' },
          'STD20260003':{ marks:10, feedback:'Outstanding work on the research framework!' },
        }},
      { week:4, date:'Mar 29, 2026', file:'w4_ai_proctors.pdf', status:'Evaluated',
        studentMarks:{
          'STD20260001':{ marks:7, feedback:'Focus more on architecture design.' },
          'STD20260002':{ marks:7, feedback:'Contributions are steady.' },
          'STD20260003':{ marks:7, feedback:'Keep the momentum going.' },
        }},
      { week:5, date:'Apr 5, 2026',  file:'w5_ai_proctors.pdf', status:'Pending Review',
        studentMarks:null },
    ],
  },
  {
    teamId: 'TEAM20260002',
    name: 'Web Wizards',
    avatar: 'WW',
    projectTitle: 'E-Commerce Platform with AI Recommendations',
    category: 'Web Development',
    status: 'Approved',
    createdOn: 'Mar 3, 2026',
    students: [
      { id:'STD20260004', name:'Ayesha Malik', role:'Leader', av:'AM' },
      { id:'STD20260005', name:'Hassan Raza',  role:'Member', av:'HR' },
      { id:'STD20260006', name:'Fatima Zaidi', role:'Member', av:'FZ' },
    ],
    proposal: {
      file:'web_wizards_proposal.pdf', size:'1.8 MB', submittedOn:'Mar 12, 2026', status:'Approved',
      abstract:'A full-stack e-commerce platform featuring AI-powered product recommendations based on user behavior, browsing patterns, and purchase history. Includes payment integration and admin dashboard.',
      tech:'React, Node.js, MongoDB, TensorFlow.js',
    },
    reports: [
      { week:1, date:'Mar 8, 2026',  file:'w1_web.pdf', status:'Evaluated',
        studentMarks:{
          'STD20260004':{ marks:9,  feedback:'Outstanding leadership in initial setup.' },
          'STD20260005':{ marks:8,  feedback:'Strong backend research.' },
          'STD20260006':{ marks:10, feedback:'Exceptional UI/UX research work!' },
        }},
      { week:2, date:'Mar 15, 2026', file:'w2_web.pdf', status:'Evaluated',
        studentMarks:{
          'STD20260004':{ marks:8, feedback:'Good frontend progress.' },
          'STD20260005':{ marks:7, feedback:'Backend API structure is solid.' },
          'STD20260006':{ marks:9, feedback:'Beautiful design prototypes.' },
        }},
      { week:3, date:'Mar 22, 2026', file:'w3_web.pdf', status:'Evaluated',
        studentMarks:{
          'STD20260004':{ marks:8, feedback:'Consistent and reliable work.' },
          'STD20260005':{ marks:8, feedback:'API endpoints well-documented.' },
          'STD20260006':{ marks:8, feedback:'Steady design work.' },
        }},
      { week:4, date:'Mar 29, 2026', file:'w4_web.pdf', status:'Pending Review', studentMarks:null },
      { week:5, date:'Apr 5, 2026',  file:'w5_web.pdf', status:'Pending Review', studentMarks:null },
    ],
  },
  {
    teamId: 'TEAM20260003',
    name: 'CloudNative',
    avatar: 'CN',
    projectTitle: 'Multi-Cloud DevOps Monitoring Dashboard',
    category: 'Cloud / DevOps',
    status: 'Pending',
    createdOn: 'Mar 10, 2026',
    students: [
      { id:'STD20260007', name:'Zain Ahmed',  role:'Leader', av:'ZA' },
      { id:'STD20260008', name:'Nadia Iqbal', role:'Member', av:'NI' },
    ],
    proposal: {
      file:'cloudnative_proposal.pdf', size:'2.1 MB', submittedOn:'Apr 10, 2026', status:'Pending',
      abstract:'A unified dashboard to monitor, analyze, and optimize workloads across AWS, Azure, and GCP. Real-time alerts, cost optimization suggestions, and deployment automation.',
      tech:'Go, React, Kubernetes, Terraform',
    },
    reports: [],
  },
  {
    teamId: 'TEAM20260004',
    name: 'DataMinds',
    avatar: 'DM',
    projectTitle: 'Student Performance Analytics Platform',
    category: 'Data Science',
    status: 'Approved',
    createdOn: 'Mar 5, 2026',
    students: [
      { id:'STD20260009', name:'Usman Tariq',   role:'Leader', av:'UT' },
      { id:'STD20260010', name:'Amna Siddiqui', role:'Member', av:'AS' },
      { id:'STD20260011', name:'Kamran Ali',    role:'Member', av:'KA' },
    ],
    proposal: {
      file:'dataminds_proposal.pdf', size:'3.1 MB', submittedOn:'Mar 18, 2026', status:'Approved',
      abstract:'Machine learning-driven platform to analyze student performance patterns, predict at-risk students, and provide personalized learning recommendations to teachers and administrators.',
      tech:'Python, Pandas, Scikit-learn, Flask, React',
    },
    reports: [
      { week:1, date:'Mar 8, 2026',  file:'w1_data.pdf', status:'Evaluated',
        studentMarks:{
          'STD20260009':{ marks:7, feedback:'Strong data collection plan.' },
          'STD20260010':{ marks:7, feedback:'Good contribution to dataset prep.' },
          'STD20260011':{ marks:7, feedback:'Helpful literature support.' },
        }},
      { week:2, date:'Mar 15, 2026', file:'w2_data.pdf', status:'Evaluated',
        studentMarks:{
          'STD20260009':{ marks:8, feedback:'Good EDA approach.' },
          'STD20260010':{ marks:9, feedback:'Excellent statistical analysis.' },
          'STD20260011':{ marks:7, feedback:'Adequate contribution.' },
        }},
      { week:3, date:'Mar 22, 2026', file:'w3_data.pdf', status:'Evaluated',
        studentMarks:{
          'STD20260009':{ marks:6, feedback:'Need to validate data quality more rigorously.' },
          'STD20260010':{ marks:7, feedback:'Good progress on modeling.' },
          'STD20260011':{ marks:5, feedback:'Contribution was below expectation this week.' },
        }},
      { week:4, date:'Mar 29, 2026', file:'w4_data.pdf', status:'Pending Review', studentMarks:null },
    ],
  },
  {
    teamId: 'TEAM20260005',
    name: 'SecureNet',
    avatar: 'SN',
    projectTitle: 'IoT Device Security Monitoring System',
    category: 'Cybersecurity',
    status: 'Pending',
    createdOn: 'Apr 5, 2026',
    students: [
      { id:'STD20260012', name:'Hamza Siddiq', role:'Leader', av:'HS' },
      { id:'STD20260013', name:'Maryam Khan',  role:'Member', av:'MK' },
      { id:'STD20260014', name:'Saad Yousuf',  role:'Member', av:'SY' },
    ],
    proposal: {
      file:'securenet_proposal.pdf', size:'1.9 MB', submittedOn:'Apr 14, 2026', status:'Pending',
      abstract:'Real-time security monitoring system for IoT devices in smart homes and enterprises. Detects anomalous behavior, unauthorized access, and potential attacks using ML-based anomaly detection.',
      tech:'Python, MQTT, TensorFlow, Grafana',
    },
    reports: [],
  },
];

const ACTIVITY = [
  { icon:'proposal', title:"<strong>TEAM20260005</strong> submitted a new proposal", time:'2 hours ago' },
  { icon:'report',   title:"<strong>TEAM20260002</strong> uploaded Week 4 report",    time:'5 hours ago' },
  { icon:'report',   title:"<strong>TEAM20260001</strong> uploaded Week 5 report",    time:'1 day ago' },
  { icon:'proposal', title:"<strong>TEAM20260003</strong> submitted proposal for review", time:'2 days ago' },
  { icon:'team',     title:"<strong>TEAM20260004</strong> joined your supervision",  time:'1 week ago' },
];

const NOTIFICATIONS = [
  { type:'warn',    title:'New Proposal Pending', desc:'TEAM20260005 submitted a proposal for review.', time:'2h ago',   unread:true },
  { type:'warn',    title:'New Proposal Pending', desc:'TEAM20260003 submitted a proposal for review.', time:'2d ago',   unread:true },
  { type:'info',    title:'New Weekly Report',    desc:'TEAM20260002 uploaded Week 4 report.',         time:'5h ago',   unread:true },
  { type:'info',    title:'New Weekly Report',    desc:'TEAM20260001 uploaded Week 5 report.',         time:'1d ago',   unread:true },
  { type:'success', title:'Team Assigned',        desc:'TEAM20260004 joined your supervision.',        time:'1 week ago', unread:false },
];

/* ══════════════════════════════════
   HELPERS — averages from per-student marks
══════════════════════════════════ */
function reportAvg(r) {
  if (!r || !r.studentMarks) return null;
  const arr = Object.values(r.studentMarks).map(s => s.marks).filter(m => m != null);
  return arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length) : null;
}

function studentAvg(team, studentId) {
  const arr = team.reports
    .map(r => r.studentMarks && r.studentMarks[studentId]?.marks)
    .filter(m => m != null);
  return arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length) : null;
}

function studentWeeklyMarks(team, studentId) {
  return team.reports.map(r => ({
    week: r.week,
    marks: r.studentMarks ? (r.studentMarks[studentId]?.marks ?? null) : null,
  }));
}

/* ══════════════════════════════════
   TAB NAVIGATION
══════════════════════════════════ */
const TITLES = {
  dashboard:'Dashboard', teams:'My Teams', projects:'Proposal Management',
  reports:'Weekly Reports', evaluation:'Evaluation & Performance',
};
const SUBS = {
  dashboard:'Overview of your assigned teams and pending actions',
  teams:'Click any team to view full details',
  projects:'Review, approve, or reject student proposals',
  reports:'Grade weekly reports — individual marks per team member',
  evaluation:'Complete performance matrix across all teams and students',
};

function switchTab(tab, el) {
  document.querySelectorAll('.dash-subpage').forEach(p => p.classList.remove('active'));
  const t = document.getElementById('tab-' + tab);
  if (t) t.classList.add('active');
  document.querySelectorAll('.sb-item').forEach(i => i.classList.remove('active'));
  if (el) el.classList.add('active');
  document.getElementById('page-title').textContent = TITLES[tab] || tab;
  document.getElementById('page-sub').textContent   = SUBS[tab]   || '';
  if (tab === 'teams')      renderTeams();
  if (tab === 'projects')   renderProposals();
  if (tab === 'reports')    renderReports();
  if (tab === 'evaluation') renderEvaluation();
  closeNotifDropdown();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ══════════════════════════════════
   NOTIFICATIONS DROPDOWN
══════════════════════════════════ */
function markAllRead() {
  document.getElementById('notif-dot').classList.add('hidden');
  document.querySelectorAll('.nd-item.nd-unread').forEach(el => el.classList.remove('nd-unread'));
  toast('All notifications marked as read');
  closeNotifDropdown();
}
function renderNotifications() {
  const iconMap = {
    success:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    warn:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>`,
    info:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  };
  document.getElementById('nd-list').innerHTML = NOTIFICATIONS.map(n => `
    <div class="nd-item ${n.unread ? 'nd-unread' : ''}">
      <div class="nd-icon nd-${n.type}">${iconMap[n.type]}</div>
      <div class="nd-content">
        <div class="nd-title">${n.title}</div>
        <div class="nd-desc">${n.desc}</div>
        <div class="nd-time">${n.time}</div>
      </div>
    </div>`).join('');
}
document.addEventListener('click', function(e) {
  const wrap = document.getElementById('notif-btn')?.closest('.nav-notif-wrap');
  if (wrap && !wrap.contains(e.target)) closeNotifDropdown();
});

/* ══════════════════════════════════
   DASHBOARD
══════════════════════════════════ */
function renderDashboard() {
  const totalTeams     = TEAMS.length;
  const totalStudents  = TEAMS.reduce((s, t) => s + t.students.length, 0);
  const pendingProps   = TEAMS.filter(t => t.proposal.status === 'Pending').length;
  const allReports     = TEAMS.flatMap(t => t.reports);
  const totalReports   = allReports.length;
  const pendingReports = allReports.filter(r => r.status === 'Pending Review').length;

  document.getElementById('stat-teams').textContent    = totalTeams;
  document.getElementById('stat-students').textContent = totalStudents;
  document.getElementById('stat-pending').textContent  = pendingProps;
  document.getElementById('stat-reports').innerHTML    = (totalReports - pendingReports) + '<span style="font-size:1rem;color:var(--text-mute);font-weight:600">/' + totalReports + '</span>';

  document.getElementById('sb-projects-badge').textContent = pendingProps;
  document.getElementById('sb-reports-badge').textContent  = pendingReports;

  const actions = [];
  TEAMS.forEach(t => {
    if (t.proposal.status === 'Pending') {
      actions.push({ type:'proposal', teamId:t.teamId, teamName:t.name,
        title:'Proposal needs review', desc:t.projectTitle,
        action: () => openProposalReview(t.teamId) });
    }
    t.reports.forEach(r => {
      if (r.status === 'Pending Review') {
        actions.push({ type:'report', teamId:t.teamId, teamName:t.name,
          title:'Week ' + r.week + ' report awaiting grade',
          desc: t.name + ' — ' + r.date + ' · ' + t.students.length + ' students to grade',
          action: () => openReportEval(t.teamId, r.week) });
      }
    });
  });


  const actIcon = {
    proposal:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
    report:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>`,
    team:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>`,
  };
  document.getElementById('teams-glance-list').innerHTML = TEAMS.slice(0, 5).map(t => `
    <div class="team-glance-row" onclick="openTeamDetails('${t.teamId}')">
      <div class="tgr-avatar">${t.avatar}</div>
      <div class="tgr-info">
        <div class="tgr-name">${t.name} <span class="tgr-id">${t.teamId}</span></div>
        <div class="tgr-proj">${t.projectTitle}</div>
      </div>
      <div class="tgr-meta">
        <span class="tgr-members">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          ${t.students.length}
        </span>
        <span class="status-badge ${statusClass(t.status)}">${t.status}</span>
      </div>
    </div>`).join('');
}

function statusClass(s) {
  return s === 'Approved' ? 's-approved' : s === 'Pending' ? 's-pending' : s === 'Rejected' ? 's-rejected' : s === 'Evaluated' ? 's-evaluated' : 's-review';
}

/* ══════════════════════════════════
   TEAMS TAB
══════════════════════════════════ */
function renderTeams() {
  const search = (document.getElementById('teams-search')?.value || '').toLowerCase();
  const filter = document.getElementById('teams-filter')?.value || '';

  let filtered = TEAMS;
  if (search) filtered = filtered.filter(t =>
    t.name.toLowerCase().includes(search) ||
    t.teamId.toLowerCase().includes(search) ||
    t.projectTitle.toLowerCase().includes(search)
  );
  if (filter) filtered = filtered.filter(t => t.status === filter);

  const grid = document.getElementById('teams-grid');
  if (!filtered.length) {
    grid.innerHTML = '<div style="text-align:center;padding:48px;color:var(--text-mute);font-size:.88rem;grid-column:1/-1">No teams match your filter</div>';
    return;
  }
  grid.innerHTML = filtered.map(t => `
    <div class="team-card status-${t.status.toLowerCase()}" onclick="openTeamDetails('${t.teamId}')">
      <div class="tc-head">
        <div style="display:flex;gap:12px;align-items:center">
          <div class="tc-avatar">${t.avatar}</div>
          <div>
            <div class="tc-name">${t.name}</div>
            <div class="tc-id">${t.teamId}</div>
          </div>
        </div>
        <span class="status-badge ${statusClass(t.status)}">${t.status}</span>
      </div>
      <div class="tc-proj">${t.projectTitle}</div>
      <div class="tc-meta">
        <span class="tc-meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          ${t.students.length} students
        </span>
        <span class="tc-meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
          ${t.reports.length} reports
        </span>
        <span class="tc-view">
          View Details
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </span>
      </div>
    </div>`).join('');
}

/* ══════════════════════════════════
   TEAM DETAILS MODAL
══════════════════════════════════ */
function openTeamDetails(teamId) {
  const t = TEAMS.find(x => x.teamId === teamId);
  if (!t) return;
  document.getElementById('team-modal-title').textContent = t.name + ' — Team Details';

  const studentsHtml = t.students.map(s => {
    const avg = studentAvg(t, s.id);
    const avgHtml = avg !== null
      ? `<span style="margin-left:auto;margin-right:10px;font-family:var(--font-display);font-weight:800;color:var(--primary);font-size:.9rem">${avg.toFixed(1)}<span style="font-size:.7rem;color:var(--text-mute);font-weight:600">/10</span></span>`
      : '';
    return `
      <div class="m-student-row">
        <div class="m-student-av">${s.av}</div>
        <div>
          <div class="m-student-name">${s.name}</div>
          <div class="m-student-id">${s.id}</div>
        </div>
        ${avgHtml}
        <span class="m-student-role ${s.role === 'Leader' ? 'm-role-lead' : 'm-role-member'}">${s.role}</span>
      </div>`;
  }).join('');

  const reportsHtml = t.reports.length ? t.reports.map(r => {
    const avg = reportAvg(r);
    return `
    <div class="m-report-row">
      <div class="m-report-week">Week ${r.week}</div>
      <div class="m-report-info">
        <div style="font-size:.82rem;font-weight:600;color:var(--text)">${r.file}</div>
        <div class="m-report-date">${r.date}${avg !== null ? ' · ' + Object.keys(r.studentMarks).length + ' graded' : ''}</div>
      </div>
      ${avg !== null
        ? '<div class="m-report-marks">' + avg.toFixed(1) + '<span style="font-size:.74rem;color:var(--text-mute);font-weight:600">/10 avg</span></div>'
        : '<span class="status-badge s-pending">Pending</span>'}
    </div>`;
  }).join('') : '<div style="text-align:center;padding:20px;color:var(--text-mute);font-size:.84rem">No reports submitted yet</div>';

  // Per-student performance breakdown
  const maxWeek = t.reports.length ? Math.max(...t.reports.map(r => r.week)) : 0;
  const studentPerfHtml = maxWeek > 0 ? t.students.map(s => {
    const weekly = studentWeeklyMarks(t, s.id);
    const avg    = studentAvg(t, s.id);
    const boxes  = weekly.map(w => {
      if (w.marks == null) return `<div class="spr-week-box none" title="Week ${w.week} pending">—</div>`;
      const cls = w.marks >= 8 ? 'high' : w.marks >= 6 ? 'mid' : 'low';
      return `<div class="spr-week-box ${cls}" title="Week ${w.week}: ${w.marks}/10">${w.marks}</div>`;
    }).join('');
    return `
      <div class="student-perf-row">
        <div class="m-student-av">${s.av}</div>
        <div style="flex:1;min-width:0">
          <div class="m-student-name">${s.name}</div>
          <div class="m-student-id">${s.id}</div>
        </div>
        <div class="spr-weeks">${boxes}</div>
        <div class="spr-avg">${avg !== null ? avg.toFixed(1) : '—'}</div>
      </div>`;
  }).join('') : '';

  document.getElementById('team-modal-body').innerHTML = `
    <div class="m-section">
      <div class="m-section-title">Basic Information</div>
      <div class="m-row"><span class="m-key">Team ID</span><span class="m-val mono">${t.teamId}</span></div>
      <div class="m-row"><span class="m-key">Supervisor ID</span><span class="m-val mono">${SUPERVISOR.id}</span></div>
      <div class="m-row"><span class="m-key">Project Title</span><span class="m-val">${t.projectTitle}</span></div>
      <div class="m-row"><span class="m-key">Category</span><span class="m-val">${t.category}</span></div>
      <div class="m-row"><span class="m-key">Created</span><span class="m-val">${t.createdOn}</span></div>
      <div class="m-row"><span class="m-key">Status</span><span class="m-val"><span class="status-badge ${statusClass(t.status)}">${t.status}</span></span></div>
    </div>


    <div class="m-section">
      <div class="m-section-title">Proposal</div>
      <div class="m-row"><span class="m-key">Status</span><span class="m-val"><span class="status-badge ${statusClass(t.proposal.status)}">${t.proposal.status}</span></span></div>
      <div class="m-row"><span class="m-key">Submitted</span><span class="m-val">${t.proposal.submittedOn}</span></div>
      <div class="m-file-card">
        <div class="m-file-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <div style="flex:1;min-width:0">
          <div class="m-file-name">${t.proposal.file}</div>
          <div class="m-file-meta">PDF · ${t.proposal.size}</div>
        </div>
        <button class="m-file-download" onclick="toast('Download started (demo)')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download
        </button>
      </div>
      <div style="margin-top:10px"><div class="m-abstract-box">${t.proposal.abstract}</div></div>
      ${t.proposal.status === 'Pending' ? `
        <div style="margin-top:12px;display:flex;gap:10px;justify-content:flex-end">
          <button class="btn btn-sm btn-danger"  onclick="closeModal('team-modal');openProposalReview('${t.teamId}')">Reject</button>
          <button class="btn btn-sm btn-success" onclick="closeModal('team-modal');openProposalReview('${t.teamId}')">Approve</button>
        </div>` : ''}
    </div>

    <div class="m-section">
      <div class="m-section-title">Weekly Reports (${t.reports.length}) · Team Averages</div>
      ${reportsHtml}
    </div>

    ${studentPerfHtml ? `
    <div class="m-section">
      <div class="m-section-title">Individual Student Performance</div>
      <div class="student-perf-grid">${studentPerfHtml}</div>
      <div style="font-size:.7rem;color:var(--text-mute);margin-top:8px;display:flex;gap:12px;flex-wrap:wrap">
        <span><span class="spr-week-box high" style="display:inline-grid;width:18px;height:18px;font-size:.6rem;vertical-align:middle">9</span> 8–10</span>
        <span><span class="spr-week-box mid" style="display:inline-grid;width:18px;height:18px;font-size:.6rem;vertical-align:middle">7</span> 6–7</span>
        <span><span class="spr-week-box low" style="display:inline-grid;width:18px;height:18px;font-size:.6rem;vertical-align:middle">5</span> 0–5</span>
        <span><span class="spr-week-box none" style="display:inline-grid;width:18px;height:18px;font-size:.6rem;vertical-align:middle">—</span> Pending</span>
      </div>
    </div>` : ''}
  `;
  openModal('team-modal');
}

/* ══════════════════════════════════
   PROPOSALS TAB
══════════════════════════════════ */
function renderProposals() {
  const filter = document.getElementById('proposals-filter')?.value || '';
  let rows = TEAMS;
  if (filter) rows = rows.filter(t => t.proposal.status === filter);

  document.getElementById('proposals-tbody').innerHTML = rows.map(t => `
    <tr>
      <td><span class="td-team-id">${t.teamId}</span></td>
      <td><div class="td-proj-title" title="${t.projectTitle}">${t.projectTitle}</div></td>
      <td style="font-size:.8rem;color:var(--text-mute)">${t.category}</td>
      <td style="font-size:.8rem;color:var(--text-mute)">${t.proposal.submittedOn}</td>
      <td><span class="status-badge ${statusClass(t.proposal.status)}">${t.proposal.status}</span></td>
      <td style="text-align:right">
        <button class="td-action-btn" onclick="openProposalReview('${t.teamId}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          Review
        </button>
      </td>
    </tr>`).join('') || '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-mute)">No proposals match this filter</td></tr>';
}

function openProposalReview(teamId) {
  const t = TEAMS.find(x => x.teamId === teamId);
  if (!t) return;

  document.getElementById('proposal-modal-body').innerHTML = `
    <div class="m-section">
      <div class="m-section-title">Team Info</div>
      <div class="m-row">
        <span class="m-key">Team ID</span>
        <span class="m-val mono">${t.teamId}</span>
      </div>
      <div class="m-row">
        <span class="m-key">Members</span>
        <span class="m-val">${t.students.length} students</span>
      </div>
    </div>

    <div class="m-section">
      <div class="m-section-title">Proposal Details</div>

      <div class="m-row">
        <span class="m-key">Title</span>
        <span class="m-val" style="font-weight:700;color:var(--primary)">
          ${t.projectTitle}
        </span>
      </div>

      <div class="m-row">
        <span class="m-key">Category</span>
        <span class="m-val">${t.category}</span>
      </div>

      <div class="m-row">
        <span class="m-key">Tech Stack</span>
        <span class="m-val">${t.proposal.tech}</span>
      </div>

      <div class="m-row">
        <span class="m-key">Submitted</span>
        <span class="m-val">${t.proposal.submittedOn}</span>
      </div>

      <div class="m-row">
        <span class="m-key">Status</span>
        <span class="m-val">
          <span class="status-badge ${statusClass(t.proposal.status)}">
            ${t.proposal.status}
          </span>
        </span>
      </div>

      <div class="m-file-card">
        <div class="m-file-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>

        <div style="flex:1;min-width:0">
          <div class="m-file-name">${t.proposal.file}</div>
          <div class="m-file-meta">PDF · ${t.proposal.size}</div>
        </div>

        <button class="m-file-download" onclick="toast('Download started (demo)')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download
        </button>
      </div>
    </div>
  `;

  const isPending = t.proposal.status === 'Pending';

  document.getElementById('proposal-modal-footer').innerHTML = isPending ? `
    <button class="btn btn-sm btn-danger"
      onclick="decideProposal('${t.teamId}','Rejected')">
      Reject Proposal
    </button>

    <button class="btn btn-sm btn-success"
      onclick="decideProposal('${t.teamId}','Approved')">
      Approve Proposal
    </button>
  ` : `
    <button class="btn btn-sm btn-ghost"
      onclick="closeModal('proposal-modal')">
      Close
    </button>
  `;

  openModal('proposal-modal');
}
function decideProposal(teamId, decision) {
  const t = TEAMS.find(x => x.teamId === teamId);
  if (!t) return;
  const feedback = (document.getElementById('proposal-feedback')?.value || '').trim();
  t.proposal.status = decision;
  if (decision === 'Approved') t.status = 'Approved';
  if (decision === 'Rejected') t.status = 'Rejected';
  closeModal('proposal-modal');
  toast('Proposal ' + decision.toLowerCase() + ' ✓' + (feedback ? ' (feedback sent)' : ''), decision === 'Approved' ? 'green' : 'red');
  renderDashboard();
  renderProposals();
  renderTeams();
}

function sendFeedback(teamId) {
  const feedback = (document.getElementById('proposal-feedback')?.value || '').trim();
  if (!feedback) { toast('Write feedback before sending', 'red'); return; }
  closeModal('proposal-modal');
  toast('Feedback sent to ' + teamId + ' ✓', 'gold');
}

/* ══════════════════════════════════
   WEEKLY REPORTS TAB
══════════════════════════════════ */
function renderReports() {
  const teamSel = document.getElementById('reports-team-filter');
  if (teamSel.options.length <= 1) {
    TEAMS.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.teamId;
      opt.textContent = t.teamId + ' · ' + t.name;
      teamSel.appendChild(opt);
    });
  }

  const teamF   = teamSel.value;
  const statusF = document.getElementById('reports-status-filter').value;

  const rows = [];
  TEAMS.forEach(t => {
    if (teamF && t.teamId !== teamF) return;
    t.reports.forEach(r => {
      if (statusF && r.status !== statusF) return;
      rows.push({ team: t, report: r });
    });
  });

  document.getElementById('reports-tbody').innerHTML = rows.length ? rows.map(({ team, report }) => {
    const avg = reportAvg(report);
    const gradedCount = report.studentMarks ? Object.keys(report.studentMarks).length : 0;
    return `
    <tr>
      <td><span class="td-team-id">${team.teamId}</span></td>
      <td style="font-weight:600">${team.name}</td>
      <td><span class="td-week">W${report.week}</span></td>
      <td style="font-size:.8rem;color:var(--text-mute)">${report.date}</td>
      <td><span class="status-badge ${statusClass(report.status)}">${report.status}</span></td>
      <td>${avg !== null
        ? '<span class="td-marks">' + avg.toFixed(1) + '</span> <span class="td-marks-out">/10 avg · ' + gradedCount + ' graded</span>'
        : '<span class="td-marks-pending">— / ' + team.students.length + ' students</span>'}</td>
      <td style="text-align:right">
        <button class="td-action-btn ${avg !== null ? 'secondary' : ''}" onclick="openReportEval('${team.teamId}',${report.week})">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          ${avg !== null ? 'Edit' : 'Grade'}
        </button>
      </td>
    </tr>`;
  }).join('') : '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-mute)">No reports match this filter</td></tr>';
}

/* ══════════════════════════════════
   REPORT EVAL — PER STUDENT
══════════════════════════════════ */
function openReportEval(teamId, week) {
  const t = TEAMS.find(x => x.teamId === teamId);
  const r = t?.reports.find(x => x.week === week);
  if (!r) return;

  const existing = r.studentMarks || {};

  const membersHtml = t.students.map(s => {
    const prev     = existing[s.id];
    const initMark = prev ? prev.marks : 5;
    const initFb   = prev ? prev.feedback : '';
    return `
      <div class="member-eval-card">
        <div class="mec-head">
          <div class="m-student-av">${s.av}</div>
          <div style="flex:1">
            <div class="m-student-name">${s.name}</div>
            <div class="m-student-id">${s.id}</div>
          </div>
          <span class="m-student-role ${s.role === 'Leader' ? 'm-role-lead' : 'm-role-member'}">${s.role}</span>
        </div>
        <div class="marks-slider-wrap" style="padding:14px 16px">
          <div class="marks-slider-head">
            <span class="marks-slider-label">Marks</span>
            <div class="marks-slider-display" style="font-size:1.5rem"><span id="mv-${s.id}">${initMark}</span><span>/10</span></div>
          </div>
          <input type="range" class="marks-slider" id="sl-${s.id}" min="0" max="10" step="1" value="${initMark}" style="--val:${initMark * 10}%" oninput="updateMemberSlider('${s.id}', this.value)">
          <div class="marks-scale"><span>0</span><span>2</span><span>4</span><span>5</span><span>6</span><span>8</span><span>10</span></div>
        </div>
        <textarea class="sf-input" id="fb-${s.id}" rows="2" placeholder="Individual feedback for ${s.name.split(' ')[0]}…" style="margin-top:12px;resize:vertical">${initFb}</textarea>
      </div>`;
  }).join('');

  document.getElementById('report-modal-body').innerHTML = `
    <div class="m-section">
      <div class="m-section-title">Report Information</div>
      <div class="m-row"><span class="m-key">Team ID</span><span class="m-val mono">${t.teamId}</span></div>
      <div class="m-row"><span class="m-key">Team Name</span><span class="m-val">${t.name}</span></div>
      <div class="m-row"><span class="m-key">Project</span><span class="m-val">${t.projectTitle}</span></div>
      <div class="m-row"><span class="m-key">Week</span><span class="m-val"><strong style="color:var(--primary);font-family:var(--font-display);font-size:1rem">Week ${r.week}</strong></span></div>
      <div class="m-row"><span class="m-key">Submitted</span><span class="m-val">${r.date}</span></div>
      <div class="m-file-card">
        <div class="m-file-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
        <div style="flex:1;min-width:0">
          <div class="m-file-name">${r.file}</div>
          <div class="m-file-meta">Weekly Report · PDF</div>
        </div>
        <button class="m-file-download" onclick="toast('Opening report (demo)')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          Open
        </button>
      </div>
    </div>

    <div class="m-section">
      <div class="m-section-title">Evaluate Each Member (${t.students.length})</div>
      ${membersHtml}
    </div>

    <div class="team-avg-display">
      <div>
        <div class="team-avg-label">Team Average</div>
        <div style="font-size:.72rem;color:var(--text-mute);margin-top:2px">Computed automatically from individual marks</div>
      </div>
      <div class="team-avg-big"><span id="team-avg-live">—</span><span>/10</span></div>
    </div>
  `;

  document.getElementById('report-modal-footer').innerHTML = `
    <button class="btn btn-sm btn-ghost" onclick="closeModal('report-modal')">Cancel</button>
    <button class="btn btn-sm btn-primary" onclick="saveReportEval('${t.teamId}',${r.week})">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><polyline points="20 6 9 17 4 12"/></svg>
      Save All Evaluations
    </button>
  `;
  openModal('report-modal');
  updateLiveTeamAvg();
}

function updateMemberSlider(studentId, val) {
  document.getElementById('mv-' + studentId).textContent = val;
  document.getElementById('sl-' + studentId).style.setProperty('--val', (val * 10) + '%');
  updateLiveTeamAvg();
}

function updateLiveTeamAvg() {
  const sliders = document.querySelectorAll('[id^="sl-STD"]');
  if (!sliders.length) return;
  const vals = Array.from(sliders).map(s => parseInt(s.value, 10));
  const avg  = vals.reduce((a, b) => a + b, 0) / vals.length;
  const el   = document.getElementById('team-avg-live');
  if (el) el.textContent = avg.toFixed(1);
}

function saveReportEval(teamId, week) {
  const t = TEAMS.find(x => x.teamId === teamId);
  const r = t?.reports.find(x => x.week === week);
  if (!r) return;

  const newMarks = {};
  let anyMissingFb = false;
  t.students.forEach(s => {
    const marks    = parseInt(document.getElementById('sl-' + s.id).value, 10);
    const feedback = (document.getElementById('fb-' + s.id).value || '').trim();
    if (!feedback) anyMissingFb = true;
    newMarks[s.id] = { marks, feedback };
  });

  if (anyMissingFb) {
    toast('Please add feedback for every member', 'red');
    return;
  }

  r.studentMarks = newMarks;
  r.status = 'Evaluated';

  const avg = reportAvg(r);
  closeModal('report-modal');
  toast('Week ' + week + ' graded · Team avg ' + avg.toFixed(1) + '/10 ✓', 'gold');
  renderDashboard();
  renderReports();
}

/* ══════════════════════════════════
   EVALUATION TAB — matrix (team avg)
══════════════════════════════════ */
function renderEvaluation() {
  const tbody      = document.getElementById('eval-matrix-tbody');
  const totalWeeks = 5;

  let classTotal = 0, classCount = 0;
  let topTeam = null, topAvg = 0;
  const rows = [];

  TEAMS.forEach(t => {
    const weekAvgs = [];
    for (let w = 1; w <= totalWeeks; w++) {
      const r = t.reports.find(x => x.week === w);
      weekAvgs.push(r ? reportAvg(r) : null);
    }
    const evaluated = weekAvgs.filter(m => m !== null);
    const total = evaluated.reduce((s, m) => s + m, 0);
    const avg   = evaluated.length ? (total / evaluated.length) : null;
    if (avg !== null) {
      classTotal += avg; classCount++;
      if (avg > topAvg) { topAvg = avg; topTeam = t; }
    }
    rows.push({ t, weekAvgs, total, avg });
  });

  const markCell = (m) => {
    if (m === null) return '<span class="em-mark none">—</span>';
    const cls = m >= 8 ? 'high' : m >= 6 ? 'mid' : 'low';
    return `<span class="em-mark ${cls}">${m.toFixed(1)}</span>`;
  };

  tbody.innerHTML = rows.map(({ t, weekAvgs, total, avg }) => `
    <tr>
      <td>
        <div class="em-team-cell">
          <div class="em-team-avatar">${t.avatar}</div>
          <div class="em-team-info"><strong>${t.name}</strong><small>${t.teamId}</small></div>
        </div>
      </td>
      ${weekAvgs.map(markCell).join('')}
      <td><span class="em-total">${total ? total.toFixed(1) : '—'}</span></td>
      <td><span class="em-avg">${avg !== null ? avg.toFixed(2) : '—'}</span></td>
      <td><input class="em-remark-input" placeholder="Write final remark…" id="remark-${t.teamId}" value="${t.finalRemark || ''}" onblur="saveRemark('${t.teamId}',this.value)"></td>
    </tr>`).join('');

  document.getElementById('eval-stat-teams').innerHTML = TEAMS.length + '<span> teams</span>';
  document.getElementById('eval-stat-avg').innerHTML = (classCount ? (classTotal / classCount).toFixed(2) : '—') + '<span>/10</span>';
  document.getElementById('eval-stat-top').textContent = topTeam ? topTeam.name : '—';
  document.getElementById('eval-stat-top-sub').textContent = topTeam ? topTeam.teamId + ' · Avg ' + topAvg.toFixed(2) + '/10' : '—';
  const allReports   = TEAMS.flatMap(t => t.reports);
  const gradedCount  = allReports.filter(r => r.status === 'Evaluated').length;
  const pendingCount = allReports.filter(r => r.status === 'Pending Review').length;
  document.getElementById('eval-stat-reports').innerHTML = gradedCount + '<span> graded</span>';
  document.querySelector('#eval-stat-reports').nextElementSibling.textContent = pendingCount + ' pending evaluation';

  // NEW: individual student rankings (per-student averages across all weeks)
  const allStudents = [];
  TEAMS.forEach(t => {
    t.students.forEach(s => {
      const avgS = studentAvg(t, s.id);
      if (avgS !== null) allStudents.push({ team: t, student: s, avg: avgS });
    });
  });
  allStudents.sort((a, b) => b.avg - a.avg);

  const remarkHtml = '<h3 style="font-family:var(--font-display);font-size:1.05rem;color:var(--primary);margin:24px 0 14px">Individual Student Rankings</h3>' +
    (allStudents.length ? allStudents.map(({ team, student, avg }, i) => `
      <div class="eval-remark-card">
        <div style="font-family:var(--font-display);font-weight:800;color:var(--gold);font-size:1rem;width:30px;text-align:center">#${i + 1}</div>
        <div class="erc-avatar">${student.av}</div>
        <div class="erc-info">
          <div class="erc-name">${student.name} ${student.role === 'Leader' ? '<span class="m-student-role m-role-lead" style="margin-left:6px;font-size:.62rem">Leader</span>' : ''}</div>
          <div class="erc-id">${student.id} · ${team.teamId} (${team.name})</div>
        </div>
        <div class="erc-avg">${avg.toFixed(2)}<span>/10</span></div>
      </div>`).join('') : '<div style="text-align:center;color:var(--text-mute);padding:20px">No evaluations yet.</div>');

  document.getElementById('eval-remark-cards').innerHTML = remarkHtml;
}

function saveRemark(teamId, val) {
  const t = TEAMS.find(x => x.teamId === teamId);
  if (t && val.trim()) {
    t.finalRemark = val.trim();
    toast('Remark saved for ' + teamId);
  }
}

/* ══════════════════════════════════
   MODAL HELPERS
══════════════════════════════════ */
function openModal(id) {
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
}
document.querySelectorAll('.modal-overlay').forEach(ov => {
  ov.addEventListener('click', e => { if (e.target === ov) closeModal(ov.id); });
});

/* ══════════════════════════════════
   TOAST
══════════════════════════════════ */
let toastTimer;
function toast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast' +
    (type === 'red' ? ' red' : type === 'gold' ? ' gold' : type === 'green' ? ' green' : '') +
    ' show';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

/* ══════════════════════════════════
   INIT
══════════════════════════════════ */
renderNotifications();
renderDashboard();