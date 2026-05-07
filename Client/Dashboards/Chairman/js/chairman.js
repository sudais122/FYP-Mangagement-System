const sup = JSON.parse(localStorage.getItem("supervisor"));

if (!sup) {
  window.location.href = "../../Auth/login.html";
}

// Force password change check
if (sup.force_password_change) {
  window.location.href = "../Supervisor/change-password.html";
}

// Only chairmen can be here
if (!sup.is_chairman) {
  alert("Access denied — Chairman only");
  window.location.href = "../Supervisor/index.html";
}

const API_BASE = "http://127.0.0.1:5001/api";
const TOTAL_MARKS = 200;

// Cached data for filtering
let WORKLOAD_DATA = [];
let TEAMS_DATA = [];
let STUDENTS_DATA = [];

// Welcome
const welcomeName = document.getElementById("welcome-name");
const welcomeDes  = document.getElementById("welcome-designation");
const welcomeId   = document.getElementById("welcome-sup-id");
if (welcomeName) welcomeName.textContent = `Welcome, ${sup.name} 👋`;
if (welcomeDes)  welcomeDes.textContent  = `Chairman · CS Department`;
if (welcomeId)   welcomeId.textContent   = sup.sup_code || "—";

const navName = document.getElementById("nav-sup-name");
const navCode = document.getElementById("nav-sup-code");
if (navName) navName.textContent = sup.name     || "Chairman";
if (navCode) navCode.textContent = sup.sup_code || "";

const authHeaders = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${sup.token}`
};

/* ═══════════════════════════════════
   TAB SWITCHING
═══════════════════════════════════ */
function showTab(tab) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById("tab-" + tab)?.classList.add("active");
  document.querySelectorAll(".sb-btn:not(.logout)").forEach(b => b.classList.remove("active"));
  document.getElementById("sb-" + tab)?.classList.add("active");

  const titles = {
    overview:  ["Department Overview", "Department-wide statistics — Chairman view"],
    workload:  ["Supervisor Workload", "Teams & students assigned to each supervisor"],
    teams:     ["All Teams",           "Read-only view of every team in the department"],
    students:  ["All Students",        "Read-only view of every student in the department"],
    proposals: ["Proposals",           "Status of every team's proposal submission"],
  };
  const t = titles[tab] || [tab, ""];
  document.getElementById("page-title").textContent = t[0];
  document.getElementById("page-sub").textContent   = t[1];

  if (tab === "overview")  loadOverview();
  if (tab === "workload")  loadWorkload();
  if (tab === "teams")     loadTeams();
  if (tab === "students")  loadStudents();
  if (tab === "proposals") loadProposals();

  if (window.innerWidth <= 900) closeSidebar();
}

/* ═══════════════════════════════════
   OVERVIEW
═══════════════════════════════════ */
async function loadOverview() {
  try {
    const res = await fetch(`${API_BASE}/supervisors/chairman/overview`, { headers: authHeaders });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");

    document.getElementById("ov-total-students").textContent = data.totalStudents;
    document.getElementById("ov-total-sups").textContent     = data.totalSupervisors;
    document.getElementById("ov-total-teams").textContent    = data.totalTeams;
    document.getElementById("ov-avg-score").textContent      = data.avgScore;

    const ps = data.proposalStats || {};
    const stats = [
      { label: "Approved",      value: ps.approved || 0,      color: "#15803d", bg: "rgba(34,197,94,.1)",  border: "#22c55e" },
      { label: "Pending",       value: ps.pending  || 0,      color: "#a16207", bg: "rgba(234,179,8,.1)",  border: "#eab308" },
      { label: "Rejected",      value: ps.rejected || 0,      color: "#dc2626", bg: "rgba(220,38,38,.1)",  border: "#dc2626" },
      { label: "Not Submitted", value: ps.not_submitted || 0, color: "#475569", bg: "rgba(148,163,184,.1)", border: "#94a3b8" },
    ];

    document.getElementById("ov-proposal-stats").innerHTML = stats.map(s => `
      <div style="background:${s.bg};border-left:3px solid ${s.border};padding:16px 18px;border-radius:10px">
        <div style="font-size:.7rem;color:var(--text-mute);font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">
          ${s.label}
        </div>
        <div style="font-size:1.8rem;font-weight:800;color:${s.color};line-height:1">
          ${s.value}
        </div>
        <div style="font-size:.7rem;color:var(--text-mute);margin-top:4px">
          ${ps.total > 0 ? Math.round((s.value / ps.total) * 100) : 0}% of teams
        </div>
      </div>
    `).join("");
  } catch (err) {
    toast("Failed to load overview: " + err.message, "red");
  }
}

/* ═══════════════════════════════════
   WORKLOAD
═══════════════════════════════════ */
async function loadWorkload() {
  const tbody = document.getElementById("workload-tbody");
  tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:30px;color:var(--text-mute)">Loading…</td></tr>`;
  try {
    const res = await fetch(`${API_BASE}/supervisors/chairman/workload`, { headers: authHeaders });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");

    WORKLOAD_DATA = data.workload || [];
    renderWorkload(WORKLOAD_DATA);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#dc2626;padding:20px">Error: ${err.message}</td></tr>`;
  }
}

