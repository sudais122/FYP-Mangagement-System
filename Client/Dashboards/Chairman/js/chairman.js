const sup = JSON.parse(localStorage.getItem("supervisor"));

if (!sup) {
  window.location.href = "../../Auth/login.html";
}

/* ═══════════════════════════════════
   MY TEAMS (chairman's own groups)
═══════════════════════════════════ */
const MARKS_SCHEMA = [
  { section: "Monthly Meetings", items: [
    { key: "oct", label: "October",  max: 10 },
    { key: "nov", label: "November", max: 10 },
    { key: "dec", label: "December", max: 10 },
    { key: "feb", label: "February", max: 10 },
    { key: "mar", label: "March",    max: 10 },
  ]},
  { section: "Submissions", items: [
    { key: "proposal",        label: "Proposal",      max: 10 },
    { key: "progress_report", label: "Progress Rpt",  max: 20 },
    { key: "thesis",          label: "Thesis",        max: 20 },
    { key: "code",            label: "Code",          max: 10 },
    { key: "prog_sim",        label: "Prog Sim",      max: 5  },
    { key: "thesis_sim",      label: "Thesis Sim",    max: 5  },
  ]},
  { section: "Viva", items: [
    { key: "iv1", label: "Internal Viva 1", max: 25 },
    { key: "iv2", label: "Internal Viva 2", max: 25 },
    { key: "ext", label: "External Viva",   max: 30 },
  ]},
];

async function loadMyTeams() {
  const container = document.getElementById("my-teams-container");
  if (!container) return;
  container.innerHTML = `<p style="color:var(--text-mute);padding:20px">Loading your teams…</p>`;

  try {
    const res = await fetch(`${API_BASE}/groups/supervisor`, { headers: authHeaders });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");

        const groups = Array.isArray(data) ? data : data.groups || [];


    if (!groups.length) {
      container.innerHTML = `<p style="color:var(--text-mute);padding:20px">No teams assigned to you yet.</p>`;
      return;
    }

    // Fetch marks for each group
    for (const group of groups) {
      try {
        const mRes = await fetch(`${API_BASE}/admin/marks/group/${group._id}`, { headers: authHeaders });
        if (!mRes.ok) continue;
        const marksData = await mRes.json();
        const marksList = Array.isArray(marksData) ? marksData : (marksData?.marks || []);

        const allStudents = [group.leader, ...(group.members || [])].filter(Boolean);
        allStudents.forEach(student => {
          const markRecord = marksList.find(m => {
            const ref = typeof m.student === "string" ? m.student : m.student?._id;
            return ref === student._id;
          });
          if (markRecord) {
            student.marks = {
              oct: markRecord.monthly?.oct ?? null,
              nov: markRecord.monthly?.nov ?? null,
              dec: markRecord.monthly?.dec ?? null,
              feb: markRecord.monthly?.feb ?? null,
              mar: markRecord.monthly?.mar ?? null,
              proposal:        markRecord.submissions?.proposal ?? null,
              progress_report: markRecord.submissions?.progress ?? null,
              thesis:          markRecord.documentation?.final ?? null,
              code:            markRecord.submissions?.code ?? null,
              prog_sim:        markRecord.submissions?.prog_sim ?? null,
              thesis_sim:      markRecord.submissions?.thesis_sim ?? null,
              iv1: markRecord.viva?.internal1 ?? null,
              iv2: markRecord.viva?.internal2 ?? null,
              ext: markRecord.viva?.external ?? null,
            };
            student.total_marks = markRecord.total ?? 0;
          } else {
            student.marks = {};
            student.total_marks = 0;
          }
        });
      } catch (e) { console.warn("Marks load failed:", e); }
    }

    container.innerHTML = groups.map(group => renderChairmanTeamBlock(group)).join("");

  } catch (err) {
    container.innerHTML = `<p style="color:#dc2626;padding:20px">Error: ${err.message}</p>`;
  }
}

