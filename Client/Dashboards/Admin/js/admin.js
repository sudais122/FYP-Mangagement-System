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

function makeStudent(id, name, teamId, marks) {
  return { id, name, teamId, marks };
}
function studentTotal(s) {
  return Object.values(s.marks).reduce((a, b) => a + (Number(b) || 0), 0);
}

/* ════════════════════════════════════
   HELPERS
══════════════════════════════════════ */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const initials = (s) =>
  s
    .split(" ")
    .filter((p) => p && /[A-Za-z]/.test(p[0]))
    .slice(-2)
    .map((p) => p[0].toUpperCase())
    .join("");
const supById = (id) =>
  supervisors.find((s) => s.id === id) || { name: "—", id: "—", email: "" };
const teamById = (id) =>
  teams.find((t) => t.id === id) || { id: "—", members: 0 };
const studentsByTeam = (teamId) => students.filter((s) => s.teamId === teamId);
const teamsBySupervisor = (supId) => teams.filter((t) => t.supId === supId);

function generateSupId() {
  const list = SUPERVISORS_DATA || [];
  if (!list.length) {
    const year = new Date().getFullYear();
    return `SUP-${year}0001`;
  }
  const year = new Date().getFullYear();
  const numbers = list
    .map(s => {
      const code = s.sup_code || "";
      const match = code.match(/SUP-\d{4}(\d+)/);
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

  // Shuffle
  pwd = pwd.split("").sort(() => Math.random() - 0.5).join("");

  $("#supPassword").value = pwd;
  $("#pwdHelp").textContent = "✓ Password generated — copy it before saving";
  $("#pwdHelp").className = "form-help success";
}

function toast(message, subtitle, type = "success") {
  const wrap = $("#toastWrap");
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  const icons = {
    success:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>',
    error:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>',
  };
  t.innerHTML = `<div class="toast-icon">${icons[type] || icons.success}</div><div class="toast-text"><strong>${message}</strong><span>${subtitle}</span></div>`;
  wrap.appendChild(t);
  requestAnimationFrame(() => t.classList.add("show"));
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 400);
  }, 3500);
}

