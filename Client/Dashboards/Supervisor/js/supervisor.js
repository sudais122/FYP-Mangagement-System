const SUPERVISOR = { id: "SUP-20260001", name: "Dr. Aftab Ahmad" };

const MARK_COMPONENTS = [
  {
    section: "Monthly Meetings",
    icon: "calendar",
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
    icon: "file",
    items: [
      { key: "proposal", label: "Proposal Submission", max: 10 },
      { key: "progress", label: "Progress Report", max: 20 },
    ],
  },
  {
    section: "Viva",
    icon: "mic",
    items: [
      { key: "viva1", label: "Internal Viva 1", max: 25 },
      { key: "viva2", label: "Internal Viva 2", max: 25 },
      { key: "external", label: "External Viva", max: 50 },
    ],
  },
  {
    section: "Documentation",
    icon: "book",
    items: [{ key: "finaldoc", label: "Final Documentation", max: 20 }],
  },
];
const TOTAL_MARKS = 200;

let TEAMS = [
  {
    teamId: "TEAM-20260001",
    projectTitle: "AI-Based Exam Proctoring System",
    students: [
      { id: "STD-20260001", name: "Ahmed Saeed", role: "Leader",
        marks: { oct:7,nov:7,dec:9,feb:7,mar:10,proposal:8,progress:18,viva1:null,viva2:null,external:null,finaldoc:null } },
      { id: "STD-20260002", name: "Bilal Khan", role: "Member",
        marks: { oct:6,nov:6,dec:8,feb:7,mar:8,proposal:7,progress:16,viva1:null,viva2:null,external:null,finaldoc:null } },
      { id: "STD-20260003", name: "Sara Noor", role: "Member",
        marks: { oct:8,nov:8,dec:10,feb:7,mar:9,proposal:9,progress:19,viva1:null,viva2:null,external:null,finaldoc:null } },
    ],
  },
  {
    teamId: "TEAM-20260002",
    projectTitle: "E-Commerce Platform with AI Recommendations",
    students: [
      { id: "STD-20260004", name: "Ayesha Malik", role: "Leader",
        marks: { oct:9,nov:8,dec:8,feb:8,mar:9,proposal:9,progress:18,viva1:null,viva2:null,external:null,finaldoc:null } },
      { id: "STD-20260005", name: "Hassan Raza", role: "Member",
        marks: { oct:8,nov:7,dec:8,feb:7,mar:8,proposal:7,progress:16,viva1:null,viva2:null,external:null,finaldoc:null } },
      { id: "STD-20260006", name: "Fatima Zaidi", role: "Member",
        marks: { oct:10,nov:9,dec:8,feb:9,mar:9,proposal:9,progress:19,viva1:null,viva2:null,external:null,finaldoc:null } },
    ],
  },
  {
    teamId: "TEAM-20260003",
    projectTitle: "Multi-Cloud DevOps Monitoring Dashboard",
    students: [
      { id: "STD-20260007", name: "Zain Ahmed", role: "Leader",
        marks: { oct:null,nov:null,dec:null,feb:null,mar:null,proposal:null,progress:null,viva1:null,viva2:null,external:null,finaldoc:null } },
      { id: "STD-20260008", name: "Nadia Iqbal", role: "Member",
        marks: { oct:null,nov:null,dec:null,feb:null,mar:null,proposal:null,progress:null,viva1:null,viva2:null,external:null,finaldoc:null } },
    ],
  },
  {
    teamId: "TEAM-20260004",
    projectTitle: "Student Performance Analytics Platform",
    students: [
      { id: "STD-20260009", name: "Usman Tariq", role: "Leader",
        marks: { oct:7,nov:8,dec:6,feb:7,mar:7,proposal:7,progress:15,viva1:null,viva2:null,external:null,finaldoc:null } },
      { id: "STD-20260010", name: "Amna Siddiqui", role: "Member",
        marks: { oct:7,nov:9,dec:7,feb:8,mar:8,proposal:8,progress:17,viva1:null,viva2:null,external:null,finaldoc:null } },
      { id: "STD-20260011", name: "Kamran Ali", role: "Member",
        marks: { oct:7,nov:7,dec:5,feb:6,mar:6,proposal:6,progress:13,viva1:null,viva2:null,external:null,finaldoc:null } },
    ],
  },
  {
    teamId: "TEAM-20260005",
    projectTitle: "IoT Device Security Monitoring System",
    students: [
      { id: "STD-20260012", name: "Hamza Siddiq", role: "Leader",
        marks: { oct:null,nov:null,dec:null,feb:null,mar:null,proposal:null,progress:null,viva1:null,viva2:null,external:null,finaldoc:null } },
      { id: "STD-20260013", name: "Maryam Khan", role: "Member",
        marks: { oct:null,nov:null,dec:null,feb:null,mar:null,proposal:null,progress:null,viva1:null,viva2:null,external:null,finaldoc:null } },
      { id: "STD-20260014", name: "Saad Yousuf", role: "Member",
        marks: { oct:null,nov:null,dec:null,feb:null,mar:null,proposal:null,progress:null,viva1:null,viva2:null,external:null,finaldoc:null } },
    ],
  },
];

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
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
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

