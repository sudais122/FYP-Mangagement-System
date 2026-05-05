let memberCountBeforeModal = 0; 
const user = JSON.parse(localStorage.getItem("user"));
console.log("user from localStorage:", user); // ← add this

if (!user) {
  window.location.href = "../login.html";
}
function logout() {
  localStorage.removeItem("user");
  window.location.href = "../index.html"; // adjust path to your login page
}
// ══════════════════════════════════
// API Configuration
// ══════════════════════════════════
const API_BASE = "http://localhost:5001/api"; // Update with your backend URL
const API_HEADERS = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${user.token}`, // Assuming token is stored in user object
};

// ══════════════════════════════════
// STATE MANAGEMENT
// ══════════════════════════════════
const STATE = {
  studentId: user.student_code,
  studentName: user.name,
  userId: user._id, // Backend user ID
  teamId: null,
  projectTitle: null,
  category: null,
  members: [],
  selectedSupervisor: null,
  supervisorData: null,
  teamCreated: false,
  teamRole: null, // "Leader" or "Member"
  uploadedFiles: [],
  unreadNotifs: 2,
  proposalState: "idle",
  proposalFile: null,
  selectedEvalStudent: 0,
  groupData: null, // Full group data from backend
};

/* ══════════════════════════════════
   MARKS DATA TEMPLATE
══════════════════════════════════ */
const MARKS_TEMPLATE = [
  { section: "Monthly Meetings", component: "October", max: 10 },
  { section: "Monthly Meetings", component: "November", max: 10 },
  { section: "Monthly Meetings", component: "December", max: 10 },
  { section: "Monthly Meetings", component: "February", max: 10 },
  { section: "Monthly Meetings", component: "March", max: 10 },
  { section: "Submissions", component: "Proposal Submission", max: 10 },
  { section: "Submissions", component: "Progress Report", max: 20 },
  { section: "Viva", component: "Internal Viva 1", max: 25 },
  { section: "Viva", component: "Internal Viva 2", max: 25 },
  { section: "Viva", component: "External Viva", max: 50 },
];

function generateMarks(seed) {
  const rng = (min, max) => {
    seed = (seed * 9301 + 49297) % 233280;
    return Math.floor(min + (seed / 233280) * (max - min + 1));
  };
  return MARKS_TEMPLATE.map((item, i) => {
    if (item.section === "Monthly Meetings") {
      const monthIdx = i;
      if (monthIdx < 5) {
        return { ...item, marks: rng(Math.floor(item.max * 0.6), item.max) };
      }
      return { ...item, marks: null };
    }
    if (item.component === "Proposal Submission")
      return { ...item, marks: rng(8, 10) };
    if (item.component === "Progress Report")
      return { ...item, marks: rng(12, 18) };
    return { ...item, marks: null };
  });
}

let STUDENT_MARKS = {};

function getAllStudents() {
  const students = [
    {
      id: STATE.studentId,
      name: STATE.studentName,
      initials: initials(STATE.studentName),
    },
    ...STATE.members.map((m) => ({
      id: m.student_code,
      name: m.name,
      initials: initials(m.name),
    })),
  ];
  return students;
}

function ensureMarksExist() {
  const students = getAllStudents();
  students.forEach((s, i) => {
    if (!STUDENT_MARKS[s.id]) {
      STUDENT_MARKS[s.id] = generateMarks(
        s.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) + i * 1000,
      );
    }
  });
}

/* ══════════════════════════════════
   API CALLS
══════════════════════════════════ */
let SUPERVISORS = []; // Initialize as empty array

async function loadSupervisors() {
  try {
    const response = await fetch(`${API_BASE}/supervisors/available`, {
      method: "GET",
      headers: API_HEADERS, 
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load supervisors");
    }

    SUPERVISORS = data.supervisors;
    return SUPERVISORS;

  } catch (error) {
    console.error("Supervisor load error:", error);
    toast("Failed to load supervisors: " + error.message, "red");
    return [];
  }
}
// Load dashboard data on page load
async function loadDashboard() {
  try {
    const response = await fetch(`${API_BASE}/students/dashboard`, {
      method: "GET",
      headers: API_HEADERS,
    });

    const data = await response.json();
    console.log(data); // ← see what's actually coming back

    if (!response.ok) {
      throw new Error(data.message || "Failed to load dashboard");
    }

    if (data.hasGroup) {
      // User is part of a team
      STATE.teamCreated = true;
      STATE.teamId = data.group.group_code || data.group.team_code;
      STATE.projectTitle = data.group.project_title;
      STATE.category = data.group.category;
      STATE.teamRole = data.student.team_role;
      STATE.groupData = data.group;

      // Populate members
      STATE.members = [];
      if (
        data.group.leader &&
        data.group.leader.student_code !== STATE.studentId
      ) {
        STATE.members.push({
          id: data.group.leader._id,
          student_code: data.group.leader.student_code,
          name: data.group.leader.name,
          initials: initials(data.group.leader.name),
          role: "Leader",
        });
      }

      if (data.group.members) {
        data.group.members.forEach((m) => {
          if (m.student_code !== STATE.studentId) {
            STATE.members.push({
              id: m._id,
              student_code: m.student_code,
              name: m.name,
              initials: initials(m.name),
              role: "Member",
            });
          }
        });
      }

      // Populate supervisor
      // Populate supervisor
if (data.group.supervisor) {
  STATE.selectedSupervisor = data.group.supervisor._id;
  // ✅ Map all fields properly
  STATE.supervisorData = {
    _id:            data.group.supervisor._id,
    name:           data.group.supervisor.name,
    email:          data.group.supervisor.email,
    designation:    data.group.supervisor.designation || "Faculty Member",
    research_areas: data.group.supervisor.research_areas || [],
    office:         data.group.supervisor.office || "CS Department",
    office_hours:   data.group.supervisor.office_hours || "Contact supervisor",
    sup_code:       data.group.supervisor.sup_code,
  };
}
      // Update UI
      updateDashboardUI();
      renderTeamTab();
      updateBannerForTeam();
      renderSupervisorTab();
    } else {
      // User is NOT part of a team - show setup
      setTimeout(() => openSetup(), 500);
    }
  } catch (error) {
    console.error("Dashboard load error:", error);
    toast("Failed to load dashboard: " + error.message, "red");
  }
}

// Search for student by code
async function searchStudentByCode(studentCode) {
  try {
    const response = await fetch(
      `${API_BASE}/students/search?student_code=${encodeURIComponent(studentCode)}`,
      {
        method: "GET",
        headers: API_HEADERS,
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message || "Student not found" };
    }

    return { success: true, student: data };
  } catch (error) {
    console.error("Search error:", error);
    return { error: "Failed to search student" };
  }
}

// Create team
async function createTeamAPI() {
  const memberCodes = STATE.members.map((m) => m.student_code);

  try {
    const response = await fetch(`${API_BASE}/groups`, {
      method: "POST",
      headers: API_HEADERS,
      body: JSON.stringify({
        project_title: STATE.projectTitle,
        category: STATE.category,
        member_codes: memberCodes,
        supervisor_id: STATE.selectedSupervisor,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create team");
    }

    // Update state with created group
    STATE.teamId = data.group.group_code || data.group.team_code;
    STATE.teamCreated = true;
    STATE.teamRole = "Leader";
    STATE.groupData = data.group;

    return { success: true, group: data.group };
  } catch (error) {
    console.error("Team creation error:", error);
    return { error: error.message };
  }
}

// Load team marks from backend
async function loadTeamMarks() {
  try {
    const response = await fetch(`${API_BASE}/students/team-marks`, {
      method: "GET",
      headers: API_HEADERS,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load marks");
    }

    // Process marks data
    data.forEach((markRecord) => {
      const studentCode = markRecord.student.student_code;
      STUDENT_MARKS[studentCode] = convertBackendMarks(markRecord);
    });

    ensureMarksExist(); // Fill in any missing data with generated marks
  } catch (error) {
    console.error("Marks load error:", error);
    // Fallback to generated marks
    ensureMarksExist();
  }
}

// Convert backend marks format to frontend format
function convertBackendMarks(markRecord) {
  // This function should map your backend marks structure to the frontend MARKS_TEMPLATE
  // For now, using generated marks as placeholder
  return generateMarks(Math.random() * 10000);
}

/* ══════════════════════════════════
   TAB NAVIGATION
══════════════════════════════════ */
const TITLES = {
  home: "Home",
  team: "My Team",
  project: "My Project",
  supervisor: "Supervisor",
  progress: "Progress & Evaluation",
};
const SUBS = {
  home: "Welcome back — here's your project overview",
  team: "Manage your FYP team and members",
  project: "Submit proposal, upload files, and track deadlines",
  supervisor: "Supervisor information and contact details",
  progress: "Marks breakdown, charts, and evaluation progress",
};

function switchTab(tab, el) {
  document
    .querySelectorAll(".dash-subpage")
    .forEach((p) => p.classList.remove("active"));
  const t = document.getElementById("tab-" + tab);
  if (t) t.classList.add("active");
  document
    .querySelectorAll(".sb-item")
    .forEach((i) => i.classList.remove("active"));
  if (el) el.classList.add("active");
  document.getElementById("page-title").textContent = TITLES[tab] || tab;
  document.getElementById("page-sub").textContent = SUBS[tab] || "";
  if (tab === "team") renderTeamTab();
  if (tab === "progress") {
    loadTeamMarks().then(() => renderEvaluation());
  }
  if (tab === "project") setProposalState(STATE.proposalState);
  if (tab === "supervisor") renderSupervisorTab();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ══════════════════════════════════
   NOTIFICATION DROPDOWN
══════════════════════════════════ */
function toggleNotifDropdown(e) {
  e.stopPropagation();
  const dropdown = document.getElementById("notif-dropdown");
  if (dropdown) dropdown.classList.toggle("open");
}

function closeNotifDropdown() {
  const dropdown = document.getElementById("notif-dropdown");
  if (dropdown) dropdown.classList.remove("open");
}

function markAllRead() {
  STATE.unreadNotifs = 0;
  const dot = document.getElementById("notif-dot");
  if (dot) dot.classList.add("hidden");
  document
    .querySelectorAll(".nd-item.nd-unread")
    .forEach((el) => el.classList.remove("nd-unread"));
  toast("All notifications marked as read");
  closeNotifDropdown();
}

document.addEventListener("click", function (e) {
  const wrap = document.getElementById("notif-btn")?.closest(".nav-notif-wrap");
  if (wrap && !wrap.contains(e.target)) closeNotifDropdown();
});

/* ══════════════════════════════════
   PROPOSAL SUBMISSION
══════════════════════════════════ */
function setProposalState(state) {
  STATE.proposalState = state;
  const area = document.getElementById("proposal-state-area");
  const badge = document.getElementById("proposal-status-badge");
  if (!area) return;

  if (state === "idle") {
    badge.textContent = "Not Submitted";
    badge.className = "status-badge s-none";
    area.innerHTML = `
      <div class="proposal-upload-zone" id="proposal-drop-zone"
           onclick="document.getElementById('proposal-file-input').click()"
           ondragover="event.preventDefault();this.classList.add('drag-over')"
           ondragleave="this.classList.remove('drag-over')"
           ondrop="handleProposalDrop(event)">
        <div class="puz-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        </div>
        <div class="puz-text">Drag & drop your proposal or <span style="color:var(--primary);text-decoration:underline;font-weight:700">browse</span></div>
        <div class="puz-hint">PDF or DOCX · Max 20 MB</div>
        <input type="file" id="proposal-file-input" hidden accept=".pdf,.docx,.doc" onchange="handleProposalUpload(this.files)">
      </div>`;
  } else if (state === "pending") {
    badge.textContent = "Pending Review";
    badge.className = "status-badge s-pending";
    area.innerHTML = `
      <div class="proposal-pending-state">
        <div class="pstate-icon pending">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <div class="pstate-info">
          <strong>Proposal Under Review</strong>
          <span>Your proposal has been submitted and is awaiting approval from your supervisor.</span>
          ${STATE.proposalFile ? `<div class="proposal-filename">${STATE.proposalFile}</div>` : ""}
        </div>
      </div>`;
  } else if (state === "approved") {
    badge.textContent = "Approved";
    badge.className = "status-badge s-approved";
    badge.style.background = "rgba(0,75,45,.1)";
    badge.style.color = "var(--primary)";
    area.innerHTML = `
      <div class="proposal-approved-state">
        <div class="pstate-icon approved">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div class="pstate-info">
          <strong>Proposal Approved</strong>
          <span>Your FYP proposal has been officially approved by your supervisor.</span>
          ${STATE.proposalFile ? `<div class="proposal-filename">${STATE.proposalFile}</div>` : ""}
        </div>
      </div>`;
  } else if (state === "rejected") {
    badge.textContent = "Rejected";
    badge.className = "status-badge s-rejected";
    area.innerHTML = `
      <div class="proposal-rejected-state">
        <div style="display:flex;gap:14px;align-items:center">
          <div class="pstate-icon rejected">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </div>
          <div class="pstate-info">
            <strong>Proposal Rejected</strong>
            <span>Your proposal was not approved. Please revise and re-upload.</span>
          </div>
        </div>
        <div class="proposal-upload-zone" style="margin-top:12px"
             onclick="document.getElementById('proposal-file-input-re').click()"
             ondragover="event.preventDefault();this.classList.add('drag-over')"
             ondragleave="this.classList.remove('drag-over')"
             ondrop="handleProposalDrop(event)">
          <div class="puz-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
          <div class="puz-text">Re-upload revised proposal</div>
          <div class="puz-hint">PDF or DOCX · Max 20 MB</div>
          <input type="file" id="proposal-file-input-re" hidden accept=".pdf,.docx,.doc" onchange="handleProposalUpload(this.files)">
        </div>
      </div>`;
  }
}

function handleProposalUpload(files) {
  if (!files.length) return;
  const file = files[0];
  const ext = file.name.split(".").pop().toLowerCase();
  if (!["pdf", "docx", "doc"].includes(ext)) {
    toast("Only PDF and DOCX files are accepted", "red");
    return;
  }
  if (file.size > 20 * 1024 * 1024) {
    toast("File exceeds 20 MB limit", "red");
    return;
  }
  STATE.proposalFile = file.name;
  STATE.proposalState = "pending";
  setProposalState("pending");
  toast("Proposal uploaded successfully ✓", "gold");
  // TODO: Upload to backend
}

function handleProposalDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove("drag-over");
  if (e.dataTransfer.files.length) handleProposalUpload(e.dataTransfer.files);
}

/* ══════════════════════════════════
   EVALUATION & MARKS RENDERING
══════════════════════════════════ */
let marksChart = null;

function renderEvaluation() {
  ensureMarksExist();
  renderStudentTabs();
  renderMarksForStudent(STATE.selectedEvalStudent);
}

function renderStudentTabs() {
  const tabs = document.getElementById("student-tabs");
  if (!tabs) return;
  const students = getAllStudents();
  tabs.innerHTML = students
    .map(
      (s, i) => `
    <button class="student-tab-btn ${i === STATE.selectedEvalStudent ? "active" : ""}"
            onclick="selectEvalStudent(${i})">
      <div class="stb-av">${s.initials}</div>
      ${s.name}
    </button>`,
    )
    .join("");
}

function selectEvalStudent(idx) {
  STATE.selectedEvalStudent = idx;
  renderStudentTabs();
  renderMarksForStudent(idx);
}

function renderMarksForStudent(idx) {
  const students = getAllStudents();
  const student = students[idx];
  if (!student) return;
  const marks = STUDENT_MARKS[student.id];
  if (!marks) return;

  let totalObtained = 0;
  let totalMax = 0;
  marks.forEach((m) => {
    totalMax += m.max;
    if (m.marks !== null) totalObtained += m.marks;
  });
  const pct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;

  const evalTotalVal = document.getElementById("eval-total-val");
  const evalPctRing = document.getElementById("eval-pct-ring");
  const evalStudentLabel = document.getElementById("eval-student-name-label");

  if (evalTotalVal) evalTotalVal.textContent = totalObtained;
  if (evalPctRing) evalPctRing.innerHTML = pct + "<small>%</small>";
  if (evalStudentLabel) evalStudentLabel.textContent = student.name;

  const progBarPct = document.getElementById("prog-bar-pct");
  const evalProgFill = document.getElementById("eval-prog-fill");
  if (progBarPct) progBarPct.textContent = pct + "%";
  if (evalProgFill) evalProgFill.style.width = pct + "%";

  renderMarksTable(marks, totalObtained, totalMax);
  renderPieChart(marks);
  renderBreakdown(marks, totalObtained, totalMax);
}

function getMarkColor(marks, max) {
  if (marks === null) return "mark-pending";
  const pct = (marks / max) * 100;
  if (pct >= 75) return "mark-green";
  if (pct >= 50) return "mark-yellow";
  return "mark-red";
}

function renderMarksTable(marks, totalObtained, totalMax) {
  const tbody = document.getElementById("marks-comp-tbody");
  if (!tbody) return;

  let html = "";
  let currentSection = "";

  marks.forEach((m) => {
    if (m.section !== currentSection) {
      currentSection = m.section;
      html += `<tr class="section-header"><td colspan="3">${currentSection}</td></tr>`;
    }
    const color = getMarkColor(m.marks, m.max);
    const pctW = m.marks !== null ? Math.round((m.marks / m.max) * 100) : 0;

    html += `<tr>
      <td>${m.component}</td>
      <td style="text-align:right">${m.max}</td>
      <td>
        ${
          m.marks !== null
            ? `
          <div class="mc-marks-cell ${color}">
            <div class="mc-mark-bar"><div class="mc-mark-fill" style="width:${pctW}%"></div></div>
            <span class="mc-mark-num">${m.marks}</span>
            <span class="mc-mark-out">/ ${m.max}</span>
          </div>`
            : `
          <div class="mc-marks-cell mark-pending" style="justify-content:flex-end">
            <span class="mc-pending-badge">Pending</span>
          </div>`
        }
      </td>
    </tr>`;
  });

  const totalPct =
    totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
  const totalColor =
    totalPct >= 75 ? "mark-green" : totalPct >= 50 ? "mark-yellow" : "mark-red";
  html += `<tr class="total-row">
    <td>GRAND TOTAL</td>
    <td style="text-align:right">${totalMax}</td>
    <td>
      <div class="mc-marks-cell ${totalColor}">
        <span class="mc-mark-num" style="font-size:1.2rem">${totalObtained}</span>
        <span class="mc-mark-out">/ ${totalMax}</span>
      </div>
    </td>
  </tr>`;

  tbody.innerHTML = html;
}

function renderPieChart(marks) {
  const canvas = document.getElementById("marksChart");
  if (!canvas) return;

  const sections = {};
  marks.forEach((m) => {
    if (!sections[m.section]) sections[m.section] = { obtained: 0, max: 0 };
    sections[m.section].max += m.max;
    if (m.marks !== null) sections[m.section].obtained += m.marks;
  });

  const labels = Object.keys(sections);
  const data = labels.map((l) => sections[l].obtained);
  const colors = ["#004b2d", "#1f7a5c", "#bfa14a", "#2a9670", "#d4b96b"];

  if (marksChart) marksChart.destroy();

  marksChart = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 2,
          borderColor: "#fff",
          hoverOffset: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "55%",
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#003520",
          titleFont: {
            family: "'DM Sans', sans-serif",
            size: 12,
            weight: "700",
          },
          bodyFont: { family: "'DM Sans', sans-serif", size: 11 },
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: function (ctx) {
              const section = labels[ctx.dataIndex];
              return ` ${section}: ${ctx.parsed} / ${sections[section].max}`;
            },
          },
        },
      },
    },
  });

  const legend = document.getElementById("chart-legend");
  if (legend) {
    legend.innerHTML = labels
      .map(
        (l, i) => `
      <div class="cl-item">
        <div class="cl-dot" style="background:${colors[i]}"></div>
        ${l}: <strong>${data[i]}</strong> / ${sections[l].max}
      </div>`,
      )
      .join("");
  }
}

function renderBreakdown(marks, totalObtained, totalMax) {
  const list = document.getElementById("breakdown-list");
  if (!list) return;

  const sections = {};
  marks.forEach((m) => {
    if (!sections[m.section]) sections[m.section] = { obtained: 0, max: 0 };
    sections[m.section].max += m.max;
    if (m.marks !== null) sections[m.section].obtained += m.marks;
  });

  const colors = {
    "Monthly Meetings": "#004b2d",
    Submissions: "#1f7a5c",
    Viva: "#bfa14a",
  };

  list.innerHTML = Object.entries(sections)
    .map(([name, s]) => {
      const pct = s.max > 0 ? Math.round((s.obtained / s.max) * 100) : 0;
      const color = colors[name] || "#004b2d";
      return `
      <div style="margin-bottom:4px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <span style="font-size:.78rem;font-weight:600;color:var(--text-soft)">${name}</span>
          <span style="font-size:.78rem;font-weight:800;color:${color}">${s.obtained} / ${s.max}</span>
        </div>
        <div style="height:8px;background:var(--border-soft);border-radius:4px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:${color};border-radius:4px;transition:width .8s ease"></div>
        </div>
      </div>`;
    })
    .join("");
}

/* ══════════════════════════════════
   FILE UPLOAD
══════════════════════════════════ */
function handleDragOver(e) {
  e.preventDefault();
  const uploadArea = document.getElementById("upload-area");
  if (uploadArea) uploadArea.classList.add("drag-over");
}

function handleDragLeave(e) {
  const uploadArea = document.getElementById("upload-area");
  if (uploadArea) uploadArea.classList.remove("drag-over");
}

function handleDrop(e) {
  e.preventDefault();
  const uploadArea = document.getElementById("upload-area");
  if (uploadArea) uploadArea.classList.remove("drag-over");
  if (e.dataTransfer.files.length) processFiles(e.dataTransfer.files);
}

function handleFileSelect(files) {
  if (files.length) processFiles(files);
}

function processFiles(files) {
  Array.from(files).forEach((file) => {
    if (file.size > 20 * 1024 * 1024) {
      toast(`${file.name} exceeds 20 MB limit`, "red");
      return;
    }
    const allowed = [
      "pdf",
      "docx",
      "doc",
      "zip",
      "png",
      "jpg",
      "jpeg",
      "xlsx",
      "pptx",
      "txt",
      "py",
      "js",
    ];
    const ext = file.name.split(".").pop().toLowerCase();
    if (!allowed.includes(ext)) {
      toast(`${ext.toUpperCase()} files are not supported`, "red");
      return;
    }
    const id = Date.now() + Math.random();
    STATE.uploadedFiles.push({
      id,
      name: file.name,
      size: file.size,
      ext,
      status: "Uploaded",
    });
    renderUploadedFiles();
    toast(file.name + " uploaded ✓");
  });
  const fileInput = document.getElementById("file-input");
  if (fileInput) fileInput.value = "";
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function getFileIconSvg(ext) {
  const pdf = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>`;
  const zip = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`;
  const img = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;
  const code = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`;
  const def = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;
  if (ext === "pdf") return pdf;
  if (["zip", "rar"].includes(ext)) return zip;
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return img;
  if (["py", "js", "ts", "cpp", "java", "html", "css"].includes(ext))
    return code;
  return def;
}

