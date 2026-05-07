const sup = JSON.parse(localStorage.getItem("supervisor"));

if (!sup) {
  window.location.href = "login.html";
}

if (sup.force_password_change) {
  window.location.href = "change-password.html";
}

const IS_CHAIRMAN = sup?.is_chairman === true;

if (IS_CHAIRMAN) {
  const chairmanNav = document.getElementById("chairman-nav-items");

  if (chairmanNav) {
    chairmanNav.style.display = "";
  }
}
const SUPERVISOR = { id: sup.sup_code, name: sup.name };
const API_BASE = "http://127.0.0.1:5001/api";

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
if (welcomeName) welcomeName.textContent = `Welcome back, ${sup.name} 👋`;
if (welcomeDes)  welcomeDes.textContent  = `${sup.designation || "Faculty Member"} · CS Department`;
if (welcomeId)   welcomeId.textContent   = sup.sup_code || "—";

const navName = document.getElementById("nav-sup-name");
const navCode = document.getElementById("nav-sup-code");
if (navName) navName.textContent = sup.name     || "Supervisor";
if (navCode) navCode.textContent = sup.sup_code || "";

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

    console.log("TOGGLES FROM SERVER:", data.toggles); // ← check this

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

    // Map backend structure → frontend structure
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
          marks:    {
            oct: null, nov: null, dec: null, feb: null, mar: null,
            proposal: null, progress_report: null, thesis: null,
            code: null, prog_sim: null, thesis_sim: null,
            iv1: null, iv2: null, ext: null,
          }
        }))
      };
    });

    // Load marks for each student
    await loadAllMarks();

    // Load admin lock config alongside teams
    await loadMarkToggles();

    renderDashboard();
  } catch (err) {
    console.error(err);
    toast("Failed to load teams: " + err.message, "red");
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
      if (!res.ok) {
        console.warn(`Marks fetch failed for ${team.teamId}: ${res.status}`);
        continue;
      }

      const data = await res.json();

      let marksList = [];
      if (Array.isArray(data)) marksList = data;
      else if (Array.isArray(data?.marks)) marksList = data.marks;
      else if (Array.isArray(data?.data)) marksList = data.data;
      else { console.warn(`Unexpected shape:`, data); continue; }

      console.log(`📊 ${team.teamId} — got ${marksList.length} mark records`);

      marksList.forEach(m => {
        // m.student might be either:
        //   - populated: { _id: "...", name: "...", student_code: "..." }
        //   - unpopulated: just the ObjectId string "abc123..."
        const studentRefId =
          (typeof m.student === "string") ? m.student :
          (m.student?._id) ? m.student._id :
          null;

        if (!studentRefId) {
          console.warn("Mark record has no student reference:", m);
          return;
        }

        const student = team.students.find(s => s._id === studentRefId);
        if (!student) {
          console.warn(`No matching student for ${studentRefId} in team ${team.teamId}`);
          return;
        }

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

        console.log(`  ✓ ${student.name}: oct=${student.marks.oct}, total=${studentTotal(student)}`);
      });
    } catch (err) {
      console.error("Error loading marks for", team.teamId, err);
    }
  }
}

function studentTotal(s) {
  let t = 0;
  MARK_COMPONENTS.forEach((sec) =>
    sec.items.forEach((item) => {
      if (s.marks[item.key] != null) t += s.marks[item.key];
    })
  );
  return t;
}

function secIcon(icon) {
  const m = {
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>',
  };
  return m[icon] || "";
}

/* ═══════════════════════════════════
   SEARCH HELPERS
═══════════════════════════════════ */
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
  return `<tr><td colspan="${colspan}">
    <div class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <h4>No results found</h4>
      <p>No matches for "<strong>${escapeHtml(query)}</strong>"</p>
    </div>
  </td></tr>`;
}

function emptyState(message) {
  return `<tr><td colspan="5" style="text-align:center;padding:50px 20px;color:var(--text-mute)">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
         stroke-linecap="round" stroke-linejoin="round"
         width="40" height="40" style="margin:0 auto 12px;display:block;color:var(--border)">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
    </svg>
    <strong style="display:block;font-size:.92rem;color:var(--text-soft);margin-bottom:4px">${message}</strong>
    <p style="font-size:.78rem">The admin has not assigned any teams to you yet.</p>
  </td></tr>`;
}