/* ═══════════════════════════════════
   TAB SWITCHING
═══════════════════════════════════ */
function showTab(tab) {
  document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
  document.getElementById("tab-" + tab).classList.add("active");
  document.querySelectorAll(".sb-btn:not(.logout)").forEach((b) => b.classList.remove("active"));
  document.getElementById("sb-" + tab).classList.add("active");
  if (tab === "dashboard") {
    document.getElementById("page-title").textContent = "Dashboard";
    document.getElementById("page-sub").textContent = "Overview of your assigned groups and students";
    renderDashboard();
  } else {
    document.getElementById("page-title").textContent = "My Groups";
    document.getElementById("page-sub").textContent = "View groups, students, and assign marks";
    showGroupsList();
  }
}

/* ═══════════════════════════════════
   DASHBOARD RENDER
═══════════════════════════════════ */
function renderDashboard() {
  document.getElementById("stat-groups").textContent = TEAMS.length;
  document.getElementById("stat-students").textContent = TEAMS.reduce((s, t) => s + t.students.length, 0);
  filterDashGroups(document.getElementById("search-dash-groups")?.value || "");
  filterStudents(document.getElementById("search-students")?.value || "");
}

/* ═══════════════════════════════════
   GROUPS TABLE — DASHBOARD (with search)
═══════════════════════════════════ */
function filterDashGroups(query) {
  const q = (query || "").trim().toLowerCase();
  const filtered = TEAMS.filter(t =>
    t.teamId.toLowerCase().includes(q) ||
    t.projectTitle.toLowerCase().includes(q)
  );
  const tbody = document.getElementById("dash-groups-tbody");
  if (filtered.length === 0) {
    tbody.innerHTML = emptySearchRow(4, query);
    return;
  }
  tbody.innerHTML = filtered.map(t =>
    `<tr onclick="openGroupDetail('${t.teamId}')">
      <td><span class="tid">${highlightMatch(t.teamId, q)}</span></td>
      <td><span class="g-proj">${highlightMatch(t.projectTitle, q)}</span></td>
      <td><span class="g-count">${t.students.length}</span></td>
      <td style="text-align:right">
        <span class="g-arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </span>
      </td>
    </tr>`
  ).join("");
}

/* ═══════════════════════════════════
   STUDENTS TABLE — DASHBOARD (with search)
═══════════════════════════════════ */
function filterStudents(query) {
  const q = (query || "").trim().toLowerCase();
  const allStudents = TEAMS.flatMap(t => t.students.map(s => ({ ...s, teamId: t.teamId })));
  const filtered = allStudents.filter(s =>
    s.id.toLowerCase().includes(q) ||
    s.name.toLowerCase().includes(q)
  );
  const tbody = document.getElementById("dash-students-tbody");
  if (filtered.length === 0) {
    tbody.innerHTML = emptySearchRow(5, query);
    return;
  }
  tbody.innerHTML = filtered.map(s => {
    const total = studentTotal(s);
    return `<tr>
      <td><span class="s-id">${highlightMatch(s.id, q)}</span></td>
      <td><span class="s-name">${highlightMatch(s.name, q)}</span></td>
      <td><span class="tid">${s.teamId}</span></td>
      <td><span class="s-role ${s.role.toLowerCase()}">${s.role}</span></td>
      <td style="text-align:right"><span class="s-marks">${total} <span class="den">/ ${TOTAL_MARKS}</span></span></td>
    </tr>`;
  }).join("");
}

/* ═══════════════════════════════════
   GROUPS TAB — LIST (with search)
═══════════════════════════════════ */
function showGroupsList() {
  document.getElementById("groups-list-view").style.display = "";
  document.getElementById("group-detail-view").style.display = "none";
  filterGroupsList(document.getElementById("search-groups")?.value || "");
}

