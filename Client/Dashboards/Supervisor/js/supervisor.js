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
const API_BASE = "http://localhost:5001/api"; 

const sup = JSON.parse(localStorage.getItem("supervisor"));

if (!sup) {
  window.location.href = "login.html";
}

if (sup.force_password_change) {
  window.location.href = "change-password.html";
}

const IS_CHAIRMAN = sup?.is_chairman === true;

// Chairman nav only shown if admin has enabled analytics mode
async function initChairmanNav() {
  if (!IS_CHAIRMAN) return; // regular supervisor — skip entirely

  try {
    const res  = await fetch(`${API_BASE}/admin/system/chairman-mode/public`);
    const data = await res.json();

    if (data.chairman_monitoring_mode) {
      // Toggle is ON — show chairman analytics nav
      const chairmanNav = document.getElementById("chairman-nav-items");
      if (chairmanNav) chairmanNav.style.display = "";
    }
    // Toggle is OFF — show nothing extra, pure supervisor view

  } catch (err) {
    // Server unreachable — fail silently, show pure supervisor view
    console.error("Chairman mode check failed:", err.message);
  }
}

initChairmanNav();
const SUPERVISOR = { id: sup.sup_code, name: sup.name, prefix: sup.prefix };

function initials(name) {
  return (name || "")
    .split(" ")
    .filter(p => p && /[A-Za-z]/.test(p[0]))
    .slice(-2)
    .map(p => p[0].toUpperCase())
    .join("");
}

function formatName(prefix, name) {
  if (!prefix || !name) return name || "";
  return `${prefix}. ${name}`;
}

const MARK_COMPONENTS = [
  {
    section: "Monthly Meetings",
    icon: "calendar",
    items: [
      { key: "oct", label: "October",  max: 10 },
      { key: "nov", label: "November", max: 10 },
      { key: "dec", label: "December", max: 10 },
      { key: "feb", label: "February", max: 10 },
      { key: "mar", label: "March",    max: 10 },
    ],
  },
  {
    section: "Submissions",
    icon: "file",
    items: [
      { key: "proposal",        label: "Proposal Submission",   max: 10 },
      { key: "progress_report", label: "Progress Report",       max: 20 },
      { key: "thesis",          label: "Thesis / Report",       max: 20 },
      { key: "code",            label: "Code / Practical Work", max: 10 },
      { key: "prog_sim",        label: "Progress Similarity",   max: 5  },
      { key: "thesis_sim",      label: "Thesis Similarity",     max: 5  },
    ],
  },
  {
    section: "Viva",
    icon: "mic",
    items: [
      { key: "iv1", label: "Internal Viva 1", max: 25 },
      { key: "iv2", label: "Internal Viva 2", max: 25 },
      { key: "ext", label: "External Viva",   max: 30 },
    ],
  },
];

const TOTAL_MARKS = 200;

// Real data from DB
let TEAMS = [];

// Admin-controlled mark toggles (loaded once, applied after each render)
let MARK_TOGGLES = {};

// Set welcome info
const welcomeName = document.getElementById("welcome-name");
const welcomeDes  = document.getElementById("welcome-designation");
const welcomeId   = document.getElementById("welcome-sup-id");
if (welcomeName) welcomeName.textContent = getSupGreeting(formatName(sup.prefix, sup.name));

startSupClock();
if (welcomeDes)  welcomeDes.textContent  = `${sup.designation || "Faculty Member"} · CS Department`;
if (welcomeId)   welcomeId.textContent   = sup.sup_code || "—";

const navName = document.getElementById("nav-sup-name");
const navCode = document.getElementById("nav-sup-code");
if (navName) navName.textContent = formatName(sup.prefix, sup.name) || "Supervisor";
if (navCode) navCode.textContent = sup.sup_code || "";

const navInitialsEl = document.getElementById("nav-avatar-initials");
if (navInitialsEl) navInitialsEl.textContent = initials(sup.name || "");

if (sup.avatar_url) setNavAvatar(sup.avatar_url);

function getSupGreeting(name) {
  const hour = new Date().getHours();
  let greeting, icon;
  if      (hour >= 5  && hour < 12) { greeting = "Good Morning";   icon = "☀️"; }
  else if (hour >= 12 && hour < 17) { greeting = "Good Afternoon"; icon = "🌤️"; }
  else if (hour >= 17 && hour < 21) { greeting = "Good Evening";   icon = "🌆"; }
  else                              { greeting = "Good Night";     icon = "🌙"; }
  return `${greeting}, ${name} ${icon}`;
}

function startSupClock() {
  function update() {
    const el = document.getElementById("sup-datetime");
    if (!el) return;
    const now    = new Date();
    const days   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const day    = days[now.getDay()];
    const date   = now.getDate();
    const month  = months[now.getMonth()];
    const year   = now.getFullYear();
    let hours    = now.getHours();
    const mins   = String(now.getMinutes()).padStart(2, "0");
    const ampm   = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    el.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round" width="12" height="12">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
       Today is ${day}, ${date} ${month} ${year} &nbsp;·&nbsp; ${hours}:${mins} ${ampm}`;
  }
  update();
  setInterval(update, 1000);
}

/* ═══════════════════════════════════
   ADMIN MARK LOCKS (single source of truth)
═══════════════════════════════════ */
async function loadMarkToggles() {
  try {
    const res = await fetch(`${API_BASE}/supervisor/mark-toggles`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${sup.token}`
      }
    });
    if (!res.ok) return;
    const data = await res.json();


    MARK_TOGGLES = data.toggles || {};
  } catch (err) {
    console.error("Toggle load failed:", err);
  }
}

