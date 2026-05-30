 const API_BASE = "http://localhost:5001/api"; 
 // Intercept all 503 responses → redirect to maintenance page
const _origFetch = window.fetch;
window.fetch = async function(...args) {
  const res = await _origFetch(...args);
  if (res.status === 503) {
    const clone = res.clone();
    try {
      const data = await clone.json();
      if (data.maintenance_mode) {
        window.location.href = "../../maintenance.html";
        return res;
      }
    } catch {}
  }
  return res;
};
/* auth & guard */
const sup = JSON.parse(localStorage.getItem("supervisor"));
if (!sup)            window.location.href = "../../Auth/login.html";
if (!sup.is_chairman) { alert("Access denied — Chairman only"); window.location.href = "../Supervisor/index.html"; }
if (sup.force_password_change) window.location.href = "../Supervisor/change-password.html";

const TOTAL_MARKS = 200;
const authHeaders = { "Content-Type": "application/json", "Authorization": `Bearer ${sup.token}` };

/* ── welcome ── */
document.getElementById("welcome-name").textContent  = `Welcome, ${sup.name} 👋`;
document.getElementById("welcome-sup-id").textContent = sup.sup_code || "—";
document.getElementById("nav-sup-name").textContent  = sup.name     || "Chairman";
document.getElementById("nav-sup-code").textContent  = sup.sup_code || "";

/* ── cached data ── */
let MY_TEAMS      = [];   // chairman's own groups (editable)
let WORKLOAD_DATA = [];
let TEAMS_DATA    = [];
let STUDENTS_DATA = [];


// Add at the top of chairman.js, after the existing auth guard:

async function checkChairmanAccess() {
  try {
    const res  = await fetch("http://localhost:5001/api/admin/system/chairman-mode/public");
    const data = await res.json();

    if (!data.chairman_monitoring_mode) {
      window.location.replace("../Supervisor/index.html");
      return false;
    }

    return true;

  } catch (err) {
    console.error("Chairman mode check failed:", err.message);
    window.location.replace("../Supervisor/index.html");
    return false;
  }
}

/* ═══════════════════════════════════
   MARKS SCHEMA
═══════════════════════════════════ */
const MARKS_SCHEMA = [
  { section: "Monthly Meetings", icon: "calendar", items: [
    { key: "oct", label: "October",  max: 10 },
    { key: "nov", label: "November", max: 10 },
    { key: "dec", label: "December", max: 10 },
    { key: "feb", label: "February", max: 10 },
    { key: "mar", label: "March",    max: 10 },
  ]},
  { section: "Submissions", icon: "file", items: [
    { key: "proposal",        label: "Proposal Submission", max: 10 },
    { key: "progress_report", label: "Progress Report",     max: 20 },
    { key: "thesis",          label: "Thesis / Report",     max: 20 },
    { key: "code",            label: "Code / Practical",    max: 10 },
    { key: "prog_sim",        label: "Progress Similarity", max: 5  },
    { key: "thesis_sim",      label: "Thesis Similarity",   max: 5  },
  ]},
  { section: "Viva", icon: "mic", items: [
    { key: "iv1", label: "Internal Viva 1", max: 25 },
    { key: "iv2", label: "Internal Viva 2", max: 25 },
    { key: "ext", label: "External Viva",   max: 30 },
  ]},
];

function flatItems() { return MARKS_SCHEMA.flatMap(s => s.items); }

function marksFromRecord(m) {
  return {
    oct: m.monthly?.oct ?? null, nov: m.monthly?.nov ?? null,
    dec: m.monthly?.dec ?? null, feb: m.monthly?.feb ?? null, mar: m.monthly?.mar ?? null,
    proposal:        m.submissions?.proposal ?? null,
    progress_report: m.submissions?.progress ?? null,
    thesis:          m.documentation?.final  ?? null,
    code:            m.submissions?.code     ?? null,
    prog_sim:        m.submissions?.prog_sim ?? null,
    thesis_sim:      m.submissions?.thesis_sim ?? null,
    iv1: m.viva?.internal1 ?? null,
    iv2: m.viva?.internal2 ?? null,
    ext: m.viva?.external  ?? null,
  };
}

function calcTotal(marks) {
  return flatItems().reduce((t, it) => t + (marks[it.key] ?? 0), 0);
}