function renderUploadedFiles() {
  const list = document.getElementById("uploaded-files-list");
  if (!list) return;

  if (!STATE.uploadedFiles.length) {
    list.innerHTML = "";
    return;
  }
  list.innerHTML = STATE.uploadedFiles
    .map(
      (f) => `
    <div class="file-item" id="fi-${f.id}">
      <div class="file-icon">${getFileIconSvg(f.ext)}</div>
      <div class="file-name" title="${f.name}">${f.name}</div>
      <span class="file-size">${formatSize(f.size)}</span>
      <span class="file-status">${f.status}</span>
      <button class="file-remove" onclick="removeFile(${f.id})" title="Remove">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>`,
    )
    .join("");
}

function removeFile(id) {
  STATE.uploadedFiles = STATE.uploadedFiles.filter((f) => f.id !== id);
  renderUploadedFiles();
  toast("File removed");
}

/* ══════════════════════════════════
   SETUP FLOW (3 steps)
══════════════════════════════════ */
async function openSetup() {
  const setupOverlay = document.getElementById("setup-overlay");
  if (!setupOverlay) return;

  setupOverlay.style.display = "flex";

  // Load supervisors first
  await loadSupervisors();

  // Get next team ID from backend
  const nextTeamId = await getNextTeamId();
  STATE.teamId = nextTeamId;

  const displayTeamId = document.getElementById("display-team-id");
  const leaderStdId = document.getElementById("leader-std-id");
  const leaderName = document.getElementById("leader-name");
  const leaderAv = document.getElementById("leader-av");

  if (displayTeamId) displayTeamId.textContent = nextTeamId;
  if (leaderStdId) leaderStdId.textContent = STATE.studentId;
  if (leaderName) leaderName.textContent = STATE.studentName;
  if (leaderAv) leaderAv.textContent = initials(STATE.studentName);

  showStep(1);
}