function applyMarkLocks() {
  document.querySelectorAll(".mk-input").forEach(input => {
    const key = input.dataset.key;

    const enabled = MARK_TOGGLES[key] === true || MARK_TOGGLES[key] === "true";

    input.disabled      = !enabled;
    input.style.opacity = enabled ? "1"    : "0.5";
    input.style.cursor  = enabled ? "text" : "not-allowed";
    input.title         = enabled ? ""     : "🔒 Locked by admin";

    if (enabled) {
      input.classList.remove("locked-by-admin");
    } else {
      input.classList.add("locked-by-admin");
    }
  });
}
async function refreshMarkLocks() {
  await loadMarkToggles();
  applyMarkLocks();
}

/* ═══════════════════════════════════
   FETCH TEAMS FROM BACKEND
═══════════════════════════════════ */
function initials(name) {
  return (name || "")
    .split(" ")
    .filter(p => p && /[A-Za-z]/.test(p[0]))
    .slice(-2)
    .map(p => p[0].toUpperCase())
    .join("");
}

/* ═══════════════════════════════════
   PAGINATION
═══════════════════════════════════ */
const GROUPS_PAGE = { current: 1, perPage: 5 };

function renderSupPagination(containerId, totalItems, currentPage, perPage, onPageChange) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const totalPages = Math.ceil(totalItems / perPage);
  const start = Math.min((currentPage - 1) * perPage + 1, totalItems);
  const end   = Math.min(currentPage * perPage, totalItems);

  if (totalItems === 0) { container.innerHTML = ""; return; }

  const visiblePages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) visiblePages.push(i);
  } else {
    visiblePages.push(1);
    if (currentPage > 3) visiblePages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      visiblePages.push(i);
    }
    if (currentPage < totalPages - 2) visiblePages.push("...");
    visiblePages.push(totalPages);
  }

  const pageButtons = totalPages > 1 ? `
    <div style="display:flex;gap:4px;align-items:center">
      <button onclick="${onPageChange}(${currentPage - 1})"
        ${currentPage === 1 ? "disabled" : ""}
        style="width:30px;height:30px;border-radius:7px;border:1px solid var(--border);
               background:var(--surface);cursor:${currentPage === 1 ? "not-allowed" : "pointer"};
               opacity:${currentPage === 1 ? ".4" : "1"};display:grid;place-items:center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      ${visiblePages.map(p => p === "..."
        ? `<span style="width:30px;height:30px;display:grid;place-items:center;color:var(--text-mute);font-size:.76rem">…</span>`
        : `<button onclick="${onPageChange}(${p})"
             style="width:30px;height:30px;border-radius:7px;
                    border:1px solid ${p === currentPage ? "var(--primary)" : "var(--border)"};
                    background:${p === currentPage ? "var(--primary)" : "var(--surface)"};
                    color:${p === currentPage ? "#fff" : "var(--text)"};
                    font-size:.76rem;font-weight:${p === currentPage ? "700" : "600"};cursor:pointer">
             ${p}
           </button>`
      ).join("")}
      <button onclick="${onPageChange}(${currentPage + 1})"
        ${currentPage === totalPages ? "disabled" : ""}
        style="width:30px;height:30px;border-radius:7px;border:1px solid var(--border);
               background:var(--surface);cursor:${currentPage === totalPages ? "not-allowed" : "pointer"};
               opacity:${currentPage === totalPages ? ".4" : "1"};display:grid;place-items:center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </div>` : "";

  container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;
                padding:12px 16px;border-top:1px solid var(--border-soft);
                flex-wrap:wrap;gap:8px">
      <span style="font-size:.74rem;color:var(--text-mute);font-weight:600">
        Showing <strong style="color:var(--text)">${start}–${end}</strong>
        of <strong style="color:var(--text)">${totalItems}</strong> groups
      </span>
      ${pageButtons}
    </div>`;
}

function renderGroupsPage(page) {
  GROUPS_PAGE.current = page;
  const perPage = GROUPS_PAGE.perPage;
  const start   = (page - 1) * perPage;
  const slice   = TEAMS.slice(start, start + perPage);

  const tbody = document.getElementById("groups-list-tbody");
  if (!tbody) return;

  if (!TEAMS.length) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--text-mute)">
      No teams assigned to you yet.
    </td></tr>`;
    renderSupPagination("groupsListPagination", 0, 1, perPage, "renderGroupsPage");
    return;
  }

  tbody.innerHTML = slice.map(t =>
    `<tr onclick="openGroupDetail('${t._id}')">
      <td><span class="tid">${t.teamId}</span></td>
      <td><span class="g-proj">${t.projectTitle}</span></td>
      <td><span class="g-count">${t.students.length}</span></td>
      <td style="text-align:right">
        <span class="g-arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </span>
      </td>
    </tr>`
  ).join("");

  renderSupPagination("groupsListPagination", TEAMS.length, page, perPage, "renderGroupsPage");
}

/* ═══════════════════════════════════
   DEADLINES
═══════════════════════════════════ */
function deadlineRowHtml(d) {
  const due      = new Date(d.dueDate);
  const diffMs   = due - new Date();
  const diffDays = Math.ceil(diffMs / 86400000);
  const expired  = diffMs < 0;
  const near     = !expired && diffDays <= 2;
  const label    = d.type === "Other" && d.customName ? d.customName : d.type;
  const day      = due.getDate().toString().padStart(2, "0");
  const mo       = due.toLocaleString("en-PK", { month: "short" });
  const tagText  = expired ? "Expired" : diffDays === 0 ? "Today!" : `${diffDays} days`;
  const bgColor  = expired ? "#dc2626" : near ? "var(--gold)" : "var(--primary)";
  const tagColor = expired ? "#dc2626" : near ? "#a16207" : "var(--secondary)";
  const tagBg    = expired ? "rgba(220,38,38,.08)" : near ? "rgba(234,179,8,.1)" : "rgba(0,75,45,.08)";

  return `
    <div style="display:flex;gap:14px;align-items:center;padding:11px 0;
                border-bottom:1px solid var(--border-soft)">
      <div style="background:${bgColor};color:#fff;border-radius:9px;padding:7px 10px;
                  text-align:center;flex-shrink:0;min-width:46px">
        <span style="font-family:var(--font-display);font-size:1.2rem;font-weight:700;
                     line-height:1;display:block">${day}</span>
        <span style="font-size:.58rem;font-weight:600;opacity:.7;
                     text-transform:uppercase;letter-spacing:.06em">${mo}</span>
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-size:.84rem;font-weight:700;color:var(--text);margin-bottom:2px">${label}</div>
        <div style="font-size:.74rem;color:var(--text-mute)">${d.description || "Submission deadline — 11:59 PM"}</div>
      </div>
      <span style="margin-left:auto;flex-shrink:0;padding:3px 9px;border-radius:20px;
                   font-size:.68rem;font-weight:700;background:${tagBg};color:${tagColor}">
        ${tagText}
      </span>
    </div>`;
}