/* ═══════════════════════════════════
   HELPERS
═══════════════════════════════════ */
function escHtml(s) {
  const d = document.createElement("div"); d.textContent = s; return d.innerHTML;
}
function hl(text, q) {
  if (!q) return escHtml(text);
  const safe = escHtml(text);
  return safe.replace(new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig"),
    '<span class="search-hl">$1</span>');
}
function noResults(colspan, q) {
  return `<tr><td colspan="${colspan}">
    <div class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <h4>No results for "<strong>${escHtml(q)}</strong>"</h4>
    </div>
  </td></tr>`;
}

/* ── read-only marks detail block ── */
function readOnlyMarksHtml(marks) {
  return MARKS_SCHEMA.map(sec => `
    <div class="mk-section">
      <div class="mk-sec-head">${sec.section}</div>
      <div class="mk-rows">
        ${sec.items.map(it => {
          const val = marks[it.key];
          return `<div class="mk-row">
            <div class="mk-label">${it.label}</div>
            <div class="mk-max">/ ${it.max}</div>
            <input type="number" class="mk-input" value="${val ?? ""}" placeholder="—"
              disabled style="opacity:.65;cursor:not-allowed" title="Read-only — Chairman view">
          </div>`;
        }).join("")}
      </div>
    </div>`).join("");
}

/* ── editable marks inputs ── */
function editableMarksHtml(marks, studentId, groupId) {
  return MARKS_SCHEMA.map(sec => `
    <div class="mk-section">
      <div class="mk-sec-head">${sec.section}</div>
      <div class="mk-rows">
        ${sec.items.map(it => {
          const val = marks[it.key];
          return `<div class="mk-row">
            <div class="mk-label">${it.label}</div>
            <div class="mk-max">/ ${it.max}</div>
            <input type="number" class="mk-input ch-edit ${val == null ? "pending" : ""}"
              min="0" max="${it.max}" value="${val ?? ""}" placeholder="—"
              data-student="${studentId}" data-key="${it.key}" data-max="${it.max}" data-group="${groupId}"
              oninput="onChairMarkChange(this); chUpdateTotal('${studentId}')">
          </div>`;
        }).join("")}
      </div>
    </div>`).join("");
}

/* ── back button ── */
function backBtn(listId, detailId, label, cb) {
  return `<button class="back-btn" onclick="
    document.getElementById('${listId}').style.display='';
    document.getElementById('${detailId}').style.display='none';
    ${cb ? cb + "();" : ""}
  ">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>${label}
  </button>`;
}

/* ═══════════════════════════════════
   TAB SWITCHING
═══════════════════════════════════ */
function showTab(tab) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById("tab-" + tab)?.classList.add("active");
  document.querySelectorAll(".sb-btn:not(.logout)").forEach(b => b.classList.remove("active"));
  document.getElementById("sb-" + tab)?.classList.add("active");

  const titles = {
    overview:  ["Overview",             "Your groups and department statistics"],
    mygroups:  ["My Groups",            "Your assigned groups — marks editable"],
    teams:     ["All Teams",            "Read-only view of every team in the department"],
    workload:  ["Supervisor Workload",  "Teams & students per supervisor"],
    students:  ["All Students",         "Read-only view of every student"],
    proposals: ["Proposals",            "Status of every team's proposal"],
  };
  const t = titles[tab] || [tab, ""];
  document.getElementById("page-title").textContent = t[0];
  document.getElementById("page-sub").textContent   = t[1];

  if (tab === "overview")  loadOverview();
  if (tab === "mygroups")  showMyGroupsList();
  if (tab === "teams")     showTeamsList();
  if (tab === "workload")  showWorkloadList();
  if (tab === "students")  showStudentsList();
  if (tab === "proposals") loadProposals();

  if (window.innerWidth <= 900) closeSidebar();
}

/* ═══════════════════════════════════
   OVERVIEW TAB
═══════════════════════════════════ */
async function loadOverview() {
  try {
    /* department stats */
    const res = await fetch(`${API_BASE}/supervisors/chairman/overview`, { headers: authHeaders });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");
    document.getElementById("ov-total-teams").textContent    = data.totalTeams    || 0;
    document.getElementById("ov-total-students").textContent = data.totalStudents || 0;

    /* my groups stats */
    const mRes = await fetch(`${API_BASE}/groups/supervisor`, { headers: authHeaders });
    const mData = await mRes.json();
    const groups = Array.isArray(mData) ? mData : (mData.groups || []);
    MY_TEAMS = groups;
    const myStudents = groups.reduce((n, g) => n + (g.leader ? 1 : 0) + (g.members?.length || 0), 0);
    document.getElementById("ov-my-groups").textContent   = groups.length;
    document.getElementById("ov-my-students").textContent = myStudents;
  } catch (err) {
    toast("Overview error: " + err.message, "red");
  }
}