function closeSteup() {
  const setupOverlay = document.getElementById("setup-overlay");
  if (setupOverlay) setupOverlay.style.display = "none";
  updateDashboardUI();
  renderTeamTab();
  updateBannerForTeam();
}

function showStep(n) {
  [1, 2, 3, "done"].forEach((s) => {
    const step = document.getElementById("setup-step-" + s);
    if (step) step.style.display = "none";
  });
  const activeStep = document.getElementById("setup-step-" + n);
  if (activeStep) activeStep.style.display = "block";
}

function goStep2() {
  const projInput = document.getElementById("s1-proj");
  const categoryInput = document.getElementById("s1-cat");

  if (!projInput) {
    toast("Project title field not found", "red");
    return;
  }

  const proj = projInput.value.trim();
  const category = categoryInput ? categoryInput.value.trim() : "";

  if (!proj) {
    toast("Please fill in Project Title", "red");
    return;
  }

  STATE.projectTitle = proj;
  STATE.category = category;

  const displayTeamId = document.getElementById("display-team-id");
  if (displayTeamId) displayTeamId.textContent = "Creating...";

  renderMemberSlots();
  clearSearch();
  showStep(2);
}

function backStep1() {
  showStep(1);
}

function goStep3() {
  // Populate supervisor dropdown with real data
  const supSelect = document.getElementById("sup-select");
  if (supSelect) {
    supSelect.innerHTML = '<option value="">— Choose a supervisor —</option>' +
      SUPERVISORS.map(sup => {
        const researchAreas = sup.research_areas && sup.research_areas.length > 0
          ? ` — ${sup.research_areas.slice(0, 3).join(", ")}`
          : "";
        
        return `<option value="${sup.id}">${sup.name}${researchAreas}</option>`;
      }).join("");
    
    // Set previously selected supervisor if exists
    if (STATE.selectedSupervisor) {
      supSelect.value = STATE.selectedSupervisor;
    }
  }

  updateSupPreview(STATE.selectedSupervisor);
  showStep(3);
}