let DEADLINES_CACHE = null;

async function loadDeadlines() {
  if (DEADLINES_CACHE) return DEADLINES_CACHE;
  try {
    const res = await fetch(`${API_BASE}/deadlines`, {
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sup.token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    DEADLINES_CACHE = Array.isArray(data) ? data : [];
    return DEADLINES_CACHE;
  } catch (err) {
    return [];
  }
}

async function renderTabDeadlines() {
  const container = document.getElementById("tab-deadlines-container");
  if (!container) return;
  container.innerHTML = `<p style="color:var(--text-mute);font-size:.82rem">Loading…</p>`;
  const data = await loadDeadlines();
  if (!data.length) {
    container.innerHTML = `<p style="color:var(--text-mute);font-size:.82rem">No deadlines posted yet.</p>`;
    return;
  }
  container.innerHTML = data.map(d => deadlineRowHtml(d)).join("");
}

/* ═══════════════════════════════════
   CHAIRMAN FUNCTIONS
═══════════════════════════════════ */
async function loadDepartmentOverview() {
  if (!IS_CHAIRMAN) return;
  const loadingEl = document.getElementById("overview-loading");
  const contentEl = document.getElementById("overview-content");
  if (loadingEl) loadingEl.style.display = "";
  if (contentEl) contentEl.style.display = "none";
  try {
    const res = await fetch(`${API_BASE}/supervisor/chairman/overview`, {
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sup.token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");
    document.getElementById("ov-total-students").textContent = data.totalStudents;
    document.getElementById("ov-total-sups").textContent     = data.totalSupervisors;
    document.getElementById("ov-total-teams").textContent    = data.totalTeams;
    document.getElementById("ov-avg-score").textContent      = data.avgScore;
    const ps = data.proposalStats;
    const stats = [
      { label: "Approved",       value: ps.approved,      color: "#15803d", bg: "rgba(34,197,94,.1)",   border: "#22c55e" },
      { label: "Pending Review", value: ps.pending,       color: "#a16207", bg: "rgba(234,179,8,.1)",   border: "#eab308" },
      { label: "Rejected",       value: ps.rejected,      color: "#dc2626", bg: "rgba(220,38,38,.1)",   border: "#dc2626" },
      { label: "Not Submitted",  value: ps.not_submitted, color: "#475569", bg: "rgba(148,163,184,.1)", border: "#94a3b8" },
    ];
    document.getElementById("ov-proposal-stats").innerHTML = stats.map(s => `
      <div style="background:${s.bg};border-left:3px solid ${s.border};padding:16px 18px;border-radius:10px">
        <div style="font-size:.7rem;color:var(--text-mute);font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">${s.label}</div>
        <div style="font-size:1.8rem;font-weight:800;color:${s.color};line-height:1">${s.value}</div>
        <div style="font-size:.7rem;color:var(--text-mute);margin-top:4px">${ps.total > 0 ? Math.round((s.value / ps.total) * 100) : 0}% of teams</div>
      </div>`).join("");
    if (loadingEl) loadingEl.style.display = "none";
    if (contentEl) contentEl.style.display = "";
  } catch (err) {
    if (loadingEl) loadingEl.innerHTML = `<div style="color:#dc2626">Failed to load: ${err.message}</div>`;
  }
}

async function loadWorkload() {
  if (!IS_CHAIRMAN) return;
  const tbody = document.getElementById("workload-tbody");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:30px;color:var(--text-mute)">Loading…</td></tr>`;
  try {
    const res = await fetch(`${API_BASE}/supervisors/chairman/workload`, {
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sup.token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");
    if (!data.workload?.length) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:30px;color:var(--text-mute)">No supervisors found</td></tr>`;
      return;
    }
    tbody.innerHTML = data.workload.map(w => `
      <tr>
        <td><div style="font-weight:600">${w.name}${w.is_chairman ? '<span class="chairman-tag">Chairman</span>' : ''}</div>
            <small style="color:var(--text-mute);font-size:.66rem">${w.designation}</small></td>
        <td><span class="tid">${w.sup_code}</span></td>
        <td><span class="g-count">${w.teamCount}</span></td>
        <td><span class="g-count">${w.studentCount}</span></td>
      </tr>`).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#dc2626;padding:20px">Error: ${err.message}</td></tr>`;
  }
}

async function loadAllTeams() {
  if (!IS_CHAIRMAN) return;
  const tbody = document.getElementById("all-teams-tbody");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:30px;color:var(--text-mute)">Loading…</td></tr>`;
  try {
    const res = await fetch(`${API_BASE}/supervisors/chairman/teams`, {
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sup.token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");
    if (!data.teams?.length) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:30px;color:var(--text-mute)">No teams yet</td></tr>`;
      return;
    }
    tbody.innerHTML = data.teams.map(t => `
      <tr>
        <td><span class="tid">${t.team_code}</span></td>
        <td><span class="g-proj">${t.project_title}</span></td>
        <td><div style="font-weight:600">${t.supervisor?.name || "—"}</div>
            <small style="color:var(--text-mute);font-size:.66rem">${t.supervisor?.sup_code || ""}</small></td>
        <td><span class="g-count">${1 + (t.members?.length || 0)}</span></td>
      </tr>`).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#dc2626;padding:20px">Error: ${err.message}</td></tr>`;
  }
}

async function loadAllStudents() {
  if (!IS_CHAIRMAN) return;
  const tbody = document.getElementById("all-students-tbody");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-mute)">Loading…</td></tr>`;
  try {
    const res = await fetch(`${API_BASE}/supervisors/chairman/students`, {
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sup.token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");
    if (!data.students?.length) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-mute)">No students yet</td></tr>`;
      return;
    }
    tbody.innerHTML = data.students.map(s => `
      <tr>
        <td><span class="s-id">${s.student_code}</span></td>
        <td><div>${s.name}</div><small style="color:var(--text-mute);font-size:.66rem">${s.email || ""}</small></td>
        <td><span class="tid">${s.group?.team_code || "—"}</span></td>
        <td>${s.group?.supervisor?.name || "Unassigned"}</td>
        <td><span class="s-role ${(s.team_role||'member').toLowerCase()}">${s.team_role || '—'}</span></td>
        <td style="text-align:right"><span class="s-marks">${s.total_marks} <span class="den">/ ${TOTAL_MARKS}</span></span></td>
      </tr>`).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#dc2626;padding:20px">Error: ${err.message}</td></tr>`;
  }
}

async function loadTeams() {
  try {
    const res = await fetch(`${API_BASE}/groups/supervisor`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${sup.token}`
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");
    const groups = Array.isArray(data) ? data : data.groups || [];
    TEAMS = groups.map(g => {
      const leader  = g.leader;
      const members = g.members || [];
      const allStudents = [
        leader ? { ...leader, role: "Leader" } : null,
        ...members.map(m => ({ ...m, role: "Member" }))
      ].filter(Boolean);
      return {
        teamId:       g.group_code || g.team_code,
        _id:          g._id,
        projectTitle: g.project_title || "—",
        category:     g.category || "—",
        students:     allStudents.map(s => ({
          id:       s.student_code || s._id,
          _id:      s._id,
          name:     s.name,
          email:    s.email || "",
          whatsapp: s.whatsapp || "",
          role:     s.role,
          marks: {
            oct: null, nov: null, dec: null, feb: null, mar: null,
            proposal: null, progress_report: null, thesis: null,
            code: null, prog_sim: null, thesis_sim: null,
            iv1: null, iv2: null, ext: null,
          }
        }))
      };
    });
    await loadAllMarks();
    await loadMarkToggles();
    teamsLoaded = true;
    GROUPS_PAGE.current = 1;
    renderDashboard();
    if (document.getElementById("tab-groups")?.classList.contains("active")) {
      renderGroupsPage(1);
    }
  } catch (err) {
    console.error(err);
    toast("Failed to load teams: " + err.message, "red");
    teamsLoaded = true;
    renderDashboard();
  }
}

async function loadAllMarks() {
  for (const team of TEAMS) {
    try {
      const res = await fetch(`${API_BASE}/marks/group/${team._id}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sup.token}`
        }
      });
      if (!res.ok) { console.warn(`Marks fetch failed for ${team.teamId}: ${res.status}`); continue; }
      const data = await res.json();
      let marksList = [];
      if (Array.isArray(data)) marksList = data;
      else if (Array.isArray(data?.marks)) marksList = data.marks;
      else { console.warn(`Unexpected shape:`, data); continue; }
      marksList.forEach(m => {
        const studentRefId = (typeof m.student === "string") ? m.student : m.student?._id ?? null;
        if (!studentRefId) return;
        const student = team.students.find(s => s._id === studentRefId);
        if (!student) return;
        student.marks = {
          oct: m.monthly?.oct ?? null,
          nov: m.monthly?.nov ?? null,
          dec: m.monthly?.dec ?? null,
          feb: m.monthly?.feb ?? null,
          mar: m.monthly?.mar ?? null,
          proposal:        m.submissions?.proposal ?? null,
          progress_report: m.submissions?.progress ?? null,
          thesis:          m.documentation?.final ?? null,
          code:            m.submissions?.code ?? null,
          prog_sim:        m.submissions?.prog_sim ?? null,
          thesis_sim:      m.submissions?.thesis_sim ?? null,
          iv1: m.viva?.internal1 ?? null,
          iv2: m.viva?.internal2 ?? null,
          ext: m.viva?.external ?? null,
        };
      });
    } catch (err) {
      console.error("Error loading marks for", team.teamId, err);
    }
  }
}

function studentTotal(s) {
  let t = 0;
  MARK_COMPONENTS.forEach(sec => sec.items.forEach(item => {
    if (s.marks[item.key] != null) t += s.marks[item.key];
  }));
  return t;
}

let avatarFileToUpload = null;

function openAvatarModal() {
  const modal = document.getElementById("avatarModal");
  if (!modal) return;
  modal.style.display = "flex";
  const navImg    = document.getElementById("nav-avatar-img");
  const modalImg  = document.getElementById("modal-avatar-img");
  const modalInit = document.getElementById("modal-avatar-initials");
  const navInit   = document.getElementById("nav-avatar-initials");
  if (navImg && navImg.style.display !== "none" && navImg.src) {
    modalImg.src = navImg.src;
    modalImg.style.display  = "block";
    modalInit.style.display = "none";
  } else {
    modalImg.style.display  = "none";
    modalInit.style.display = "";
    if (navInit) modalInit.textContent = navInit.textContent;
  }
  avatarFileToUpload = null;
  const btn = document.getElementById("avatar-save-btn");
  if (btn) { btn.disabled = true; btn.style.opacity = ".5"; }
  const errEl = document.getElementById("avatar-error");
  if (errEl) errEl.style.display = "none";
}

function closeAvatarModal() {
  const modal = document.getElementById("avatarModal");
  if (modal) modal.style.display = "none";
  avatarFileToUpload = null;
}

function handleAvatarDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove("av-drag");
  const file = e.dataTransfer.files[0];
  if (file) previewAvatar(file);
}

function previewAvatar(file) {
  const errEl = document.getElementById("avatar-error");
  if (errEl) errEl.style.display = "none";
  if (!file) return;
  if (!["image/jpeg","image/png","image/webp"].includes(file.type)) {
    if (errEl) { errEl.textContent = "Only JPG, PNG or WEBP allowed"; errEl.style.display = "block"; }
    return;
  }
  if (file.size > 3 * 1024 * 1024) {
    if (errEl) { errEl.textContent = "File must be under 3 MB"; errEl.style.display = "block"; }
    return;
  }
  avatarFileToUpload = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    const modalImg  = document.getElementById("modal-avatar-img");
    const modalInit = document.getElementById("modal-avatar-initials");
    if (modalImg)  { modalImg.src = e.target.result; modalImg.style.display = "block"; }
    if (modalInit) modalInit.style.display = "none";
  };
  reader.readAsDataURL(file);
  const btn = document.getElementById("avatar-save-btn");
  if (btn) { btn.disabled = false; btn.style.opacity = "1"; }
}

async function uploadAvatar() {
  if (!avatarFileToUpload) return;

  const btn = document.getElementById("avatar-save-btn");
  const errEl = document.getElementById("avatar-error");

  if (btn) {
    btn.textContent = "Uploading…";
    btn.disabled = true;
    btn.style.opacity = ".6";
  }

  if (errEl) errEl.style.display = "none";

  const formData = new FormData();
  formData.append("avatar", avatarFileToUpload);

  try {
    const res = await fetch(`${API_BASE}/uploads/supervisor/avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sup.token}`,
      },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Upload failed");

    const avatarUrl = data.avatar_url;

    setNavAvatar(avatarUrl);

    const modalImg = document.getElementById("modal-avatar-img");
    const modalInit = document.getElementById("modal-avatar-initials");

    if (modalImg) {
      modalImg.src = avatarUrl;
      modalImg.style.display = "block";
    }

    if (modalInit) {
      modalInit.style.display = "none";
    }

    try {
      const stored = JSON.parse(localStorage.getItem("supervisor"));

      if (stored) {
        stored.avatar_url = avatarUrl;
        localStorage.setItem("supervisor", JSON.stringify(stored));
      }
    } catch (e) {
      console.warn("localStorage error:", e);
    }

    if (typeof sup !== "undefined" && sup) {
      sup.avatar_url = avatarUrl;
    }

    closeAvatarModal();
    toast("Profile picture updated", "green");
  } catch (err) {
    if (errEl) {
      errEl.textContent = err.message;
      errEl.style.display = "block";
    }

    if (btn) {
      btn.textContent = "Save Photo";
      btn.disabled = false;
      btn.style.opacity = "1";
    }
  }
}

function setNavAvatar(url) {
  const img  = document.getElementById("nav-avatar-img");
  const init = document.getElementById("nav-avatar-initials");
  if (!img) return;

  if (!url) {
    img.style.display = "none";
    if (init) init.style.display = "";
    return;
  }

  const testImg = new Image();
  testImg.onload = () => {
    img.src            = url;
    img.style.display  = "block";
    if (init) init.style.display = "none";
  };
  testImg.onerror = () => {
    img.style.display = "none";
    if (init) init.style.display = "";
    console.warn("Avatar failed to load:", url);
  };
  testImg.src = url;
}

// Load avatar on page start
if (sup.avatar_url) setNavAvatar(sup.avatar_url);
let teamsLoaded = false;

function renderDashboard() {
  const statGroups   = document.getElementById("stat-groups");
  const statStudents = document.getElementById("stat-students");
  const dashTab      = document.getElementById("tab-dashboard");

  if (statGroups)   statGroups.textContent   = TEAMS.length;
  if (statStudents) statStudents.textContent = TEAMS.reduce((s, t) => s + t.students.length, 0);

  if (dashTab) filterDashGroups();
}
function filterDashGroups() {
  const tbody = document.getElementById("dash-groups-tbody");
  if (!tbody) return;

  if (TEAMS.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--text-mute)">No teams assigned to you yet.</td></tr>`;
    return;
  }

  const slice = TEAMS.slice(0, 3);
  tbody.innerHTML = slice.map(t => `
    <tr onclick="showTab('groups')">
      <td><span class="tid">${t.teamId}</span></td>
      <td><span class="g-proj">${t.projectTitle}</span></td>
      <td><span class="g-count">${t.students.length}</span></td>
      <td style="text-align:right"><span class="g-arrow">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </span></td>
    </tr>`
  ).join("");

  if (TEAMS.length > 3) {
    tbody.innerHTML += `
      <tr>
        <td colspan="4" style="text-align:center;padding:14px 0">
          <button onclick="showTab('groups')"
            style="padding:7px 20px;border-radius:9px;border:1.5px solid var(--primary);
                   background:rgba(0,75,45,.06);color:var(--primary);font-size:.78rem;
                   font-weight:700;cursor:pointer">
            View all ${TEAMS.length} groups →
          </button>
        </td>
      </tr>`;
  }
}

function showGroupsList() {
  document.getElementById("groups-list-view").style.display = "";
  document.getElementById("group-detail-view").style.display = "none";
  const tbody = document.getElementById("groups-list-tbody");
  if (!tbody) return;
  if (!teamsLoaded) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--text-mute)">Loading groups…</td></tr>`;
    return;
  }
  if (TEAMS.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--text-mute)">No teams assigned to you yet.</td></tr>`;
    const pag = document.getElementById("groupsListPagination");
    if (pag) pag.innerHTML = "";
    return;
  }
  const query = document.getElementById("search-groups")?.value || "";
  if (query.trim()) { filterGroupsList(query); } else { renderGroupsPage(GROUPS_PAGE.current); }
}

function filterGroupsList(query) {
  const q = (query || "").trim().toLowerCase();
  const tbody = document.getElementById("groups-list-tbody");
  const pag   = document.getElementById("groupsListPagination");
  if (!tbody) return;
  if (!q) { renderGroupsPage(1); return; }
  GROUPS_PAGE.current = 1;
  const filtered = TEAMS.filter(t =>
    (t.teamId || "").toLowerCase().includes(q) ||
    (t.projectTitle || "").toLowerCase().includes(q)
  );
  if (!filtered.length) { tbody.innerHTML = emptySearchRow(4, query); if (pag) pag.innerHTML = ""; return; }
  tbody.innerHTML = filtered.map(t =>
    `<tr onclick="openGroupDetail('${t._id}')">
      <td><span class="tid">${highlightMatch(t.teamId, q)}</span></td>
      <td><span class="g-proj">${highlightMatch(t.projectTitle, q)}</span></td>
      <td><span class="g-count">${t.students.length}</span></td>
      <td style="text-align:right"><span class="g-arrow">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg></span></td>
    </tr>`
  ).join("");
  if (pag) pag.innerHTML = `<div style="padding:10px 16px;font-size:.74rem;color:var(--text-mute);font-weight:600;border-top:1px solid var(--border-soft)">${filtered.length} result${filtered.length !== 1 ? "s" : ""} found</div>`;
}

function showTab(tab) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById("tab-" + tab)?.classList.add("active");
  document.querySelectorAll(".sb-btn:not(.logout)").forEach(b => b.classList.remove("active"));
  document.getElementById("sb-" + tab)?.classList.add("active");
  const titles = {
    "dashboard": ["Dashboard",           "Overview of your assigned groups and students"],
    "groups":    ["My Groups",           "View groups, students, and assign marks"],
    "overview":  ["Department Overview", "Department-wide statistics — Chairman view"],
    "deadlines": ["Academic Deadlines",  "Upcoming submission and evaluation deadlines"],
  };
  const t = titles[tab] || [tab, ""];
  document.getElementById("page-title").textContent = t[0];
  document.getElementById("page-sub").textContent   = t[1];
  if (tab === "dashboard") renderDashboard();
  if (tab === "groups")    showGroupsList();
  if (tab === "overview")  loadDepartmentOverview();
  if (tab === "deadlines") renderTabDeadlines();
}