/* ═══════════════════════════════════
   MY GROUPS TAB (editable marks)
═══════════════════════════════════ */
async function loadMyTeamsData() {
  if (MY_TEAMS.length) return;          // already loaded in overview
  const res  = await fetch(`${API_BASE}/groups/supervisor`, { headers: authHeaders });
  const data = await res.json();
  MY_TEAMS   = Array.isArray(data) ? data : (data.groups || []);
}

function showMyGroupsList() {
  document.getElementById("mygroups-list-view").style.display  = "";
  document.getElementById("mygroups-detail-view").style.display = "none";
  renderMyGroupsList(document.getElementById("search-mygroups")?.value || "");
}

async function renderMyGroupsList(query) {
  await loadMyTeamsData();
  const q      = (query || "").trim().toLowerCase();
  const tbody  = document.getElementById("mygroups-tbody");
  const filtered = MY_TEAMS.filter(g =>
    (g.group_code || g.team_code || "").toLowerCase().includes(q) ||
    (g.project_title || "").toLowerCase().includes(q)
  );

  if (!MY_TEAMS.length) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--text-mute)">No teams assigned to you yet.</td></tr>`;
    return;
  }
  if (!filtered.length) { tbody.innerHTML = noResults(4, query); return; }

  tbody.innerHTML = filtered.map(g => {
    const code = g.group_code || g.team_code || "—";
    const count = (g.leader ? 1 : 0) + (g.members?.length || 0);
    return `<tr onclick="openMyGroupDetail('${g._id}')">
      <td><span class="tid">${hl(code, q)}</span></td>
      <td><span class="g-proj">${hl(g.project_title || "—", q)}</span></td>
      <td><span class="g-count">${count}</span></td>
      <td style="text-align:right"><span class="g-arrow">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </span></td>
    </tr>`;
  }).join("");
}

function filterMyGroups(q) { renderMyGroupsList(q); }

async function openMyGroupDetail(groupId) {
  const group = MY_TEAMS.find(g => g._id === groupId);
  if (!group) return;

  /* fetch marks */
  try {
    const res  = await fetch(`${API_BASE}/marks/group/${group._id}`, { headers: authHeaders });
    const data = await res.json();
    const list = Array.isArray(data) ? data : (data.marks || data.data || []);
    const allStudents = [
      group.leader  ? { ...group.leader,  role: "Leader" } : null,
      ...(group.members || []).map(m => ({ ...m, role: "Member" }))
    ].filter(Boolean);

    allStudents.forEach(s => {
      const rec = list.find(m => {
        const ref = typeof m.student === "string" ? m.student : m.student?._id;
        return ref === s._id;
      });
      s.marks = rec ? marksFromRecord(rec) : {};
    });
    group._students = allStudents;
  } catch (e) { toast("Could not load marks: " + e.message, "red"); return; }

  document.getElementById("mygroups-list-view").style.display  = "none";
  const d = document.getElementById("mygroups-detail-view");
  d.style.display = "";

  const code = group.group_code || group.team_code || "—";

  d.innerHTML = `
    ${backBtn("mygroups-list-view", "mygroups-detail-view", "Back to My Groups")}
    <div class="gh-strip">
      <div class="gh-info">
        <div class="gh-tid">${code}</div>
        <div class="gh-proj">${group.project_title || "—"}</div>
      </div>
    </div>
    ${group._students.map(s => renderMyGroupStudentCard(group._id, s)).join("")}`;
}