function backStep2() {
  showStep(2);
}

function selectSupervisor(id) {
  STATE.selectedSupervisor = id || null;
  updateSupPreview(id);
}

function updateSupPreview(id) {
  const preview = document.getElementById("sup-preview");
  if (!id || !preview) {
    if (preview) preview.style.display = "none";
    return;
  }
  
  const sup = SUPERVISORS.find((s) => s.id === id);
  if (!sup) {
    preview.style.display = "none";
    return;
  }
  
  const supPreviewName = document.getElementById("sup-preview-name");
  const supPreviewDept = document.getElementById("sup-preview-dept");

  if (supPreviewName) supPreviewName.textContent = sup.name;
  if (supPreviewDept) {
    const deptText = sup.designation || "Faculty Member";
    const researchText = sup.research_areas && sup.research_areas.length > 0
      ? ` · ${sup.research_areas.slice(0, 2).join(", ")}`
      : "";
    supPreviewDept.textContent = deptText + researchText;
  }
  
  preview.style.display = "flex";
}

async function finishSetup() {
  if (!STATE.selectedSupervisor) {
    toast("Please select a supervisor to continue", "red");
    return;
  }

  // Call backend API to create team
  toast("Creating team...", "gold");

  const result = await createTeamAPI();

  if (result.error) {
    toast("Failed to create team: " + result.error, "red");
    return;
  }

  STATE.teamCreated = true;
STATE.teamId = result.group.group_code;

// Reset marks for new team
STUDENT_MARKS = {};


const selSup = SUPERVISORS.find((s) => s.id === STATE.selectedSupervisor);
if (selSup) {
  STATE.supervisorData = {
    _id:            selSup.id,
    name:           selSup.name,
    email:          selSup.email,
    designation:    selSup.designation || "Faculty Member",
    research_areas: selSup.research_areas || [],
    office:         selSup.office || "CS Department",
    office_hours:   selSup.office_hours || "Contact for details",
    sup_code:       selSup.sup_code,
  };
}
  const chips = [
    { icon: "id", text: STATE.teamId },
    {
      icon: "proj",
      text:
        STATE.projectTitle.length > 28
          ? STATE.projectTitle.slice(0, 28) + "…"
          : STATE.projectTitle,
    },
    {
      icon: "members",
      text:
        STATE.members.length +
        1 +
        " member" +
        (STATE.members.length !== 0 ? "s" : ""),
    },
  ];
  if (selSup) chips.push({ icon: "sup", text: selSup.name });

  const svgMap = {
    id: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/></svg>`,
    proj: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>`,
    members: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>`,
    sup: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  };

  const summaryChips = document.getElementById("summary-chips");
  if (summaryChips) {
    summaryChips.innerHTML = chips
      .map((c) => `<div class="s-chip">${svgMap[c.icon]}${c.text}</div>`)
      .join("");
  }

  showStep("done");

  setTimeout(() => {
    toast("⚠ Save your Team ID — you'll need it later!", "gold");
  }, 1500);
}

/* ══ Member search ══ */
let searchDebounce;

function searchMember(val) {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => _doSearch(val.trim()), 300);
}

async function _doSearch(val) {
  const res = document.getElementById("search-result");
  if (!res) return;

  if (!val) {
    res.classList.remove("show");
    return;
  }

  if (!val.startsWith("STD")) {
    res.innerHTML = '<div class="sr-error">Format must be STD-20261234</div>';
    res.classList.add("show");
    return;
  }

  if (val === STATE.studentId) {
    res.innerHTML = '<div class="sr-error">This is your own ID</div>';
    res.classList.add("show");
    return;
  }

  if (STATE.members.find((m) => m.student_code === val)) {
    res.innerHTML = '<div class="sr-error">Member already added</div>';
    res.classList.add("show");
    return;
  }

  if (STATE.members.length >= 2) {
    res.innerHTML =
      '<div class="sr-error">Team is full (max 2 additional members)</div>';
    res.classList.add("show");
    return;
  }

  // Call backend API to search for student
  res.innerHTML = '<div class="sr-empty">Searching...</div>';
  res.classList.add("show");

  const searchResult = await searchStudentByCode(val);

  if (searchResult.error) {
    res.innerHTML = `<div class="sr-empty">${searchResult.error}</div>`;
    res.classList.add("show");
    return;
  }

  const foundUser = searchResult.student;

  if (foundUser.in_team) {
    res.innerHTML = '<div class="sr-error">Student is already in a team</div>';
    res.classList.add("show");
    return;
  }

  res.innerHTML = `<div class="sr-item">
    <div class="sr-info"><strong>${foundUser.name}</strong><small>${foundUser.student_code}</small></div>
    <button class="sr-add" onclick="addMember('${foundUser.student_code}','${foundUser.name}','${foundUser.initials}')">+ Add</button>
  </div>`;
  res.classList.add("show");
}

function addMember(studentCode, name, ini) {
  if (STATE.members.length >= 2) {
    toast("Team is full", "red");
    return;
  }
  STATE.members.push({ student_code: studentCode, name, initials: ini });

  const memberSearch = document.getElementById("member-search");
  const searchResult = document.getElementById("search-result");

  if (memberSearch) memberSearch.value = "";
  if (searchResult) searchResult.classList.remove("show");

  renderMemberSlots();
  toast(name + " added to team ✓");
}

function removeMember(idx) {
  const removed = STATE.members[idx].name;
  STATE.members.splice(idx, 1);
  renderMemberSlots();
  toast(removed + " removed");
}
async function addMemberAPI(studentCode) {
  if (!STATE.teamId) {
    toast("No team", "Create a team first", "red");
    return { error: "No team" };
  }

  // Get the MongoDB _id of the group from STATE
  const groupId = STATE.groupData?._id;
  if (!groupId) {
    toast("Error", "Team data not loaded", "red");
    return { error: "No team ID" };
  }

  try {
    const res = await fetch(`${API_BASE}/groups/${groupId}/add-member`, {
      method: "PUT",
      headers: API_HEADERS,
      body: JSON.stringify({ student_code: studentCode }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");

    // Update local state with new group data
    STATE.groupData = data.group;

    return { success: true, group: data.group };
  } catch (err) {
    return { error: err.message };
  }
}
function clearSearch() {
  const memberSearch = document.getElementById("member-search");
  const searchResult = document.getElementById("search-result");

  if (memberSearch) memberSearch.value = "";
  if (searchResult) searchResult.classList.remove("show");
}

function renderMemberSlots() {
  const list = document.getElementById("members-list");
  if (!list) return;

  const leaderHTML = `<div class="tm-item">
    <div><div class="tm-name">${STATE.studentName}</div><div class="tm-id">${STATE.studentId}</div></div>
    <span class="tm-role tm-lead">Team Leader</span>
  </div>`;

  const membersHTML = STATE.members
    .map(
      (m, i) => `
    <div class="tm-item" style="margin-top:8px">
      <div><div class="tm-name">${m.name}</div><div class="tm-id">${m.student_code}</div></div>
      <span class="tm-role tm-member">Member</span>
      <button class="tm-remove" onclick="removeMember(${i})">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>`,
    )
    .join("");

  list.innerHTML = leaderHTML + membersHTML;

  const slot1 = document.getElementById("slot-1");
  const slot2 = document.getElementById("slot-2");

  if (slot1) slot1.style.display = STATE.members.length < 1 ? "flex" : "none";
  if (slot2) slot2.style.display = STATE.members.length < 2 ? "flex" : "none";
}

/* ══ Render team tab ══ */
function renderTeamTab() {
  const ti = document.getElementById("team-tab-id");
  const tp = document.getElementById("team-tab-proj");
  if (ti && STATE.teamId) ti.textContent = STATE.teamId;
  if (tp && STATE.projectTitle) tp.textContent = STATE.projectTitle;

  const display = document.getElementById("team-members-display");
  if (!display) return;

  if (!STATE.teamCreated) {
    display.innerHTML = `<div style="text-align:center;padding:36px 20px">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="48" height="48" style="margin:0 auto 16px;color:var(--border)"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      <h4 style="font-size:1rem;font-weight:700;color:var(--text-soft);margin-bottom:8px">No Team Created Yet</h4>
      <p style="font-size:.84rem;color:var(--text-mute);margin-bottom:20px">Create your team to start your FYP journey.</p>
      <button class="btn btn-primary" onclick="openSetup()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Create Team
      </button>
    </div>`;
    return;
  }

  const allMembers = [
    {
      student_code: STATE.studentId,
      name: STATE.studentName,
      initials: initials(STATE.studentName),
      role: STATE.teamRole || "Team Leader",
      isYou: true,
    },
    ...STATE.members.map((m) => ({
      ...m,
      role: m.role || "Member",
      isYou: false,
    })),
  ];

  display.innerHTML = allMembers
    .map(
      (m) => `
    <div class="tm-item" style="margin-bottom:8px">
      <div class="tm-av">${m.initials}</div>
      <div>
        <div class="tm-name">${m.name}${m.isYou ? " (You)" : ""}</div>
        <div class="tm-id">${m.student_code}</div>
      </div>
      <span class="tm-role ${m.role === "Team Leader" || m.role === "Leader" ? "tm-lead" : "tm-member"}">${m.role}</span>
    </div>`,
    )
    .join("");

    const totalMembers = 1 + STATE.members.length; // leader + members
    if (totalMembers < 3 && STATE.teamRole === "Leader") {
display.innerHTML += `
    <div style="margin-top:20px;padding-top:16px;border-top:1px dashed var(--border-soft);display:flex;justify-content:center">
      <button onclick="openAddMemberModal()" style="background:var(--primary);color:#fff;border:none;border-radius:12px;padding:12px 28px;font-size:.9rem;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:5px;box-shadow:0 4px 14px rgba(0,75,45,.3);transition:opacity .2s" onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Member
      </button>
    </div>`;
}
}

function openAddMemberModal() {
  memberCountBeforeModal = STATE.members.length; 
}

function saveNewMember() {
  if (STATE.members.length <= memberCountBeforeModal) {
    toast("Please search and add a member first", "red");
    return;
  }
  closeAddMemberModal();
  toast("Member added successfully");
}

function closeAddMemberModal() {
  const setupOverlay = document.getElementById("setup-overlay");
  if (setupOverlay) setupOverlay.style.display = "none";
  // Restore step 2 footer for future use in setup flow
  const footer = document.getElementById("setup-step-2")?.querySelector(".setup-footer");
  if (footer) {
footer.innerHTML = `
  <button class="btn btn-ghost" onclick="closeAddMemberModal()">✕ Close</button>
  <button class="btn btn-primary" onclick="saveNewMember()">
    Save Member
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
  </button>`;
  }
  // Remove close button
  document.querySelector(".modal-close-btn")?.remove();
  renderTeamTab();
}

function saveNewMember() {
  const beforeCount = STATE.members.length;
  if (STATE.members.length === 0 || STATE.members.length === beforeCount) {
    toast("Please search and add a member first", "red");
    return;
  }
  closeAddMemberModal();
  toast("Member added successfully");
}

/* ══ Render supervisor tab ══ */
function renderSupervisorTab() {
  if (!STATE.supervisorData) {
    // Show a "no supervisor yet" state
    const card = document.querySelector("#tab-supervisor .dash-card-body");
    if (card) {
      card.innerHTML = `
        <div style="text-align:center;padding:36px 20px">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
               stroke-linecap="round" stroke-linejoin="round"
               width="48" height="48" style="margin:0 auto 16px;color:var(--border)">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <h4 style="font-size:1rem;font-weight:700;color:var(--text-soft);margin-bottom:8px">
            No Supervisor Assigned
          </h4>
          <p style="font-size:.84rem;color:var(--text-mute)">
            Complete your team setup to get a supervisor.
          </p>
        </div>`;
    }
    return;
  }

  const sup = STATE.supervisorData;

  // Build the supervisor tab content dynamically
  const card = document.querySelector("#tab-supervisor .dash-card-body");
  if (!card) return;

  card.innerHTML = `
    <div class="sup-card">
      <div class="sup-avatar">${initials(sup.name || "")}</div>
      <div class="sup-info">
        <strong>${sup.name || "—"}</strong>
        <span>${sup.designation || "Faculty Member"} · Dept. of Computer Science</span>
      </div>
    </div>
    <div class="proj-row">
      <span class="proj-key">Email</span>
      <span class="proj-val">${sup.email || "—"}</span>
    </div>
    <div class="proj-row">
      <span class="proj-key">Office</span>
      <span class="proj-val">${sup.office || "CS Department"}</span>
    </div>
    <div class="proj-row">
      <span class="proj-key">Office Hours</span>
      <span class="proj-val">${sup.office_hours || "Contact supervisor directly"}</span>
    </div>
    <div class="proj-row">
      <span class="proj-key">Research Areas</span>
      <span class="proj-val">${
        sup.research_areas && sup.research_areas.length
          ? sup.research_areas.join(", ")
          : "—"
      }</span>
    </div>
    ${sup.sup_code ? `
    <div class="proj-row">
      <span class="proj-key">Supervisor ID</span>
      <span class="proj-val">
        <span class="id-highlight id-highlight-team">${sup.sup_code}</span>
      </span>
    </div>` : ""}
  `;
}

function updateBannerForTeam() {
  if (STATE.teamId) {
    const ids = ["banner-team-id", "ov-team-id", "proj-team-id", "team-tab-id", "proj-tab-team-id"];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = STATE.teamId;
    });
  }
}

function updateDashboardUI() {
  // Update all dashboard elements with team data
  const elements = {
    "banner-team-id": STATE.teamId,
    "ov-team-id": STATE.teamId,
    "team-tab-id": STATE.teamId,
    "team-tab-proj": STATE.projectTitle,
    "proj-team-id": STATE.teamId,       
    "proj-tab-team-id": STATE.teamId,
    "stat-project-title": STATE.projectTitle,
    "ov-proj-title": STATE.projectTitle,    
    "ov-student-id": STATE.studentId,        
    "proj-student-id": STATE.studentId,      
    "proj-team-id": STATE.teamId,     
    "ov-proj-category": STATE.category, 
    "proj-tab-team-id": STATE.teamId,   
    "proj-tab-title": STATE.projectTitle,    
    "proj-tab-category": STATE.category,  
    "stat-supervisor-name":  STATE.supervisorData?.name || "Not assigned",
    "proj-supervisor-name":  STATE.supervisorData?.name || "Not assigned",
  };

  Object.entries(elements).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el && value) el.textContent = value;
  });

  // Update supervisor info if available
  if (STATE.supervisorData) {
    const supNameElements = document.querySelectorAll(".supervisor-name");
    supNameElements.forEach((el) => {
      if (el) el.textContent = STATE.supervisorData.name;
    });
  }
}

/* ══════════════════════════════════
   HELPERS
══════════════════════════════════ */
function initials(name) {
  return (name || "")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

let toastTimer;
function toast(msg, type) {
  const t = document.getElementById("toast");
  if (!t) return;

  t.textContent = msg;
  t.className =
    "toast" +
    (type === "red" ? " red" : type === "gold" ? " gold" : "") +
    " show";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2800);
}
function openAddMemberModal() {
  memberCountBeforeModal = STATE.members.length;
  
  const setupOverlay = document.getElementById("setup-overlay");
  if (setupOverlay) setupOverlay.style.display = "flex";
  
  renderMemberSlots();
  clearSearch();
  
  // Hide all steps
  [1, 2, 3, "done"].forEach((s) => {
    const step = document.getElementById("setup-step-" + s);
    if (step) step.style.display = "none";
  });
  
  // Show step 2 only
  const step2 = document.getElementById("setup-step-2");
  if (step2) step2.style.display = "block";
  
  // Replace footer with Save + Close buttons
  const footer = step2.querySelector(".setup-footer");
  if (footer) {
    footer.innerHTML = `
      <button class="btn btn-ghost" onclick="closeAddMemberModal()">✕ Close</button>
      <button class="btn btn-primary" onclick="saveNewMember()">
        Save Member
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
      </button>`;
  }
  
  // Add X button to header
  const header = step2.querySelector(".setup-header");
  if (header && !header.querySelector(".modal-close-btn")) {
    header.style.position = "relative";
    header.insertAdjacentHTML("beforeend", `
      <button class="modal-close-btn" onclick="closeAddMemberModal()" style="position:absolute;top:14px;right:14px;background:none;border:none;cursor:pointer;color:var(--text-soft)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>`);
  }
}