function toggleSidebar() {
  const sidebar   = document.getElementById("sidebar");
  const overlay   = document.getElementById("sidebarOverlay");
  const hamburger = document.getElementById("hamburgerBtn");
  if (sidebar.classList.contains("open")) { closeSidebar(); return; }
  sidebar.classList.add("open");
  overlay?.classList.add("show");
  hamburger?.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeSidebar() {
  document.querySelector(".sidebar")?.classList.remove("open");
  document.getElementById("sidebarOverlay")?.classList.remove("show");
  document.getElementById("hamburgerBtn")?.classList.remove("open");
  document.body.style.overflow = "";
}

document.querySelectorAll(".sb-btn").forEach(btn => {
  btn.addEventListener("click", () => { if (window.innerWidth <= 900) closeSidebar(); });
});

document.addEventListener("keydown", e => { if (e.key === "Escape") closeSidebar(); });

function logout() {
  localStorage.removeItem("supervisor");
  window.location.href = "/Client/Auth/login.html";
}

let toastTimer;
function toast(msg, type) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.className = "toast" + (type ? " " + type : "") + " show";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2800);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function highlightMatch(text, query) {
  if (!query) return escapeHtml(text);
  const safe = escapeHtml(text);
  const re = new RegExp("(" + query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
  return safe.replace(re, '<span class="search-hl">$1</span>');
}

function emptySearchRow(colspan, query) {
  return `<tr><td colspan="${colspan}"><div class="empty-state">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
    <h4>No results found</h4>
    <p>No matches for "<strong>${escapeHtml(query)}</strong>"</p>
  </div></td></tr>`;
}

function secIcon(icon) {
  const m = {
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>',
  };
  return m[icon] || "";
}

function toggleBody(sid) {
  document.getElementById("bd-" + sid).classList.toggle("open");
  document.getElementById("ch-" + sid).classList.toggle("open");
}

function validateMark(input) {
  const max = parseInt(input.dataset.max), val = parseInt(input.value);
  input.classList.remove("error", "pending");
  if (input.value === "") { input.classList.add("pending"); return; }
  if (isNaN(val) || val < 0 || val > max) input.classList.add("error");
}

function updateTotal(sid) {
  let total = 0;
  MARK_COMPONENTS.forEach(sec => sec.items.forEach(item => {
    const inp = document.getElementById("mk-" + sid + "-" + item.key);
    if (inp && inp.value !== "") {
      const v = parseInt(inp.value);
      if (!isNaN(v) && v >= 0 && v <= parseInt(inp.dataset.max)) total += v;
    }
  }));
  const a = document.getElementById("td-" + sid);
  const b = document.getElementById("gt-" + sid);
  if (a) a.textContent = total;
  if (b) b.textContent = total;
}

async function loadGroupMarks(groupId) {
  try {
    const supData = JSON.parse(localStorage.getItem("supervisor"));
    const res = await fetch(`${API_BASE}/marks/group/${groupId}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supData.token}`
      }
    });
    const data = await res.json();
    if (!res.ok) return;

    const marksList = Array.isArray(data) ? data : (data?.marks || []);
    const team = TEAMS.find(t => t._id === groupId);
    if (!team) return;

    marksList.forEach(m => {
      const studentRefId = typeof m.student === "string" ? m.student : m.student?._id;
      const student = team.students.find(s => s._id === studentRefId);
      if (!student) return;
      student.marks = {
        oct:             m.monthly?.oct          ?? null,
        nov:             m.monthly?.nov          ?? null,
        dec:             m.monthly?.dec          ?? null,
        feb:             m.monthly?.feb          ?? null,
        mar:             m.monthly?.mar          ?? null,
        proposal:        m.submissions?.proposal  ?? null,
        progress_report: m.submissions?.progress  ?? null,
        thesis:          m.documentation?.final   ?? null,
        code:            m.submissions?.code      ?? null,
        prog_sim:        m.submissions?.prog_sim  ?? null,
        thesis_sim:      m.submissions?.thesis_sim ?? null,
        iv1:             m.viva?.internal1        ?? null,
        iv2:             m.viva?.internal2        ?? null,
        ext:             m.viva?.external         ?? null,
      };
    });
  } catch (err) {
    console.error("Marks reload error:", err);
  }
}

