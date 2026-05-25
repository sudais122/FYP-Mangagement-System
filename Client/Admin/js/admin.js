const API_BASE = window.API_BASE || "http://127.0.0.1:5001";

const MARKS_SCHEMA = [
  {
    section: "Monthly Meetings",
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
    items: [
      { key: "iv1", label: "Internal Viva 1", max: 25 },
      { key: "iv2", label: "Internal Viva 2", max: 25 },
      { key: "ext", label: "External Viva",   max: 30 },
    ],
  },
];

const MAX_TOTAL = 200;

/* ════════════════════════════════════
   HELPERS
══════════════════════════════════════ */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function formatCnic(cnic) {
  const d = (cnic || "").replace(/\D/g, "");
  if (d.length !== 13) return cnic || "—";
  return `${d.slice(0, 5)}-${d.slice(5, 12)}-${d.slice(12)}`;
}
const initials = (s) =>
  (s || "")
    .split(" ")
    .filter((p) => p && /[A-Za-z]/.test(p[0]))
    .slice(-2)
    .map((p) => p[0].toUpperCase())
    .join("");

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

/* Add proper prefix to supervisor names if missing */
function withPrefix(name, isChairman = false) {
  if (!name) return "—";
  const trimmed = String(name).trim();

  if (/^(Dr\.?|Prof\.?|Mr\.?|Ms\.?|Mrs\.?|Engr\.?|Sir|Madam)\s/i.test(trimmed)) {
    return trimmed;
  }

  return isChairman ? `Prof. ${trimmed}` : `Dr. ${trimmed}`;
}

function highlightText(text, query) {
  const safe = escapeHtml(text);
  if (!query) return safe;
  const q = query.trim();
  if (!q) return safe;
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  return safe.replace(re, '<mark class="q-hl">$1</mark>');
}

function matches(haystack, query) {
  if (!query) return true;
  return String(haystack ?? "").toLowerCase().includes(query.trim().toLowerCase());
}

/* ════════════════════════════════════
   TOAST
══════════════════════════════════════ */
function toast(message, subtitle, type = "success") {
  const wrap = $("#toastWrap");
  if (!wrap) return;
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  const icons = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>',
    error:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    warn:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>',
  };
  t.innerHTML = `<div class="toast-icon">${icons[type] || icons.success}</div><div class="toast-text"><strong>${message}</strong><span>${subtitle || ""}</span></div>`;
  wrap.appendChild(t);
  requestAnimationFrame(() => t.classList.add("show"));
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 400);
  }, 3500);
}

/* ════════════════════════════════════
   ADMIN INFO + GREETING + CLOCK
══════════════════════════════════════ */
function displayAdminInfo() {
  const admin = JSON.parse(localStorage.getItem("admin"));
  if (!admin) { window.location.href = "../Auth/login.html"; return; }

  const navName     = document.getElementById("nav-admin-name");
  const navInitials = document.getElementById("nav-admin-avatar-initials");
  const greeting    = document.getElementById("admin-banner-greeting");

if (navName)     navName.textContent     = formatName(admin.prefix, admin.name);
if (navInitials) navInitials.textContent = initials(admin.name);
if (greeting)    greeting.textContent    = getAdminGreeting(formatName(admin.prefix, admin.name));

  if (admin.avatar_url) setAdminNavAvatar(admin.avatar_url);

  startAdminClock();
}

function getAdminGreeting(name) {
  const hour = new Date().getHours();
  let g, icon;
  if      (hour >= 5  && hour < 12) { g = "Good Morning";   icon = "☀️"; }
  else if (hour >= 12 && hour < 17) { g = "Good Afternoon"; icon = "🌤️"; }
  else if (hour >= 17 && hour < 21) { g = "Good Evening";   icon = "🌆"; }
  else                               { g = "Good Night";     icon = "🌙"; }
  return `${g}, ${name} ${icon}`;
}

function startAdminClock() {
  function update() {
    const el = document.getElementById("admin-datetime");
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
           stroke-linecap="round" stroke-linejoin="round" width="11" height="11"
           style="display:inline;vertical-align:middle;margin-right:4px">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      ${day}, ${date} ${month} ${year} · ${hours}:${mins} ${ampm}`;
  }
  update();
  setInterval(update, 1000);
}

function logout() {
  localStorage.removeItem("admin");
  window.location.href = "./login.html";
}
function formatName(prefix, name) {
  if (!prefix || !name) return name || "";
  return `${prefix}. ${name}`;
}
/* ════════════════════════════════════
   VIEW ROUTING
══════════════════════════════════════ */
function switchView(view) {
  $$(".view").forEach((v) => v.classList.remove("active"));
  $$(".nav-item").forEach((n) => n.classList.remove("active"));
  const target = $(`#view-${view}`);
  if (target) target.classList.add("active");
  $$(`.nav-item[data-view="${view}"]`).forEach((n) => n.classList.add("active"));
  $("#sidebar").classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (view === "deadlines")    renderDeadlines();
  if (view === "settings")     loadGlobalToggles();
  if (view === "supervisors")  renderSupervisors();
  if (view === "teams")        renderTeams();
  if (view === "students")     renderStudents();
}

$$(".nav-item").forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    const view = item.dataset.view;
    if (view) switchView(view);
  });
});

$("#mobileMenuBtn")?.addEventListener("click", () => {
  $("#sidebar").classList.toggle("open");
});

/* ════════════════════════════════════
   DASHBOARD STATS
══════════════════════════════════════ */
async function fetchDashboardStats() {
  const admin = JSON.parse(localStorage.getItem("admin"));
  if (!admin?.token) return;

  try {
    const res  = await fetch(`${API_BASE}/api/admin/stats`, {
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${admin.token}` }
    });
    const data = await res.json();
    if (!res.ok) return console.error("Stats fetch failed:", data.message);

    updateDashboardStats(data.stats);
    updateSidebarBadges(data.stats);
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
  }
    // ── Internship count ──
  try {
    const res  = await fetch(`${API_BASE}/api/internship/admin/all`, {
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${admin.token}` }
    });
    const data = await res.json();
    const el   = document.getElementById("stat-internship-count");
    if (el) el.textContent = data.total ?? (data.data?.length ?? 0);
  } catch (err) {
    console.error("Internship count error:", err);
  }
}

function updateDashboardStats(stats) {
  const cards = document.querySelectorAll(".dstat-card");
  if (cards[0]) cards[0].querySelector(".dstat-value").textContent = stats.students;
  if (cards[1]) cards[1].querySelector(".dstat-value").textContent = stats.supervisors;
  if (cards[2]) cards[2].querySelector(".dstat-value").textContent = stats.teams;
}

function updateSidebarBadges(stats) {
  document.querySelectorAll(".nav-item").forEach(item => {
    const view  = item.dataset.view;
    const badge = item.querySelector(".nav-item-badge");
    if (!badge) return;
    if (view === "supervisors") badge.textContent = stats.supervisors;
    else if (view === "teams")  badge.textContent = stats.teams;
    else if (view === "students") badge.textContent = stats.students;
  });
}

/* ════════════════════════════════════
   RECENT TEAMS
══════════════════════════════════════ */
async function renderRecentTeams() {
  const admin = JSON.parse(localStorage.getItem("admin"));
  const tbody = document.getElementById("recentTeamsTbody");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--text-mute)">Loading…</td></tr>`;

  try {
    const res  = await fetch(`${API_BASE}/api/groups`, {
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${admin.token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");

    const teams = (Array.isArray(data) ? data : data.groups || []).slice(0, 3);

    if (!teams.length) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--text-mute)">No teams yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = teams.map(g => {
      const code    = g.team_code || g.group_code || "—";
      const title   = g.project_title || "—";
      const members = 1 + (g.members?.length || 0);
      const supName = g.supervisor
        ? formatName(g.supervisor.prefix, g.supervisor.name)
        : "Unassigned";

      const proposalUrl    = g.proposal_url    || "";
      const proposalStatus = g.proposal_status || "pending";

      // ── Proposal badge ──
      let proposalBadge = "";
      if (proposalStatus === "approved") {
        proposalBadge = `
          <span style="display:inline-flex;align-items:center;gap:4px;padding:3px 9px;
                       border-radius:6px;font-size:.7rem;font-weight:700;
                       background:rgba(21,128,61,.1);color:#15803d">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                 stroke-linecap="round" stroke-linejoin="round" width="12" height="12">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Approved
          </span>`;
      } else if (proposalStatus === "rejected") {
        proposalBadge = `
          <span style="display:inline-flex;align-items:center;gap:4px;padding:3px 9px;
                       border-radius:6px;font-size:.7rem;font-weight:700;
                       background:rgba(220,38,38,.08);color:#dc2626">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                 stroke-linecap="round" stroke-linejoin="round" width="12" height="12">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Rejected
          </span>`;
      } else {
        proposalBadge = `
          <span style="display:inline-flex;align-items:center;gap:4px;padding:3px 9px;
                       border-radius:6px;font-size:.7rem;font-weight:700;
                       background:rgba(234,179,8,.1);color:#a16207">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round" width="12" height="12">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Pending
          </span>`;
      }

      // ── Proposal actions (only if pending + has file) ──
      let proposalActions = "";
      if (proposalUrl && proposalStatus === "pending") {
        proposalActions = `
          <div style="display:flex;gap:5px;margin-top:6px;flex-wrap:wrap">

            <button onclick="viewDoc('${proposalUrl}')"
              style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;
                     border-radius:5px;font-size:.66rem;font-weight:700;cursor:pointer;
                     border:1px solid rgba(0,75,45,.2);background:rgba(0,75,45,.06);color:var(--primary)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                   stroke-linecap="round" stroke-linejoin="round" width="11" height="11">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              View
            </button>

            <button onclick="updateProposalStatus('${g._id}','approved')"
              style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;
                     border-radius:5px;font-size:.66rem;font-weight:700;cursor:pointer;
                     border:1px solid rgba(21,128,61,.2);background:rgba(21,128,61,.06);color:#15803d">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                   stroke-linecap="round" stroke-linejoin="round" width="11" height="11">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Accept
            </button>

            <button onclick="updateProposalStatus('${g._id}','rejected')"
              style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;
                     border-radius:5px;font-size:.66rem;font-weight:700;cursor:pointer;
                     border:1px solid rgba(220,38,38,.2);background:rgba(220,38,38,.05);color:#dc2626">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                   stroke-linecap="round" stroke-linejoin="round" width="11" height="11">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Reject
            </button>

          </div>`;
      }

      return `
        <tr>
          <td>
            <div class="team-info">
              <strong>${title.length > 28 ? title.slice(0, 28) + "…" : title}</strong>
              <span style="display:block;font-size:.72rem;color:var(--text-mute)">${members} member${members !== 1 ? "s" : ""}</span>
            </div>
          </td>
          <td><span class="id-pill gold">${code}</span></td>
          <td><span style="font-weight:600;color:var(--text)">${supName}</span></td>
          <td>
            ${proposalBadge}
            ${proposalActions}
          </td>
          <td>
            <div class="action-row">
              <button class="icon-action" title="Reassign supervisor"
                onclick="event.stopPropagation();openReassignModal('${g._id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
                  <polyline points="1 4 1 10 7 10"/>
                  <polyline points="23 20 23 14 17 14"/>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                </svg>
              </button>
              <button class="icon-action" title="View team"
                onclick="event.stopPropagation();openTeamDetail('${g._id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
          </td>
        </tr>`;
    }).join("");

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#dc2626;padding:20px">${err.message}</td></tr>`;
  }
}
/* ════════════════════════════════════
   SUPERVISORS
══════════════════════════════════════ */
const SUPERVISORS_PAGE = { current: 1, perPage: 8 };