function renderMyGroupStudentCard(groupId, s) {
  const total = calcTotal(s.marks || {});
  const sid   = s._id;
  return `<div class="stu-card">
    <div class="stu-head" onclick="chToggle('${sid}')">
      <div class="stu-dot ${s.role.toLowerCase()}"></div>
      <div class="stu-info">
        <div class="stu-name">${s.name}</div>
        <div class="stu-id">${s.student_code || sid}</div>
      </div>
      <span class="stu-role-tag ${s.role.toLowerCase()}">${s.role}</span>
      <div class="stu-total">
        <span id="chtd-${sid}">${total}</span><span class="den">/ ${TOTAL_MARKS}</span>
      </div>
      <div class="stu-chev" id="chch-${sid}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
    </div>
    <div class="stu-body" id="chbd-${sid}">
      <div style="font-size:.7rem;color:var(--text-mute);margin-bottom:10px;display:flex;gap:18px">
        <span>📧 ${s.email || "—"}</span>
        <a href="https://wa.me/${(s.whatsapp||"").replace(/^0/,"92")}" target="_blank"
           style="color:#15803d;font-weight:600;text-decoration:none">
          📱 ${s.whatsapp || "—"}
        </a>
      </div>
      <div class="mk-grid">${editableMarksHtml(s.marks || {}, sid, groupId)}</div>
      <div class="grand-bar">
        <div class="gb-label">Grand Total</div>
        <div class="gb-val">
          <span class="num" id="chgt-${sid}">${total}</span>
          <span class="den">/ ${TOTAL_MARKS}</span>
        </div>
      </div>
      <div class="save-row">
        <button class="btn-save" onclick="saveMyGroupMarks('${groupId}','${sid}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          Save Marks
        </button>
      </div>
    </div>
  </div>`;
}

function chToggle(sid) {
  document.getElementById("chbd-" + sid)?.classList.toggle("open");
  document.getElementById("chch-" + sid)?.classList.toggle("open");
}

function onChairMarkChange(input) {
  const max = parseInt(input.dataset.max), val = parseInt(input.value);
  input.classList.remove("error", "pending");
  if (input.value === "") { input.classList.add("pending"); return; }
  if (isNaN(val) || val < 0 || val > max) input.classList.add("error");
}

function chUpdateTotal(sid) {
  let total = 0;
  document.querySelectorAll(`.ch-edit[data-student="${sid}"]`).forEach(inp => {
    const v = parseInt(inp.value);
    if (!isNaN(v) && v >= 0) total += v;
  });
  const a = document.getElementById("chtd-" + sid);
  const b = document.getElementById("chgt-" + sid);
  if (a) a.textContent = total;
  if (b) b.textContent = total;
}

async function saveMyGroupMarks(groupId, studentId) {
  const marks = {};
  let hasError = false;
  document.querySelectorAll(`.ch-edit[data-student="${studentId}"]`).forEach(inp => {
    if (inp.value === "") { marks[inp.dataset.key] = null; return; }
    const v = parseInt(inp.value);
    if (isNaN(v) || v < 0 || v > parseInt(inp.dataset.max)) { hasError = true; inp.classList.add("error"); }
    else marks[inp.dataset.key] = v;
  });
  if (hasError) { toast("Fix invalid marks first", "red"); return; }

  const monthly       = { oct: marks.oct, nov: marks.nov, dec: marks.dec, feb: marks.feb, mar: marks.mar };
  const submissions   = { proposal: marks.proposal, progress: marks.progress_report, code: marks.code, prog_sim: marks.prog_sim, thesis_sim: marks.thesis_sim };
  const viva          = { internal1: marks.iv1, internal2: marks.iv2, external: marks.ext };
  const documentation = { final: marks.thesis };

  try {
    const res  = await fetch(`${API_BASE}/marks/save`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ student_id: studentId, monthly, submissions, viva, documentation })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");

    const newTotal = data.total ?? chUpdateTotal(studentId);
    const a = document.getElementById("chtd-" + studentId);
    const b = document.getElementById("chgt-" + studentId);
    if (a && data.total !== undefined) a.textContent = data.total;
    if (b && data.total !== undefined) b.textContent = data.total;
    toast("Marks saved ✓", "green");
  } catch (err) {
    toast("Save failed: " + err.message, "red");
  }
}

/* ═══════════════════════════════════
   ALL TEAMS TAB (read-only, click for marks)
═══════════════════════════════════ */
async function showTeamsList() {
  document.getElementById("teams-list-view").style.display  = "";
  document.getElementById("teams-detail-view").style.display = "none";
  if (TEAMS_DATA.length) { renderTeams(TEAMS_DATA, ""); return; }

  const tbody = document.getElementById("teams-tbody");
  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--text-mute)">Loading…</td></tr>`;
  try {
    const res  = await fetch(`${API_BASE}/supervisors/chairman/teams`, { headers: authHeaders });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");
    TEAMS_DATA = data.teams || [];
    renderTeams(TEAMS_DATA, "");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" style="color:#dc2626;padding:20px">Error: ${err.message}</td></tr>`;
  }
}