/* ═══════════════════════════════════
   TAB SWITCHING
═══════════════════════════════════ */
function showTab(tab) {
  document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
  document.getElementById("tab-" + tab)?.classList.add("active");
  document.querySelectorAll(".sb-btn:not(.logout)").forEach((b) => b.classList.remove("active"));
  document.getElementById("sb-" + tab)?.classList.add("active");

  const titles = {
    "dashboard":     ["Dashboard",            "Overview of your assigned groups and students"],
    "groups":        ["My Groups",            "View groups, students, and assign marks"],
    "overview":      ["Department Overview",  "Department-wide statistics — Chairman view"],
    "workload":      ["Supervisor Workload",  "Teams & students assigned to each supervisor"],
    "all-teams":     ["All Teams",            "Read-only view of every team in the department"],
    "all-students":  ["All Students",         "Read-only view of every student in the department"],
  };
  const t = titles[tab] || [tab, ""];
  document.getElementById("page-title").textContent = t[0];
  document.getElementById("page-sub").textContent   = t[1];

  if (tab === "dashboard")    renderDashboard();
  if (tab === "groups")       showGroupsList();
  if (tab === "overview")     loadDepartmentOverview();
  if (tab === "workload")     loadWorkload();
  if (tab === "all-teams")    loadAllTeams();
  if (tab === "all-students") loadAllStudents();
}

/* ═══════════════════════════════════
   DASHBOARD RENDER
═══════════════════════════════════ */
function renderDashboard() {
  document.getElementById("stat-groups").textContent = TEAMS.length;
  document.getElementById("stat-students").textContent =
    TEAMS.reduce((s, t) => s + t.students.length, 0);

  filterDashGroups(document.getElementById("search-dash-groups")?.value || "");
  filterStudents(document.getElementById("search-students")?.value || "");
}

/* ═══════════════════════════════════
   GROUPS TABLE — DASHBOARD
═══════════════════════════════════ */
function filterDashGroups(query) {
  const q = (query || "").trim().toLowerCase();
  const filtered = TEAMS.filter(t =>
    (t.teamId || "").toLowerCase().includes(q) ||
    (t.projectTitle || "").toLowerCase().includes(q)
  );
  const tbody = document.getElementById("dash-groups-tbody");
  if (!tbody) return;

  if (TEAMS.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--text-mute)">
      No teams assigned to you yet.
    </td></tr>`;
    return;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = emptySearchRow(4, query);
    return;
  }

  tbody.innerHTML = filtered.map(t =>
    `<tr onclick="openGroupDetail('${t._id}')">
      <td><span class="tid">${highlightMatch(t.teamId, q)}</span></td>
      <td><span class="g-proj">${highlightMatch(t.projectTitle, q)}</span></td>
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
}