async function saveMarks(teamMongoId, studentMongoId) {
  const team    = TEAMS.find(t => t._id === teamMongoId);
  const student = team?.students.find(s => s._id === studentMongoId);
  if (!student) return;
  const marks = {};
  let hasError = false;
  MARK_COMPONENTS.forEach(sec => {
    sec.items.forEach(item => {
      const inp = document.getElementById("mk-" + studentMongoId + "-" + item.key);
      if (!inp || inp.disabled) return;
      if (inp.value === "") { marks[item.key] = null; return; }
      const v = parseInt(inp.value);
      if (isNaN(v) || v < 0 || v > item.max) { hasError = true; inp.classList.add("error"); }
      else { marks[item.key] = v; inp.classList.remove("error", "pending"); }
    });
  });
  if (hasError) { toast("Fix invalid marks (red fields)", "red"); return; }
  const monthly       = { oct: marks.oct, nov: marks.nov, dec: marks.dec, feb: marks.feb, mar: marks.mar };
  const submissions   = { proposal: marks.proposal, progress: marks.progress_report, code: marks.code, prog_sim: marks.prog_sim, thesis_sim: marks.thesis_sim };
  const viva          = { internal1: marks.iv1, internal2: marks.iv2, external: marks.ext };
  const documentation = { final: marks.thesis ?? null };
  try {
    const res = await fetch(`${API_BASE}/marks/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sup.token}` },
      body: JSON.stringify({ student_id: studentMongoId, supervisor_id: sup.id, monthly, submissions, viva, documentation })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");
    MARK_COMPONENTS.forEach(sec => sec.items.forEach(item => {
      if (marks[item.key] !== null && marks[item.key] !== undefined)
        student.marks[item.key] = marks[item.key];
    }));
    const newTotal = data.total || studentTotal(student);
    const tdEl = document.getElementById(`td-${studentMongoId}`);
    const gtEl = document.getElementById(`gt-${studentMongoId}`);
    if (tdEl) tdEl.textContent = newTotal;
    if (gtEl) gtEl.textContent = newTotal;
    renderDashboard();
    toast(`${student.name} — saved (${newTotal}/${TOTAL_MARKS})`, "green");
    await loadGroupMarks(teamMongoId);
  } catch (err) {
    console.error(err);
    toast("Save failed: " + err.message, "red");
  }
}