function renderTeams(list, q) {
  q = (q || "").trim().toLowerCase();
  const tbody = document.getElementById("teams-tbody");
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--text-mute)">No teams yet</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(t => {
    const count = (t.leader ? 1 : 0) + (t.members?.length || 0);
    return `<tr onclick="openTeamDetail('${t._id || t.team_code}', this)" style="cursor:pointer">
      <td><span class="tid">${hl(t.team_code || "—", q)}</span></td>
      <td><span class="g-proj">${hl(t.project_title || "—", q)}</span></td>
      <td>
        <div style="font-weight:600">${hl(t.supervisor?.name || "Unassigned", q)}</div>
        <small style="color:var(--text-mute);font-size:.66rem">${t.supervisor?.sup_code || ""}</small>
      </td>
      <td><span class="g-count">${count}</span></td>
      <td style="text-align:right"><span class="g-arrow">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </span></td>
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
  renderTeams(filtered, q);
}

async function openTeamDetail(teamId) {
  /* find in cache */
  const team = TEAMS_DATA.find(t => t._id === teamId || t.team_code === teamId);
  if (!team) return;

  /* fetch marks */
  try {
    const res  = await fetch(`${API_BASE}/marks/group/${team._id}`, { headers: authHeaders });
    const data = await res.json();
    const list = Array.isArray(data) ? data : (data.marks || data.data || []);
    const allStudents = [
      team.leader  ? { ...team.leader,  role: "Leader" } : null,
      ...(team.members || []).map(m => ({ ...m, role: "Member" }))
    ].filter(Boolean);

    allStudents.forEach(s => {
      const rec = list.find(m => {
        const ref = typeof m.student === "string" ? m.student : m.student?._id;
        return ref === s._id;
      });
      s.marks = rec ? marksFromRecord(rec) : {};
    });
    team._students = allStudents;
  } catch (e) { toast("Could not load marks", "red"); return; }

  document.getElementById("teams-list-view").style.display  = "none";
  const d = document.getElementById("teams-detail-view");
  d.style.display = "";

  d.innerHTML = `
    ${backBtn("teams-list-view", "teams-detail-view", "Back to All Teams")}
    <div class="gh-strip">
      <div class="gh-info">
        <div class="gh-tid">${team.team_code || "—"}</div>
        <div class="gh-proj">${team.project_title || "—"}</div>
        <div class="gh-sup">Supervisor: ${team.supervisor?.name || "—"} (${team.supervisor?.sup_code || ""})</div>
      </div>
    </div>
    <p style="font-size:.78rem;color:var(--text-mute);margin:0 0 12px;padding:0 4px">
      🔒 Read-only — marks are not editable in this view
    </p>
    ${team._students.map(s => {
      const total = calcTotal(s.marks || {});
      const sid   = "tv-" + s._id;
      return `<div class="stu-card">
        <div class="stu-head" onclick="chToggle('${sid}')">
          <div class="stu-dot ${s.role.toLowerCase()}"></div>
          <div class="stu-info">
            <div class="stu-name">${s.name}</div>
            <div class="stu-id">${s.student_code || s._id}</div>
          </div>
          <span class="stu-role-tag ${s.role.toLowerCase()}">${s.role}</span>
          <div class="stu-total"><span>${total}</span><span class="den">/ ${TOTAL_MARKS}</span></div>
          <div class="stu-chev" id="chch-${sid}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
        <div class="stu-body" id="chbd-${sid}">
          <div class="mk-grid">${readOnlyMarksHtml(s.marks || {})}</div>
          <div class="grand-bar">
            <div class="gb-label">Grand Total</div>
            <div class="gb-val"><span class="num">${total}</span><span class="den">/ ${TOTAL_MARKS}</span></div>
          </div>
        </div>
      </div>`;
    }).join("")}`;
}

/* ═══════════════════════════════════
   SUPERVISOR WORKLOAD TAB
═══════════════════════════════════ */
async function showWorkloadList() {
  document.getElementById("workload-list-view").style.display  = "";
  document.getElementById("workload-detail-view").style.display = "none";
  if (WORKLOAD_DATA.length) { renderWorkload(WORKLOAD_DATA, ""); return; }

  const tbody = document.getElementById("workload-tbody");
  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--text-mute)">Loading…</td></tr>`;
  try {
    const res  = await fetch(`${API_BASE}/supervisors/chairman/workload`, { headers: authHeaders });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");
    WORKLOAD_DATA = data.workload || [];
    renderWorkload(WORKLOAD_DATA, "");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" style="color:#dc2626;padding:20px">Error: ${err.message}</td></tr>`;
  }
}