/* ═══════════════════════════════════
   STUDENTS TABLE — DASHBOARD
═══════════════════════════════════ */
function filterStudents(query) {
  const q = (query || "").trim().toLowerCase();
  const allStudents = TEAMS.flatMap(t =>
    t.students.map(s => ({ ...s, teamId: t.teamId }))
  );
  const filtered = allStudents.filter(s =>
    (s.id || "").toLowerCase().includes(q) ||
    (s.name || "").toLowerCase().includes(q) ||
    (s.email || "").toLowerCase().includes(q) ||
    (s.whatsapp || "").includes(q)
  );

  const tbody = document.getElementById("dash-students-tbody");
  if (!tbody) return;

  if (allStudents.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-mute)">
      No students assigned yet.
    </td></tr>`;
    return;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = emptySearchRow(6, query);
    return;
  }

  tbody.innerHTML = filtered.map(s => {
    const total = studentTotal(s);
    return `<tr>
      <td><span class="s-id">${highlightMatch(s.id, q)}</span></td>
      <td>
        <div>${highlightMatch(s.name, q)}</div>
        <small style="color:var(--text-mute);font-size:.66rem">${s.email || ""}</small>
      </td>
      <td>
        <a href="https://wa.me/${(s.whatsapp || "").replace(/^0/, "92")}"
           target="_blank"
           style="color:#15803d;font-weight:600;text-decoration:none;display:inline-flex;align-items:center;gap:4px;font-size:.74rem">
          <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
            <path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4a7.94 7.94 0 0 0-6.88 11.93L4 20l4.2-1.1a7.93 7.93 0 0 0 3.85.98h.01a7.94 7.94 0 0 0 5.55-13.56zm-5.55 12.21h-.01a6.6 6.6 0 0 1-3.36-.92l-.24-.14-2.49.65.66-2.43-.16-.25a6.6 6.6 0 1 1 5.6 3.09z"/>
          </svg>
          ${s.whatsapp || "—"}
        </a>
      </td>
      <td><span class="tid">${s.teamId}</span></td>
      <td><span class="s-role ${s.role.toLowerCase()}">${s.role}</span></td>
      <td style="text-align:right">
        <span class="s-marks">${total} <span class="den">/ ${TOTAL_MARKS}</span></span>
      </td>
    </tr>`;
  }).join("");
}

/* ═══════════════════════════════════
   GROUPS TAB — LIST
═══════════════════════════════════ */
function showGroupsList() {
  document.getElementById("groups-list-view").style.display = "";
  document.getElementById("group-detail-view").style.display = "none";
  filterGroupsList(document.getElementById("search-groups")?.value || "");
}

function filterGroupsList(query) {
  const q = (query || "").trim().toLowerCase();
  const filtered = TEAMS.filter(t =>
    (t.teamId || "").toLowerCase().includes(q) ||
    (t.projectTitle || "").toLowerCase().includes(q)
  );
  const tbody = document.getElementById("groups-list-tbody");
  if (!tbody) return;

  if (TEAMS.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--text-mute)">
      No teams assigned to you yet.
    </td></tr>`;
    return;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = emptySearchRow(4, query);
    return;
  }

  tbody.innerHTML = filtered.map(t =>
    `<tr onclick="openGroupDetail('${t._id}')">
      <td><span class="tid">${highlightMatch(t.teamId, q)}</span></td>
      <td><span class="g-proj">${highlightMatch(t.projectTitle, q)}</span></td>
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
}

/* ═══════════════════════════════════
   GROUP DETAIL VIEW
═══════════════════════════════════ */
async function openGroupDetail(teamMongoId) {
  showTab("groups");
  const t = TEAMS.find((x) => x._id === teamMongoId);
  if (!t) return;
  const isMyGroup = !IS_CHAIRMAN || (t.students && SUPERVISOR && (t.supervisorId === sup._id || t.supervisorId === sup.id));
  window.__readOnlyMode = IS_CHAIRMAN && !isMyGroup;

  document.getElementById("groups-list-view").style.display = "none";
  const d = document.getElementById("group-detail-view");
  d.style.display = "";

  const leader = t.students.find(s => s.role === "Leader");
  const members = t.students.filter(s => s.role !== "Leader");

  const waLink = (num) => {
    if (!num) return null;
    const intl = num.replace(/^0/, "92").replace(/[^0-9]/g, "");
    return `https://wa.me/${intl}`;
  };

  const contactRow = (s) => {
    const wa = waLink(s.whatsapp);
    return `
      <div style="display:flex;flex-wrap:wrap;gap:10px;font-size:.7rem;margin-top:4px">
        <span style="color:var(--text-mute);display:inline-flex;align-items:center;gap:4px">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" width="11" height="11">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          ${s.email || "—"}
        </span>
        ${wa ? `
          <a href="${wa}" target="_blank"
             style="color:#15803d;font-weight:600;text-decoration:none;display:inline-flex;align-items:center;gap:4px"
             title="Open WhatsApp chat">
            <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
              <path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4a7.94 7.94 0 0 0-6.88 11.93L4 20l4.2-1.1a7.93 7.93 0 0 0 3.85.98h.01a7.94 7.94 0 0 0 5.55-13.56zm-5.55 12.21h-.01a6.6 6.6 0 0 1-3.36-.92l-.24-.14-2.49.65.66-2.43-.16-.25a6.6 6.6 0 1 1 5.6 3.09z"/>
            </svg>
            ${s.whatsapp}
          </a>` : `<span style="color:var(--text-mute);font-style:italic">No WhatsApp</span>`}
      </div>`;
  };

  d.innerHTML = `
    <button class="back-btn" onclick="showGroupsList()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
      Back to Groups
    </button>

    <div class="gh-strip">
      <div class="gh-info">
        <div class="gh-tid">${t.teamId}</div>
        <div class="gh-proj">${t.projectTitle}</div>
        <div class="gh-sup">Category: ${t.category} · Supervisor: ${SUPERVISOR.name} (${SUPERVISOR.id})</div>
      </div>
      <div class="gh-stat-box">
        <div class="st-label">Students</div>
        <div class="st-val">${t.students.length}</div>
        <div class="st-sub">in this group</div>
      </div>
    </div>

    <div class="card" style="margin-bottom:18px">
      <div class="card-head">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
          </svg>
          Team Composition
        </h3>
      </div>
      <div class="card-body" style="padding:14px 18px">
        ${leader ? `
          <div style="display:flex;align-items:flex-start;gap:12px;padding:12px;background:rgba(191,161,74,.08);border:1px solid rgba(191,161,74,.2);border-radius:10px;margin-bottom:10px">
            <div class="stu-dot leader" style="margin-top:6px"></div>
            <div style="flex:1;min-width:0">
              <div style="font-weight:600;font-size:.88rem;margin-bottom:2px">${leader.name}</div>
              <div style="font-size:.7rem;color:var(--text-mute);font-family:monospace">${leader.id}</div>
              ${contactRow(leader)}
            </div>
            <span class="stu-role-tag leader">Team Leader</span>
          </div>` : ""}
        ${members.map(m => `
          <div style="display:flex;align-items:flex-start;gap:12px;padding:12px;border:1px solid var(--border-soft);border-radius:10px;margin-bottom:8px">
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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <line x1="9" y1="3" x2="9" y2="21"/>
      </svg>
      Marks Entry
    </h3>
    ${t.students.map((s) => renderStudentCard(t, s)).join("")}`;

  // ✅ Apply admin locks AFTER HTML is rendered
  await refreshMarkLocks();
          // Apply chairman read-only lock
if (window.__readOnlyMode) {
  document.querySelectorAll(".mk-input").forEach(i => {
    i.disabled = true;
    i.style.opacity = "0.5";
    i.style.cursor = "not-allowed";
    i.title = "🔒 Chairman view — read only";
  });
  document.querySelectorAll(".btn-save").forEach(b => {
    b.disabled = true;
    b.style.opacity = "0.4";
    b.style.cursor = "not-allowed";
    b.innerHTML = "🔒 Read-only (Chairman view)";
  });
}
}

function renderStudentCard(team, student) {
  const total = studentTotal(student);
  const sid   = student._id;

  const sectionsHtml = MARK_COMPONENTS.map((sec) => {
    const rows = sec.items.map((item) => {
      const val = student.marks[item.key];
      const isPending = val === null || val === undefined;
      return `<div class="mk-row">
        <div class="mk-label">${item.label}</div>
        <div class="mk-max">/ ${item.max}</div>
        <input type="number"
               class="mk-input ${isPending ? "pending" : ""}"
               id="mk-${sid}-${item.key}"
               min="0" max="${item.max}"
               value="${isPending ? "" : val}"
               placeholder="—"
               data-student="${sid}"
               data-key="${item.key}"
               data-max="${item.max}"
               oninput="validateMark(this);updateTotal('${sid}')">
      </div>`;
    }).join("");
    return `<div class="mk-section">
      <div class="mk-sec-head">${secIcon(sec.icon)} ${sec.section}</div>
      <div class="mk-rows">${rows}</div>
    </div>`;
  }).join("");

  return `<div class="stu-card">
    <div class="stu-head" onclick="toggleBody('${sid}')">
      <div class="stu-dot ${student.role.toLowerCase()}"></div>
      <div class="stu-info">
        <div class="stu-name">${student.name}</div>
        <div class="stu-id">${student.id}</div>
      </div>
      <span class="stu-role-tag ${student.role.toLowerCase()}">${student.role}</span>
      <div class="stu-total">
        <span id="td-${sid}">${total}</span>
        <span class="den">/ ${TOTAL_MARKS}</span>
      </div>
      <div class="stu-chev" id="ch-${sid}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
    </div>
    <div class="stu-body" id="bd-${sid}">
      <div class="mk-grid">${sectionsHtml}</div>
      <div class="grand-bar">
        <div class="gb-label">Grand Total</div>
        <div class="gb-val">
          <span class="num" id="gt-${sid}">${total}</span>
          <span class="den">/ ${TOTAL_MARKS}</span>
        </div>
      </div>
      <div class="save-row">
        <button class="btn-save" onclick="saveMarks('${team._id}','${sid}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Save Marks
        </button>
      </div>
    </div>
  </div>`;
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
  MARK_COMPONENTS.forEach((sec) =>
    sec.items.forEach((item) => {
      const inp = document.getElementById("mk-" + sid + "-" + item.key);
      if (inp && inp.value !== "") {
        const v = parseInt(inp.value);
        if (!isNaN(v) && v >= 0 && v <= parseInt(inp.dataset.max)) total += v;
      }
    })
  );
  const a = document.getElementById("td-" + sid);
  const b = document.getElementById("gt-" + sid);
  if (a) a.textContent = total;
  if (b) b.textContent = total;
}

/* ═══════════════════════════════════
   SAVE MARKS — TO BACKEND
═══════════════════════════════════ */
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
      if (inp.value === "") {
        marks[item.key] = null;
      } else {
        const v = parseInt(inp.value);
        if (isNaN(v) || v < 0 || v > item.max) {
          hasError = true;
          inp.classList.add("error");
        } else {
          marks[item.key] = v;
          inp.classList.remove("error", "pending");
        }
      }
    });
  });

  if (hasError) { toast("Fix invalid marks (red fields)", "red"); return; }

  const monthly       = { oct: marks.oct, nov: marks.nov, dec: marks.dec, feb: marks.feb, mar: marks.mar };
  const submissions   = { proposal: marks.proposal, progress: marks.progress_report, code: marks.code, prog_sim: marks.prog_sim, thesis_sim: marks.thesis_sim };
  const viva          = { internal1: marks.iv1, internal2: marks.iv2, external: marks.ext };
  const documentation = { final: marks.thesis };

  try {
    const res = await fetch(`${API_BASE}/marks/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sup.token}` },
      body: JSON.stringify({ student_id: studentMongoId, monthly, submissions, viva, documentation })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");

    Object.keys(marks).forEach(k => {
      if (marks[k] !== null) student.marks[k] = marks[k];
    });

    const newTotal = data.total || studentTotal(student);

    const tdEl = document.getElementById(`td-${studentMongoId}`);
    const gtEl = document.getElementById(`gt-${studentMongoId}`);
    if (tdEl) tdEl.textContent = newTotal;
    if (gtEl) gtEl.textContent = newTotal;

    renderDashboard();

    toast(`${student.name} — saved (${newTotal}/${TOTAL_MARKS})`, "green");

  } catch (err) {
    console.error(err);
    toast("Save failed: " + err.message, "red");
  }
}

/* ═══════════════════════════════════
   CHANGE PASSWORD MODAL
═══════════════════════════════════ */
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

  if (!newPw || newPw.length < 8) {
    err.textContent = "Minimum 8 characters";
    err.style.display = "block";
    return;
  }
  if (newPw !== confirmPw) {
    err.textContent = "Passwords do not match";
    err.style.display = "block";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/supervisors/change-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${sup.token}`
      },
      body: JSON.stringify({ newPassword: newPw, confirmPassword: confirmPw })
    });

    const data = await res.json();
    if (!res.ok) {
      err.textContent = data.message || "Failed";
      err.style.display = "block";
      return;
    }

    document.getElementById("change-pw-modal").remove();
    toast("Password updated successfully ✓", "green");
  } catch {
    err.textContent = "Server error";
    err.style.display = "block";
  }
}

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

