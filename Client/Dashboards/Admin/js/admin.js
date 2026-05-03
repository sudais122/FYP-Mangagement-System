/* ════════════════════════════════════
   DATA
══════════════════════════════════════ */
const supervisors = [
  {
    id: "SUP-20261201",
    name: "Dr. Sajid Ali",
    email: "sajid.ali@awkum.edu.pk",
    teams: 5,
    capacity: 6,
  },
  {
    id: "SUP-20261202",
    name: "Dr. Naila Khan",
    email: "naila.khan@awkum.edu.pk",
    teams: 4,
    capacity: 6,
  },
  {
    id: "SUP-20261203",
    name: "Dr. Faisal Ahmed",
    email: "faisal.ahmed@awkum.edu.pk",
    teams: 3,
    capacity: 6,
  },
  {
    id: "SUP-20261204",
    name: "Dr. Sana Iqbal",
    email: "sana.iqbal@awkum.edu.pk",
    teams: 2,
    capacity: 6,
  },
  {
    id: "SUP-20261205",
    name: "Dr. Imran Yousaf",
    email: "imran.y@awkum.edu.pk",
    teams: 6,
    capacity: 6,
  },
  {
    id: "SUP-20261206",
    name: "Dr. Aliya Hussain",
    email: "aliya.h@awkum.edu.pk",
    teams: 1,
    capacity: 6,
  },
];

const teams = [
  { id: "TEAM-20261284", members: 4, supId: "SUP-20261201" },
  { id: "TEAM-20261283", members: 3, supId: "SUP-20261202" },
  { id: "TEAM-20261282", members: 4, supId: "SUP-20261203" },
  { id: "TEAM-20261281", members: 3, supId: "SUP-20261201" },
  { id: "TEAM-20261280", members: 4, supId: "SUP-20261204" },
  { id: "TEAM-20261279", members: 3, supId: "SUP-20261205" },
  { id: "TEAM-20261278", members: 4, supId: "SUP-20261202" },
  { id: "TEAM-20261277", members: 3, supId: "SUP-20261206" },
];

/* Marks structure — each component is { key, max } */
const MARKS_SCHEMA = [
  {
    section: "Monthly Meetings",
    items: [
      { key: "oct", label: "October", max: 10 },
      { key: "nov", label: "November", max: 10 },
      { key: "dec", label: "December", max: 10 },
      { key: "feb", label: "February", max: 10 },
      { key: "mar", label: "March", max: 10 },
    ],
  },
  {
    section: "Submissions",
    items: [
      { key: "proposal", label: "Proposal Submission", max: 10 },
      { key: "progress", label: "Progress Report", max: 20 },
    ],
  },
  {
    section: "Viva",
    items: [
      { key: "iv1", label: "Internal Viva 1", max: 25 },
      { key: "iv2", label: "Internal Viva 2", max: 25 },
      { key: "ext", label: "External Viva", max: 50 },
    ],
  },
];
const MAX_TOTAL = MARKS_SCHEMA.reduce(
  (sum, sec) => sum + sec.items.reduce((s, i) => s + i.max, 0),
  0,
); // = 180