function closeAddMemberModal() {
  const setupOverlay = document.getElementById("setup-overlay");
  if (setupOverlay) setupOverlay.style.display = "none";
  
  // Restore original step 2 footer
  const footer = document.getElementById("setup-step-2")?.querySelector(".setup-footer");
  if (footer) {
    footer.innerHTML = `
      <button class="btn btn-ghost" onclick="backStep1()">← Back</button>
      <button class="btn btn-primary" onclick="goStep3()">
        Next: Choose Supervisor
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>`;
  }
  
  // Remove X button
  document.querySelector(".modal-close-btn")?.remove();
  renderTeamTab();
}

function saveNewMember() {
  if (STATE.members.length <= memberCountBeforeModal) {
    toast("Please search and add a member first", "red");
    return;
  }
  closeAddMemberModal();
  toast("Member added successfully ✓");
}


// Get next available team ID from backend
async function getNextTeamId() {
  try {
    const response = await fetch(`${API_BASE}/groups/next-id`, {
      method: "GET",
      headers: API_HEADERS,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to get team ID");
    }

    return data.team_id;
  } catch (error) {
    console.error("Team ID fetch error:", error);
    toast("Failed to generate Team ID. Please refresh and try again.", "red");
    return "TEAM-PENDING"; // Better fallback that shows something went wrong
  }
}

async function addMember(studentCode, name, ini) {
  if (STATE.members.length >= 2) {
    toast("Team is full", "red");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/groups/${STATE.groupData._id}/add-member`, {
      method: "PUT",
      headers: API_HEADERS,
      body: JSON.stringify({ student_code: studentCode }),
    });

    const data = await response.json();

    if (!response.ok) {
      toast(data.message || "Failed to add member", "red");
      return;
    }

    // Update local state with returned data
    STATE.members.push({
      _id: data.member._id,
      student_code: data.member.student_code,
      name: data.member.name,
      initials: initials(data.member.name),
      role: "Member",
    });

    const memberSearch = document.getElementById("member-search");
    const searchResult = document.getElementById("search-result");
    if (memberSearch) memberSearch.value = "";
    if (searchResult) searchResult.classList.remove("show");

    renderMemberSlots();
    toast(name + " added to team ✓");

  } catch (error) {
    toast("Failed to add member: " + error.message, "red");
  }
}

async function uploadCV(file) {
  const user = JSON.parse(localStorage.getItem("user"));

  // FormData is required for file uploads — DON'T set Content-Type manually,
  // the browser sets the correct multipart boundary automatically
  const formData = new FormData();
  formData.append("cv", file);  // "cv" must match upload.single("cv") in the route

  try {
    const res = await fetch(`${API_BASE}/students/upload-cv`, {
      method: "POST",
      headers: {
        // ONLY Authorization here — no Content-Type!
        "Authorization": `Bearer ${user.token}`,
      },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Upload failed");

    toast("CV uploaded ✓", "gold");
    console.log("CV URL:", data.cv_url);
    return data.cv_url;

  } catch (err) {
    toast("Upload failed: " + err.message, "red");
    return null;
  }
}
/* ══════════════════════════════════
   INIT
══════════════════════════════════ */
function initDashboard() {
  // Set user info
  const navStdId = document.getElementById("nav-std-id");
  const navName = document.getElementById("nav-name");
  const navInitials = document.getElementById("nav-initials");
  const bannerName = document.getElementById("banner-name");
  const studentId = document.getElementById("student-id");

  if (navStdId) navStdId.textContent = STATE.studentId;
  if (navName) navName.textContent = STATE.studentName;
  if (navInitials) navInitials.textContent = initials(STATE.studentName);
  if (bannerName) bannerName.textContent = STATE.studentName;
  if (studentId) studentId.textContent = STATE.studentId;

  // Load dashboard data from backend
  loadDashboard();
}

// Start initialization when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDashboard);
} else {
  initDashboard();
}