async function openGroupDetail(teamMongoId) {
  showTab("groups");
  const t = TEAMS.find(x => x._id === teamMongoId);
  if (!t) return;
  window.__readOnlyMode = IS_CHAIRMAN;
  document.getElementById("groups-list-view").style.display = "none";
  const d = document.getElementById("group-detail-view");
  d.style.display = "";
  const leader  = t.students.find(s => s.role === "Leader");
  const members = t.students.filter(s => s.role !== "Leader");
  const waLink = num => { if (!num) return null; return `https://wa.me/${num.replace(/^0/, "92").replace(/[^0-9]/g, "")}`; };
  const contactRow = s => {
    const wa = waLink(s.whatsapp);
    return `<div style="display:flex;flex-wrap:wrap;gap:10px;font-size:.7rem;margin-top:4px">
      <span style="color:var(--text-mute);display:inline-flex;align-items:center;gap:4px">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="11" height="11">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>${s.email || "—"}
      </span>
      ${wa ? `<a href="${wa}" target="_blank" style="color:#15803d;font-weight:600;text-decoration:none;display:inline-flex;align-items:center;gap:4px">
        <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4a7.94 7.94 0 0 0-6.88 11.93L4 20l4.2-1.1a7.93 7.93 0 0 0 3.85.98h.01a7.94 7.94 0 0 0 5.55-13.56zm-5.55 12.21h-.01a6.6 6.6 0 0 1-3.36-.92l-.24-.14-2.49.65.66-2.43-.16-.25a6.6 6.6 0 1 1 5.6 3.09z"/></svg>
        ${s.whatsapp}</a>` : `<span style="color:var(--text-mute);font-style:italic">No WhatsApp</span>`}
    </div>`;
  };
  d.innerHTML = `
    <button class="back-btn" onclick="showGroupsList()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      Back to Groups
    </button>
    <div class="gh-strip">
      <div class="gh-info">
      <div class="gh-proj">${t.projectTitle}</div>
        <div class="gh-tid">${t.teamId}</div>
        <div class="gh-sup">Category: ${t.category} · Supervisor: ${formatName(sup.prefix, SUPERVISOR.name)} (${SUPERVISOR.id})</div>
      </div>
      <div class="gh-stat-box">
        <div class="st-label">Students</div>
        <div class="st-val">${t.students.length}</div>
        <div class="st-sub">in this group</div>
      </div>
    </div>
    <div class="card" style="margin-bottom:18px">
      <div class="card-head"><h3>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        </svg>Team Composition
      </h3></div>
      <div class="card-body" style="padding:14px 18px">
        ${leader ? `<div style="display:flex;align-items:flex-start;gap:12px;padding:12px;background:rgba(191,161,74,.08);border:1px solid rgba(191,161,74,.2);border-radius:10px;margin-bottom:10px">
          <div class="stu-dot leader" style="margin-top:6px"></div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:600;font-size:.88rem;margin-bottom:2px">${leader.name}</div>
            <div style="font-size:.7rem;color:var(--text-mute);font-family:monospace">${leader.id}</div>
            ${contactRow(leader)}
          </div>
          <span class="stu-role-tag leader">Team Leader</span>
        </div>` : ""}
        ${members.map(m => `<div style="display:flex;align-items:flex-start;gap:12px;padding:12px;border:1px solid var(--border-soft);border-radius:10px;margin-bottom:8px">
          <div class="stu-dot member" style="margin-top:6px"></div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:600;font-size:.88rem;margin-bottom:2px">${m.name}</div>
            <div style="font-size:.7rem;color:var(--text-mute);font-family:monospace">${m.id}</div>
            ${contactRow(m)}
          </div>
          <span class="stu-role-tag member">Member</span>
        </div>`).join("")}
      </div>
    </div>
    <h3 style="font-size:.95rem;font-weight:700;color:var(--primary-dark);margin:18px 0 10px;display:flex;align-items:center;gap:6px">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
        <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>
      </svg>Marks Entry
    </h3>
    ${t.students.map(s => renderStudentCard(t, s)).join("")}`;
  await refreshMarkLocks();
  if (window.__readOnlyMode) {
    document.querySelectorAll(".mk-input").forEach(i => { i.disabled = true; i.style.opacity = "0.5"; i.style.cursor = "not-allowed"; i.title = "🔒 Chairman view — read only"; });
    document.querySelectorAll(".btn-save").forEach(b => { b.disabled = true; b.style.opacity = "0.4"; b.style.cursor = "not-allowed"; b.innerHTML = "🔒 Read-only (Chairman view)"; });
  }
}