function renderWorkload(list, q) {
  q = (q || "").trim().toLowerCase();
  const tbody = document.getElementById("workload-tbody");
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--text-mute)">No supervisors found</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(w => `
    <tr onclick="openSupDetail('${w._id || w.sup_code}')" style="cursor:pointer">
      <td>
        <div style="font-weight:600">${hl(w.name, q)}${w.is_chairman ? ' <span class="chairman-tag">Chairman</span>' : ''}</div>
        <small style="color:var(--text-mute);font-size:.66rem">${w.designation || "Faculty Member"}</small>
      </td>
      <td><span class="tid">${hl(w.sup_code || "—", q)}</span></td>
      <td><span class="g-count">${w.teamCount}</span></td>
      <td><span class="g-count">${w.studentCount}</span></td>
      <td style="text-align:right"><span class="g-arrow">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </span></td>
    </tr>`).join("");
}

function filterWorkload(q) {
  q = (q || "").trim().toLowerCase();
  const filtered = WORKLOAD_DATA.filter(w =>
    (w.name || "").toLowerCase().includes(q) ||
    (w.sup_code || "").toLowerCase().includes(q)
  );
  renderWorkload(filtered, q);
}

async function openSupDetail(supId) {
  const sup_data = WORKLOAD_DATA.find(w => w._id === supId || w.sup_code === supId);
  if (!sup_data) return;

  /* fetch this supervisor's teams */
  let supTeams = [];
  try {
    const res  = await fetch(`${API_BASE}/supervisors/chairman/teams`, { headers: authHeaders });
    const data = await res.json();
    const allTeams = data.teams || [];
    supTeams = allTeams.filter(t => t.supervisor?.sup_code === sup_data.sup_code || t.supervisor?._id === sup_data._id);

    /* fetch marks for each team */
    for (const team of supTeams) {
      const mRes  = await fetch(`${API_BASE}/marks/group/${team._id}`, { headers: authHeaders });
      const mData = await mRes.json();
      const list  = Array.isArray(mData) ? mData : (mData.marks || mData.data || []);
      const all   = [
        team.leader  ? { ...team.leader,  role: "Leader" } : null,
        ...(team.members || []).map(m => ({ ...m, role: "Member" }))
      ].filter(Boolean);
      all.forEach(s => {
        const rec = list.find(m => {
          const ref = typeof m.student === "string" ? m.student : m.student?._id;
          return ref === s._id;
        });
        s.marks = rec ? marksFromRecord(rec) : {};
      });
      team._students = all;
    }
  } catch (e) { toast("Could not load supervisor detail", "red"); return; }

  document.getElementById("workload-list-view").style.display  = "none";
  const d = document.getElementById("workload-detail-view");
  d.style.display = "";

  d.innerHTML = `
    ${backBtn("workload-list-view", "workload-detail-view", "Back to Supervisor Workload")}
    <div class="gh-strip">
      <div class="gh-info">
        <div class="gh-tid">${sup_data.sup_code || "—"}</div>
        <div class="gh-proj">${sup_data.name}</div>
        <div class="gh-sup">${sup_data.designation || "Faculty Member"} — ${sup_data.teamCount} teams · ${sup_data.studentCount} students</div>
      </div>
    </div>
    <p style="font-size:.78rem;color:var(--text-mute);margin:0 0 14px;padding:0 4px">
      🔒 Read-only — you cannot edit another supervisor's marks
    </p>
    ${supTeams.length === 0
      ? `<p style="color:var(--text-mute);padding:20px">No teams assigned to this supervisor yet.</p>`
      : supTeams.map(team => {
          const code = team.team_code || team.group_code || "—";
          return `<div class="card" style="margin-bottom:18px">
            <div class="card-head">
              <h3><span class="tid">${code}</span> &nbsp;·&nbsp;
                <span style="font-weight:400;font-size:.9rem">${team.project_title || "—"}</span>
              </h3>
            </div>
            <div class="card-body" style="padding:12px 18px">
              ${team._students.map(s => {
                const total = calcTotal(s.marks || {});
                const sid   = "wv-" + s._id;
                return `<div class="stu-card" style="margin-bottom:10px">
                  <div class="stu-head" onclick="chToggle('${sid}')">
                    <div class="stu-dot ${s.role.toLowerCase()}"></div>
                    <div class="stu-info">
                      <div class="stu-name">${s.name}</div>
                      <div class="stu-id">${s.student_code || s._id}</div>
                    </div>
                    <span class="stu-role-tag ${s.role.toLowerCase()}">${s.role}</span>
                    <div class="stu-total"><span>${total}</span><span class="den">/ ${TOTAL_MARKS}</span></div>
                    <div class="stu-chev" id="chch-${sid}">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                           stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                  </div>
                  <div class="stu-body" id="chbd-${sid}">
                    <div style="font-size:.7rem;color:var(--text-mute);margin-bottom:10px;display:flex;gap:18px">
                      <span>📧 ${s.email || "—"}</span>
                      <a href="https://wa.me/${(s.whatsapp||"").replace(/^0/,"92")}" target="_blank"
                         style="color:#15803d;font-weight:600;text-decoration:none">
                        📱 ${s.whatsapp || "—"}
                      </a>
                    </div>
                    <div class="mk-grid">${readOnlyMarksHtml(s.marks || {})}</div>
                    <div class="grand-bar">
                      <div class="gb-label">Grand Total</div>
                      <div class="gb-val"><span class="num">${total}</span><span class="den">/ ${TOTAL_MARKS}</span></div>
                    </div>
                  </div>
                </div>`;
              }).join("")}
            </div>
          </div>`;
        }).join("")}`;
}

/* ═══════════════════════════════════
   ALL STUDENTS TAB (click for marks detail)
═══════════════════════════════════ */
async function showStudentsList() {
  document.getElementById("students-list-view").style.display  = "";
  document.getElementById("students-detail-view").style.display = "none";
  if (STUDENTS_DATA.length) { renderStudents(STUDENTS_DATA, ""); return; }

  const tbody = document.getElementById("students-tbody");
  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-mute)">Loading…</td></tr>`;
  try {
    const res  = await fetch(`${API_BASE}/supervisors/chairman/students`, { headers: authHeaders });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");
    STUDENTS_DATA = data.students || [];
    renderStudents(STUDENTS_DATA, "");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="color:#dc2626;padding:20px">Error: ${err.message}</td></tr>`;
  }
}

function renderStudents(list, q) {
  q = (q || "").trim().toLowerCase();
  const tbody = document.getElementById("students-tbody");
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-mute)">No students yet</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(s => {
    const teamCode = s.group?.team_code || "—";
    const supName  = s.group?.supervisor?.name || "Unassigned";
    return `<tr onclick="openStudentDetail('${s._id}')" style="cursor:pointer">
      <td><span class="s-id">${hl(s.student_code, q)}</span></td>
      <td>
        <div>${hl(s.name, q)}</div>
        <small style="color:var(--text-mute);font-size:.66rem">${s.email || ""}</small>
        ${s.whatsapp ? `<a href="https://wa.me/${s.whatsapp.replace(/^0/,"92")}" target="_blank"
          onclick="event.stopPropagation()"
          style="color:#15803d;font-size:.66rem;font-weight:600;text-decoration:none;display:block">
          📱 ${s.whatsapp}</a>` : ""}
      </td>
      <td><span class="tid">${hl(teamCode, q)}</span></td>
      <td>${hl(supName, q)}</td>
      <td><span class="s-role ${(s.team_role||"member").toLowerCase()}">${s.team_role || "—"}</span></td>
      <td style="text-align:right">
        <span class="s-marks">${s.total_marks ?? 0} <span class="den">/ ${TOTAL_MARKS}</span></span>
      </td>
      <td style="text-align:right"><span class="g-arrow">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </span></td>
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
  renderStudents(filtered, q);
}