function renderChairmanTeamBlock(group) {
  const allStudents = [
    group.leader ? { ...group.leader, role: "Leader" } : null,
    ...(group.members || []).map(m => ({ ...m, role: "Member" }))
  ].filter(Boolean);

  if (!allStudents.length) return `
    <div class="card" style="margin-bottom:16px">
      <div class="card-head"><h3>${group.group_code || group.team_code || "—"}</h3></div>
      <div class="card-body"><p style="color:var(--text-mute)">No students linked.</p></div>
    </div>`;

  const headers = MARKS_SCHEMA.flatMap(sec =>
    sec.items.map(it => `<th style="text-align:center;white-space:nowrap">${it.label}<br><small style="color:var(--text-mute)">/${it.max}</small></th>`)
  ).join("");

  const rows = allStudents.map(s => {
    const cells = MARKS_SCHEMA.flatMap(sec =>
      sec.items.map(it => {
        const val = s.marks?.[it.key];
        const display = val !== null && val !== undefined ? val : "";
        return `<td style="text-align:center">
          <input type="number" min="0" max="${it.max}"
            style="width:52px;padding:4px;text-align:center;border:1.5px solid var(--border);border-radius:6px;font-weight:700"
            data-student="${s._id}" data-key="${it.key}" data-max="${it.max}" data-group="${group._id}"
            value="${display}" placeholder="—"
            oninput="onChairmanMarkChange(this)">
        </td>`;
      })
    ).join("");

    return `<tr>
      <td>
        <strong>${s.name}</strong>
        <div style="font-size:.7rem;color:var(--text-mute)">${s.email || ""}</div>
        <div style="font-size:.7rem;color:#15803d">${s.whatsapp || "—"}</div>
      </td>
      <td><span class="tid">${s.student_code || s._id}</span></td>
      <td><span class="s-role ${s.role.toLowerCase()}">${s.role}</span></td>
      ${cells}
      <td><strong id="ch-total-${s._id}" style="font-family:monospace">${s.total_marks || 0}<span style="color:var(--text-mute);font-weight:400">/200</span></strong></td>
    </tr>`;
  }).join("");

  return `
    <div class="card" style="margin-bottom:20px;overflow:hidden">
      <div class="card-head" style="justify-content:space-between">
        <h3>${group.group_code || group.team_code || "—"} &nbsp;·&nbsp; <span style="font-weight:400;font-size:.9rem">${group.project_title || "—"}</span></h3>
        <button onclick="saveChairmanMarks('${group._id}')"
          style="padding:8px 16px;background:linear-gradient(135deg,var(--primary),var(--secondary));color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer">
          Save Changes
        </button>
      </div>
      <div class="card-body" style="padding:0;overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:.82rem">
          <thead style="background:var(--bg)">
            <tr>
              <th style="padding:10px 14px;text-align:left">Student</th>
              <th style="padding:10px 14px">ID</th>
              <th style="padding:10px 14px">Role</th>
              ${headers}
              <th style="padding:10px 14px">Total</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
}

function onChairmanMarkChange(input) {
  const max = parseInt(input.dataset.max);
  let val = parseInt(input.value);
  if (input.value === "") { updateChairmanTotal(input.dataset.student); return; }
  if (isNaN(val) || val < 0) val = 0;
  if (val > max) { val = max; input.value = val; input.style.borderColor = "#dc2626"; }
  else input.style.borderColor = "";
  updateChairmanTotal(input.dataset.student);
}

function updateChairmanTotal(studentId) {
  let total = 0;
  document.querySelectorAll(`input[data-student="${studentId}"]`).forEach(inp => {
    const v = parseInt(inp.value);
    if (!isNaN(v) && v >= 0) total += v;
  });
  const el = document.getElementById(`ch-total-${studentId}`);
  if (el) el.innerHTML = `${total}<span style="color:var(--text-mute);font-weight:400">/200</span>`;
}

async function saveChairmanMarks(groupId) {
  const inputs = document.querySelectorAll(`input[data-group="${groupId}"]`);
  const marksByStudent = {};
  inputs.forEach(inp => {
    const sid = inp.dataset.student;
    if (!marksByStudent[sid]) marksByStudent[sid] = {};
    if (inp.value !== "") marksByStudent[sid][inp.dataset.key] = parseInt(inp.value) || 0;
  });

  try {
    for (const studentId in marksByStudent) {
      const marks = marksByStudent[studentId];
      const monthly = {}, submissions = {}, viva = {}, documentation = {};

      Object.entries(marks).forEach(([key, value]) => {
        if (["oct","nov","dec","feb","mar"].includes(key)) monthly[key] = value;
        else if (["proposal","progress_report","code","prog_sim","thesis_sim"].includes(key))
          submissions[key === "progress_report" ? "progress" : key] = value;
        else if (["iv1","iv2","ext"].includes(key))
          viva[key === "iv1" ? "internal1" : key === "iv2" ? "internal2" : "external"] = value;
        else if (key === "thesis") documentation.final = value;
      });

      const res = await fetch(`${API_BASE}/supervisors/marks`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ student_id: studentId, monthly, submissions, viva, documentation })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Save failed");

      const el = document.getElementById(`ch-total-${studentId}`);
      if (el && data.total !== undefined)
        el.innerHTML = `${data.total}<span style="color:var(--text-mute);font-weight:400">/200</span>`;
    }
    toast("Marks saved successfully", "green");
  } catch (err) {
    toast("Error: " + err.message, "red");
  }
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
  loadMyTeams();
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