function renderStudentCard(team, student) {
  const total = studentTotal(student);
  const sid   = student._id;
  const sectionsHtml = MARK_COMPONENTS.map(sec => {
    const rows = sec.items.map(item => {
      const val = student.marks[item.key];
      const isPending = val === null || val === undefined;
      return `<div class="mk-row">
        <div class="mk-label">${item.label}</div>
        <div class="mk-max">/ ${item.max}</div>
        <input type="number" class="mk-input ${isPending ? "pending" : ""}" id="mk-${sid}-${item.key}"
               min="0" max="${item.max}" value="${isPending ? "" : val}" placeholder="—"
               data-student="${sid}" data-key="${item.key}" data-max="${item.max}"
               oninput="validateMark(this);updateTotal('${sid}')">
      </div>`;
    }).join("");
    return `<div class="mk-section"><div class="mk-sec-head">${secIcon(sec.icon)} ${sec.section}</div><div class="mk-rows">${rows}</div></div>`;
  }).join("");
  return `<div class="stu-card">
    <div class="stu-head" onclick="toggleBody('${sid}')">
      <div class="stu-dot ${student.role.toLowerCase()}"></div>
      <div class="stu-info"><div class="stu-name">${student.name}</div><div class="stu-id">${student.id}</div></div>
      <span class="stu-role-tag ${student.role.toLowerCase()}">${student.role}</span>
      <div class="stu-total"><span id="td-${sid}">${total}</span><span class="den">/ ${TOTAL_MARKS}</span></div>
      <div class="stu-chev" id="ch-${sid}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
    </div>
    <div class="stu-body" id="bd-${sid}">
      <div class="mk-grid">${sectionsHtml}</div>
      <div class="grand-bar">
        <div class="gb-label">Grand Total</div>
        <div class="gb-val"><span class="num" id="gt-${sid}">${total}</span><span class="den">/ ${TOTAL_MARKS}</span></div>
      </div>
      <div class="save-row">
        <button class="btn-save" onclick="saveMarks('${team._id}','${sid}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          Save Marks
        </button>
      </div>
    </div>
  </div>`;
}