async function openStudentDetail(studentId) {
  const s = STUDENTS_DATA.find(x => x._id === studentId);
  if (!s) return;

  /* fetch marks */
  let marks = {};
  try {
    if (s.group?._id) {
      const res  = await fetch(`${API_BASE}/marks/group/${s.group._id}`, { headers: authHeaders });
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.marks || data.data || []);
      const rec  = list.find(m => {
        const ref = typeof m.student === "string" ? m.student : m.student?._id;
        return ref === studentId;
      });
      if (rec) marks = marksFromRecord(rec);
    }
  } catch (e) { /* silently continue with empty marks */ }

  const total = calcTotal(marks);

  document.getElementById("students-list-view").style.display  = "none";
  const d = document.getElementById("students-detail-view");
  d.style.display = "";

  d.innerHTML = `
    ${backBtn("students-list-view", "students-detail-view", "Back to All Students")}
    <div class="gh-strip">
      <div class="gh-info">
        <div class="gh-tid">${s.student_code || "—"}</div>
        <div class="gh-proj">${s.name}</div>
        <div class="gh-sup">
          Team: ${s.group?.team_code || "—"} &nbsp;·&nbsp;
          Supervisor: ${s.group?.supervisor?.name || "Unassigned"} &nbsp;·&nbsp;
          Role: ${s.team_role || "—"}
        </div>
        <div style="margin-top:8px;font-size:.78rem;color:var(--text-mute);display:flex;gap:18px">
          <span>📧 ${s.email || "—"}</span>
          ${s.whatsapp ? `<a href="https://wa.me/${s.whatsapp.replace(/^0/,"92")}" target="_blank"
            style="color:#15803d;font-weight:600;text-decoration:none">📱 ${s.whatsapp}</a>` : ""}
        </div>
      </div>
      <div class="gh-stat-box">
        <div class="st-label">Total</div>
        <div class="st-val">${total}</div>
        <div class="st-sub">/ ${TOTAL_MARKS}</div>
      </div>
    </div>
    <p style="font-size:.78rem;color:var(--text-mute);margin:0 0 12px;padding:0 4px">
      🔒 Read-only — marks cannot be edited here
    </p>
    <div class="mk-grid">${readOnlyMarksHtml(marks)}</div>
    <div class="grand-bar">
      <div class="gb-label">Grand Total</div>
      <div class="gb-val"><span class="num">${total}</span><span class="den">/ ${TOTAL_MARKS}</span></div>
    </div>`;
}