/* Students — now with detailed marks */
const students = [
  makeStudent("STD-20261001", "Ali Hassan", "TEAM-20261284", {
    oct: 9,
    nov: 8,
    dec: 9,
    feb: 10,
    mar: 9,
    proposal: 9,
    progress: 18,
    iv1: 22,
    iv2: 23,
    ext: 45,
  }),
  makeStudent("STD-20261002", "Mariam Khan", "TEAM-20261284", {
    oct: 10,
    nov: 10,
    dec: 9,
    feb: 10,
    mar: 10,
    proposal: 10,
    progress: 19,
    iv1: 24,
    iv2: 24,
    ext: 48,
  }),
  makeStudent("STD-20261003", "Usman Tariq", "TEAM-20261284", {
    oct: 8,
    nov: 9,
    dec: 8,
    feb: 9,
    mar: 9,
    proposal: 9,
    progress: 17,
    iv1: 21,
    iv2: 22,
    ext: 43,
  }),
  makeStudent("STD-20261004", "Ayesha Malik", "TEAM-20261284", {
    oct: 10,
    nov: 10,
    dec: 10,
    feb: 10,
    mar: 10,
    proposal: 10,
    progress: 20,
    iv1: 25,
    iv2: 24,
    ext: 47,
  }),
  makeStudent("STD-20261005", "Bilal Ahmed", "TEAM-20261283", {
    oct: 7,
    nov: 8,
    dec: 8,
    feb: 9,
    mar: 8,
    proposal: 8,
    progress: 16,
    iv1: 20,
    iv2: 21,
    ext: 40,
  }),
  makeStudent("STD-20261006", "Fatima Noor", "TEAM-20261283", {
    oct: 8,
    nov: 7,
    dec: 7,
    feb: 8,
    mar: 8,
    proposal: 8,
    progress: 15,
    iv1: 19,
    iv2: 20,
    ext: 38,
  }),
  makeStudent("STD-20261007", "Hamza Sheikh", "TEAM-20261283", {
    oct: 8,
    nov: 9,
    dec: 8,
    feb: 8,
    mar: 8,
    proposal: 8,
    progress: 16,
    iv1: 21,
    iv2: 20,
    ext: 40,
  }),
  makeStudent("STD-20261008", "Zara Hussain", "TEAM-20261282", {
    oct: 6,
    nov: 7,
    dec: 6,
    feb: 7,
    mar: 6,
    proposal: 7,
    progress: 13,
    iv1: 16,
    iv2: 17,
    ext: 33,
  }),
  makeStudent("STD-20261009", "Omar Latif", "TEAM-20261282", {
    oct: 6,
    nov: 6,
    dec: 6,
    feb: 6,
    mar: 6,
    proposal: 6,
    progress: 12,
    iv1: 15,
    iv2: 15,
    ext: 34,
  }),
  makeStudent("STD-20261010", "Iqra Rashid", "TEAM-20261281", {
    oct: 9,
    nov: 10,
    dec: 9,
    feb: 10,
    mar: 9,
    proposal: 9,
    progress: 18,
    iv1: 23,
    iv2: 23,
    ext: 46,
  }),
  makeStudent("STD-20261011", "Saad Munir", "TEAM-20261281", {
    oct: 9,
    nov: 9,
    dec: 9,
    feb: 9,
    mar: 9,
    proposal: 9,
    progress: 17,
    iv1: 22,
    iv2: 22,
    ext: 43,
  }),
  makeStudent("STD-20261012", "Hira Aslam", "TEAM-20261280", {
    oct: 7,
    nov: 7,
    dec: 7,
    feb: 7,
    mar: 7,
    proposal: 7,
    progress: 14,
    iv1: 18,
    iv2: 18,
    ext: 36,
  }),
];

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
  const max = Math.max(
    ...supervisors.map((s) => parseInt(s.id.replace("SUP-2026", ""))),
  );
  return "SUP-2026" + String(max + 1).padStart(4, "0");
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
function renderSupervisors() {
  const grid = $("#supervisorCards");
  grid.innerHTML = supervisors
    .map((s) => {
      const assignedTeams = teamsBySupervisor(s.id).length;
      const available = s.capacity - assignedTeams;
      return `
    <div class="entity-card" onclick="openSupDetail('${s.id}')">
      <div class="entity-card-head">
        <div class="entity-avatar">${initials(s.name)}</div>
        <div class="entity-info">
          <strong>${s.name}</strong>
          <p>${s.email}</p>
        </div>
      </div>
      <div style="margin-bottom:10px"><span class="id-pill">${s.id}</span></div>
      <div class="entity-stats">
        <div class="entity-stat-cell"><strong>${assignedTeams}</strong><span>Teams</span></div>
        <div class="entity-stat-cell"><strong>${available}</strong><span>Available</span></div>
      </div>
      <div style="text-align:center;font-size:.72rem;color:var(--secondary);font-weight:700">Click to view teams →</div>
    </div>`;
    })
    .join("");
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
function openSupDetail(supId) {
  const sup = supById(supId);
  const myTeams = teamsBySupervisor(supId);
  const totalStudents = myTeams.reduce(
    (sum, t) => sum + studentsByTeam(t.id).length,
    0,
  );

  let html = `
    <div class="sup-detail-header">
      <div class="sup-detail-avatar">${initials(sup.name)}</div>
      <div class="sup-detail-info">
        <h2>${sup.name}</h2>
        <p>${sup.email}</p>
        <div class="sup-detail-stats">
          <div class="sup-detail-stat"><strong>${sup.id}</strong></div>
          <div class="sup-detail-stat">📋 <strong>${myTeams.length}</strong> Teams</div>
          <div class="sup-detail-stat">👥 <strong>${totalStudents}</strong> Students</div>
        </div>
      </div>
    </div>
  `;

  if (myTeams.length === 0) {
    html += `
      <div class="dash-panel">
        <div class="panel-body" style="text-align:center;padding:40px;color:var(--text-mute)">
          <p>No teams assigned to this supervisor yet.</p>
        </div>
      </div>`;
  } else {
    html += myTeams.map((team) => renderTeamBlock(team)).join("");
  }

  $("#supDetailContent").innerHTML = html;
  $$(".view").forEach((v) => v.classList.remove("active"));
  $("#view-sup-detail").classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderTeamBlock(team) {
  const members = studentsByTeam(team.id);
  if (members.length === 0) {
    return `
      <div class="team-block">
        <div class="team-block-head">
          <div class="team-block-head-left">
            <div class="team-avatar">${team.id.slice(-2)}</div>
            <div>
              <h3>${team.id}</h3>
              <p>${team.members} members · No students linked</p>
            </div>
          </div>
        </div>
      </div>`;
  }

  // Build header columns from schema
  const componentHeaders = MARKS_SCHEMA.flatMap((sec) =>
    sec.items.map(
      (it) =>
        `<th title="${sec.section} · max ${it.max}">${it.label}<br><small style="color:var(--text-mute);font-weight:600">/${it.max}</small></th>`,
    ),
  ).join("");

  // Build rows for each student
  const rows = members
    .map((s) => {
      const cells = MARKS_SCHEMA.flatMap((sec) =>
        sec.items.map(
          (it) => `
        <td class="mark-input-cell">
          <input type="number" min="0" max="${it.max}"
            class="mark-input"
            data-student="${s.id}" data-key="${it.key}" data-max="${it.max}"
            value="${s.marks[it.key] ?? 0}"
            oninput="onMarkChange(this)">
        </td>`,
        ),
      ).join("");
      return `
      <tr>
        <td><strong>${s.name}</strong></td>
        <td><span class="id-pill">${s.id}</span></td>
        ${cells}
        <td><span class="mark-total-display" id="total-${s.id}">${studentTotal(s)}<span class="out">/${MAX_TOTAL}</span></span></td>
      </tr>`;
    })
    .join("");

  return `
    <div class="team-block">
      <div class="team-block-head">
        <div class="team-block-head-left">
          <div class="team-avatar">${team.id.slice(-2)}</div>
          <div>
            <h3>${team.id}</h3>
            <p>${members.length} members · Max total: ${MAX_TOTAL} marks</p>
          </div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="saveTeamMarks('${team.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          Save Changes
        </button>
      </div>
      <div style="overflow-x:auto">
        <table class="marks-edit-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>ID</th>
              ${componentHeaders}
              <th>Total</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="team-marks-foot">
        <div class="team-marks-foot-info">
          ✓ Changes are validated in real time. Click <strong>Save Changes</strong> to commit.
        </div>
      </div>
    </div>
  `;
}

/* Live mark validation + total update */
function onMarkChange(input) {
  const max = parseInt(input.dataset.max);
  let val = parseInt(input.value);
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
  // Update student object live
  const s = students.find((st) => st.id === input.dataset.student);
  if (s) {
    s.marks[input.dataset.key] = val;
    const totalEl = $(`#total-${s.id}`);
    if (totalEl)
      totalEl.innerHTML = `${studentTotal(s)}<span class="out">/${MAX_TOTAL}</span>`;
  }
}

function saveTeamMarks(teamId) {
  // In a real app this would POST to the server.
  // For now, the data is already updated live in `students`.
  renderMarks(); // refresh marks view if visible
  toast("Marks saved", `Updated marks for ${teamId}`, "success");
}

/* ════════════════════════════════════
   RENDER: TEAMS
══════════════════════════════════════ */
function renderTeams() {
  const tbody = $("#teamsTable tbody");
  tbody.innerHTML = teams
    .map((t) => {
      const sup = supById(t.supId);
      return `
    <tr>
      <td><span class="id-pill gold">${t.id}</span></td>
      <td>${t.members}</td>
      <td><span style="font-weight:600;color:var(--text)">${sup.name}</span></td>
      <td>
        <div class="action-row">
          <button class="icon-action" onclick="openReassignModal('${t.id}')" title="Reassign supervisor">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          </button>
          <button class="icon-action" onclick="openSupDetail('${t.supId}')" title="View team details">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
      </td>
    </tr>`;
    })
    .join("");
}

/* ════════════════════════════════════
   RENDER: STUDENTS
══════════════════════════════════════ */
function renderStudents() {
  const tbody = $("#studentsTable tbody");
  tbody.innerHTML = students
    .map((s) => {
      const team = teamById(s.teamId);
      const sup = supById(team.supId);
      return `
    <tr>
      <td><div class="team-info"><strong>${s.name}</strong><span>Semester 7</span></div></td>
      <td><span class="id-pill">${s.id}</span></td>
      <td>${sup.name}</td>
      <td><strong style="color:var(--primary);font-family:monospace">${studentTotal(s)}<span style="color:var(--text-mute);font-weight:500">/${MAX_TOTAL}</span></strong></td>
      <td><button class="icon-action" onclick="openSupDetail('${team.supId}')" title="View / edit marks">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      </button></td>
    </tr>`;
    })
    .join("");
}

/* ════════════════════════════════════
   RENDER: MARKS (overview)
══════════════════════════════════════ */
function renderMarks() {
  const tbody = $("#marksTable tbody");
  if (!tbody) return;
  tbody.innerHTML = students
    .map(
      (s) => `
    <tr>
      <td><strong>${s.name}</strong></td>
      <td><span class="id-pill">${s.id}</span></td>
      <td><strong style="font-family:monospace;color:var(--primary)">${studentTotal(s)}<span style="color:var(--text-mute);font-weight:500">/${MAX_TOTAL}</span></strong></td>
    </tr>`,
    )
    .join("");
}

/* ════════════════════════════════════
   ADD SUPERVISOR MODAL
══════════════════════════════════════ */
function openSupervisorModal() {
  $("#generatedSupId").textContent = generateSupId();
  $("#supName").value = "";
  $("#supEmail").value = "";
  $("#supPassword").value = "";
  $("#forceChange").checked = true;
  $("#pwdHelp").textContent =
    "Minimum 8 characters · Will be sent to supervisor via email";
  $("#pwdHelp").className = "form-help";
  $("#supervisorModal").classList.add("open");
}
function closeSupervisorModal() {
  $("#supervisorModal").classList.remove("open");
}

async function submitSupervisor() {
  const name  = $("#supName").value.trim();
  const email = $("#supEmail").value.trim();
  const pwd   = $("#supPassword").value.trim();
  const designation = $("#supDesignation")?.value.trim() || "";
  const office      = $("#supOffice")?.value.trim() || "";

  if (!name || !email || !pwd) {
    toast("Missing fields", "Please fill in name, email and password", "error");
    return;
  }
  if (pwd.length < 8) {
    toast("Weak password", "Password must be at least 8 characters", "error");
    return;
  }

  const admin = JSON.parse(localStorage.getItem("admin"));

  try {
    const res = await fetch("http://127.0.0.1:5001/api/admin/supervisor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${admin.token}`
      },
      body: JSON.stringify({ name, email, password: pwd, designation, office })
    });

    const data = await res.json();

    if (!res.ok) {
      toast("Error", data.message || "Failed to create supervisor", "error");
      return;
    }

    // Add to local array so UI updates instantly
    supervisors.unshift({
      id:       data.supervisor.sup_code,
      name:     data.supervisor.name,
      email:    data.supervisor.email,
      teams:    0,
      capacity: 6,
    });

    closeSupervisorModal();
    renderSupervisors();
    toast("Supervisor created", `${name} · ${data.supervisor.sup_code}`, "success");

  } catch (err) {
    console.error(err);
    toast("Network error", "Could not connect to server", "error");
  }
}
/* ════════════════════════════════════
   REASSIGN MODAL
══════════════════════════════════════ */
let reassignTeamId = null;
function openReassignModal(teamId) {
  reassignTeamId = teamId;
  const team = teamById(teamId);
  const currentSupervisor = supById(team.supId);
  $("#reassignTeamName").textContent = team.id;
  $("#currentSup").value =
    `${currentSupervisor.name} (${currentSupervisor.id})`;
  const select = $("#newSup");
  select.innerHTML =
    '<option value="">— Choose a supervisor —</option>' +
    supervisors
      .filter((s) => s.id !== team.supId)
      .map(
        (s) =>
          `<option value="${s.id}">${s.name} · ${teamsBySupervisor(s.id).length}/${s.capacity} teams</option>`,
      )
      .join("");
  $("#reassignModal").classList.add("open");
}
function closeReassignModal() {
  $("#reassignModal").classList.remove("open");
}
function confirmReassign() {
  const newSupId = $("#newSup").value;
  if (!newSupId) {
    toast(
      "Select a supervisor",
      "Please choose a new supervisor first",
      "error",
    );
    return;
  }
  const team = teamById(reassignTeamId);
  team.supId = newSupId;
  closeReassignModal();
  renderTeams();
  renderSupervisors();
  toast(
    "Supervisor reassigned",
    `${team.id} now under ${supById(newSupId).name}`,
    "success",
  );
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

/* ════════════════════════════════════
   FETCH REAL DASHBOARD STATS
══════════════════════════════════════ */
async function fetchDashboardStats() {
  const admin = JSON.parse(localStorage.getItem("admin"));
  
  if (!admin || !admin.token) {
    console.error("No admin token found");
    return;
  }

  try {
    const res = await fetch("http://127.0.0.1:5001/api/admin/stats", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${admin.token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Failed to fetch stats:", data.message);
      return;
    }

    // Update dashboard stat cards
    updateDashboardStats(data.stats);
    
    // Update sidebar badges
    updateSidebarBadges(data.stats);
    
    // Update marks summary if exists
    if (data.stats.marks) {
      updateMarksSummary(data.stats.marks);
    }

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
  }
}

function updateDashboardStats(stats) {
  // Update the three main stat cards
  const statCards = document.querySelectorAll(".dstat-card");
  
  if (statCards[0]) {
    statCards[0].querySelector(".dstat-value").textContent = stats.students;
  }
  
  if (statCards[1]) {
    statCards[1].querySelector(".dstat-value").textContent = stats.supervisors;
  }
  
  if (statCards[2]) {
    statCards[2].querySelector(".dstat-value").textContent = stats.teams;
  }
}

function updateSidebarBadges(stats) {
  // Update sidebar navigation badges
  const navItems = document.querySelectorAll(".nav-item");
  
  navItems.forEach(item => {
    const view = item.dataset.view;
    const badge = item.querySelector(".nav-item-badge");
    
    if (badge) {
      if (view === "supervisors") {
        badge.textContent = stats.supervisors;
      } else if (view === "teams") {
        badge.textContent = stats.teams;
      } else if (view === "students") {
        badge.textContent = stats.students;
      }
    }
  });
}

function updateMarksSummary(marksData) {
  // Update marks summary stats in the marks view
  const marksStats = document.querySelectorAll(".marks-stat");
  
  if (marksStats[0]) {
    marksStats[0].querySelector(".marks-stat-value").innerHTML = 
      `${marksData.avgScore}<span style="font-size: 0.9rem; color: var(--text-mute); font-weight: 600;">/180</span>`;
  }
  
  if (marksStats[1]) {
    marksStats[1].querySelector(".marks-stat-value").textContent = marksData.topScore;
  }
  
  if (marksStats[2]) {
    marksStats[2].querySelector(".marks-stat-value").textContent = marksData.pendingMarks;
  }
  
  if (marksStats[3]) {
    marksStats[3].querySelector(".marks-stat-value").textContent = `${marksData.completedPct}%`;
  }
}

/* ════════════════════════════════════ INIT ══════════════════════════════════════ */
async function initDashboard() {
  // Display admin info first
  displayAdminInfo();
  
  // Fetch real stats
  await fetchDashboardStats();
  
  // Render data
  renderSupervisors();
  renderTeams();
  renderStudents();
  renderMarks();
}

initDashboard();