async function renderSupervisors() {
  const admin = JSON.parse(localStorage.getItem("admin"));
  const grid  = $("#supervisorCards");
  grid.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-mute)">Loading...</div>`;

  try {
    const res  = await fetch(`${API_BASE}/api/admin/supervisors`, {
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${admin.token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");

    SUPERVISORS_DATA = data;
    renderSupervisorPage(SUPERVISORS_PAGE.current);
  } catch (err) {
    grid.innerHTML = `<div style="padding:40px;color:#dc2626">Failed: ${err.message}</div>`;
  }
}

function renderSupervisorPage(page) {
  SUPERVISORS_PAGE.current = page;
  const { perPage } = SUPERVISORS_PAGE;
  const slice = SUPERVISORS_DATA.slice((page - 1) * perPage, page * perPage);
  renderSupervisorCards(slice);
  renderPagination("supervisorsPagination", SUPERVISORS_DATA.length, page, perPage, "renderSupervisorPage");
}

function renderTeamsPage(page) {
  TEAMS_PAGE.current = page;
  const { perPage } = TEAMS_PAGE;
  const slice = TEAMS_DATA.slice((page - 1) * perPage, page * perPage);
  renderTeamsTable(slice);
  renderPagination("teamsPagination", TEAMS_DATA.length, page, perPage, "renderTeamsPage");
}

function renderStudentsPage(page) {
  STUDENTS_PAGE.current = page;
  const { perPage } = STUDENTS_PAGE;
  const slice = STUDENTS_DATA.slice((page - 1) * perPage, page * perPage);
  renderStudentsTable(slice);
  renderPagination("studentsPagination", STUDENTS_DATA.length, page, perPage, "renderStudentsPage");
}


function renderSupervisorCards(list) {
  const grid = $("#supervisorCards");

  if (!list?.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;padding:40px;text-align:center;color:var(--text-mute)">No supervisors found.</div>`;
    return;
  }

  grid.innerHTML = list.map(sup => `
    <div class="entity-card" data-chairman="${sup.is_chairman === true}">

      <div class="entity-card-head">
        <div class="entity-avatar"
             style="${sup.avatar_url ? "padding:0;overflow:hidden;background:none" : ""}">
          ${supAvatar(sup)}
        </div>
        <div class="entity-info">
          <strong>${formatName(sup.prefix, sup.name)}</strong>
          <p>${sup.email || "—"}</p>
        </div>
      </div>

      <div style="margin-bottom:12px">
        <span class="id-pill">${sup.sup_code || "—"}</span>
        <span class="id-pill" style="
          margin-left:6px;
          background:${sup.is_chairman ? "rgba(191,161,74,.15)" : "rgba(99,102,241,.1)"};
          color:${sup.is_chairman ? "#9a7e2a" : "#4f46e5"}">
          ${sup.is_chairman ? "Chairman / HOD" : (sup.designation || "Supervisor")}
        </span>
      </div>

      <div class="entity-stats">
        <div class="entity-stat-cell">
          <strong>${sup.teamCount || 0}</strong>
          <span>Teams</span>
        </div>
        <div class="entity-stat-cell">
          <strong>${sup.whatsapp || "—"}</strong>
          <span>WhatsApp</span>
        </div>
      </div>

      <div style="display:flex;gap:8px;margin-top:12px">
        <button class="btn btn-ghost btn-sm" style="flex:1"
          onclick="openSupDetail('${sup._id}')">View</button>
        <button class="btn btn-sm"
          style="flex:1;background:rgba(59,130,246,.08);color:#2563eb;border:1px solid rgba(59,130,246,.2)"
          onclick="openEditSupModal('${sup._id}','${(sup.prefix||"Mr").replace(/'/g,"\\'")}','${(sup.name||"").replace(/'/g,"\\'")}','${(sup.email||"").replace(/'/g,"\\'")}','${(sup.whatsapp||"").replace(/'/g,"\\'")}','${sup.is_chairman?"chairman":"supervisor"}')">
          Edit
        </button>
        <button class="btn btn-sm"
          style="flex:1;background:rgba(220,38,38,.08);color:#dc2626;border:1px solid rgba(220,38,38,.2)"
          onclick="event.stopPropagation();openDeleteSupModal('${sup._id}','${formatName(sup.prefix,sup.name).replace(/'/g,"\\'")}')">
          Delete
        </button>
      </div>
    </div>
  `).join("");
}

function renderSupDetailTeamPage(groups, page) {
  const perPage    = 5;
  const totalPages = Math.ceil(groups.length / perPage);
  const start      = (page - 1) * perPage;
  const slice      = groups.slice(start, start + perPage);

  // Store globally for pagination button access
  window._supGroups = groups;

  // Remove old team blocks + old pagination
  document.querySelectorAll(".team-block, #sup-team-pagination").forEach(el => el.remove());

  const container = document.getElementById("supDetailContent");
  if (!container) return;

  // Render this page's team blocks
  slice.forEach(group => {
    container.insertAdjacentHTML("beforeend", renderTeamBlockFromDB(group));
  });

  // Render pagination bar
  const pag = document.createElement("div");
  pag.id = "sup-team-pagination";
  pag.style.cssText = `
    display:flex;align-items:center;justify-content:space-between;
    padding:16px 20px;margin-top:12px;
    background:var(--surface);border-radius:var(--radius);
    border:1px solid var(--border-soft);
    flex-wrap:wrap;gap:10px;
  `;

  const btnStyle = (active) => `
    width:32px;height:32px;border-radius:7px;
    border:1px solid ${active ? "var(--primary)" : "var(--border)"};
    background:${active ? "var(--primary)" : "var(--surface)"};
    color:${active ? "#fff" : "var(--text)"};
    font-size:.78rem;font-weight:${active ? "700" : "600"};
    cursor:pointer;transition:background .15s;
  `;

  // Build page number buttons
  let btns = "";

  // Prev button
  btns += `
    <button onclick="renderSupDetailTeamPage(window._supGroups,${page - 1})"
      ${page === 1 ? "disabled" : ""}
      style="${btnStyle(false)}opacity:${page === 1 ? ".4" : "1"};cursor:${page === 1 ? "not-allowed" : "pointer"}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
           width="13" height="13">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    </button>`;

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    btns += `
      <button onclick="renderSupDetailTeamPage(window._supGroups,${i})"
        style="${btnStyle(i === page)}">
        ${i}
      </button>`;
  }

  // Next button
  btns += `
    <button onclick="renderSupDetailTeamPage(window._supGroups,${page + 1})"
      ${page === totalPages ? "disabled" : ""}
      style="${btnStyle(false)}opacity:${page === totalPages ? ".4" : "1"};cursor:${page === totalPages ? "not-allowed" : "pointer"}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
           width="13" height="13">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </button>`;

  const showing_start = start + 1;
  const showing_end   = Math.min(start + perPage, groups.length);

  pag.innerHTML = `
    <span style="font-size:.76rem;color:var(--text-mute);font-weight:600">
      Showing <strong style="color:var(--text)">${showing_start}–${showing_end}</strong>
      of <strong style="color:var(--text)">${groups.length}</strong> teams
    </span>
    <div style="display:flex;gap:4px;align-items:center">
      ${btns}
    </div>`;

  if (totalPages > 1) {
    container.appendChild(pag);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}
/* ════════════════════════════════════
   SUPERVISOR DETAIL
══════════════════════════════════════ */
async function openSupDetail(supId) {
  const admin = JSON.parse(localStorage.getItem("admin"));

  $$(".view").forEach(v => v.classList.remove("active"));
  $("#view-sup-detail").classList.add("active");
  $("#supDetailContent").innerHTML = `
    <div style="padding:60px 20px;text-align:center;color:var(--text-mute)">Loading supervisor details...</div>`;

  try {
    const res  = await fetch(`${API_BASE}/api/admin/supervisors/${supId}`, {
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${admin.token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");

    const sup    = data.supervisor;
    const groups = data.groups || [];

    // Fetch marks for every group
    for (const group of groups) {
      try {
        const mRes = await fetch(`${API_BASE}/api/admin/marks/group/${group._id}`, {
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${admin.token}` }
        });
        if (!mRes.ok) continue;

        const marksData = await mRes.json();
        const marksList = Array.isArray(marksData) ? marksData
          : (Array.isArray(marksData?.marks) ? marksData.marks : []);

        const allStudents = [group.leader, ...(group.members || [])].filter(Boolean);

        allStudents.forEach(student => {
          const markRecord = marksList.find(m => {
            const ref = (typeof m.student === "string") ? m.student : m.student?._id;
            return ref === student._id;
          });

          if (markRecord) {
            student.marks = {
              oct: markRecord.monthly?.oct ?? null,
              nov: markRecord.monthly?.nov ?? null,
              dec: markRecord.monthly?.dec ?? null,
              feb: markRecord.monthly?.feb ?? null,
              mar: markRecord.monthly?.mar ?? null,
              proposal:        markRecord.submissions?.proposal  ?? null,
              progress_report: markRecord.submissions?.progress  ?? null,
              thesis:          markRecord.documentation?.final   ?? null,
              code:            markRecord.submissions?.code      ?? null,
              prog_sim:        markRecord.submissions?.prog_sim  ?? null,
              thesis_sim:      markRecord.submissions?.thesis_sim ?? null,
              iv1: markRecord.viva?.internal1 ?? null,
              iv2: markRecord.viva?.internal2 ?? null,
              ext: markRecord.viva?.external  ?? null,
            };
            student.total_marks = markRecord.total ?? 0;
          } else {
            student.marks       = {};
            student.total_marks = 0;
          }
        });
      } catch (err) {
        console.warn(`Could not load marks for ${group.group_code}:`, err);
      }
    }

const totalStudents = groups.reduce((sum, g) =>
      sum + (g.members?.length || 0) + (g.leader ? 1 : 0), 0);

    // ── Build avatar HTML ──
    const avatarHtml = (() => {
      if (!sup.avatar_url) {
        return `<div class="sup-detail-avatar">${initials(sup.name)}</div>`;
      }
      const fullUrl = sup.avatar_url.startsWith("http")
        ? sup.avatar_url
        : `http://127.0.0.1:5001${sup.avatar_url}`;
      return `
        <div class="sup-detail-avatar" style="padding:0;overflow:hidden;background:none;border:3px solid rgba(255,255,255,.25)">
          <img src="${fullUrl}" alt="${escapeHtml(sup.name)}"
               style="width:100%;height:100%;object-fit:cover;border-radius:18px;display:block"
               onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">
          <span style="display:none;width:100%;height:100%;border-radius:18px;
                       background:linear-gradient(135deg,var(--gold),var(--gold-lt));
                       color:var(--primary-dark);font-weight:800;font-size:1.6rem;
                       place-items:center;font-family:var(--font-display)">
            ${initials(sup.name)}
          </span>
        </div>`;
    })();
let html = `
  <div class="sup-detail-header">
    ${avatarHtml}
    <div class="sup-detail-info">
      <h2>${formatName(sup.prefix, sup.name)}</h2>
      <p>${sup.email}</p>
      <div class="sup-detail-stats">
<div class="sup-detail-stat"><strong>${sup.sup_code || "—"}</strong></div>
<div class="sup-detail-stat"><strong>${groups.length}</strong> Teams</div>
<div class="sup-detail-stat"><strong>${totalStudents}</strong> Students</div>
      </div>
    </div>
  </div>`;

$("#supDetailContent").innerHTML = html;

    if (groups.length === 0) {
      $("#supDetailContent").insertAdjacentHTML("beforeend",
        `<div class="dash-panel">
           <div class="panel-body" style="text-align:center;padding:40px;color:var(--text-mute)">
             No teams assigned yet.
           </div>
         </div>`
      );
    } else {
      window._supGroups = groups;
      renderSupDetailTeamPage(groups, 1);
    }

  } catch (err) {
    console.error(err);
    $("#supDetailContent").innerHTML = `
      <div style="padding:40px;text-align:center;color:#dc2626">Failed to load: ${err.message}</div>`;
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ════════════════════════════════════
   TEAM BLOCK WITH MARKS
══════════════════════════════════════ */
function renderTeamBlockFromDB(group) {
  const allStudents = [
    group.leader ? { ...group.leader, role: "Leader" } : null,
    ...(group.members || []).map(m => ({ ...m, role: "Member" }))
  ].filter(Boolean);

  // ── Empty team (no students) ──
 if (allStudents.length === 0) {
  return `
    <div class="team-block">
      <div class="team-block-head">
        <div class="team-block-head-left">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
            <span class="id-pill gold" style="font-size:.8rem;padding:5px 12px;font-weight:700">
              ${group.team_code || group.group_code || "—"}
            </span>
            <span style="color:var(--text-mute);font-weight:600">·</span>
            <h3 style="font-size:1rem;font-weight:700;color:var(--primary-dark);margin:0">
              ${group.project_title || "—"}
            </h3>
            <span style="color:var(--text-mute);font-weight:600">·</span>
            <span style="font-size:.78rem;color:var(--text-mute);font-style:italic">
              No students linked
            </span>
          </div>
        </div>
      </div>
    </div>`;
}

  // ── Build component headers ──
  const componentHeaders = MARKS_SCHEMA.flatMap(sec =>
    sec.items.map(it => `
      <th title="${sec.section} · max ${it.max}">
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
          <span>${it.label}</span>
          <small style="color:var(--text-mute);font-weight:600">/${it.max}</small>
        </div>
      </th>`)
  ).join("");

  // ── Build student rows ──
  const rows = allStudents.map(s => {
    const cells = MARKS_SCHEMA.flatMap(sec =>
      sec.items.map(it => {
        const val = s.marks?.[it.key];
        const displayValue = (val !== null && val !== undefined) ? val : "";
        return `
          <td class="mark-input-cell">
            <input type="number" min="0" max="${it.max}"
              class="mark-input"
              data-student="${s._id}"
              data-key="${it.key}"
              data-max="${it.max}"
              data-group="${group._id}"
              value="${displayValue}"
              placeholder="—"
              oninput="onMarkChange(this)">
          </td>`;
      })
    ).join("");

    return `
      <tr>
        <td>
          <strong>${s.name}</strong>
          <div style="font-size:.66rem;color:var(--text-mute);margin-top:2px">${s.email || ""}</div>
          <div style="font-size:.66rem;color:#15803d;font-weight:600;margin-top:2px;display:inline-flex;align-items:center;gap:3px">
            <svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10">
              <path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4a7.94 7.94 0 0 0-6.88 11.93L4 20l4.2-1.1a7.93 7.93 0 0 0 3.85.98h.01a7.94 7.94 0 0 0 5.55-13.56zm-5.55 12.21h-.01a6.6 6.6 0 0 1-3.36-.92l-.24-.14-2.49.65.66-2.43-.16-.25a6.6 6.6 0 1 1 5.6 3.09z"/>
            </svg>
            ${s.whatsapp || "—"}
          </div>
        </td>
        <td><span class="id-pill">${s.student_code || s._id}</span></td>
        <td><span class="id-pill" style="background:rgba(191,161,74,.1);color:#9a7e2a">${s.role}</span></td>
        ${cells}
        <td><span class="mark-total-display" id="total-${s._id}">${s.total_marks || 0}<span class="out">/${MAX_TOTAL}</span></span></td>
      </tr>`;
  }).join("");

  // ── Final return with new header (Team ID → Title → member count) ──
return `
  <div class="team-block">
    <div class="team-block-head">
      <div class="team-block-head-left">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <span class="id-pill gold" style="font-size:.8rem;padding:5px 12px;font-weight:700">
            ${group.team_code || group.group_code || "—"}
          </span>
          <span style="color:var(--text-mute);font-weight:600">·</span>
          <h3 style="font-size:1rem;font-weight:700;color:var(--primary-dark);margin:0">
            ${group.project_title || "—"}
          </h3>
          <span style="color:var(--text-mute);font-weight:600">·</span>
          <span style="font-size:.78rem;color:var(--text-mute);font-weight:600">
            ${allStudents.length} member${allStudents.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
      <button class="btn btn-primary btn-sm" onclick="saveTeamMarks('${group._id}')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Save Changes
      </button>
    </div>
    <div style="overflow-x:auto">
      <table class="marks-edit-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>ID</th>
            <th>Role</th>
            ${componentHeaders}
            <th>Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </div>`;
}

/* ════════════════════════════════════
   MARKS — LIVE VALIDATION + SAVE
══════════════════════════════════════ */
function onMarkChange(input) {
  const max = parseInt(input.dataset.max);
  let val   = parseInt(input.value);

  if (input.value === "") {
    input.classList.remove("invalid");
    updateStudentTotal(input.dataset.student);
    return;
  }

  if (isNaN(val)) val = 0;
  if (val < 0)    val = 0;
  if (val > max) {
    input.classList.add("invalid");
    toast("Invalid mark", `Maximum allowed is ${max}`, "warn");
    val = max;
    input.value = val;
  } else {
    input.classList.remove("invalid");
  }

  updateStudentTotal(input.dataset.student);
}

function updateStudentTotal(studentId) {
  let total = 0;
  document.querySelectorAll(`.mark-input[data-student="${studentId}"]`).forEach(inp => {
    if (inp.value !== "") {
      const v = parseInt(inp.value);
      if (!isNaN(v) && v >= 0) total += v;
    }
  });
  const el = document.getElementById(`total-${studentId}`);
  if (el) el.innerHTML = `${total}<span class="out">/${MAX_TOTAL}</span>`;
}

async function saveTeamMarks(groupId) {
  const admin  = JSON.parse(localStorage.getItem("admin"));
  const inputs = document.querySelectorAll(`.mark-input[data-group="${groupId}"]`);

  const marksByStudent = {};
  inputs.forEach(inp => {
    const sid = inp.dataset.student;
    const key = inp.dataset.key;
    if (!marksByStudent[sid]) marksByStudent[sid] = {};
    if (inp.value !== "") marksByStudent[sid][key] = parseInt(inp.value) || 0;
  });

  try {
    for (const studentId in marksByStudent) {
      const marks        = marksByStudent[studentId];
      const monthly      = {};
      const submissions  = {};
      const viva         = {};
      const documentation = {};

      Object.entries(marks).forEach(([key, value]) => {
        if (["oct","nov","dec","feb","mar"].includes(key)) {
          monthly[key] = value;
        } else if (["proposal","progress_report","code","prog_sim","thesis_sim"].includes(key)) {
          submissions[key === "progress_report" ? "progress" : key] = value;
        } else if (["iv1","iv2","ext"].includes(key)) {
          viva[key === "iv1" ? "internal1" : key === "iv2" ? "internal2" : "external"] = value;
        } else if (key === "thesis") {
          documentation.final = value;
        }
      });

      const res = await fetch(`${API_BASE}/api/admin/marks`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${admin.token}` },
        body: JSON.stringify({ student_id: studentId, monthly, submissions, viva, documentation })
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || "Save failed");
      }

      const d = await res.json();
      const totalEl = document.getElementById(`total-${studentId}`);
      if (totalEl && d.total !== undefined) {
        totalEl.innerHTML = `${d.total}<span class="out">/${MAX_TOTAL}</span>`;
      }
    }

    toast("Saved", `Marks saved for ${Object.keys(marksByStudent).length} students`, "success");

  } catch (err) {
    console.error(err);
    toast("Error", err.message, "error");
  }
}

/* ════════════════════════════════════
   TEAMS
══════════════════════════════════════ */
const TEAMS_PAGE = { current: 1, perPage: 20 };

async function renderTeams() {
  const admin = JSON.parse(localStorage.getItem("admin"));
  const tbody = $("#teamsTable tbody");
  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--text-mute)">Loading...</td></tr>`;

  try {
    const res = await fetch(`${API_BASE}/api/groups`, {
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${admin.token}` }
    });
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) throw new Error("Server returned HTML — route not registered");

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");

    TEAMS_DATA = Array.isArray(data) ? data : data.groups || [];
    renderTeamsPage(TEAMS_PAGE.current);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#dc2626;padding:30px">${err.message}</td></tr>`;
  }
}

function renderTeamsPage(page) {
  TEAMS_PAGE.current = page;
  const perPage = TEAMS_PAGE.perPage;
  const start   = (page - 1) * perPage;
  const slice   = TEAMS_DATA.slice(start, start + perPage);
  renderTeamsTable(slice);
  renderPagination("teamsPagination", TEAMS_DATA.length, page, perPage, "renderTeamsPage", "changeTeamsPerPage");
}

//TEAMS TABLE — now includes Proposal status + approve/reject
function renderTeamsTable(list) {
  const tbody = $("#teamsTable tbody");

  function withPrefix(supervisor) {
    if (!supervisor) return "Unassigned";
    return `${supervisor.prefix || "Mr"} ${supervisor.name}`;
  }

  if (!list.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;padding:40px;color:var(--text-mute)">
          No teams found.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = list.map(g => {
    const supName        = withPrefix(g.supervisor);
    const teamCode       = g.team_code || "—";
    const proposalUrl    = g.proposal_url || "";
    const proposalStatus = g.proposal_status || "pending";
    const attempt        = g.proposal_attempt || 1;

    // ── Attempt badge ──
    const attemptBadge = attempt > 1 ? `
      <span style="display:inline-flex;align-items:center;gap:4px;margin-left:6px;
                   padding:2px 7px;border-radius:5px;font-size:.62rem;font-weight:800;
                   background:rgba(99,102,241,.12);color:#4f46e5">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" width="11" height="11">
          <polyline points="1 4 1 10 7 10"/>
          <path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
        </svg>
        Attempt ${attempt}
      </span>` : "";

    // ── Second attempt warning ──
    const secondAttemptWarning = attempt > 1 ? `
      <div style="margin-top:5px;font-size:.65rem;color:#a16207;
                  background:rgba(234,179,8,.08);padding:4px 8px;
                  border-radius:5px;border:1px solid rgba(234,179,8,.2);
                  display:flex;align-items:center;gap:5px">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" width="12" height="12">
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        Previously rejected proposal exists
      </div>` : "";

    // ── Proposal badge ──
    let proposalBadge = "";

    if (proposalStatus === "approved") {
      proposalBadge = `
        <span style="display:inline-flex;align-items:center;gap:4px;padding:3px 9px;
                     border-radius:6px;font-size:.7rem;font-weight:700;
                     background:rgba(21,128,61,.1);color:#15803d">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round" width="12" height="12">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Approved
        </span>
        ${attemptBadge}`;

    } else if (proposalStatus === "rejected") {
      proposalBadge = `
        <span style="display:inline-flex;align-items:center;gap:4px;padding:3px 9px;
                     border-radius:6px;font-size:.7rem;font-weight:700;
                     background:rgba(220,38,38,.08);color:#dc2626">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round" width="12" height="12">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          Rejected
        </span>
        ${attemptBadge}`;

    } else {
      proposalBadge = `
        <span style="display:inline-flex;align-items:center;gap:4px;padding:3px 9px;
                     border-radius:6px;font-size:.7rem;font-weight:700;
                     background:rgba(234,179,8,.1);color:#a16207">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" width="12" height="12">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          Pending
        </span>
        ${attemptBadge}`;
    }

    // ── Proposal actions ──
    // ── Proposal actions ──
    let proposalActions = "";
    if (proposalUrl) {
      // View + Download always visible when file exists
      const viewDownload = `
        <div style="display:flex;gap:5px;margin-top:6px;flex-wrap:wrap">
          <button onclick="viewDoc('${proposalUrl}')"
            style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;
                   border-radius:5px;font-size:.66rem;font-weight:700;cursor:pointer;
                   border:1px solid rgba(0,75,45,.2);background:rgba(0,75,45,.06);color:var(--primary)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round" width="11" height="11">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            View
          </button>
        </div>`;

      // Accept + Reject only when pending
      if (proposalStatus === "pending") {
        proposalActions = `
          ${viewDownload}
          <div style="display:flex;gap:5px;margin-top:5px;flex-wrap:wrap">
            <button onclick="updateProposalStatus('${g._id}','approved')"
              style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;
                     border-radius:5px;font-size:.66rem;font-weight:700;cursor:pointer;
                     border:1px solid rgba(21,128,61,.2);background:rgba(21,128,61,.06);color:#15803d">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                   stroke-linecap="round" stroke-linejoin="round" width="11" height="11">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Accept
            </button>
            <button onclick="updateProposalStatus('${g._id}','rejected')"
              style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;
                     border-radius:5px;font-size:.66rem;font-weight:700;cursor:pointer;
                     border:1px solid rgba(220,38,38,.2);background:rgba(220,38,38,.05);color:#dc2626">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                   stroke-linecap="round" stroke-linejoin="round" width="11" height="11">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Reject
            </button>
          </div>
          ${secondAttemptWarning}`;
      } else {
        // Approved or rejected — only view/download, no action buttons
        proposalActions = viewDownload;
      }
    }

    // ── Table row ──
    return `
      <tr>
        <td><span class="id-pill gold">${teamCode}</span></td>

        <td>${g.project_title || "—"}</td>

        <td><span style="font-weight:600;color:var(--text)">${supName}</span></td>

        <td>
          ${proposalBadge}
          ${proposalActions}
        </td>

        <td>
          <div class="action-row">
            <button class="icon-action" title="Reassign supervisor"
              onclick="event.stopPropagation();openReassignModal('${g._id}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                   stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
                <polyline points="1 4 1 10 7 10"/>
                <polyline points="23 20 23 14 17 14"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
              </svg>
            </button>
            <button class="icon-action" title="View team"
              onclick="event.stopPropagation();openTeamDetail('${g._id}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                   stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>`;
  }).join("");
}


function renderStudentsTable(list, query = "", matchSet = new Set()) {
  const tbody = $("#studentsTable tbody");

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-mute)">No students found.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(s => {
    const isMatch          = query && matchSet.has(s._id);
    const supId            = s.group?.supervisor?._id || "";
    const supName = s.group?.supervisor
    ? formatName(s.group.supervisor.prefix, s.group.supervisor.name)
    : "—";
    const totalMarks       = s.total_marks || 0;
    const safeName         = (s.name || "").replace(/'/g, "\\'");
    const whatsapp         = s.whatsapp || "—";
    const cvUrl            = s.cv_url || "";
    const certUrl = s.certificates_url || "";
    const proposalUrl      = s.group?.proposal_url || "";
    const proposalUploader = s.group?.proposal_uploaded_by?.name || "";
    const proposalStatus   = s.group?.proposal_status || "";

    return `
      <tr class="${isMatch ? "search-match" : ""}">
        <td>
          <div class="team-info">
            <strong>${highlightText(s.name, query)}</strong>
            <span style="display:block">${s.email || ""}</span>
            <span style="display:block;font-size:.7rem;color:var(--success);font-weight:600">
              <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"
                   style="display:inline;vertical-align:middle;margin-right:3px">
                <path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4a7.94 7.94 0 0 0-6.88 11.93L4 20l4.2-1.1a7.93 7.93 0 0 0 3.85.98h.01a7.94 7.94 0 0 0 5.55-13.56zm-5.55 12.21h-.01a6.6 6.6 0 0 1-3.36-.92l-.24-.14-2.49.65.66-2.43-.16-.25a6.6 6.6 0 1 1 5.6 3.09z"/>
              </svg>
              ${whatsapp}
            </span>
          </div>
        </td>
        <td><span class="id-pill">${highlightText(s.student_code || "—", query)}</span></td>
        <td>${highlightText(supName, query)}</td>
        <td>
          <strong style="font-family:monospace;color:var(--primary)">
            ${totalMarks}<span style="color:var(--text-mute);font-weight:500">/${MAX_TOTAL}</span>
          </strong>
        </td>
        <td>
          <div class="doc-cell">
            ${renderDocBadge("CV", cvUrl, true, safeName)}
            ${renderDocBadge("Proposal", proposalUrl, false, safeName, proposalUploader, proposalStatus)}
          </div>
        </td>
          <td>
  <div class="action-row" style="flex-direction:column;gap:6px;align-items:flex-start">

    <!-- View button -->
    <button onclick="openStudentViewModal('${s._id}')"
      style="display:inline-flex;align-items:center;gap:5px;padding:5px 10px;
             border-radius:7px;font-size:.72rem;font-weight:700;cursor:pointer;
             border:1px solid rgba(0,75,45,.2);background:rgba(0,75,45,.06);
             color:var(--primary);width:100%;justify-content:center">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round" width="12" height="12">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
      View
    </button>

    <!-- Edit (view supervisor marks) -->
    <button onclick="${supId ? `openSupDetail('${supId}')` : `toast('No supervisor','Not in a team yet','warn')`}"
      style="display:inline-flex;align-items:center;gap:5px;padding:5px 10px;
             border-radius:7px;font-size:.72rem;font-weight:700;cursor:pointer;
             border:1px solid rgba(59,130,246,.2);background:rgba(59,130,246,.06);
             color:#2563eb;width:100%;justify-content:center">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round" width="12" height="12">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
      Edit
    </button>

    <!-- Delete -->
    <button onclick="deleteStudent('${s._id}','${safeName}')"
      style="display:inline-flex;align-items:center;gap:5px;padding:5px 10px;
             border-radius:7px;font-size:.72rem;font-weight:700;cursor:pointer;
             border:1px solid rgba(220,38,38,.2);background:rgba(220,38,38,.06);
             color:#dc2626;width:100%;justify-content:center">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round" width="12" height="12">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      </svg>
      Delete
    </button>

  </div>
</td>
      </tr>`;
  }).join("");
}
async function openTeamDetail(teamId) {
  const team = TEAMS_DATA.find(t => t._id === teamId);
  if (!team) { toast("Error", "Team not found", "error"); return; }
  if (team.supervisor?._id) {
    openSupDetail(team.supervisor._id);
  } else {
    toast("No supervisor", "This team has no supervisor assigned yet", "warn");
  }
}

/* ════════════════════════════════════
   REASSIGN SUPERVISOR
══════════════════════════════════════ */
let reassignTeamId = null;

function openReassignModal(teamId) {
  reassignTeamId = teamId;
  const team = TEAMS_DATA.find(t => t._id === teamId);
  if (!team) return;

  const currentSup = team.supervisor;

  $("#reassignTeamName").textContent = team.group_code || team.team_code;

  $("#currentSup").value = currentSup
    ? `${formatName(currentSup.prefix, currentSup.name)} (${currentSup.sup_code})`
    : "Unassigned";

  const select = $("#newSup");

  select.innerHTML =
    '<option value="">— Choose a supervisor —</option>' +
    SUPERVISORS_DATA
      .map(s => `<option value="${s._id}">${formatName(s.prefix, s.name)} · ${s.sup_code}</option>`)
      .join("");

  $("#reassignModal").classList.add("open");
}

function closeReassignModal() {
  $("#reassignModal").classList.remove("open");
}

async function confirmReassign() {
  const newSupId = $("#newSup").value;
  if (!newSupId) { toast("Select a supervisor", "Please choose a new supervisor", "error"); return; }

  const admin = JSON.parse(localStorage.getItem("admin"));
  try {
    const res  = await fetch(`${API_BASE}/api/groups/${reassignTeamId}/reassign`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${admin.token}` },
      body: JSON.stringify({ supervisor_id: newSupId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    closeReassignModal();
    await renderTeams();
    await renderSupervisors();
    toast("Supervisor reassigned", "Updated successfully", "success");
  } catch (err) {
    toast("Error", err.message, "error");
  }
}

/* ════════════════════════════════════
   STUDENTS
══════════════════════════════════════ */
const STUDENTS_PAGE = { current: 1, perPage: 30 };

async function renderStudents() {
  const admin = JSON.parse(localStorage.getItem("admin"));
  const tbody = $("#studentsTable tbody");
  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-mute)">Loading...</td></tr>`;

  try {
    const res  = await fetch(`${API_BASE}/api/admin/students`, {
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${admin.token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");

    STUDENTS_DATA = Array.isArray(data) ? data : data.students || [];
    renderStudentsPage(STUDENTS_PAGE.current);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#dc2626;padding:30px">${err.message}</td></tr>`;
  }
}

function renderStudentsPage(page) {
  STUDENTS_PAGE.current = page;
  const perPage = STUDENTS_PAGE.perPage;
  const start   = (page - 1) * perPage;
  const slice   = STUDENTS_DATA.slice(start, start + perPage);
  renderStudentsTable(slice);
  renderPagination("studentsPagination", STUDENTS_DATA.length, page, perPage, "renderStudentsPage", "changeStudentsPerPage");
}

//   DOCUMENT BADGES
function renderDocBadge(label, url, required, studentName, uploaderName = "", status = "") {
  if (!url) {
    return `
      <span class="doc-badge missing" title="${required ? label + " missing — required" : label + " not yet submitted"}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        ${label}
        <small>${required ? "missing" : "not yet"}</small>
      </span>`;
  }

  return `
    <div class="doc-badge available">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
      <span class="doc-label">${label}</span>
      ${uploaderName ? `<small class="doc-uploader">by ${uploaderName.split(" ")[0]}</small>` : ""}
      ${status ? `<span class="doc-status doc-status-${status}">${status}</span>` : ""}
      <button class="doc-btn view" title="View ${label}" onclick="viewDoc('${url}')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </button>
    </div>`;
}

async function viewDoc(url) {
  if (!url) return toast("No document", "File not available", "warn");

  try {
    // S3 private files need a presigned URL
    if (url.includes("amazonaws.com")) {
      const admin   = JSON.parse(localStorage.getItem("admin"))
                   || JSON.parse(localStorage.getItem("student"))
                   || JSON.parse(localStorage.getItem("supervisor"));

      const res  = await fetch(
        `${API_BASE}/api/uploads/signed-url?url=${encodeURIComponent(url)}`,
        { headers: { "Authorization": `Bearer ${admin?.token}` } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      window.open(data.signedUrl, "_blank", "noopener");
      return;
    }

    // Local files — open directly
    const finalUrl = url.startsWith("http") ? url : `http://127.0.0.1:5001${url}`;
    window.open(finalUrl, "_blank", "noopener");

  } catch (err) {
    console.error("viewDoc error:", err);
    toast("Error", "Could not open document", "error");
  }
}

async function downloadDoc(url, filename) {
  if (!url) return toast("No document", "File not available", "warn");

  const finalUrl = url.startsWith("http") ? url : `http://127.0.0.1:5001${url}`;
  const safeFilename = (filename || "document").replace(/[^\w\-\.]/g, "_");

  try {
    // Fetch the file as a blob → forces download instead of opening in browser
    const response = await fetch(finalUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    // Detect extension from URL
    const ext = finalUrl.split(".").pop().split("?")[0].toLowerCase();
    const filenameWithExt = safeFilename.endsWith(`.${ext}`)
      ? safeFilename
      : `${safeFilename}.${ext}`;

    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filenameWithExt;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Clean up
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

    toast("Downloaded", filenameWithExt, "success");
  } catch (err) {
    console.error("Download error:", err);
    toast("Download failed", err.message, "error");
  }
}



//   PROPOSAL STATUS
let pendingRejectGroupId = null;

function openRejectConfirmModal(groupId) {
  pendingRejectGroupId = groupId;
  document.getElementById("rejectConfirmModal").classList.add("open");
  document.getElementById("rejectReason").value = "";
}

function closeRejectConfirmModal() {
  pendingRejectGroupId = null;
  document.getElementById("rejectConfirmModal").classList.remove("open");
}

async function confirmRejectProposal() {
  if (!pendingRejectGroupId) return;
  const reason = document.getElementById("rejectReason").value.trim();

  const admin = JSON.parse(localStorage.getItem("admin"));
  const btn = document.getElementById("confirmRejectBtn");
  if (btn) { btn.disabled = true; btn.textContent = "Deleting…"; }

  try {
    const res = await fetch(`${API_BASE}/api/groups/${pendingRejectGroupId}/proposal-status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${admin.token}` },
      body: JSON.stringify({ status: "rejected", reason })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");

    closeRejectConfirmModal();
    toast("Proposal Rejected", "File permanently deleted from S3", "warn");
    await renderTeams();
    await renderStudents();
  } catch (err) {
    toast("Error", err.message, "error");
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = "Confirm Reject"; }
  }
}

async function approveProposal(groupId) {
  const admin = JSON.parse(localStorage.getItem("admin"));
  try {
    const res = await fetch(`${API_BASE}/api/groups/${groupId}/proposal-status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${admin.token}` },
      body: JSON.stringify({ status: "approved" })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");

    toast("Proposal Approved ✓", "Student notified", "success");
    await renderTeams();
    await renderStudents();
  } catch (err) {
    toast("Error", err.message, "error");
  }
}

function updateProposalStatus(groupId, status) {
  if (status === "approved") {
    approveProposal(groupId);
  } else if (status === "rejected") {
    openRejectConfirmModal(groupId);
  }
}
/* ════════════════════════════════════
   DELETE STUDENT
══════════════════════════════════════ */
async function deleteStudent(studentId, studentName) {
  if (!confirm(`Delete ${studentName}?\n\nThis will also remove them from their team. If they're the team leader, the entire team will be deleted.`)) return;

  const admin = JSON.parse(localStorage.getItem("admin"));
  try {
    const res  = await fetch(`${API_BASE}/api/admin/student/${studentId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${admin.token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");

    toast("Student deleted", `${studentName} has been removed`, "success");
    await fetchDashboardStats();
    await renderStudents();
    await renderTeams();
    await renderSupervisors();
  } catch (err) {
    toast("Error", err.message, "error");
  }
}

/* ════════════════════════════════════
   SEARCH FILTERS
══════════════════════════════════════ */
function filterSupervisors(query) {
  SUPERVISORS_PAGE.current = 1;
  if (!Array.isArray(SUPERVISORS_DATA)) return;

  const q       = (query || "").trim().toLowerCase();
  const matched = [];
  const rest    = [];

  SUPERVISORS_DATA.forEach(sup => {
    const hit = !q
      || (sup.name     || "").toLowerCase().includes(q)
      || (sup.sup_code || "").toLowerCase().includes(q)
      || (sup.email    || "").toLowerCase().includes(q);
    (hit ? matched : rest).push(sup);
  });

  if (!q) { renderSupervisorPage(1); return; }

  const grid = $("#supervisorCards");
  grid.innerHTML = [...matched, ...rest].map(sup => {
    const isMatch = matched.some(m => m._id === sup._id);
    return `
      <div class="entity-card ${isMatch ? "search-match" : ""}">
        <div class="entity-card-head">
          <div class="entity-avatar"
               style="${sup.avatar_url ? "padding:0;overflow:hidden;background:none" : ""}">
            ${supAvatar(sup)}
          </div>
          <div class="entity-info">
            <strong>${highlightText(formatName(sup.prefix, sup.name), q)}</strong>
            <p>${highlightText(sup.email || "", q)}</p>
          </div>
        </div>
        <div style="margin-bottom:12px">
          <span class="id-pill">${highlightText(sup.sup_code || "—", q)}</span>
          <span class="id-pill" style="margin-left:6px;
            background:${sup.is_chairman ? "rgba(191,161,74,.15)" : "rgba(99,102,241,.1)"};
            color:${sup.is_chairman ? "#9a7e2a" : "#4f46e5"}">
            ${sup.is_chairman ? "Chairman / HOD" : (sup.designation || "Supervisor")}
          </span>
        </div>
        <div class="entity-stats">
          <div class="entity-stat-cell"><strong>${sup.teamCount || 0}</strong><span>Teams</span></div>
          <div class="entity-stat-cell"><strong>${highlightText(sup.whatsapp || "—", q)}</strong><span>WhatsApp</span></div>
        </div>
        <div style="display:flex;gap:8px;margin-top:12px">
          <button class="btn btn-ghost btn-sm" style="flex:1"
            onclick="openSupDetail('${sup._id}')">View</button>
          <button class="btn btn-sm"
            style="flex:1;background:rgba(59,130,246,.08);color:#2563eb;border:1px solid rgba(59,130,246,.2)"
            onclick="openEditSupModal('${sup._id}','${(sup.prefix||"Mr").replace(/'/g,"\\'")}','${(sup.name||"").replace(/'/g,"\\'")}','${(sup.email||"").replace(/'/g,"\\'")}','${(sup.whatsapp||"").replace(/'/g,"\\'")}','${sup.is_chairman?"chairman":"supervisor"}')">
            Edit
          </button>
          <button class="btn btn-sm"
            style="flex:1;background:rgba(220,38,38,.08);color:#dc2626;border:1px solid rgba(220,38,38,.2)"
            onclick="event.stopPropagation();openDeleteSupModal('${sup._id}','${formatName(sup.prefix,sup.name).replace(/'/g,"\\'")}')">
            Delete
          </button>
        </div>
      </div>`;
  }).join("");

  const pag = document.getElementById("supervisorsPagination");
  if (pag) pag.innerHTML = matched.length
    ? `<div style="padding:12px 20px;font-size:.76rem;color:var(--text-mute);font-weight:600">${matched.length} result${matched.length !== 1 ? "s" : ""} found</div>`
    : `<div style="padding:12px 20px;font-size:.76rem;color:var(--text-mute)">No results</div>`;
}

function filterTeams(query) {
  TEAMS_PAGE.current = 1;
  if (!Array.isArray(TEAMS_DATA)) return;
  applyTeamsFilter();
}

function filterStudents(query) {
  STUDENTS_PAGE.current = 1;
  if (!Array.isArray(STUDENTS_DATA)) return;

  if (!query || !query.trim()) {
    renderStudentsPage(1);
    return;
  }

  const q       = query.trim().toLowerCase();
  const matched = [], rest = [];

  STUDENTS_DATA.forEach(s => {
    const hit = matches(s.name, q)
      || matches(s.email, q)
      || matches(s.student_code, q);
    (hit ? matched : rest).push(s);
  });

  const matchSet = new Set(matched.map(s => s._id));
  renderStudentsTable([...matched, ...rest], q, matchSet);

  const pag = document.getElementById("studentsPagination");
  if (pag) pag.innerHTML = matched.length
    ? `<div style="padding:12px 20px;font-size:.76rem;color:var(--text-mute);font-weight:600">${matched.length} result${matched.length !== 1 ? "s" : ""} found</div>`
    : `<div style="padding:12px 20px;font-size:.76rem;color:var(--text-mute)">No results</div>`;
}

/* ════════════════════════════════════
   ADD SUPERVISOR MODAL
══════════════════════════════════════ */
function generateSupId() {
  const list = SUPERVISORS_DATA || [];
  const year = new Date().getFullYear();
  if (!list.length) return `SUP-${year}0001`;

  const numbers = list
    .map(s => {
      const match = (s.sup_code || "").match(/SUP-\d{4}(\d+)/);
      return match ? parseInt(match[1]) : 0;
    })
    .filter(n => !isNaN(n));

  const max = numbers.length ? Math.max(...numbers) : 0;
  return `SUP-${year}${String(max + 1).padStart(4, "0")}`;
}

function generatePassword() {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const nums  = "23456789";
  const syms  = "!@#$%&*";

  let pwd = "";
  pwd += upper[Math.floor(Math.random() * upper.length)];
  pwd += upper[Math.floor(Math.random() * upper.length)];
  pwd += lower[Math.floor(Math.random() * lower.length)];
  pwd += lower[Math.floor(Math.random() * lower.length)];
  pwd += nums[Math.floor(Math.random() * nums.length)];
  pwd += nums[Math.floor(Math.random() * nums.length)];
  pwd += syms[Math.floor(Math.random() * syms.length)];
  pwd += lower[Math.floor(Math.random() * lower.length)];
  pwd = pwd.split("").sort(() => Math.random() - 0.5).join("");

  $("#supPassword").value   = pwd;
  $("#pwdHelp").textContent = "✓ Password generated — copy it before saving";
  $("#pwdHelp").className   = "form-help success";
}

function openSupervisorModal() {
  $("#generatedSupId").textContent = generateSupId();
  $("#supPrefix").value  = "";           
  $("#supName").value    = "";
  $("#supEmail").value   = "";
  const preview = $("#supNamePreview");
  if (preview) preview.textContent = ""; 
  if ($("#supPassword"))  $("#supPassword").value   = "";
  if ($("#forceChange"))  $("#forceChange").checked = true;
  const pwdHelp = $("#pwdHelp");
  if (pwdHelp) {
    pwdHelp.textContent = "Minimum 8 characters · Will be sent to supervisor via email";
    pwdHelp.className   = "form-help";
  }
  $("#supervisorModal").classList.add("open");
}

function closeSupervisorModal() {
  $("#supervisorModal").classList.remove("open");
}

async function submitSupervisor() {
  const admin = JSON.parse(localStorage.getItem("admin"));

  const prefix     = $("#supPrefix").value.trim();       
  const name       = $("#supName").value.trim();
  const email      = $("#supEmail").value.trim();
  const pwd        = $("#supPassword").value.trim();
  const whatsapp   = $("#supWhatsapp")?.value.trim() || "";
  const isChairman = $("#supRole")?.value === "chairman";

  if (!prefix) { toast("Missing field", "Please select a title/prefix", "error"); return; } // ← ADD
  if (!name || !email || !pwd) {
    toast("Missing fields", "Name, email and password are required", "error");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/admin/supervisors`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${admin.token}` },
      body: JSON.stringify({ prefix, name, email, password: pwd, whatsapp, is_chairman: isChairman }) // ← prefix added
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    toast("Success", `${formatName(prefix, name)} added successfully`, "success"); // ← formatted
    closeSupervisorModal();
    await renderSupervisors();
    await fetchDashboardStats();
  } catch (err) {
    toast("Error", err.message, "error");
  }
}

/* ════════════════════════════════════
   EDIT SUPERVISOR
══════════════════════════════════════ */
function openEditSupModal(id, prefix, name, email, whatsapp, role) {
  const get = (elId) => document.getElementById(elId);
  if (!get("editSupModal")) { console.error("editSupModal not found in DOM"); return; }

  if (get("editSupId"))       get("editSupId").value       = id;
  if (get("editSupPrefix"))   get("editSupPrefix").value   = prefix || "";
  if (get("editSupName"))     get("editSupName").value     = name;
  if (get("editSupEmail"))    get("editSupEmail").value    = email;
  if (get("editSupWhatsapp")) get("editSupWhatsapp").value = whatsapp;
  if (get("editSupRole"))     get("editSupRole").value     = role;

  get("editSupModal").classList.add("open");
}
function closeEditSupModal() {
  document.getElementById("editSupModal").classList.remove("open");
}

async function submitEditSupervisor() {
  const id       = document.getElementById("editSupId").value;
  const prefix   = document.getElementById("editSupPrefix").value.trim(); // ← ADD
  const name     = document.getElementById("editSupName").value.trim();
  const email    = document.getElementById("editSupEmail").value.trim();
  const whatsapp = document.getElementById("editSupWhatsapp").value.trim();
  const role     = document.getElementById("editSupRole").value;

  if (!prefix) { toast("Missing field", "Please select a prefix", "error"); return; } // ← ADD
  if (!name || !email) { toast("Missing fields", "Name and email are required", "error"); return; }

  const admin = JSON.parse(localStorage.getItem("admin"));
  try {
    const res = await fetch(`${API_BASE}/api/admin/supervisors/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${admin.token}` },
      body: JSON.stringify({ prefix, name, email, whatsapp, is_chairman: role === "chairman" }) // ← prefix added
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update");

    closeEditSupModal();
    await renderSupervisors();
    toast("Supervisor updated", `${formatName(prefix, name)} has been updated`, "success"); // ← formatted
  } catch (err) {
    toast("Error", err.message, "error");
  }
}

/* ════════════════════════════════════
   DELETE SUPERVISOR
══════════════════════════════════════ */
let deleteSupId = null;

function openDeleteSupModal(supId, supName) {
  deleteSupId = supId;
  document.getElementById("deleteSupName").textContent = supName;
  setTimeout(() => document.getElementById("deleteSupModal").classList.add("open"), 10);
}

function closeDeleteSupModal() {
  deleteSupId = null;
  document.getElementById("deleteSupModal").classList.remove("open");
}

async function confirmDeleteSupervisor() {
  if (!deleteSupId) return;
  const admin   = JSON.parse(localStorage.getItem("admin"));
  const supName = document.getElementById("deleteSupName").textContent;

  try {
    const res  = await fetch(`${API_BASE}/api/admin/supervisors/${deleteSupId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${admin.token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete");

    closeDeleteSupModal();
    await renderSupervisors();
    await fetchDashboardStats();
    toast("Supervisor deleted", `${supName} has been removed`, "success");
  } catch (err) {
    toast("Error", err.message, "error");
  }
}

/* ════════════════════════════════════
   GLOBAL MARK TOGGLES
══════════════════════════════════════ */
let GLOBAL_TOGGLES = {};

async function loadGlobalToggles() {
  const admin = JSON.parse(localStorage.getItem("admin"));
  try {
    const res  = await fetch(`${API_BASE}/api/admin/mark-toggles`, {
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${admin.token}` }
    });
    if (!res.ok) return;
    const data     = await res.json();
    GLOBAL_TOGGLES = data.toggles || {};
  } catch (err) {
    console.error("Failed to load toggles:", err);
    GLOBAL_TOGGLES = {};
  }
  renderGlobalToggles();
}

function renderGlobalToggles() {
  const body = $("#global-toggles-body");
  if (!body) return;

  body.innerHTML = MARKS_SCHEMA.map(sec => `
    <div style="margin-bottom:28px">
      <div style="font-size:.7rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:var(--text-mute);margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid var(--border-soft)">
        ${sec.section}
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px">
        ${sec.items.map(it => {
          const enabled = GLOBAL_TOGGLES[it.key] === true;
          return `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border:1.5px solid var(--border-soft);border-radius:12px;background:var(--surface)">
              <div>
                <div style="font-size:.85rem;font-weight:600;color:var(--text)">${it.label}</div>
                <div style="font-size:.7rem;color:var(--text-mute);margin-top:2px">
                  Max: ${it.max} marks ·
                  <span id="gtoggle-status-${it.key}" style="font-weight:700;color:${enabled ? "var(--success,#15803d)" : "#dc2626"}">
                    ${enabled ? "Open" : "Locked"}
                  </span>
                </div>
              </div>
              <label class="mark-toggle">
                <input type="checkbox" id="gtoggle-${it.key}" ${enabled ? "checked" : ""}
                       onchange="onGlobalToggleChange('${it.key}', this.checked)">
                <span class="toggle-slider"></span>
              </label>
            </div>`;
        }).join("")}
      </div>
    </div>
  `).join("");
}

function onGlobalToggleChange(key, enabled) {
  GLOBAL_TOGGLES[key] = enabled;
  const statusEl = document.getElementById(`gtoggle-status-${key}`);
  if (statusEl) {
    statusEl.textContent = enabled ? "Open" : "Locked";
    statusEl.style.color = enabled ? "var(--success,#15803d)" : "#dc2626";
  }
}

async function saveGlobalToggles() {
  const admin = JSON.parse(localStorage.getItem("admin"));
  try {
    const res  = await fetch(`${API_BASE}/api/admin/mark-toggles`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${admin.token}` },
      body: JSON.stringify({ toggles: GLOBAL_TOGGLES })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");
    toast("Settings saved", "Supervisor mark access updated for all teams", "success");
  } catch (err) {
    toast("Error", err.message, "error");
  }
}

/* ════════════════════════════════════
   DEADLINES
══════════════════════════════════════ */
let DEADLINES_DATA    = [];
let deleteDeadlineId  = null;
let editingDeadlineId = null;

function getDeadlineLabel(d) {
  return d.type === "Other" && d.customName ? d.customName : d.type;
}

function getDeadlineStatus(dueDate) {
  const now      = new Date();
  const due      = new Date(dueDate);
  const diffMs   = due - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffMs < 0)       return { label: "Expired",        color: "#dc2626", bg: "rgba(220,38,38,.1)"   };
  if (diffDays <= 2)    return { label: `${diffDays}d left`, color: "#a16207", bg: "rgba(234,179,8,.12)" };
  return                       { label: `${diffDays}d left`, color: "#15803d", bg: "rgba(34,197,94,.1)"  };
}

async function renderDeadlines() {
  const admin = JSON.parse(localStorage.getItem("admin"));
  const tbody = document.querySelector("#deadlinesTable tbody");
  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--text-mute)">Loading...</td></tr>`;

  try {
    const res  = await fetch(`${API_BASE}/api/deadlines`, {
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${admin.token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");

    DEADLINES_DATA = Array.isArray(data) ? data : [];

    if (!DEADLINES_DATA.length) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-mute)">No deadlines yet. Click "Create Deadline" to add one.</td></tr>`;
      return;
    }

    tbody.innerHTML = DEADLINES_DATA.map(d => {
      const status  = getDeadlineStatus(d.dueDate);
      const label   = getDeadlineLabel(d);
      const dateStr = new Date(d.dueDate).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
      return `
        <tr>
          <td><strong>${label}</strong></td>
          <td>${dateStr} · 11:59 PM</td>
          <td style="max-width:200px;color:var(--text-mute);font-size:.78rem">${d.description || "—"}</td>
          <td>
            <span style="padding:3px 10px;border-radius:6px;font-size:.72rem;font-weight:700;background:${status.bg};color:${status.color}">
              ${status.label}
            </span>
          </td>
          <td>
            <div class="action-row">
              <button class="icon-action" title="Edit" onclick="openEditDeadlineModal('${d._id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button class="icon-action danger" title="Delete" style="color:#dc2626"
                      onclick="openDeleteDeadlineModal('${d._id}','${label.replace(/'/g,"\\'")}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </td>
        </tr>`;
    }).join("");

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#dc2626;padding:20px">${err.message}</td></tr>`;
  }
}

function onDeadlineTypeChange() {
  const val = document.getElementById("deadlineType").value;
  document.getElementById("customNameGroup").style.display = val === "Other" ? "block" : "none";
}

function openDeadlineModal() {
  editingDeadlineId = null;
  document.getElementById("deadlineModalTitle").textContent  = "Create Deadline";
  document.getElementById("deadlineSubmitLabel").textContent = "Create Deadline";
  document.getElementById("editDeadlineId").value    = "";
  document.getElementById("deadlineType").value      = "";
  document.getElementById("deadlineCustomName").value = "";
  document.getElementById("deadlineDesc").value      = "";
  document.getElementById("deadlineDate").value      = "";
  document.getElementById("customNameGroup").style.display = "none";
  setTimeout(() => document.getElementById("deadlineModal").classList.add("open"), 50);
}

function openEditDeadlineModal(id) {
  const d = DEADLINES_DATA.find(x => x._id === id);
  if (!d) return;
  editingDeadlineId = id;
  document.getElementById("deadlineModalTitle").textContent  = "Edit Deadline";
  document.getElementById("deadlineSubmitLabel").textContent = "Save Changes";
  document.getElementById("editDeadlineId").value    = id;
  document.getElementById("deadlineType").value      = d.type;
  document.getElementById("deadlineCustomName").value = d.customName || "";
  document.getElementById("deadlineDesc").value      = d.description || "";
  document.getElementById("deadlineDate").value      = new Date(d.dueDate).toISOString().split("T")[0];
  document.getElementById("customNameGroup").style.display = d.type === "Other" ? "block" : "none";
  setTimeout(() => document.getElementById("deadlineModal").classList.add("open"), 50);
}

function closeDeadlineModal() {
  document.getElementById("deadlineModal").classList.remove("open");
}

async function submitDeadline() {
  const type        = document.getElementById("deadlineType").value;
  const customName  = document.getElementById("deadlineCustomName").value.trim();
  const description = document.getElementById("deadlineDesc").value.trim();
  const dueDate     = document.getElementById("deadlineDate").value;

  if (!type)                          { toast("Missing field", "Please select a deadline type", "error"); return; }
  if (type === "Other" && !customName){ toast("Missing field", "Please enter a custom name",    "error"); return; }
  if (!dueDate)                       { toast("Missing field", "Please select a due date",       "error"); return; }

  const admin  = JSON.parse(localStorage.getItem("admin"));
  const id     = document.getElementById("editDeadlineId").value;
  const url    = id ? `${API_BASE}/api/deadlines/${id}` : `${API_BASE}/api/deadlines`;
  const method = id ? "PUT" : "POST";

  try {
    const res  = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${admin.token}` },
      body: JSON.stringify({ type, customName, description, dueDate })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");

    closeDeadlineModal();
    await renderDeadlines();
    toast(id ? "Deadline updated" : "Deadline created", data.deadline ? getDeadlineLabel(data.deadline) : "", "success");
  } catch (err) {
    toast("Error", err.message, "error");
  }
}

function openDeleteDeadlineModal(id, name) {
  deleteDeadlineId = id;
  document.getElementById("deleteDeadlineName").textContent = name;
  setTimeout(() => document.getElementById("deleteDeadlineModal").classList.add("open"), 50);
}

function closeDeleteDeadlineModal() {
  deleteDeadlineId = null;
  document.getElementById("deleteDeadlineModal").classList.remove("open");
}

async function confirmDeleteDeadline() {
  if (!deleteDeadlineId) return;
  const name  = document.getElementById("deleteDeadlineName").textContent;
  const admin = JSON.parse(localStorage.getItem("admin"));

  try {
    const res  = await fetch(`${API_BASE}/api/deadlines/${deleteDeadlineId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${admin.token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");

    closeDeleteDeadlineModal();
    await renderDeadlines();
    toast("Deadline deleted", name + " removed", "success");
  } catch (err) {
    toast("Error", err.message, "error");
  }
}

/* ════════════════════════════════════
   MODAL — CLICK OUTSIDE + ESC
══════════════════════════════════════ */
$$(".modal-overlay").forEach(overlay => {
  overlay.addEventListener("click", e => {
    if (e.target === overlay) overlay.classList.remove("open");
  });
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") $$(".modal-overlay.open").forEach(m => m.classList.remove("open"));
});

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("searchSupervisors")?.addEventListener("input", e => filterSupervisors(e.target.value));
  document.getElementById("searchTeams")?.addEventListener("input",       e => filterTeams(e.target.value));
  document.getElementById("searchStudents")?.addEventListener("input",    e => filterStudents(e.target.value));

  document.getElementById("supPrefix")?.addEventListener("change", updateSupNamePreview);
  document.getElementById("supName")?.addEventListener("input", updateSupNamePreview);

  function updateSupNamePreview() {
  const prefix  = document.getElementById("supPrefix")?.value;
  const name    = document.getElementById("supName")?.value.trim();
  const preview = document.getElementById("supNamePreview");
  if (!preview) return;
  if (prefix && name) {
    preview.textContent    = `Will appear as: ${formatName(prefix, name)}`;
    preview.style.display  = "block";
  } else {
    preview.textContent    = "";
    preview.style.display  = "none";
  }
}
});

/* ════════════════════════════════════
   PAGINATION HELPER
══════════════════════════════════════ */
function renderPagination(containerId, totalItems, currentPage, perPage, onPageChange) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const totalPages = Math.ceil(totalItems / perPage);
  const start      = Math.min((currentPage - 1) * perPage + 1, totalItems);
  const end        = Math.min(currentPage * perPage, totalItems);

  if (totalPages <= 1) {
    container.innerHTML = totalItems > 0
      ? `<div style="padding:12px 20px;font-size:.76rem;color:var(--text-mute);font-weight:600">Showing all ${totalItems}</div>`
      : "";
    return;
  }

  // Build visible page numbers with ellipsis
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

  const btnStyle = (active) => `
    width:32px;height:32px;border-radius:7px;
    border:1px solid ${active ? "var(--primary)" : "var(--border)"};
    background:${active ? "var(--primary)" : "var(--surface)"};
    color:${active ? "#fff" : "var(--text)"};
    font-size:.78rem;font-weight:${active ? "700" : "600"};
    cursor:pointer;transition:background .15s
  `;

  const numbersHtml = visiblePages.map(p => {
    if (p === "...") return `<span style="width:32px;height:32px;display:grid;place-items:center;color:var(--text-mute);font-size:.82rem">…</span>`;
    return `<button onclick="${onPageChange}(${p})" style="${btnStyle(p === currentPage)}">${p}</button>`;
  }).join("");

  container.innerHTML = `
    <div style="
      display:flex;align-items:center;justify-content:space-between;
      padding:14px 20px;border-top:1px solid var(--border-soft);
      flex-wrap:wrap;gap:10px;background:var(--surface)
    ">
      <span style="font-size:.76rem;color:var(--text-mute);font-weight:600">
        Showing <strong style="color:var(--text)">${start}–${end}</strong> of <strong style="color:var(--text)">${totalItems}</strong>
      </span>
      <div style="display:flex;gap:4px;align-items:center">
        <button onclick="${onPageChange}(${currentPage - 1})"
          ${currentPage === 1 ? "disabled" : ""}
          style="${btnStyle(false)}opacity:${currentPage === 1 ? ".4" : "1"};cursor:${currentPage === 1 ? "not-allowed" : "pointer"}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        ${numbersHtml}
        <button onclick="${onPageChange}(${currentPage + 1})"
          ${currentPage === totalPages ? "disabled" : ""}
          style="${btnStyle(false)}opacity:${currentPage === totalPages ? ".4" : "1"};cursor:${currentPage === totalPages ? "not-allowed" : "pointer"}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>`;
}
/* ════════════════════════════════════
   ADMIN AVATAR UPLOAD
════════════════════════════════════ */
let adminAvatarFileToUpload = null;

function openAdminAvatarModal() {
  const modal   = document.getElementById("adminAvatarModal");
  const modalImg  = document.getElementById("admin-modal-avatar-img");
  const modalInit = document.getElementById("admin-modal-avatar-initials");
  const navImg    = document.getElementById("nav-admin-avatar-img");
  const navInit   = document.getElementById("nav-admin-avatar-initials");

  if (!modal) return;

  // Reset state
  adminAvatarFileToUpload = null;
  const btn   = document.getElementById("admin-avatar-save-btn");
  const errEl = document.getElementById("admin-avatar-error");
  if (btn)   { btn.disabled = true; btn.style.opacity = ".5"; btn.textContent = ""; btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg> Save Photo'; }
  if (errEl) errEl.style.display = "none";

  // Sync preview with current nav avatar
  const hasRealImage = navImg && navImg.style.display === "block" && navImg.src && !navImg.src.endsWith(window.location.href);
  if (hasRealImage) {
    modalImg.src            = navImg.src;
    modalImg.style.display  = "block";
    modalInit.style.display = "none";
  } else {
    modalImg.src            = "";
    modalImg.style.display  = "none";
    modalInit.style.display = "";
    modalInit.textContent   = navInit ? navInit.textContent : "";
  }

  // Reset file input
  const fileInput = document.getElementById("admin-avatar-file-input");
  if (fileInput) fileInput.value = "";

  modal.classList.add("open");
}

function closeAdminAvatarModal() {
  const modal = document.getElementById("adminAvatarModal");
  if (modal) modal.classList.remove("open");
  adminAvatarFileToUpload = null;
}

function handleAdminAvatarDrop(e) {
  e.preventDefault();
  const dz = document.getElementById("admin-avatar-dropzone");
  if (dz) { dz.style.borderColor = "var(--border)"; dz.style.background = ""; }
  const file = e.dataTransfer?.files?.[0];
  if (file) previewAdminAvatar(file);
}

function previewAdminAvatar(file) {
  const errEl = document.getElementById("admin-avatar-error");
  if (errEl) errEl.style.display = "none";
  if (!file) return;

  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) {
    if (errEl) { errEl.textContent = "Only JPG, PNG or WEBP files are allowed."; errEl.style.display = "block"; }
    return;
  }
  if (file.size > 3 * 1024 * 1024) {
    if (errEl) { errEl.textContent = "File must be under 3 MB."; errEl.style.display = "block"; }
    return;
  }

  adminAvatarFileToUpload = file;

  const reader = new FileReader();
  reader.onload = (ev) => {
    const modalImg  = document.getElementById("admin-modal-avatar-img");
    const modalInit = document.getElementById("admin-modal-avatar-initials");
    if (modalImg)  { modalImg.src = ev.target.result; modalImg.style.display = "block"; }
    if (modalInit) modalInit.style.display = "none";
  };
  reader.readAsDataURL(file);

  const btn = document.getElementById("admin-avatar-save-btn");
  if (btn) { btn.disabled = false; btn.style.opacity = "1"; }
}

async function uploadAdminAvatar() {
  if (!adminAvatarFileToUpload) return;

  const admin = JSON.parse(localStorage.getItem("admin"));
  const btn   = document.getElementById("admin-avatar-save-btn");
  const errEl = document.getElementById("admin-avatar-error");

  if (btn)   { btn.innerHTML = "Uploading…"; btn.disabled = true; btn.style.opacity = ".6"; }
  if (errEl) errEl.style.display = "none";

  const formData = new FormData();
  formData.append("avatar", adminAvatarFileToUpload);

  try {
    const res  = await fetch(`${API_BASE}/api/uploads/admin/avatar`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${admin.token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Upload failed");

    const fullUrl = data.avatar_url.startsWith("http")
      ? data.avatar_url
      : `${API_BASE}${data.avatar_url}`;

    setAdminNavAvatar(fullUrl);

    const stored = JSON.parse(localStorage.getItem("admin")) || {};
    stored.avatar_url = fullUrl;
    localStorage.setItem("admin", JSON.stringify(stored));

    closeAdminAvatarModal();
    toast("Profile picture updated ✓", "", "success");
  } catch (err) {
    if (errEl) { errEl.textContent = err.message; errEl.style.display = "block"; }
    if (btn)   { btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg> Save Photo'; btn.disabled = false; btn.style.opacity = "1"; }
  }
}

function setAdminNavAvatar(url) {
  const img  = document.getElementById("nav-admin-avatar-img");
  const init = document.getElementById("nav-admin-avatar-initials");
  if (!img) return;

  if (!url) {
    img.style.display = "none";
    if (init) init.style.display = "";
    return;
  }

  // Resolve relative URLs from the API
  const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;

  const testImg   = new Image();
  testImg.onload  = () => {
    img.src            = fullUrl;
    img.style.display  = "block";
    if (init) init.style.display = "none";
  };
  testImg.onerror = () => {
    img.style.display = "none";
    if (init) init.style.display = "";
  };
  testImg.src = fullUrl;
}

/* ════════════════════════════════════
   SUPERVISOR AVATAR HELPER
══════════════════════════════════════ */
function supAvatar(sup, size = 48, radius = 12) {
  if (!sup.avatar_url) return initials(sup.name);
  const fullUrl = sup.avatar_url.startsWith("http")
    ? sup.avatar_url
    : `http://127.0.0.1:5001${sup.avatar_url}`;
  return `
    <img src="${fullUrl}" alt="${escapeHtml(sup.name)}"
         style="width:${size}px;height:${size}px;object-fit:cover;
                border-radius:${radius}px;display:block"
         onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">
    <span style="display:none;width:${size}px;height:${size}px;
                 border-radius:${radius}px;
                 background:linear-gradient(135deg,var(--primary),var(--secondary));
                 color:#fff;font-weight:700;font-size:${Math.round(size * 0.33)}px;
                 place-items:center">
      ${initials(sup.name)}
    </span>`;
}
/* ════════════════════════════════════
   STUDENT LOOKUP
══════════════════════════════════════ */

function runStudentLookup() {
  const field   = document.getElementById("lookupField")?.value   || "name";
  const query   = (document.getElementById("lookupQuery")?.value  || "").trim().toLowerCase();
  const results = document.getElementById("lookupResults");
  const count   = document.getElementById("lookupResultCount");

  if (!results) return;

  // Need data loaded
  if (!Array.isArray(STUDENTS_DATA) || !STUDENTS_DATA.length) {
    results.innerHTML = `
      <div class="dash-panel">
        <div class="panel-body" style="text-align:center;padding:40px;color:var(--text-mute)">
          No student data loaded yet — go to Students tab first.
        </div>
      </div>`;
    return;
  }

  if (!query) {
    results.innerHTML = `
      <div class="dash-panel">
        <div class="panel-body" style="text-align:center;padding:40px;color:var(--text-mute)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
               stroke-linecap="round" width="48" height="48"
               style="margin:0 auto 16px;display:block;color:var(--border)">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <p style="font-size:.88rem">Enter a search term above to find students</p>
        </div>
      </div>`;
    if (count) count.style.display = "none";
    return;
  }

  // Filter based on selected field
  const matched = STUDENTS_DATA.filter(s => {
    switch (field) {
      case "name":          return matches(s.name, query);
      case "email":         return matches(s.email, query);
      case "student_code":  return matches(s.student_code, query);
      case "team_id":       return matches(s.group?.team_code || s.group?.group_code, query);
      case "project_title": return matches(s.group?.project_title, query);
      case "supervisor":    return matches(s.group?.supervisor?.name, query)
                                || matches(s.group?.supervisor?.sup_code, query);
      default:              return matches(s.name, query);
    }
  });

  // Show count
  if (count) {
    count.textContent  = `${matched.length} student${matched.length !== 1 ? "s" : ""} found`;
    count.style.display = "block";
    count.style.color   = matched.length ? "var(--primary)" : "#dc2626";
  }

  if (!matched.length) {
    results.innerHTML = `
      <div class="dash-panel">
        <div class="panel-body" style="text-align:center;padding:40px;color:var(--text-mute)">
          No students match your search.
        </div>
      </div>`;
    return;
  }

  results.innerHTML = matched.map(s => renderStudentLookupCard(s, query)).join("");
}

function clearStudentLookup() {
  const q = document.getElementById("lookupQuery");
  const c = document.getElementById("lookupResultCount");
  const r = document.getElementById("lookupResults");
  if (q) q.value = "";
  if (c) c.style.display = "none";
  if (r) r.innerHTML = "";
  runStudentLookup();
}

function renderStudentLookupCard(s, query = "") {
  const sup          = s.group?.supervisor;
  const supName      = sup ? formatName(sup.prefix, sup.name) : "Not assigned";
  const supCode      = sup?.sup_code  || "—";
  const supEmail     = sup?.email     || "—";
  const supWhatsapp  = sup?.whatsapp  || "—";
  const teamCode     = s.group?.team_code || s.group?.group_code || "—";
  const projTitle    = s.group?.project_title || "—";
  const category     = s.group?.category || "—";
  const totalMarks   = s.total_marks || 0;
  const cvUrl        = s.cv_url || "";
  const proposalUrl  = s.group?.proposal_url || "";
  const propStatus   = s.group?.proposal_status || "";
  const memberCount  = (s.group?.members?.length || 0) + 1;

  // Proposal status badge
  const propBadge = !proposalUrl
    ? `<span style="font-size:.7rem;color:var(--text-mute);font-style:italic">Not submitted</span>`
    : propStatus === "approved"
      ? `<span style="padding:3px 9px;border-radius:6px;font-size:.7rem;font-weight:700;background:rgba(21,128,61,.1);color:#15803d">✓ Approved</span>`
      : propStatus === "rejected"
        ? `<span style="padding:3px 9px;border-radius:6px;font-size:.7rem;font-weight:700;background:rgba(220,38,38,.08);color:#dc2626">✗ Rejected</span>`
        : `<span style="padding:3px 9px;border-radius:6px;font-size:.7rem;font-weight:700;background:rgba(234,179,8,.1);color:#a16207">⏳ Pending</span>`;

  // Mark color
  const markPct   = Math.round((totalMarks / MAX_TOTAL) * 100);
  const markColor = markPct >= 75 ? "#15803d" : markPct >= 50 ? "#a16207" : "#dc2626";

  return `
    <div class="dash-panel" style="margin-bottom:16px;overflow:hidden">

      <!-- Student Header -->
      <div style="padding:20px 24px;background:linear-gradient(135deg,rgba(0,75,45,.04),rgba(191,161,74,.04));
                  border-bottom:1px solid var(--border-soft);
                  display:flex;align-items:center;gap:16px;flex-wrap:wrap">

        <div style="width:52px;height:52px;border-radius:14px;flex-shrink:0;overflow:hidden;
                    background:linear-gradient(135deg,var(--primary),var(--secondary));
                    display:grid;place-items:center;color:#fff;font-weight:800;font-size:1.1rem">
          ${initials(s.name)}
        </div>

        <div style="flex:1;min-width:180px">
          <div style="font-size:1rem;font-weight:800;color:var(--primary-dark);margin-bottom:3px">
            ${highlightText(s.name, query)}
          </div>
          <div style="font-size:.76rem;color:var(--text-mute)">
            ${highlightText(s.email || "—", query)}
          </div>
          <div style="font-size:.72rem;color:#15803d;font-weight:600;margin-top:3px;
                      display:inline-flex;align-items:center;gap:4px">
            <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11">
              <path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4a7.94 7.94 0 0 0-6.88 11.93L4 20l4.2-1.1a7.93 7.93 0 0 0 3.85.98h.01a7.94 7.94 0 0 0 5.55-13.56zm-5.55 12.21h-.01a6.6 6.6 0 0 1-3.36-.92l-.24-.14-2.49.65.66-2.43-.16-.25a6.6 6.6 0 1 1 5.6 3.09z"/>
            </svg>
            ${s.whatsapp || "—"}
          </div>
        </div>

        <!-- Quick stats pills -->
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
          <span class="id-pill">${highlightText(s.student_code || "—", query)}</span>
          <span class="id-pill gold">${highlightText(teamCode, query)}</span>
          <span style="padding:4px 10px;border-radius:6px;font-size:.72rem;font-weight:700;
                       background:rgba(0,75,45,.08);color:var(--primary)">
            ${s.team_role || "Member"}
          </span>
          <span style="padding:4px 10px;border-radius:6px;font-size:.72rem;font-weight:700;
                       background:rgba(${markColor === '#15803d' ? '21,128,61' : markColor === '#a16207' ? '161,98,7' : '220,38,38'},.1);
                       color:${markColor}">
            ${totalMarks}/${MAX_TOTAL} marks
          </span>
        </div>

        <!-- Action buttons -->
        <div style="display:flex;gap:8px;margin-left:auto">
          ${sup?._id ? `
            <button onclick="openSupDetail('${sup._id}')"
              style="padding:8px 14px;border-radius:9px;font-size:.76rem;font-weight:700;
                     cursor:pointer;border:1px solid rgba(0,75,45,.2);
                     background:rgba(0,75,45,.06);color:var(--primary)">
              View Marks
            </button>` : ""}
          <button onclick="deleteStudent('${s._id}','${(s.name||"").replace(/'/g,"\\'")}')"
            style="padding:8px 14px;border-radius:9px;font-size:.76rem;font-weight:700;
                   cursor:pointer;border:1px solid rgba(220,38,38,.2);
                   background:rgba(220,38,38,.06);color:#dc2626">
            Delete
          </button>
        </div>
      </div>

      <!-- Detail Grid -->
      <div style="padding:20px 24px;display:grid;
                  grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px">

        <!-- Project Info -->
        <div>
          <div style="font-size:.68rem;font-weight:800;text-transform:uppercase;
                      letter-spacing:.08em;color:var(--text-mute);margin-bottom:10px;
                      padding-bottom:6px;border-bottom:1px solid var(--border-soft)">
            Project
          </div>
          <div class="proj-row">
            <span class="proj-key">Title</span>
            <span class="proj-val" style="font-weight:600">
              ${highlightText(projTitle, query)}
            </span>
          </div>
          <div class="proj-row">
            <span class="proj-key">Team Size</span>
            <span class="proj-val">${memberCount} member${memberCount !== 1 ? "s" : ""}</span>
          </div>
          <div class="proj-row">
            <span class="proj-key">Proposal</span>
            <span class="proj-val">
              ${propBadge}
              ${proposalUrl ? `
                <button onclick="viewDoc('${proposalUrl}')"
                  style="margin-left:6px;padding:2px 8px;border-radius:5px;font-size:.66rem;
                         font-weight:700;cursor:pointer;border:1px solid rgba(0,75,45,.2);
                         background:rgba(0,75,45,.06);color:var(--primary)">
                  View
                </button>` : ""}
            </span>
          </div>
        </div>

        <!-- Supervisor Info -->
        <div>
          <div style="font-size:.68rem;font-weight:800;text-transform:uppercase;
                      letter-spacing:.08em;color:var(--text-mute);margin-bottom:10px;
                      padding-bottom:6px;border-bottom:1px solid var(--border-soft)">
            Supervisor
          </div>
          <div class="proj-row">
            <span class="proj-key">Name</span>
            <span class="proj-val" style="font-weight:700;color:var(--primary-dark)">
              ${highlightText(supName, query)}
            </span>
          </div>
          <div class="proj-row">
            <span class="proj-key">SUP ID</span>
            <span class="proj-val"><span class="id-pill">${supCode}</span></span>
          </div>
          <div class="proj-row">
            <span class="proj-val">
          </div>
          <div class="proj-row">
            <span class="proj-key">WhatsApp</span>
            <span class="proj-val">
              ${sup?.whatsapp
                ? `<a href="https://wa.me/${sup.whatsapp.replace(/^0/,'92').replace(/\D/g,'')}"
                      target="_blank"
                      style="color:#15803d;font-weight:600;text-decoration:none;font-size:.8rem">
                     ${sup.whatsapp}
                   </a>`
                : `<span style="color:var(--text-mute)">—</span>`}
            </span>
          </div>
        </div>

        <!-- Documents & Marks -->
        <div>
          <div style="font-size:.68rem;font-weight:800;text-transform:uppercase;
                      letter-spacing:.08em;color:var(--text-mute);margin-bottom:10px;
                      padding-bottom:6px;border-bottom:1px solid var(--border-soft)">
            Documents & Marks
          </div>

          <!-- CV -->
          <div class="proj-row">
            <span class="proj-key">CV</span>
            <span class="proj-val">
              ${cvUrl
                ? `<div class="doc-badge available" style="display:inline-flex">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                          stroke-linecap="round" stroke-linejoin="round" width="13" height="13">
                       <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                       <polyline points="14 2 14 8 20 8"/>
                     </svg>
                     <span class="doc-label">CV</span>
                     <button class="doc-btn view" onclick="viewDoc('${cvUrl}')">
                       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round" width="12" height="12">
                         <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                         <circle cx="12" cy="12" r="3"/>
                       </svg>
                     </button>
                   </div>`
                : `<span style="font-size:.72rem;color:var(--text-mute);font-style:italic">Not uploaded</span>`}
            </span>
          </div>

          <!-- Marks progress bar -->
          <div class="proj-row" style="display:block">
            <span class="proj-key" style="display:block;margin-bottom:6px">Marks Progress</span>
            <div style="display:flex;align-items:center;gap:10px">
              <div style="flex:1;height:8px;background:var(--border-soft);border-radius:4px;overflow:hidden">
                <div style="height:100%;width:${markPct}%;background:${markColor};
                            border-radius:4px;transition:width .6s ease"></div>
              </div>
              <span style="font-size:.76rem;font-weight:700;color:${markColor};white-space:nowrap">
                ${totalMarks} / ${MAX_TOTAL}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>`;
}

/* ════════════════════════════════════
   MAINTENANCE MODE
══════════════════════════════════════ */
async function loadMaintenanceStatus() {
  try {
    const res  = await fetch(`${API_BASE}/api/admin/maintenance`);
    const data = await res.json();
    updateMaintenanceUI(data);
  } catch (err) {
    console.error("Failed to load maintenance status:", err);
  }
}

function updateMaintenanceUI(data) {
  const dot       = document.getElementById("maintenance-status-dot");
  const text      = document.getElementById("maintenance-status-text");
  const toggle    = document.getElementById("maintenance-toggle");
  const body      = document.getElementById("maintenance-detail-body");
  const card      = document.getElementById("maintenance-card");
  const reasonIn  = document.getElementById("maintenance-reason-input");
  const startedEl = document.getElementById("maintenance-started-info");

  if (!dot) return;

  if (data.maintenance_mode) {
    dot.style.background = "#dc2626";
    dot.style.boxShadow  = "0 0 0 4px rgba(220,38,38,.18)";
    text.textContent     = "Site is in MAINTENANCE MODE — only Admin can access";
    text.style.color     = "#dc2626";
    text.style.fontWeight = "700";
    toggle.checked       = true;
    body.style.display   = "block";
    card.style.borderColor = "rgba(220,38,38,.3)";
    card.style.background  = "rgba(220,38,38,.02)";
    reasonIn.value       = data.maintenance_reason || "";

    if (data.maintenance_started_at && startedEl) {
      const started = new Date(data.maintenance_started_at);
      startedEl.textContent = `Started: ${started.toLocaleString()}`;
    }
  } else {
    dot.style.background = "#15803d";
    dot.style.boxShadow  = "0 0 0 4px rgba(21,128,61,.18)";
    text.textContent     = "Site is LIVE — all users have full access";
    text.style.color     = "";
    text.style.fontWeight = "";
    toggle.checked       = false;
    body.style.display   = "none";
    card.style.borderColor = "transparent";
    card.style.background  = "";
  }
}

async function toggleMaintenance(enabled) {
  const admin = JSON.parse(localStorage.getItem("admin"));

  // Confirm before enabling
  if (enabled) {
    const ok = confirm("⚠️ Enable Maintenance Mode?\n\nAll students, supervisors, and the chairman will be locked out of the system. Only you will be able to access the admin dashboard.\n\nContinue?");
    if (!ok) {
      document.getElementById("maintenance-toggle").checked = false;
      return;
    }
  }

  const reason = document.getElementById("maintenance-reason-input")?.value.trim() || "";

  try {
    const res = await fetch(`${API_BASE}/api/admin/maintenance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${admin.token}`,
      },
      body: JSON.stringify({ enabled, reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");

    updateMaintenanceUI(data);
    toast(
      enabled ? "Maintenance Mode ENABLED" : "Maintenance Mode DISABLED",
      enabled ? "All non-admin users are now blocked" : "Site is back online",
      enabled ? "warn" : "success"
    );
  } catch (err) {
    toast("Error", err.message, "error");
    document.getElementById("maintenance-toggle").checked = !enabled;
  }
}

async function updateMaintenanceReason() {
  const admin  = JSON.parse(localStorage.getItem("admin"));
  const reason = document.getElementById("maintenance-reason-input")?.value.trim();

  if (!reason) {
    toast("Empty reason", "Please enter a reason to show users", "warn");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/admin/maintenance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${admin.token}`,
      },
      body: JSON.stringify({ enabled: true, reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");

    updateMaintenanceUI(data);
    toast("Reason updated", "Users will see the new message", "success");
  } catch (err) {
    toast("Error", err.message, "error");
  }
}

/* INTERNSHIP SUBMISSIONS */
let INTERNSHIP_DATA = [];
const INTERNSHIP_PAGE = { current: 1, perPage: 25 };

async function renderInternships() {
  const admin = JSON.parse(localStorage.getItem("admin"));
  const tbody = document.getElementById("internshipTbody");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--text-mute)">Loading…</td></tr>`;

  try {
    const res  = await fetch(`${API_BASE}/api/internship/admin/all`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${admin.token}`
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load");

    INTERNSHIP_DATA = data.data || [];

    // Update badge
    const badge = document.getElementById("internship-badge");
    if (badge) badge.textContent = INTERNSHIP_DATA.length || "";

    INTERNSHIP_PAGE.current = 1;
    renderInternshipPage(1);

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#dc2626;padding:20px">${err.message}</td></tr>`;
  }
}

function renderInternshipPage(page) {
  INTERNSHIP_PAGE.current = page;
  const { perPage } = INTERNSHIP_PAGE;
  const start  = (page - 1) * perPage;
  const slice  = INTERNSHIP_DATA.slice(start, start + perPage);
  renderInternshipTable(slice);
  renderPagination(
    "internshipPagination",
    INTERNSHIP_DATA.length,
    page,
    perPage,
    "renderInternshipPage"
  );
}

function renderInternshipTable(list) {
  const tbody = document.getElementById("internshipTbody");

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-mute)">No internship submissions yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(item => {
    const dateStr = item.createdAt
      ? new Date(item.createdAt).toLocaleDateString("en-PK", {
          day: "numeric", month: "short", year: "numeric"
        })
      : "—";

    const letterBtn = item.acceptance_letter_url
      ? `<button onclick="viewDoc('${item.acceptance_letter_url}')"
           style="display:inline-flex;align-items:center;gap:5px;padding:5px 12px;
                  border-radius:7px;font-size:.74rem;font-weight:700;cursor:pointer;
                  border:1px solid rgba(0,75,45,.2);background:rgba(0,75,45,.06);
                  color:var(--primary)">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" width="13" height="13">
             <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
             <circle cx="12" cy="12" r="3"/>
           </svg>
           View Letter
         </button>`
      : `<span style="font-size:.74rem;color:var(--text-mute);font-style:italic">No file</span>`;

    return `
      <tr>
        <td><strong>${escapeHtml(item.full_name || "—")}</strong></td>
        <td><span style="font-family:monospace;font-size:.82rem">${formatCnic(item.cnic)}</span></td>
        <td><span style="font-size:.8rem">${escapeHtml(item.discipline || "—")}</span></td>
        <td style="font-size:.78rem;color:var(--text-mute)">${dateStr}</td>
<td>${letterBtn}</td>
        <td>
          <button onclick="deleteInternship('${item._id}','${escapeHtml(item.full_name || '')}')"
            style="display:inline-flex;align-items:center;gap:5px;padding:5px 10px;
                   border-radius:7px;font-size:.74rem;font-weight:700;cursor:pointer;
                   border:1px solid rgba(220,38,38,.2);background:rgba(220,38,38,.06);
                   color:#dc2626">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round" width="13" height="13">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            Delete
          </button>
        </td>
      </tr>`;;
  }).join("");
}

async function deleteInternship(id, name) {
  const confirmed = confirm(`Delete internship submission for "${name}"?\n\nThis will permanently remove their record and acceptance letter file. This cannot be undone.`);
  if (!confirmed) return;

  const admin = JSON.parse(localStorage.getItem("admin"));
  try {
    const res = await fetch(`${API_BASE}/api/internship/admin/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${admin.token}`
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete");

    toast("Deleted", `${name}'s submission has been removed`, "success");
    await renderInternships(); 
    await fetchDashboardStats(); 
  } catch (err) {
    toast("Error", err.message, "error");
  }
}
/* GLOBAL DATA */
let SUPERVISORS_DATA = [];
let TEAMS_DATA       = [];
let STUDENTS_DATA    = [];
/* ════════════════════════════════════
   STUDENT VIEW MODAL
══════════════════════════════════════ */
function openStudentViewModal(studentId) {
  const s = STUDENTS_DATA.find(s => s._id === studentId);
  if (!s) return toast("Error", "Student not found", "error");

  const body = document.getElementById("studentViewModalBody");
  if (!body) return;

  const projTitle = s.group?.project_title || "Not assigned";
  const supName   = s.group?.supervisor
    ? formatName(s.group.supervisor.prefix, s.group.supervisor.name)
    : "Not assigned";

  const fieldStyle = `
    width:100%;padding:9px 12px;
    background:#f8faf8;border:1.5px solid var(--border);
    border-radius:9px;font-size:.86rem;color:var(--text);
    font-family:inherit;cursor:default`;

  const labelStyle = `
    display:block;font-size:.7rem;font-weight:700;
    color:var(--text-mute);text-transform:uppercase;
    letter-spacing:.06em;margin-bottom:5px`;

  body.innerHTML = `
    <!-- Avatar + name header -->
      <div>
        <div style="font-weight:800;font-size:1rem;color:var(--primary-dark)">${escapeHtml(s.name)}</div>
        <div style="font-size:.74rem;color:var(--text-mute);margin-top:2px">${escapeHtml(s.email || "—")}</div>
        <span class="id-pill" style="margin-top:4px;display:inline-block">${escapeHtml(s.student_code || "—")}</span>
      </div>
    </div>

    <!-- Personal info: 2 per row -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">

      <div>
        <label style="${labelStyle}">Full Name</label>
        <div style="${fieldStyle}">${escapeHtml(s.name || "—")}</div>
      </div>

      <div>
        <label style="${labelStyle}">Student ID</label>
        <div style="${fieldStyle};font-family:monospace;font-weight:700;color:var(--primary)">
          ${escapeHtml(s.student_code || "—")}
        </div>
      </div>

      <div>
        <label style="${labelStyle}">Email</label>
        <div style="${fieldStyle}">${escapeHtml(s.email || "—")}</div>
      </div>

      <div>
        <label style="${labelStyle}">WhatsApp</label>
        <div style="${fieldStyle}">${escapeHtml(s.whatsapp || "—")}</div>
      </div>

      <div style="grid-column:1/-1">
        <label style="${labelStyle}">Gender</label>
        <div style="${fieldStyle};text-transform:capitalize">${escapeHtml(s.gender || "—")}</div>
      </div>

    </div>

    <!-- Team & Project -->
    <div style="border-top:1px solid var(--border-soft);padding-top:14px;margin-bottom:14px">
      <div style="font-size:.68rem;font-weight:800;text-transform:uppercase;
                  letter-spacing:.08em;color:var(--text-mute);margin-bottom:10px">
        Team &amp; Project
      </div>
      <div style="display:grid;grid-template-columns:1fr;gap:14px">

        <div>
          <label style="${labelStyle}">Supervisor</label>
          <div style="${fieldStyle}">${escapeHtml(supName)}</div>
        </div>

        <div>
          <label style="${labelStyle}">Project Title</label>
          <div style="${fieldStyle}">${escapeHtml(projTitle)}</div>
        </div>

      </div>
    </div>

    <!-- Documents -->
    <div style="border-top:1px solid var(--border-soft);padding-top:14px">
      <div style="font-size:.68rem;font-weight:800;text-transform:uppercase;
                  letter-spacing:.08em;color:var(--text-mute);margin-bottom:10px">
        Documents
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">

        ${s.cv_url ? `
          <button onclick="viewDoc('${s.cv_url}')"
            style="display:inline-flex;align-items:center;gap:6px;padding:8px 14px;
                   border-radius:9px;font-size:.78rem;font-weight:700;cursor:pointer;
                   border:1.5px solid rgba(0,75,45,.2);background:rgba(0,75,45,.06);
                   color:var(--primary)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            View CV
          </button>` : `
          <span style="padding:8px 14px;border-radius:9px;font-size:.78rem;font-weight:600;
                       border:1.5px dashed var(--border);color:var(--text-mute)">
            CV not uploaded
          </span>`}

        ${s.group?.proposal_url ? `
          <button onclick="viewDoc('${s.group.proposal_url}')"
            style="display:inline-flex;align-items:center;gap:6px;padding:8px 14px;
                   border-radius:9px;font-size:.78rem;font-weight:700;cursor:pointer;
                   border:1.5px solid rgba(99,102,241,.25);background:rgba(99,102,241,.06);
                   color:#4f46e5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            View Proposal
          </button>` : `
          <span style="padding:8px 14px;border-radius:9px;font-size:.78rem;font-weight:600;
                       border:1.5px dashed var(--border);color:var(--text-mute)">
            Proposal not submitted
          </span>`}

      </div>
    </div>`;

  document.getElementById("studentViewModal").classList.add("open");
}
function closeStudentViewModal() {
  document.getElementById("studentViewModal").classList.remove("open");
}
/* ════════════════════════════════════
   INTERNSHIP SEARCH
══════════════════════════════════════ */
function filterInternships(query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) {
    renderInternshipPage(1);
    return;
  }
  const filtered = INTERNSHIP_DATA.filter(item =>
    (item.full_name || "").toLowerCase().includes(q)
  );
  renderInternshipTable(filtered);
  const pag = document.getElementById("internshipPagination");
  if (pag) pag.innerHTML = filtered.length
    ? `<div style="padding:12px 20px;font-size:.76rem;color:var(--text-mute);font-weight:600">${filtered.length} result${filtered.length !== 1 ? "s" : ""} found</div>`
    : `<div style="padding:12px 20px;font-size:.76rem;color:var(--text-mute)">No results found</div>`;
}
/* ════════════════════════════════════
   TEAMS PROPOSAL FILTER
══════════════════════════════════════ */
let _activeProposalFilter = "all";

function setProposalFilter(status) {
  _activeProposalFilter = status;

  // Update button styles
  ["all","pending","approved","rejected"].forEach(s => {
    const btn = document.getElementById(`pf-${s}`);
    if (!btn) return;
    btn.className = s === status ? "btn btn-sm btn-primary" : "btn btn-sm btn-ghost";
  });

  applyTeamsFilter();
}

function applyTeamsFilter() {
  const searchQuery = (document.getElementById("searchTeams")?.value || "").trim().toLowerCase();
  let filtered = [...TEAMS_DATA];

  // Proposal status filter
  if (_activeProposalFilter !== "all") {
    filtered = filtered.filter(g =>
      (g.proposal_status || "pending") === _activeProposalFilter
    );
  }

  // Search filter
  if (searchQuery) {
    filtered = filtered.filter(g =>
      matches(g.group_code || g.team_code, searchQuery)
      || matches(g.project_title, searchQuery)
      || matches(g.supervisor?.name, searchQuery)
      || matches(g.supervisor?.sup_code, searchQuery)
    );
  }

  renderTeamsTable(filtered);

  const pag = document.getElementById("teamsPagination");
  if (pag) pag.innerHTML = filtered.length
    ? `<div style="padding:12px 20px;font-size:.76rem;color:var(--text-mute);font-weight:600">${filtered.length} team${filtered.length !== 1 ? "s" : ""} found</div>`
    : `<div style="padding:12px 20px;font-size:.76rem;color:var(--text-mute)">No teams found</div>`;
}

/* ════════════════════════════════════
   GLOBAL REFRESH
══════════════════════════════════════ */
async function refreshDashboard() {
  const icon = document.getElementById("refresh-icon");

  // Spin animation
  if (icon) icon.style.animation = "spin 0.8s linear infinite";

  try {
    await Promise.all([
      fetchDashboardStats(),
      renderSupervisors(),
      renderTeams(),
      renderStudents(),
      renderDeadlines(),
      renderRecentTeams(),
      renderInternships(),
      loadMaintenanceStatus(),
    ]);
    toast("Refreshed", "All data updated", "success");
  } catch (err) {
    toast("Refresh failed", err.message, "error");
  } finally {
    if (icon) icon.style.animation = "";
  }
}
async function initDashboard() {
  displayAdminInfo();
  await fetchDashboardStats();
  await renderSupervisors();
  await renderTeams();
  await renderStudents();
  await loadGlobalToggles();
  await renderDeadlines();
  await renderRecentTeams();
  await loadMaintenanceStatus();
  await renderInternships();
}

initDashboard();