/* ════════════════════════════════════
   SIDEBAR TOGGLE (mobile)
════════════════════════════════════ */
function toggleSidebar() {
  const sidebar  = document.getElementById("sidebar") || document.querySelector(".sidebar");
  const overlay  = document.getElementById("sidebarOverlay");
  const hamburger = document.getElementById("hamburgerBtn");
  const isOpen = sidebar.classList.contains("open");
  if (isOpen) {
    closeSidebar();
  } else {
    sidebar.classList.add("open");
    overlay?.classList.add("show");
    hamburger?.classList.add("open");
    document.body.style.overflow = "hidden";
  }
}

function closeSidebar() {
  const sidebar   = document.querySelector(".sidebar");
  const overlay   = document.getElementById("sidebarOverlay");
  const hamburger = document.getElementById("hamburgerBtn");
  sidebar?.classList.remove("open");
  overlay?.classList.remove("show");
  hamburger?.classList.remove("open");
  document.body.style.overflow = "";
}

document.querySelectorAll(".sb-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    if (window.innerWidth <= 900) closeSidebar();
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeSidebar();
});

function logout() {
  localStorage.removeItem("supervisor");
  window.location.href = "/Client/Auth/login.html";
}

/* ═══════════════════════════════════
   CHAIRMAN — DEPARTMENT OVERVIEW
═══════════════════════════════════ */
async function loadDepartmentOverview() {
  if (!IS_CHAIRMAN) return;

  const loadingEl = document.getElementById("overview-loading");
  const contentEl = document.getElementById("overview-content");

  if (loadingEl) loadingEl.style.display = "";
  if (contentEl) contentEl.style.display = "none";

  try {
    const res = await fetch(`${API_BASE}/supervisor/chairman/overview`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${sup.token}`
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");

    // Update stat cards
    document.getElementById("ov-total-students").textContent = data.totalStudents;
    document.getElementById("ov-total-sups").textContent     = data.totalSupervisors;
    document.getElementById("ov-total-teams").textContent    = data.totalTeams;
    document.getElementById("ov-avg-score").textContent      = data.avgScore;

    // Render proposal status pills
    const ps = data.proposalStats;
    const stats = [
      { label: "Approved",      value: ps.approved,      color: "#15803d", bg: "rgba(34,197,94,.1)",  border: "#22c55e" },
      { label: "Pending Review", value: ps.pending,      color: "#a16207", bg: "rgba(234,179,8,.1)",  border: "#eab308" },
      { label: "Rejected",      value: ps.rejected,      color: "#dc2626", bg: "rgba(220,38,38,.1)",  border: "#dc2626" },
      { label: "Not Submitted", value: ps.not_submitted, color: "#475569", bg: "rgba(148,163,184,.1)", border: "#94a3b8" },
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

    if (loadingEl) loadingEl.style.display = "none";
    if (contentEl) contentEl.style.display = "";

  } catch (err) {
    console.error(err);
    if (loadingEl) {
      loadingEl.innerHTML = `<div style="color:#dc2626">Failed to load: ${err.message}</div>`;
    }
  }
}
/* ═══════════════════════════════════
   CHAIRMAN — WORKLOAD PER SUPERVISOR
═══════════════════════════════════ */
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

    if (!data.workload || data.workload.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:30px;color:var(--text-mute)">No supervisors found</td></tr>`;
      return;
    }

    tbody.innerHTML = data.workload.map(w => `
      <tr>
        <td>
          <div style="font-weight:600">${w.name}${w.is_chairman ? '<span class="chairman-tag">Chairman</span>' : ''}</div>
          <small style="color:var(--text-mute);font-size:.66rem">${w.designation}</small>
        </td>
        <td><span class="tid">${w.sup_code}</span></td>
        <td><span class="g-count">${w.teamCount}</span></td>
        <td><span class="g-count">${w.studentCount}</span></td>
      </tr>
    `).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#dc2626;padding:20px">Error: ${err.message}</td></tr>`;
  }
}