function openChangePwModal() {
  const existing = document.getElementById("change-pw-modal");
  if (existing) existing.remove();
  document.body.insertAdjacentHTML("beforeend", `
    <div id="change-pw-modal" style="position:fixed;inset:0;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;z-index:9999">
      <div style="background:var(--surface);border-radius:18px;padding:36px;max-width:400px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,.12)">
        <h3 style="margin-bottom:20px;color:var(--primary)">Change Password</h3>
        <input type="password" id="cpw-new" placeholder="New password (min 8 chars)"
          style="width:100%;padding:10px 14px;border:1.5px solid var(--border);border-radius:10px;margin-bottom:12px;font-size:.9rem;box-sizing:border-box"/>
        <input type="password" id="cpw-confirm" placeholder="Confirm new password"
          style="width:100%;padding:10px 14px;border:1.5px solid var(--border);border-radius:10px;margin-bottom:16px;font-size:.9rem;box-sizing:border-box"/>
        <p id="cpw-err" style="color:#dc2626;font-size:.82rem;margin-bottom:12px;display:none"></p>
        <div style="display:flex;gap:10px">
          <button onclick="document.getElementById('change-pw-modal').remove()"
            style="flex:1;padding:10px;border:1.5px solid var(--border);border-radius:10px;background:none;cursor:pointer;font-weight:600">Cancel</button>
          <button onclick="submitChangePw()"
            style="flex:1;padding:10px;background:var(--primary);color:#fff;border:none;border-radius:10px;cursor:pointer;font-weight:700">Update</button>
        </div>
      </div>
    </div>`);
}

async function submitChangePw() {
  const newPw = document.getElementById("cpw-new").value;
  const confirmPw = document.getElementById("cpw-confirm").value;
  const err = document.getElementById("cpw-err");
  err.style.display = "none";
  if (!newPw || newPw.length < 8) { err.textContent = "Minimum 8 characters"; err.style.display = "block"; return; }
  if (newPw !== confirmPw) { err.textContent = "Passwords do not match"; err.style.display = "block"; return; }
  try {
    const res = await fetch(`${API_BASE}/supervisors/change-password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sup.token}` },
      body: JSON.stringify({ newPassword: newPw, confirmPassword: confirmPw })
    });
    const data = await res.json();
    if (!res.ok) { err.textContent = data.message || "Failed"; err.style.display = "block"; return; }
    document.getElementById("change-pw-modal").remove();
    toast("Password updated successfully", "green");
  } catch { err.textContent = "Server error"; err.style.display = "block"; }
}

/* ═══════════════════════════════════
   INIT
═══════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  loadTeams();
});