function filterGroupsList(query) {
  const q = (query || "").trim().toLowerCase();
  const filtered = TEAMS.filter(t =>
    t.teamId.toLowerCase().includes(q) ||
    t.projectTitle.toLowerCase().includes(q)
  );
  const tbody = document.getElementById("groups-list-tbody");
  if (!tbody) return;
  if (filtered.length === 0) {
    tbody.innerHTML = emptySearchRow(4, query);
    return;
  }
  tbody.innerHTML = filtered.map(t =>
    `<tr onclick="openGroupDetail('${t.teamId}')">
      <td><span class="tid">${highlightMatch(t.teamId, q)}</span></td>
      <td><span class="g-proj">${highlightMatch(t.projectTitle, q)}</span></td>
      <td><span class="g-count">${t.students.length}</span></td>
      <td style="text-align:right">
        <span class="g-arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </span>
      </td>
    </tr>`
  ).join("");
}

/* ═══════════════════════════════════
   GROUP DETAIL VIEW
═══════════════════════════════════ */
function openGroupDetail(teamId) {
  showTab("groups");
  const t = TEAMS.find((x) => x.teamId === teamId);
  if (!t) return;
  document.getElementById("groups-list-view").style.display = "none";
  const d = document.getElementById("group-detail-view");
  d.style.display = "";
  d.innerHTML = `
    <button class="back-btn" onclick="showGroupsList()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      Back to Groups
    </button>
    <div class="gh-strip">
      <div class="gh-info">
        <div class="gh-tid">${t.teamId}</div>
        <div class="gh-proj">${t.projectTitle}</div>
        <div class="gh-sup">Supervisor: ${SUPERVISOR.id} · ${SUPERVISOR.name}</div>
      </div>
      <div class="gh-stat-box">
        <div class="st-label">Students</div>
        <div class="st-val">${t.students.length}</div>
        <div class="st-sub">in this group</div>
      </div>
    </div>
    ${t.students.map((s) => renderStudentCard(t, s)).join("")}`;
}

function renderStudentCard(team, student) {
  const total = studentTotal(student), sid = student.id;
  const sectionsHtml = MARK_COMPONENTS.map((sec) => {
    const rows = sec.items.map((item) => {
      const val = student.marks[item.key];
      const isPending = val === null;
      return `<div class="mk-row">
        <div class="mk-label">${item.label}</div>
        <div class="mk-max">/ ${item.max}</div>
        <input type="number" class="mk-input ${isPending ? "pending" : ""}" id="mk-${sid}-${item.key}" min="0" max="${item.max}" value="${isPending ? "" : val}" placeholder="—" data-student="${sid}" data-key="${item.key}" data-max="${item.max}" oninput="validateMark(this);updateTotal('${sid}')">
      </div>`;
    }).join("");
    return `<div class="mk-section"><div class="mk-sec-head">${secIcon(sec.icon)} ${sec.section}</div><div class="mk-rows">${rows}</div></div>`;
  }).join("");
  return `<div class="stu-card">
    <div class="stu-head" onclick="toggleBody('${sid}')">
      <div class="stu-dot ${student.role.toLowerCase()}"></div>
      <div class="stu-info">
        <div class="stu-name">${student.name}</div>
        <div class="stu-id">${sid}</div>
      </div>
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
        <div class="gb-val"><span class="num" id="gt-${sid}">${total}</span> <span class="den">/ ${TOTAL_MARKS}</span></div>
      </div>
      <div class="save-row">
        <button class="btn-save" onclick="saveMarks('${team.teamId}','${sid}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
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
  const a = document.getElementById("td-" + sid), b = document.getElementById("gt-" + sid);
  if (a) a.textContent = total;
  if (b) b.textContent = total;
}

function saveMarks(teamId, sid) {
  const team = TEAMS.find((t) => t.teamId === teamId),
    student = team?.students.find((s) => s.id === sid);
  if (!student) return;
  let hasError = false;
  MARK_COMPONENTS.forEach((sec) =>
    sec.items.forEach((item) => {
      const inp = document.getElementById("mk-" + sid + "-" + item.key);
      if (!inp) return;
      if (inp.value === "") student.marks[item.key] = null;
      else {
        const v = parseInt(inp.value);
        if (isNaN(v) || v < 0 || v > item.max) { hasError = true; inp.classList.add("error"); }
        else { student.marks[item.key] = v; inp.classList.remove("error", "pending"); }
      }
    })
  );
  if (hasError) { toast("Fix invalid marks (red fields)", "red"); return; }
  toast(student.name + " — marks saved (" + studentTotal(student) + "/" + TOTAL_MARKS + ")", "green");
  renderDashboard();
}

let toastTimer;
function toast(msg, type) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = "toast" + (type ? " " + type : "") + " show";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2800);
}

renderDashboard();