function renderWorkload(list) {
  const tbody = document.getElementById("workload-tbody");
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:30px;color:var(--text-mute)">No supervisors found</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(w => `
    <tr>
      <td>
        <div style="font-weight:600">${w.name}${w.is_chairman ? '<span class="chairman-tag">Chairman</span>' : ''}</div>
        <small style="color:var(--text-mute);font-size:.66rem">${w.designation || "Faculty Member"}</small>
      </td>
      <td><span class="tid">${w.sup_code || "—"}</span></td>
      <td><span class="g-count">${w.teamCount}</span></td>
      <td><span class="g-count">${w.studentCount}</span></td>
    </tr>
  `).join("");
}

function filterWorkload(q) {
  q = (q || "").trim().toLowerCase();
  const filtered = WORKLOAD_DATA.filter(w =>
    (w.name || "").toLowerCase().includes(q) ||
    (w.sup_code || "").toLowerCase().includes(q)
  );
  renderWorkload(filtered);
}

/* ═══════════════════════════════════
   ALL TEAMS
═══════════════════════════════════ */
async function loadTeams() {
  const tbody = document.getElementById("teams-tbody");
  tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:30px;color:var(--text-mute)">Loading…</td></tr>`;
  try {
    const res = await fetch(`${API_BASE}/supervisors/chairman/teams`, { headers: authHeaders });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");

    TEAMS_DATA = data.teams || [];
    renderTeams(TEAMS_DATA);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#dc2626;padding:20px">Error: ${err.message}</td></tr>`;
  }
}

function renderTeams(list) {
  const tbody = document.getElementById("teams-tbody");
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:30px;color:var(--text-mute)">No teams yet</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(t => {
    const studentCount = (t.leader ? 1 : 0) + (t.members?.length || 0);
    const supName = t.supervisor?.name || "Unassigned";
    const supCode = t.supervisor?.sup_code || "";
    return `
      <tr>
        <td><span class="tid">${t.team_code || "—"}</span></td>
        <td><span class="g-proj">${t.project_title || "—"}</span></td>
        <td>
          <div style="font-weight:600">${supName}</div>
          <small style="color:var(--text-mute);font-size:.66rem">${supCode}</small>
        </td>
        <td><span class="g-count">${studentCount}</span></td>
      </tr>`;
  }).join("");
}

function filterTeams(q) {
  q = (q || "").trim().toLowerCase();
  const filtered = TEAMS_DATA.filter(t =>
    (t.team_code || "").toLowerCase().includes(q) ||
    (t.project_title || "").toLowerCase().includes(q) ||
    (t.supervisor?.name || "").toLowerCase().includes(q)
  );
  renderTeams(filtered);
}

/* ═══════════════════════════════════
   ALL STUDENTS
═══════════════════════════════════ */
async function loadStudents() {
  const tbody = document.getElementById("students-tbody");
  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-mute)">Loading…</td></tr>`;
  try {
    const res = await fetch(`${API_BASE}/supervisors/chairman/students`, { headers: authHeaders });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");

    STUDENTS_DATA = data.students || [];
    renderStudents(STUDENTS_DATA);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#dc2626;padding:20px">Error: ${err.message}</td></tr>`;
  }
}