/* ═══════════════════════════════════
   CHAIRMAN — ALL TEAMS (read-only)
═══════════════════════════════════ */
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

    if (!data.teams || data.teams.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:30px;color:var(--text-mute)">No teams yet</td></tr>`;
      return;
    }

    tbody.innerHTML = data.teams.map(t => {
      const studentCount = 1 + (t.members?.length || 0);
      const supName = t.supervisor?.name || "—";
      const supCode = t.supervisor?.sup_code || "";
      return `
        <tr>
          <td><span class="tid">${t.team_code}</span></td>
          <td><span class="g-proj">${t.project_title}</span></td>
          <td>
            <div style="font-weight:600">${supName}</div>
            <small style="color:var(--text-mute);font-size:.66rem">${supCode}</small>
          </td>
          <td><span class="g-count">${studentCount}</span></td>
        </tr>`;
    }).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#dc2626;padding:20px">Error: ${err.message}</td></tr>`;
  }
}

/* ═══════════════════════════════════
   CHAIRMAN — ALL STUDENTS (read-only)
═══════════════════════════════════ */
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

    if (!data.students || data.students.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-mute)">No students yet</td></tr>`;
      return;
    }

    tbody.innerHTML = data.students.map(s => {
      const teamCode = s.group?.team_code || "—";
      const supName = s.group?.supervisor?.name || "Unassigned";
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
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#dc2626;padding:20px">Error: ${err.message}</td></tr>`;
  }
}
/* ═══════════════════════════════════
   INIT — load real data
═══════════════════════════════════ */
loadTeams();