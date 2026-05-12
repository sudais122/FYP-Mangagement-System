/* ════════════════════════════════════
   MARKS SCHEMA
══════════════════════════════════════ */
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

  if (!admin) {
    window.location.href = "./login.html";
    return;
  }

  const navName   = document.getElementById("nav-admin-name");
  const navAvatar = document.getElementById("nav-admin-avatar");
  const greeting  = document.getElementById("admin-banner-greeting");

  if (navName)   navName.textContent   = admin.name;
  if (navAvatar) navAvatar.textContent = initials(admin.name);
  if (greeting)  greeting.textContent  = getAdminGreeting(admin.name);

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
  if (view === "deadlines") renderDeadlines();
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
    const res  = await fetch("http://127.0.0.1:5001/api/admin/stats", {
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${admin.token}` }
    });
    const data = await res.json();
    if (!res.ok) return console.error("Stats fetch failed:", data.message);

    updateDashboardStats(data.stats);
    updateSidebarBadges(data.stats);
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
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

  tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:20px;color:var(--text-mute)">Loading…</td></tr>`;

  try {
    const res  = await fetch("http://127.0.0.1:5001/api/groups", {
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${admin.token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");

    const teams = (Array.isArray(data) ? data : data.groups || []).slice(0, 5);

    if (!teams.length) {
      tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:20px;color:var(--text-mute)">No teams yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = teams.map(g => {
      const code    = g.group_code || g.team_code || "—";
      const title   = g.project_title || "—";
      const supName = g.supervisor?.name || "Unassigned";
      const abbr    = code.slice(-2).toUpperCase();
      const members = 1 + (g.members?.length || 0);

      return `
        <tr>
          <td>
            <div class="team-cell">
              <div class="team-avatar">${abbr}</div>
              <div class="team-info">
                <strong>${title.length > 28 ? title.slice(0, 28) + "…" : title}</strong>
                <span>${members} member${members !== 1 ? "s" : ""}</span>
              </div>
            </div>
          </td>
          <td><span class="id-pill gold">${code}</span></td>
          <td>${supName}</td>
        </tr>`;
    }).join("");

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;color:#dc2626;padding:20px">${err.message}</td></tr>`;
  }
}

/* ════════════════════════════════════
   SUPERVISORS
══════════════════════════════════════ */
async function renderSupervisors() {
  const admin = JSON.parse(localStorage.getItem("admin"));
  const grid  = $("#supervisorCards");
  grid.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-mute)">Loading...</div>`;

  try {
    const res  = await fetch("http://127.0.0.1:5001/api/admin/supervisors", {
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${admin.token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");

    SUPERVISORS_DATA = data;
    renderSupervisorCards(data);
  } catch (err) {
    grid.innerHTML = `<div style="padding:40px;color:#dc2626">Failed: ${err.message}</div>`;
  }
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
        <div class="entity-avatar">${initials(sup.name)}</div>
        <div class="entity-info">
          <strong>${sup.name}</strong>
          <p>${sup.email}</p>
        </div>
      </div>

      <div style="margin-bottom:12px">
        <span class="id-pill">${sup.sup_code || "—"}</span>
        <span class="id-pill" style="
          margin-left:6px;
          background:${sup.is_chairman ? "rgba(191,161,74,.15)" : "rgba(99,102,241,.1)"};
          color:${sup.is_chairman ? "#9a7e2a" : "#4f46e5"}
        ">
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
          onclick="openEditSupModal('${sup._id}','${(sup.name||"").replace(/'/g,"\\'")}','${(sup.email||"").replace(/'/g,"\\'")}','${(sup.whatsapp||"").replace(/'/g,"\\'")}','${sup.is_chairman?"chairman":"supervisor"}')">
          Edit
        </button>

        <button class="btn btn-sm"
          style="flex:1;background:rgba(220,38,38,.08);color:#dc2626;border:1px solid rgba(220,38,38,.2)"
          onclick="event.stopPropagation();openDeleteSupModal('${sup._id}','${(sup.name||"").replace(/'/g,"\\'")}')">
          Delete
        </button>
      </div>
    </div>
  `).join("");
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
    const res  = await fetch(`http://127.0.0.1:5001/api/admin/supervisors/${supId}`, {
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${admin.token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");

    const sup    = data.supervisor;
    const groups = data.groups || [];

    // Fetch marks for every group
    for (const group of groups) {
      try {
        const mRes = await fetch(`http://127.0.0.1:5001/api/admin/marks/group/${group._id}`, {
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

    let html = `
      <div class="sup-detail-header">
        <div class="sup-detail-avatar">${initials(sup.name)}</div>
        <div class="sup-detail-info">
          <h2>${sup.name}</h2>
          <p>${sup.email}</p>
          <div class="sup-detail-stats">
            <div class="sup-detail-stat"><strong>${sup.sup_code || "—"}</strong><span>SUP ID</span></div>
            <div class="sup-detail-stat"><strong>${sup.designation || "Lecturer"}</strong><span>Designation</span></div>
            <div class="sup-detail-stat">📋 <strong>${groups.length}</strong> Teams</div>
            <div class="sup-detail-stat">👥 <strong>${totalStudents}</strong> Students</div>
          </div>
        </div>
      </div>`;

    html += groups.length === 0
      ? `<div class="dash-panel"><div class="panel-body" style="text-align:center;padding:40px;color:var(--text-mute)">No teams assigned yet.</div></div>`
      : groups.map(group => renderTeamBlockFromDB(group)).join("");

    $("#supDetailContent").innerHTML = html;

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

  if (allStudents.length === 0) {
    return `
      <div class="team-block">
        <div class="team-block-head">
          <div class="team-block-head-left">
            <div class="team-avatar">${(group.group_code || "—").slice(-2)}</div>
            <div>
              <h3>${group.group_code || "—"}</h3>
              <p>${group.project_title || "—"} · No students linked</p>
            </div>
          </div>
        </div>
      </div>`;
  }

  const componentHeaders = MARKS_SCHEMA.flatMap(sec =>
    sec.items.map(it => `
      <th title="${sec.section} · max ${it.max}">
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
          <span>${it.label}</span>
          <small style="color:var(--text-mute);font-weight:600">/${it.max}</small>
        </div>
      </th>`)
  ).join("");

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

  return `
    <div class="team-block">
      <div class="team-block-head">
        <div class="team-block-head-left">
          <div class="team-avatar">${(group.group_code || "—").slice(-2)}</div>
          <div>
            <h3>${group.group_code || "—"}</h3>
            <p>${group.project_title || "—"} · ${allStudents.length} students</p>
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

      const res = await fetch("http://127.0.0.1:5001/api/admin/marks", {
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
async function renderTeams() {
  const admin = JSON.parse(localStorage.getItem("admin"));
  const tbody = $("#teamsTable tbody");
  tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:30px;color:var(--text-mute)">Loading...</td></tr>`;

  try {
    const res = await fetch("http://127.0.0.1:5001/api/groups", {
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${admin.token}` }
    });
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) throw new Error("Server returned HTML — route not registered");

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");

    TEAMS_DATA = Array.isArray(data) ? data : data.groups || [];
    renderTeamsTable(TEAMS_DATA);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#dc2626;padding:30px">${err.message}</td></tr>`;
  }
}

/* ══════════════════════════════════════════════════════════════
   PASTE THESE TWO FUNCTIONS into your admin.js
   replacing the existing renderTeamsTable and renderStudentsTable
══════════════════════════════════════════════════════════════ */

/* ────────────────────────────────────────────────────────────
   TEAMS TABLE — now includes Proposal status + approve/reject
──────────────────────────────────────────────────────────────*/
function renderTeamsTable(list) {
  const tbody = $("#teamsTable tbody");
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-mute)">No teams found.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(g => {
    const supName    = g.supervisor ? g.supervisor.name : "Unassigned";
    const teamCode   = g.group_code || g.team_code || "—";
    const proposalUrl    = g.proposal_url    || "";
    const proposalStatus = g.proposal_status || "";

    // Proposal badge
    let proposalBadge = "";
    if (!proposalUrl) {
      proposalBadge = `<span style="font-size:.72rem;color:var(--text-mute);font-style:italic">Not submitted</span>`;
    } else if (proposalStatus === "approved") {
      proposalBadge = `<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:6px;font-size:.7rem;font-weight:700;background:rgba(21,128,61,.1);color:#15803d">✓ Approved</span>`;
    } else if (proposalStatus === "rejected") {
      proposalBadge = `<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:6px;font-size:.7rem;font-weight:700;background:rgba(220,38,38,.08);color:#dc2626">✗ Rejected</span>`;
    } else {
      proposalBadge = `<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:6px;font-size:.7rem;font-weight:700;background:rgba(234,179,8,.1);color:#a16207">⏳ Pending</span>`;
    }

    // Proposal action buttons (only show if submitted)
    let proposalActions = "";
    if (proposalUrl) {
      proposalActions = `
        <div style="display:flex;gap:5px;margin-top:6px;flex-wrap:wrap">
          <button onclick="viewDoc('${proposalUrl}')"
            style="padding:3px 8px;border-radius:5px;font-size:.66rem;font-weight:700;cursor:pointer;border:1px solid rgba(0,75,45,.2);background:rgba(0,75,45,.06);color:var(--primary);transition:all .2s"
            onmouseover="this.style.background='var(--primary)';this.style.color='#fff'"
            onmouseout="this.style.background='rgba(0,75,45,.06)';this.style.color='var(--primary)'">
            View
          </button>
          <button onclick="updateProposalStatus('${g._id}','approved')"
            style="padding:3px 8px;border-radius:5px;font-size:.66rem;font-weight:700;cursor:pointer;border:1px solid rgba(21,128,61,.2);background:rgba(21,128,61,.06);color:#15803d;transition:all .2s"
            onmouseover="this.style.background='#15803d';this.style.color='#fff'"
            onmouseout="this.style.background='rgba(21,128,61,.06)';this.style.color='#15803d'">
            ✓ Approve
          </button>
          <button onclick="updateProposalStatus('${g._id}','rejected')"
            style="padding:3px 8px;border-radius:5px;font-size:.66rem;font-weight:700;cursor:pointer;border:1px solid rgba(220,38,38,.2);background:rgba(220,38,38,.05);color:#dc2626;transition:all .2s"
            onmouseover="this.style.background='#dc2626';this.style.color='#fff'"
            onmouseout="this.style.background='rgba(220,38,38,.05)';this.style.color='#dc2626'">
            ✗ Reject
          </button>
        </div>`;
    }

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
                   stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 4 23 10 17 10"/>
                <polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
            </button>
            <button class="icon-action" title="View team details"
                    onclick="event.stopPropagation();openTeamDetail('${g._id}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                   stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>`;
  }).join("");
}

/* ────────────────────────────────────────────────────────────
   STUDENTS TABLE — proposal column removed
──────────────────────────────────────────────────────────────*/
/* ══════════════════════════════════════════════════════════════
   Replace your existing renderStudentsTable in admin.js
   with this fixed version
══════════════════════════════════════════════════════════════ */

function renderStudentsTable(list, query = "", matchSet = new Set()) {
  const tbody = $("#studentsTable tbody");

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-mute)">No students found.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(s => {
    const isMatch    = query && matchSet.has(s._id);
    const supId      = s.group?.supervisor?._id || "";
    const supName    = s.group?.supervisor?.name || "—";
    const totalMarks = s.total_marks || 0;
    const safeName   = (s.name || "").replace(/'/g, "\\'");
    const whatsapp   = s.whatsapp || "—";
    const cvUrl      = s.cv_url || "";

    // CV badge only — no proposal anything
    const cvBadge = cvUrl
      ? `<div class="doc-badge available" style="display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:8px;font-size:.72rem;font-weight:600;background:rgba(0,75,45,.08);color:var(--primary);border:1px solid rgba(0,75,45,.15)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          CV
          <button class="doc-btn" title="View CV" onclick="viewDoc('${cvUrl}')" style="background:none;border:none;cursor:pointer;padding:0;display:inline-flex;color:inherit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="12" height="12">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>`
      : `<span style="font-size:.72rem;color:var(--text-mute);font-style:italic">No CV</span>`;

    return `
      <tr class="${isMatch ? "search-match" : ""}">

        <td>
          <div class="team-info">
            <strong>${highlightText(s.name, query)}</strong>
            <span style="display:block;font-size:.8rem;color:var(--text-mute)">${s.email || ""}</span>
            <span style="display:block;font-size:.7rem;color:#15803d;font-weight:600;margin-top:2px">
              <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"
                   style="display:inline;vertical-align:middle;margin-right:3px">
                <path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4a7.94 7.94 0 0 0-6.88 11.93L4 20l4.2-1.1a7.93 7.93 0 0 0 3.85.98h.01a7.94 7.94 0 0 0 5.55-13.56zm-5.55 12.21h-.01a6.6 6.6 0 0 1-3.36-.92l-.24-.14-2.49.65.66-2.43-.16-.25a6.6 6.6 0 1 1 5.6 3.09z"/>
              </svg>
              ${whatsapp}
            </span>
          </div>
        </td>

        <td><span class="id-pill">${highlightText(s.student_code || "—", query)}</span></td>

        <td style="font-weight:600;color:var(--text)">${highlightText(supName, query)}</td>

        <td>
          <strong style="font-family:monospace;color:var(--primary)">
            ${totalMarks}<span style="color:var(--text-mute);font-weight:500">/${MAX_TOTAL}</span>
          </strong>
        </td>

        <td>${cvBadge}</td>

        <td>
          <div style="display:flex;flex-direction:row;gap:6px;align-items:center">
            <button class="icon-action" title="View marks"
              onclick="${supId
                ? `openSupDetail('${supId}')`
                : `toast('No supervisor','Student is not in a team yet','warn')`}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                   stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="icon-action" title="Delete student" style="color:#dc2626"
              onclick="deleteStudent('${s._id}','${safeName}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                   stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
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
    ? `${currentSup.name} (${currentSup.sup_code})`
    : "Unassigned";

  const select = $("#newSup");
  select.innerHTML = '<option value="">— Choose a supervisor —</option>' +
    SUPERVISORS_DATA
      .filter(s => s._id !== currentSup?._id)
      .map(s => `<option value="${s._id}">${s.name} · ${s.sup_code}</option>`)
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
    const res  = await fetch(`http://127.0.0.1:5001/api/groups/${reassignTeamId}/reassign`, {
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
async function renderStudents() {
  const admin = JSON.parse(localStorage.getItem("admin"));
  const tbody = $("#studentsTable tbody");
  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-mute)">Loading...</td></tr>`;

  try {
    const res  = await fetch("http://127.0.0.1:5001/api/admin/students", {
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${admin.token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");

    STUDENTS_DATA = Array.isArray(data) ? data : data.students || [];
    renderStudentsTable(STUDENTS_DATA);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#dc2626;padding:30px">${err.message}</td></tr>`;
  }
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
    const supName          = s.group?.supervisor?.name || "—";
    const totalMarks       = s.total_marks || 0;
    const safeName         = (s.name || "").replace(/'/g, "\\'");
    const whatsapp         = s.whatsapp || "—";
    const cvUrl            = s.cv_url || "";
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
          <div class="action-row">
            <button class="icon-action" title="View supervisor"
              onclick="${supId ? `openSupDetail('${supId}')` : `toast('No supervisor','Student is not in a team yet','warn')`}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                   stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="icon-action danger" title="Delete student" style="color:#dc2626"
              onclick="deleteStudent('${s._id}','${safeName}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                   stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
            </button>
          </div>
        </td>

      </tr>`;
  }).join("");
}

/* ════════════════════════════════════
   DOCUMENT BADGES
══════════════════════════════════════ */
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
      <button class="doc-btn dl" title="Download ${label}" onclick="downloadDoc('${url}','${studentName}_${label}')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      </button>
    </div>`;
}

function viewDoc(url) {
  if (!url) return toast("No document", "File not available", "warn");
  window.open(`http://127.0.0.1:5001${url}`, "_blank", "noopener");
}

function downloadDoc(url, filename) {
  if (!url) return toast("No document", "File not available", "warn");
  const a = document.createElement("a");
  a.href     = `http://127.0.0.1:5001${url}`;
  a.download = (filename || "document").replace(/[^\w\-]/g, "_");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/* ════════════════════════════════════
   PROPOSAL STATUS
══════════════════════════════════════ */
async function updateProposalStatus(groupId, status) {
  if (!groupId) return;

  let reason = "";
  if (status === "rejected") {
    reason = prompt("Enter rejection reason (optional):");
    if (reason === null) return; // cancelled
  }

  const admin = JSON.parse(localStorage.getItem("admin"));
  try {
    const res  = await fetch(`http://127.0.0.1:5001/api/groups/${groupId}/proposal-status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${admin.token}` },
      body: JSON.stringify({ status, reason })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");

    toast(
      status === "approved" ? "Proposal Approved ✓" : "Proposal Rejected",
      data.message || "",
      status === "approved" ? "success" : "warn"
    );
    await renderStudents();
  } catch (err) {
    toast("Error", err.message, "error");
  }
}

/* ════════════════════════════════════
   DELETE STUDENT
══════════════════════════════════════ */
async function deleteStudent(studentId, studentName) {
  if (!confirm(`Delete ${studentName}?\n\nThis will also remove them from their team. If they're the team leader, the entire team will be deleted.`)) return;

  const admin = JSON.parse(localStorage.getItem("admin"));
  try {
    const res  = await fetch(`http://127.0.0.1:5001/api/admin/student/${studentId}`, {
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
  if (!Array.isArray(SUPERVISORS_DATA)) return;
  const q       = (query || "").trim().toLowerCase();
  const matched = [];
  const rest    = [];

  SUPERVISORS_DATA.forEach(sup => {
    const hit = !q
      || (sup.name    || "").toLowerCase().includes(q)
      || (sup.sup_code|| "").toLowerCase().includes(q)
      || (sup.email   || "").toLowerCase().includes(q);
    (hit ? matched : rest).push(sup);
  });

  const grid = $("#supervisorCards");
  if (!SUPERVISORS_DATA.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;padding:40px;text-align:center;color:var(--text-mute)">No supervisors found.</div>`;
    return;
  }

  grid.innerHTML = [...matched, ...rest].map(sup => {
    const isMatch = q && matched.some(m => m._id === sup._id);
    return `
      <div class="entity-card ${isMatch ? "search-match" : ""}">
        <div class="entity-card-head">
          <div class="entity-avatar">${initials(sup.name)}</div>
          <div class="entity-info">
            <strong>${highlightText(sup.name || "", q)}</strong>
            <p>${highlightText(sup.email || "", q)}</p>
          </div>
        </div>
        <div style="margin-bottom:12px">
          <span class="id-pill">${highlightText(sup.sup_code || "—", q)}</span>
          <span class="id-pill" style="margin-left:6px;background:${sup.is_chairman ? "rgba(191,161,74,.15)" : "rgba(99,102,241,.1)"};color:${sup.is_chairman ? "#9a7e2a" : "#4f46e5"}">
            ${sup.is_chairman ? "Chairman / HOD" : (sup.designation || "Supervisor")}
          </span>
        </div>
        <div class="entity-stats">
          <div class="entity-stat-cell"><strong>${sup.teamCount || 0}</strong><span>Teams</span></div>
          <div class="entity-stat-cell"><strong>${highlightText(sup.whatsapp || "—", q)}</strong><span>WhatsApp</span></div>
        </div>
        <div style="display:flex;gap:8px;margin-top:12px">
          <button class="btn btn-ghost btn-sm" style="flex:1" onclick="openSupDetail('${sup._id}')">View</button>
          <button class="btn btn-sm" style="flex:1;background:rgba(59,130,246,.08);color:#2563eb;border:1px solid rgba(59,130,246,.2)"
            onclick="openEditSupModal('${sup._id}','${(sup.name||"").replace(/'/g,"\\'")}','${(sup.email||"").replace(/'/g,"\\'")}','${(sup.whatsapp||"").replace(/'/g,"\\'")}','${sup.is_chairman?"chairman":"supervisor"}')">Edit</button>
          <button class="btn btn-sm" style="flex:1;background:rgba(220,38,38,.08);color:#dc2626;border:1px solid rgba(220,38,38,.2)"
            onclick="event.stopPropagation();openDeleteSupModal('${sup._id}','${(sup.name||"").replace(/'/g,"\\'")}')">Delete</button>
        </div>
      </div>`;
  }).join("");
}

function filterTeams(query) {
  if (!Array.isArray(TEAMS_DATA)) return;
  const q       = (query || "").trim().toLowerCase();
  const matched = [], rest = [];

  TEAMS_DATA.forEach(g => {
    const hit = !q
      || matches(g.group_code || g.team_code, q)
      || matches(g.project_title, q)
      || matches(g.supervisor?.name, q)
      || matches(g.supervisor?.sup_code, q);
    (hit ? matched : rest).push(g);
  });

  const matchSet = new Set(matched.map(g => g._id));
  const tbody    = $("#teamsTable tbody");

  tbody.innerHTML = [...matched, ...rest].map(g => {
    const supName  = g.supervisor ? g.supervisor.name : "Unassigned";
    const teamCode = g.group_code || g.team_code || "—";
    const isMatch  = q && matchSet.has(g._id);
    return `
      <tr class="${isMatch ? "search-match" : ""}">
        <td><span class="id-pill gold">${highlightText(teamCode, q)}</span></td>
        <td>${highlightText(g.project_title || "—", q)}</td>
        <td><span style="font-weight:600;color:var(--text)">${highlightText(supName, q)}</span></td>
        <td>
          <div class="action-row">
            <button class="icon-action" title="Reassign supervisor" onclick="event.stopPropagation();openReassignModal('${g._id}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
            </button>
            <button class="icon-action" title="View team details" onclick="event.stopPropagation();openTeamDetail('${g._id}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>`;
  }).join("");
}

function filterStudents(query) {
  if (!Array.isArray(STUDENTS_DATA)) return;
  const q       = (query || "").trim().toLowerCase();
  const matched = [], rest = [];

  STUDENTS_DATA.forEach(s => {
    const hit = !q
      || matches(s.name, q)
      || matches(s.email, q)
      || matches(s.student_code, q);
    (hit ? matched : rest).push(s);
  });

  const matchSet = new Set(matched.map(s => s._id));
  renderStudentsTable([...matched, ...rest], q, matchSet);
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
  $("#supName").value  = "";
  $("#supEmail").value = "";
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

  const name       = $("#supName").value.trim();
  const email      = $("#supEmail").value.trim();
  const pwd        = $("#supPassword").value.trim();
  const whatsapp   = $("#supWhatsapp")?.value.trim()   || "";
  const isChairman = $("#supRole")?.value === "chairman";

  if (!name || !email || !pwd) {
    toast("Missing fields", "Name, email and password are required", "error");
    return;
  }

  try {
    const res  = await fetch("http://127.0.0.1:5001/api/admin/supervisors", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${admin.token}` },
      body: JSON.stringify({ name, email, password: pwd, whatsapp, is_chairman: isChairman })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    toast("Success", "Supervisor created successfully", "success");
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
function openEditSupModal(id, name, email, whatsapp, role) {
  document.getElementById("editSupId").value       = id;
  document.getElementById("editSupName").value     = name;
  document.getElementById("editSupEmail").value    = email;
  document.getElementById("editSupWhatsapp").value = whatsapp;
  document.getElementById("editSupRole").value     = role;
  setTimeout(() => document.getElementById("editSupModal").classList.add("open"), 10);
}

function closeEditSupModal() {
  document.getElementById("editSupModal").classList.remove("open");
}

async function submitEditSupervisor() {
  const id       = document.getElementById("editSupId").value;
  const name     = document.getElementById("editSupName").value.trim();
  const email    = document.getElementById("editSupEmail").value.trim();
  const whatsapp = document.getElementById("editSupWhatsapp").value.trim();
  const role     = document.getElementById("editSupRole").value;

  if (!name || !email) { toast("Missing fields", "Name and email are required", "error"); return; }

  const admin = JSON.parse(localStorage.getItem("admin"));
  try {
    const res  = await fetch(`http://127.0.0.1:5001/api/admin/supervisors/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${admin.token}` },
      body: JSON.stringify({ name, email, whatsapp, is_chairman: role === "chairman" })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update");

    closeEditSupModal();
    await renderSupervisors();
    toast("Supervisor updated", `${name} has been updated`, "success");
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
    const res  = await fetch(`http://127.0.0.1:5001/api/admin/supervisors/${deleteSupId}`, {
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
    const res  = await fetch("http://127.0.0.1:5001/api/admin/mark-toggles", {
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
    const res  = await fetch("http://127.0.0.1:5001/api/admin/mark-toggles", {
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
    const res  = await fetch("http://127.0.0.1:5001/api/deadlines", {
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
  const url    = id ? `http://127.0.0.1:5001/api/deadlines/${id}` : "http://127.0.0.1:5001/api/deadlines";
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
    const res  = await fetch(`http://127.0.0.1:5001/api/deadlines/${deleteDeadlineId}`, {
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
});

/* ════════════════════════════════════
   GLOBAL DATA + INIT
══════════════════════════════════════ */
let SUPERVISORS_DATA = [];
let TEAMS_DATA       = [];
let STUDENTS_DATA    = [];

async function initDashboard() {
  displayAdminInfo();
  await fetchDashboardStats();
  await renderSupervisors();
  await renderTeams();
  await renderStudents();
  await loadGlobalToggles();
  await renderDeadlines();
  await renderRecentTeams();
}

initDashboard();