function renderStudents(list) {
  const tbody = document.getElementById("students-tbody");
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-mute)">No students yet</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(s => {
    const teamCode = s.group?.team_code || "—";
    const supName  = s.group?.supervisor?.name || "Unassigned";
    return `
      <tr>
        <td><span class="s-id">${s.student_code}</span></td>
        <td>
          <div>${s.name}</div>
          <small style="color:var(--text-mute);font-size:.66rem">${s.email || ""}</small>
        </td>
        <td><span class="tid">${teamCode}</span></td>
        <td>${supName}</td>
        <td><span class="s-role ${(s.team_role||'member').toLowerCase()}">${s.team_role || '—'}</span></td>
        <td style="text-align:right"><span class="s-marks">${s.total_marks} <span class="den">/ ${TOTAL_MARKS}</span></span></td>
      </tr>`;
  }).join("");
}

function filterStudents(q) {
  q = (q || "").trim().toLowerCase();
  const filtered = STUDENTS_DATA.filter(s =>
    (s.student_code || "").toLowerCase().includes(q) ||
    (s.name || "").toLowerCase().includes(q) ||
    (s.group?.team_code || "").toLowerCase().includes(q)
  );
  renderStudents(filtered);
}

/* ═══════════════════════════════════
   PROPOSALS
═══════════════════════════════════ */
async function loadProposals() {
  const tbody = document.getElementById("proposals-tbody");
  tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:30px;color:var(--text-mute)">Loading…</td></tr>`;
  try {
    const res = await fetch(`${API_BASE}/supervisors/chairman/teams`, { headers: authHeaders });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");

    const teams = data.teams || [];
    if (!teams.length) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:30px;color:var(--text-mute)">No teams yet</td></tr>`;
      return;
    }

    tbody.innerHTML = teams.map(t => {
      let status, statusClass;
      if (!t.proposal_url) { status = "Not Submitted"; statusClass = "not-submitted"; }
      else if (t.proposal_status === "approved") { status = "Approved"; statusClass = "approved"; }
      else if (t.proposal_status === "rejected") { status = "Rejected"; statusClass = "rejected"; }
      else { status = "Pending"; statusClass = "pending"; }

      return `
        <tr>
          <td><span class="tid">${t.team_code || "—"}</span></td>
          <td><span class="g-proj">${t.project_title || "—"}</span></td>
          <td><span class="prop-status ${statusClass}">${status}</span></td>
          <td>${t.supervisor?.name || "Unassigned"}</td>
        </tr>`;
    }).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#dc2626;padding:20px">Error: ${err.message}</td></tr>`;
  }
}

function filterProposals(q) {
  q = (q || "").trim().toLowerCase();
  const rows = document.querySelectorAll("#proposals-tbody tr");
  rows.forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(q) ? "" : "none";
  });
}

/* ═══════════════════════════════════
   SIDEBAR (mobile)
═══════════════════════════════════ */
function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const ham = document.getElementById("hamburgerBtn");
  if (sidebar.classList.contains("open")) closeSidebar();
  else {
    sidebar.classList.add("open");
    overlay?.classList.add("show");
    ham?.classList.add("open");
    document.body.style.overflow = "hidden";
  }
}
function closeSidebar() {
  document.querySelector(".sidebar")?.classList.remove("open");
  document.getElementById("sidebarOverlay")?.classList.remove("show");
  document.getElementById("hamburgerBtn")?.classList.remove("open");
  document.body.style.overflow = "";
}

document.addEventListener("keydown", e => { if (e.key === "Escape") closeSidebar(); });

/* ═══════════════════════════════════
   TOAST
═══════════════════════════════════ */
let toastTimer;
function toast(msg, type) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.className = "toast" + (type ? " " + type : "") + " show";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2800);
}

function logout() {
  localStorage.removeItem("supervisor");
  window.location.href = "../../Auth/login.html";
}

/* ═══════════════════════════════════
   INIT
═══════════════════════════════════ */
loadOverview();