/* ═══════════════════════════════════
   PROPOSALS TAB
═══════════════════════════════════ */
async function loadProposals() {
  const tbody = document.getElementById("proposals-tbody");
  tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:30px;color:var(--text-mute)">Loading…</td></tr>`;
  try {
    const res  = await fetch(`${API_BASE}/supervisors/chairman/teams`, { headers: authHeaders });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");
    const teams = data.teams || [];
    if (!teams.length) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:30px;color:var(--text-mute)">No teams yet</td></tr>`;
      return;
    }
    window._proposalTeams = teams;
    renderProposals(teams, "");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" style="color:#dc2626;padding:20px">Error: ${err.message}</td></tr>`;
  }
}

function renderProposals(list, q) {
  q = (q || "").trim().toLowerCase();
  const tbody = document.getElementById("proposals-tbody");
  tbody.innerHTML = list.map(t => {
    let status, cls;
    if (!t.proposal_url)                    { status = "Not Submitted"; cls = "not-submitted"; }
    else if (t.proposal_status === "approved") { status = "Approved";     cls = "approved"; }
    else if (t.proposal_status === "rejected") { status = "Rejected";     cls = "rejected"; }
    else                                    { status = "Pending";       cls = "pending"; }

    return `<tr>
      <td><span class="tid">${hl(t.team_code || "—", q)}</span></td>
      <td><span class="g-proj">${hl(t.project_title || "—", q)}</span></td>
      <td><span class="prop-status ${cls}">${status}</span></td>
      <td>${hl(t.supervisor?.name || "Unassigned", q)}</td>
    </tr>`;
  }).join("");
}

function filterProposals(q) {
  const teams = window._proposalTeams || [];
  q = (q || "").trim().toLowerCase();
  const filtered = teams.filter(t =>
    (t.team_code || "").toLowerCase().includes(q) ||
    (t.project_title || "").toLowerCase().includes(q) ||
    (t.proposal_status || "").toLowerCase().includes(q) ||
    (t.supervisor?.name || "").toLowerCase().includes(q)
  );
  renderProposals(filtered, q);
}

/* ═══════════════════════════════════
   SIDEBAR (mobile)
═══════════════════════════════════ */
function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const ham     = document.getElementById("hamburgerBtn");
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
  t.className   = "toast" + (type ? " " + type : "") + " show";
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
(async () => {
  await checkChairmanAccess();
  loadOverview();
})();