/* ════════════════════════════════════
   VIEW ROUTING
══════════════════════════════════════ */
function switchView(view) {
  $$(".view").forEach((v) => v.classList.remove("active"));
  $$(".nav-item").forEach((n) => n.classList.remove("active"));
  const target = $(`#view-${view}`);
  if (target) target.classList.add("active");
  $$(`.nav-item[data-view="${view}"]`).forEach((n) =>
    n.classList.add("active"),
  );
  $("#sidebar").classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
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
   RENDER: SUPERVISORS
══════════════════════════════════════ */
async function renderSupervisors() {
  const admin = JSON.parse(localStorage.getItem("admin"));
  const grid  = $("#supervisorCards");
  grid.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-mute)">Loading...</div>`;

  try {
    const res = await fetch("http://127.0.0.1:5001/api/supervisors", {
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

  if (!list.length) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;padding:40px;text-align:center;color:var(--text-mute)">
        No supervisors found.
      </div>`;
    return;
  }

  grid.innerHTML = list.map(sup => `
    <div 
      class="entity-card"
      data-chairman="${sup.is_chairman === true}"
      onclick="openSupDetail('${sup._id}')"
    >
      <div class="entity-card-head">
        <div class="entity-avatar">${initials(sup.name)}</div>

        <div class="entity-info">
          <strong>${sup.name}</strong>
          <p>${sup.email}</p>
        </div>
      </div>

      <div style="margin-bottom:12px">
        <span class="id-pill">${sup.sup_code || "—"}</span>

        <span 
          class="id-pill"
          style="
            margin-left:6px;
            background:${sup.is_chairman
              ? 'rgba(191,161,74,.15)'
              : 'rgba(99,102,241,.1)'};
            color:${sup.is_chairman
              ? '#9a7e2a'
              : '#4f46e5'}
          "
        >
          ${sup.is_chairman
            ? "Chairman / HOD"
            : sup.designation || "Supervisor"}
        </span>
      </div>

      <div class="entity-stats">
        <div class="entity-stat-cell">
          <strong>${sup.teamCount || 0}</strong>
          <span>Teams</span>
        </div>

        <div class="entity-stat-cell">
          <strong style="display:inline-flex;align-items:center;gap:4px">
            <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13" style="color:#15803d">
              <path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4a7.94 7.94 0 0 0-6.88 11.93L4 20l4.2-1.1a7.93 7.93 0 0 0 3.85.98h.01a7.94 7.94 0 0 0 5.55-13.56zm-5.55 12.21h-.01a6.6 6.6 0 0 1-3.36-.92l-.24-.14-2.49.65.66-2.43-.16-.25a6.6 6.6 0 1 1 5.6 3.09z"/>
            </svg>

            ${sup.whatsapp || "—"}
          </strong>

          <span>WhatsApp</span>
        </div>
      </div>

      <div style="text-align:center;font-size:.72rem;color:var(--secondary);font-weight:700;margin-top:10px">
        Click to view teams →
      </div>
    </div>
  `).join("");
}
/* ════════════════════════════════════
   DISPLAY LOGGED-IN ADMIN INFO
══════════════════════════════════════ */
function displayAdminInfo() {
  const admin = JSON.parse(localStorage.getItem("admin"));
  
  if (!admin) {
    // If no admin in localStorage, redirect to login
    window.location.href = "../../Auth/login.html";
    return;
  }

  // Update navbar user info
  const navUserInfo = document.querySelector(".nav-user-info strong");
  if (navUserInfo) {
    navUserInfo.textContent = admin.name;
  }

  // Update navbar avatar initials
  const navAvatar = document.querySelector(".nav-avatar");
  if (navAvatar) {
    navAvatar.textContent = initials(admin.name);
  }

  // Update banner welcome message
  const bannerTitle = document.querySelector(".banner-content h2");
  if (bannerTitle) {
    bannerTitle.textContent = `Welcome back, ${admin.name}`;
  }
}

/* ════════════════════════════════════
   SUPERVISOR DETAIL VIEW
══════════════════════════════════════ */
async function openSupDetail(supId) {
  const admin = JSON.parse(localStorage.getItem("admin"));

  // Show detail view immediately with loading state
  $$(".view").forEach(v => v.classList.remove("active"));
  $("#view-sup-detail").classList.add("active");
  $("#supDetailContent").innerHTML = `
    <div style="padding:60px 20px;text-align:center;color:var(--text-mute)">
      Loading supervisor details...
    </div>`;

  try {
    const res = await fetch(`http://127.0.0.1:5001/api/supervisors/${supId}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${admin.token}`
      }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");

    const sup    = data.supervisor;
    const groups = data.groups || [];

    // ─── NEW: fetch marks for every group ───
    for (const group of groups) {
      try {
          const mRes = await fetch(`http://127.0.0.1:5001/api/admin/marks/group/${group._id}`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${admin.token}`
          }
        });
        if (!mRes.ok) continue;

        const marksData = await mRes.json();
        const marksList = Array.isArray(marksData) ? marksData
                       : (Array.isArray(marksData?.marks) ? marksData.marks : []);

        // Attach marks to each student in the group
        const allStudents = [
          group.leader,
          ...(group.members || [])
        ].filter(Boolean);

        allStudents.forEach(student => {
          const studentRefId = student._id;
          const markRecord = marksList.find(m => {
            const ref = (typeof m.student === "string") ? m.student : m.student?._id;
            return ref === studentRefId;
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
      } catch (err) {
        console.warn(`Could not load marks for ${group.group_code}:`, err);
      }
    }
    // ─── END NEW ───

    const totalStudents = groups.reduce((sum, g) =>
      sum + (g.members?.length || 0) + (g.leader ? 1 : 0), 0);

    let html = `
      <div class="sup-detail-header">
        <div class="sup-detail-avatar">${initials(sup.name)}</div>
        <div class="sup-detail-info">
          <h2>${sup.name}</h2>
          <p>${sup.email}</p>
          <div class="sup-detail-stats">
            <div class="sup-detail-stat">
              <strong>${sup.sup_code || "—"}</strong>
              <span>SUP ID</span>
            </div>
            <div class="sup-detail-stat">
              <strong>${sup.designation || "Lecturer"}</strong>
              <span>Designation</span>
            </div>
            <div class="sup-detail-stat">
              📋 <strong>${groups.length}</strong> Teams
            </div>
            <div class="sup-detail-stat">
              👥 <strong>${totalStudents}</strong> Students
            </div>
          </div>
        </div>
      </div>`;

    if (groups.length === 0) {
      html += `
        <div class="dash-panel">
          <div class="panel-body" style="text-align:center;padding:40px;color:var(--text-mute)">
            <p>No teams assigned to this supervisor yet.</p>
          </div>
        </div>`;
    } else {
      html += groups.map(group => renderTeamBlockFromDB(group)).join("");
    }

    $("#supDetailContent").innerHTML = html;

  } catch (err) {
    console.error(err);
    $("#supDetailContent").innerHTML = `
      <div style="padding:40px;text-align:center;color:#dc2626">
        Failed to load: ${err.message}
      </div>`;
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ════════════════════════════════════
   RENDER TEAM BLOCK FROM DB
══════════════════════════════════════ */
function renderTeamBlockFromDB(group) {
  const leader  = group.leader;
  const members = group.members || [];

  const allStudents = [
    leader ? { ...leader, role: "Leader" } : null,
    ...members.map(m => ({ ...m, role: "Member" }))
  ].filter(Boolean);

  if (allStudents.length === 0) {
    return `
      <div class="team-block">
        <div class="team-block-head">
          <div class="team-block-head-left">
            <div class="team-avatar">${(group.group_code || group.team_code || "—").slice(-2)}</div>
            <div>
              <h3>${group.group_code || group.team_code || "—"}</h3>
              <p>${group.project_title || "—"} · No students linked</p>
            </div>
          </div>
        </div>
      </div>`;
  }

  // Simple headers — no toggles
  const componentHeaders = MARKS_SCHEMA.flatMap(sec =>
    sec.items.map(it => `
      <th title="${sec.section} · max ${it.max}">
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
          <span>${it.label}</span>
          <small style="color:var(--text-mute);font-weight:600">/${it.max}</small>
        </div>
      </th>`)
  ).join("");

  // ✅ FIX: Move cells INSIDE the rows loop
  const rows = allStudents.map(s => {
    const cells = MARKS_SCHEMA.flatMap(sec =>
      sec.items.map(it => {
        const savedValue = s.marks?.[it.key];
        const displayValue = (savedValue !== null && savedValue !== undefined) ? savedValue : "";
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
            <h3>${group.group_code || group.team_code || "—"}</h3>
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

async function renderTeams() {
  const admin = JSON.parse(localStorage.getItem("admin"));
  const tbody = $("#teamsTable tbody");
  tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:30px;color:var(--text-mute)">Loading...</td></tr>`;

  try {
    const res = await fetch("http://127.0.0.1:5001/api/groups", {
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${admin.token}` }
    });

    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      throw new Error("Server returned HTML — route not registered");
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");

    TEAMS_DATA = Array.isArray(data) ? data : data.groups || [];
    renderTeamsTable(TEAMS_DATA);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#dc2626;padding:30px">${err.message}</td></tr>`;
  }
}

function renderTeamsTable(list) {
  const tbody = $("#teamsTable tbody");
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--text-mute)">No teams found.</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(g => {
    const sup      = g.supervisor;
    const supName  = sup ? sup.name : "Unassigned";
    const teamCode = g.group_code || g.team_code || "—";
    return `
      <tr>
        <td><span class="id-pill gold">${teamCode}</span></td>
        <td>${g.project_title || "—"}</td>
        <td><span style="font-weight:600;color:var(--text)">${supName}</span></td>
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

// Open team detail — fetches the team's supervisor and shows their detail page
async function openTeamDetail(teamId) {
  const team = TEAMS_DATA.find(t => t._id === teamId);
  if (!team) {
    toast("Error", "Team not found", "error");
    return;
  }
  if (team.supervisor && team.supervisor._id) {
    openSupDetail(team.supervisor._id);
  } else {
    toast("No supervisor", "This team has no supervisor assigned yet", "warn");
  }
}


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

async function confirmReassign() {
  const newSupId = $("#newSup").value;
  if (!newSupId) {
    toast("Select a supervisor", "Please choose a new supervisor", "error");
    return;
  }

  const admin = JSON.parse(localStorage.getItem("admin"));
  try {
    const res = await fetch(`http://127.0.0.1:5001/api/groups/${reassignTeamId}/reassign`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${admin.token}` },
      body: JSON.stringify({ supervisor_id: newSupId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    closeReassignModal();
    await renderTeams();
    await renderSupervisors();
    toast("Supervisor reassigned", `Updated successfully`, "success");
  } catch (err) {
    toast("Error", err.message, "error");
  }
}

/* Live mark validation + total update */
function onMarkChange(input) {
  const max = parseInt(input.dataset.max);
  let val = parseInt(input.value);

  if (input.value === "") {
    input.classList.remove("invalid");
    updateStudentTotal(input.dataset.student);
    return;
  }

  if (isNaN(val)) val = 0;
  if (val < 0) val = 0;
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
  if (el) {
    el.innerHTML = `${total}<span class="out">/${MAX_TOTAL}</span>`;
  }
}

// Update saveTeamMarks to show real time total after backend confirms
async function saveTeamMarks(groupId) {
  const admin = JSON.parse(localStorage.getItem("admin"));
  const inputs = document.querySelectorAll(`.mark-input[data-group="${groupId}"]`);

  const marksByStudent = {};
  inputs.forEach(inp => {
    const sid = inp.dataset.student;
    const key = inp.dataset.key;
    if (!marksByStudent[sid]) marksByStudent[sid] = {};
    if (inp.value !== "") {
      marksByStudent[sid][key] = parseInt(inp.value) || 0;
    }
  });

  try {
    for (const studentId in marksByStudent) {
      const marks = marksByStudent[studentId];

      const monthly = {}, submissions = {}, viva = {}, documentation = {};

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
        const data = await res.json();
        throw new Error(data.message || "Save failed");
      }

      const data = await res.json();

      const totalEl = document.getElementById(`total-${studentId}`);
      if (totalEl && data.total !== undefined) {
        totalEl.innerHTML = `${data.total}<span class="out">/${MAX_TOTAL}</span>`;
      }
    }

    toast("Saved", `Marks saved for ${Object.keys(marksByStudent).length} students`, "success");

  } catch (err) {
    console.error(err);
    toast("Error", err.message, "error");
  }
}

/* ════════════════════════════════════
   RENDER: STUDENTS
══════════════════════════════════════ */
async function renderStudents() {
  const admin = JSON.parse(localStorage.getItem("admin"));
  const tbody = $("#studentsTable tbody");
  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--text-mute)">Loading...</td></tr>`;

  try {
    const res = await fetch("http://127.0.0.1:5001/api/admin/students", {
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${admin.token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");

    STUDENTS_DATA = Array.isArray(data) ? data : data.students || [];
    renderStudentsTable(STUDENTS_DATA);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#dc2626;padding:30px">${err.message}</td></tr>`;
  }
}
/* ════════════════════════════════════
   DOCUMENT BADGES — CV / Proposal
══════════════════════════════════════ */
/* ════════════════════════════════════
   DOCUMENT BADGES — CV / Proposal
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
  window.open(url, "_blank", "noopener");
}

function downloadDoc(url, filename) {
  if (!url) return toast("No document", "File not available", "warn");
  // Cloudinary trick: fl_attachment forces download instead of inline preview
  const downloadUrl = url.replace("/upload/", "/upload/fl_attachment/");
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = (filename || "document").replace(/[^\w\-]/g, "_");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function viewDoc(url) {
  if (!url) return toast("No document", "File not available", "warn");
  window.open(url, "_blank", "noopener");
}

function downloadDoc(url, filename) {
  if (!url) return toast("No document", "File not available", "warn");
  // Cloudinary trick: fl_attachment forces download instead of inline preview
  const downloadUrl = url.replace("/upload/", "/upload/fl_attachment/");
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = (filename || "document").replace(/[^\w\-]/g, "_");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}


function toggleMarkEnabled(groupId, key, enabled) {
  // Update the status label under the toggle
  const statusEl = document.getElementById(`toggle-status-${groupId}-${key}`);
  if (statusEl) {
    statusEl.textContent = enabled ? "Open" : "Locked";
    statusEl.style.color = enabled ? "var(--success, #15803d)" : "var(--danger, #dc2626)";
  }

  // Save toggle state to backend so supervisor sees it
  saveMarkToggle(groupId, key, enabled);

  toast(
    enabled ? "Mark unlocked" : "Mark locked",
    `Supervisor ${enabled ? "can now edit" : "cannot edit"} this mark`,
    enabled ? "success" : "warn"
  );
}

// Send toggle state to backend
async function saveMarkToggle(groupId, key, enabled) {
  const admin = JSON.parse(localStorage.getItem("admin"));
  try {
    await fetch(`http://127.0.0.1:5001/api/admin/mark-toggle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${admin.token}`
      },
      body: JSON.stringify({ group_id: groupId, mark_key: key, enabled })
    });
  } catch (err) {
    console.error("Failed to save toggle:", err);
  }
}
/* ════════════════════════════════════
   RENDER: MARKS (overview)
══════════════════════════════════════ */
// ✅ NEW renderMarks — fetches from DB instead of hardcoded array
async function renderMarks() {
  const admin = JSON.parse(localStorage.getItem("admin"));
  const tbody = $("#marksTable tbody");
  if (!tbody) return;

  try {
    const res = await fetch("http://127.0.0.1:5001/api/admin/students", {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${admin.token}`
      }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");

    const students = Array.isArray(data) ? data : data.students || [];

    if (!students.length) {
      tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:30px;color:var(--text-mute)">No students yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = students.map(s => `
      <tr>
        <td><strong>${s.name}</strong></td>
        <td><span class="id-pill">${s.student_code || "—"}</span></td>
        <td>
          <strong style="font-family:monospace;color:var(--primary)">
            — <span style="color:var(--text-mute);font-weight:500">/ 200</span>
          </strong>
        </td>
      </tr>`
    ).join("");

  } catch (err) {
    console.error(err);
    if (tbody) tbody.innerHTML = `<tr><td colspan="3" style="color:#dc2626;text-align:center;padding:20px">Failed to load marks: ${err.message}</td></tr>`;
  }
}

/* ════════════════════════════════════
   ADD SUPERVISOR MODAL
══════════════════════════════════════ */
function openSupervisorModal() {
  $("#generatedSupId").textContent = generateSupId();
  $("#supName").value = "";
  $("#supEmail").value = "";
  if ($("#supPassword")) $("#supPassword").value = "";          
  if ($("#forceChange")) $("#forceChange").checked = true;
  const pwdHelp = $("#pwdHelp");
  if (pwdHelp) {
    pwdHelp.textContent = "Minimum 8 characters · Will be sent to supervisor via email";
    pwdHelp.className = "form-help";
  }
  $("#supervisorModal").classList.add("open");
}
function closeSupervisorModal() {
  $("#supervisorModal").classList.remove("open");
}

async function submitSupervisor() {
  const admin = JSON.parse(localStorage.getItem("admin"));

  const name        = $("#supName").value.trim();
  const email       = $("#supEmail").value.trim();
  const pwd         = $("#supPassword").value.trim();
  const designation = $("#supDesignation")?.value.trim() || "";
  const office      = $("#supOffice")?.value.trim() || "";
  const whatsapp    = $("#supWhatsapp")?.value.trim() || "";
  const isChairman  = $("#supRole")?.value === "chairman";

  console.log("isChairman:", isChairman);

  // ✅ BASIC VALIDATION
  if (!name || !email || !pwd) {
    toast("Missing fields", "Name, email and password are required", "error");
    return;
  }

  try {
    const res = await fetch("http://127.0.0.1:5001/api/admin/supervisors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${admin.token}` 
      },
      body: JSON.stringify({
        name,
        email,
        password: pwd,
        designation,
        office,
        whatsapp,
        is_chairman: isChairman 
      })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    toast("Success", "Supervisor created successfully", "success");
    closeSupervisorModal();
    renderSupervisors();

  } catch (err) {
    console.error(err);
    toast("Error", err.message, "error");
  }
}
/* ════════════════════════════════════
   REASSIGN MODAL
══════════════════════════════════════ */
function closeReassignModal() {
  $("#reassignModal").classList.remove("open");
}

/* ════════════════════════════════════
   CLOSE MODALS
══════════════════════════════════════ */
$$(".modal-overlay").forEach((overlay) => {
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.classList.remove("open");
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape")
    $$(".modal-overlay.open").forEach((m) => m.classList.remove("open"));
});
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("searchSupervisors")?.addEventListener("input", e => {
    filterSupervisors(e.target.value);
  });
  document.getElementById("searchTeams")?.addEventListener("input", e => {
    filterTeams(e.target.value);
  });
  document.getElementById("searchStudents")?.addEventListener("input", e => {
    filterStudents(e.target.value);
  });
});


function filterStudents(query) {
  const q = (query || "").trim().toLowerCase();
  const filtered = STUDENTS_DATA.filter(s =>
    s.name?.toLowerCase().includes(q) ||
    s.email?.toLowerCase().includes(q) ||
    s.student_code?.toLowerCase().includes(q)
  );
  renderStudentsTable(filtered);
}
/* ════════════════════════════════════
   FETCH REAL DASHBOARD STATS
══════════════════════════════════════ */
async function fetchDashboardStats() {
  const admin = JSON.parse(localStorage.getItem("admin"));
  if (!admin || !admin.token) return console.error("No admin token found");

  try {
    const res = await fetch("http://127.0.0.1:5001/api/admin/stats", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${admin.token}`
      }
    });
    const data = await res.json();
    if (!res.ok) return console.error("Stats fetch failed:", data.message);

    updateDashboardStats(data.stats);
    updateSidebarBadges(data.stats);
    if (data.stats.marks) updateMarksSummary(data.stats.marks);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
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
    const view = item.dataset.view;
    const badge = item.querySelector(".nav-item-badge");
    if (!badge) return;
    if (view === "supervisors") badge.textContent = stats.supervisors;
    else if (view === "teams")  badge.textContent = stats.teams;
    else if (view === "students") badge.textContent = stats.students;
  });
}

function updateMarksSummary(marksData) {
  const stats = document.querySelectorAll(".marks-stat");
  if (stats[0]) stats[0].querySelector(".marks-stat-value").innerHTML =
    `${marksData.avgScore}<span style="font-size:.9rem;color:var(--text-mute);font-weight:600">/180</span>`;
  if (stats[1]) stats[1].querySelector(".marks-stat-value").textContent = marksData.topScore;
  if (stats[2]) stats[2].querySelector(".marks-stat-value").textContent = marksData.pendingMarks;
  if (stats[3]) stats[3].querySelector(".marks-stat-value").textContent = `${marksData.completedPct}%`;
}

/* ════════════════════════════════════
   DELETE STUDENT
══════════════════════════════════════ */
async function deleteStudent(studentId, studentName) {
  if (!confirm(`Delete ${studentName}?\n\nThis will also remove them from their team. If they're a team leader, the entire team will be deleted.`)) return;

  const admin = JSON.parse(localStorage.getItem("admin"));
  try {
    const res = await fetch(`http://127.0.0.1:5001/api/admin/student/${studentId}`, {
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

function logout() {
  localStorage.removeItem("admin");
  window.location.href = "../../Admin/login.html";
}

/* ════════════════════════════════════
   SEARCH HELPERS
══════════════════════════════════════ */
function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, c =>
    ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c])
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
   STUDENTS TABLE — with Documents + Action buttons
══════════════════════════════════════ */
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
              <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11" style="display:inline;vertical-align:middle;margin-right:3px">
                <path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4a7.94 7.94 0 0 0-6.88 11.93L4 20l4.2-1.1a7.93 7.93 0 0 0 3.85.98h.01a7.94 7.94 0 0 0 5.55-13.56zm-5.55 12.21h-.01a6.6 6.6 0 0 1-3.36-.92l-.24-.14-2.49.65.66-2.43-.16-.25a6.6 6.6 0 1 1 5.6 3.09z"/>
              </svg>${whatsapp}
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
            <button class="icon-action" title="Edit marks"
                    onclick="${supId ? `openSupDetail('${supId}')` : `toast('No supervisor','Student is not in a team yet','warn')`}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="icon-action danger" title="Delete student" style="color:#dc2626"
                    onclick="deleteStudent('${s._id}', '${safeName}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>`;
  }).join("");
}

/* ════════════════════════════════════
   SEARCH FILTERS
══════════════════════════════════════ */
function filterSupervisors(query) {
  if (!Array.isArray(SUPERVISORS_DATA)) return;

  const q = (query || "").trim().toLowerCase();

  const matched = [];
  const rest = [];

  SUPERVISORS_DATA.forEach(sup => {
    const hit =
      !q ||
      (sup.name || "").toLowerCase().includes(q) ||
      (sup.sup_code || "").toLowerCase().includes(q) ||
      (sup.email || "").toLowerCase().includes(q);

    (hit ? matched : rest).push(sup);
  });

  const matchSet = new Set(matched.map(s => s._id));

  const grid = $("#supervisorCards");

  if (!SUPERVISORS_DATA.length) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;padding:40px;text-align:center;color:var(--text-mute)">
        No supervisors found.
      </div>`;
    return;
  }

  grid.innerHTML = [...matched, ...rest].map(sup => {

    const isMatch = q && matchSet.has(sup._id);

    return `
      <div 
        class="entity-card ${isMatch ? "search-match" : ""}"
        data-chairman="${sup.is_chairman === true}"
        onclick="openSupDetail('${sup._id}')"
      >
        <div class="entity-card-head">

          <div class="entity-avatar">
            ${initials(sup.name)}
          </div>

          <div class="entity-info">
            <strong>${highlightText(sup.name, q)}</strong>
            <p>${highlightText(sup.email, q)}</p>
          </div>
        </div>

        <div style="margin-bottom:12px">

          <span class="id-pill">
            ${highlightText(sup.sup_code || "—", q)}
          </span>

          <span
            class="id-pill"
            style="
              margin-left:6px;
              background:${sup.is_chairman
                ? 'rgba(191,161,74,.15)'
                : 'rgba(99,102,241,.1)'};
              color:${sup.is_chairman
                ? '#9a7e2a'
                : '#4f46e5'}
            "
          >
            ${sup.is_chairman
              ? "Chairman / HOD"
              : sup.designation || "Supervisor"}
          </span>
        </div>

        <div class="entity-stats">

          <div class="entity-stat-cell">
            <strong>${sup.teamCount || 0}</strong>
            <span>Teams</span>
          </div>

          <div class="entity-stat-cell">
            <strong style="display:inline-flex;align-items:center;gap:4px">

              <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13" style="color:#15803d">
                <path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4a7.94 7.94 0 0 0-6.88 11.93L4 20l4.2-1.1a7.93 7.93 0 0 0 3.85.98h.01a7.94 7.94 0 0 0 5.55-13.56zm-5.55 12.21h-.01a6.6 6.6 0 0 1-3.36-.92l-.24-.14-2.49.65.66-2.43-.16-.25a6.6 6.6 0 1 1 5.6 3.09z"/>
              </svg>

              ${highlightText(sup.whatsapp || "—", q)}
            </strong>

            <span>WhatsApp</span>
          </div>
        </div>

        <div style="text-align:center;font-size:.72rem;color:var(--secondary);font-weight:700;margin-top:10px">
          Click to view teams →
        </div>
      </div>
    `;
  }).join("");
}

function filterTeams(query) {
  if (!Array.isArray(TEAMS_DATA)) return;
  const q = (query || "").trim().toLowerCase();

  const matched = [], rest = [];
  TEAMS_DATA.forEach(g => {
    const supName = g.supervisor?.name || "";
    const supCode = g.supervisor?.sup_code || "";
    const code    = g.group_code || g.team_code || "";
    const hit = !q
      || matches(code, q)
      || matches(g.project_title, q)
      || matches(supName, q)
      || matches(supCode, q);
    (hit ? matched : rest).push(g);
  });

  const matchSet = new Set(matched.map(g => g._id));
  const tbody = $("#teamsTable tbody");
  if (![...matched, ...rest].length) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--text-mute)">No teams found.</td></tr>`;
    return;
  }

  tbody.innerHTML = [...matched, ...rest].map(g => {
    const sup      = g.supervisor;
    const supName  = sup ? sup.name : "Unassigned";
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
  const q = (query || "").trim().toLowerCase();

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
   GLOBAL MARK TOGGLES
══════════════════════════════════════ */
let GLOBAL_TOGGLES = {};

async function loadGlobalToggles() {
  const admin = JSON.parse(localStorage.getItem("admin"));
  try {
    const res = await fetch("http://127.0.0.1:5001/api/admin/mark-toggles", {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${admin.token}`
      }
    });
    if (!res.ok) return;
    const data = await res.json();
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
                  <span id="gtoggle-status-${it.key}" style="font-weight:700;color:${enabled ? 'var(--success,#15803d)' : '#dc2626'}">
                    ${enabled ? "Open" : "Locked"}
                  </span>
                </div>
              </div>
              <label class="mark-toggle">
                <input type="checkbox" id="gtoggle-${it.key}" ${enabled ? "checked" : ""} onchange="onGlobalToggleChange('${it.key}', this.checked)">
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
    const res = await fetch("http://127.0.0.1:5001/api/admin/mark-toggles", {
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
   MODAL CLICK-OUTSIDE-TO-CLOSE + ESC + SEARCH WIRING
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
  document.getElementById("searchTeams")?.addEventListener("input", e => filterTeams(e.target.value));
  document.getElementById("searchStudents")?.addEventListener("input", e => filterStudents(e.target.value));
});

/* ════════════════════════════════════
   GLOBAL DATA + INIT
══════════════════════════════════════ */
let SUPERVISORS_DATA = [];
let TEAMS_DATA = [];
let STUDENTS_DATA = [];

async function initDashboard() {
  displayAdminInfo();
  await fetchDashboardStats();
  await renderSupervisors();
  await renderTeams();
  await renderStudents();
  await loadGlobalToggles();
}

initDashboard();