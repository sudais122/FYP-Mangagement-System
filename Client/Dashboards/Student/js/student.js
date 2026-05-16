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
  userId: user._id, 
  teamId: null,
  projectTitle: null,
  category: null,
  members: [],
  selectedSupervisor: null,
  supervisorData: null,
  teamCreated: false,
  teamRole: null, 
  uploadedFiles: [],
  unreadNotifs: 2,
  proposalState: "idle",
  proposalFile: null,
  selectedEvalStudent: 0,
  groupData: null, 
  deadlines: [], 
};

/* ══════════════════════════════════
   MARKS DATA TEMPLATE
══════════════════════════════════ */
const MARKS_TEMPLATE = [
  { section: "Monthly Meetings", component: "October",  max: 10 },
  { section: "Monthly Meetings", component: "November", max: 10 },
  { section: "Monthly Meetings", component: "December", max: 10 },
  { section: "Monthly Meetings", component: "February", max: 10 },
  { section: "Monthly Meetings", component: "March",    max: 10 },
  { section: "Submissions", component: "Proposal Submission",      max: 10 },
  { section: "Submissions", component: "Progress Report",          max: 20 },
  { section: "Submissions", component: "Progress Similarity Check", max: 5  },
  { section: "Documentation", component: "Thesis / Final Report",   max: 20 },
  { section: "Documentation", component: "Thesis Similarity Check", max: 5  },
  { section: "Practical", component: "Code / Practical Work", max: 10 },
  { section: "Viva", component: "Internal Viva 1", max: 25 },
  { section: "Viva", component: "Internal Viva 2", max: 25 },
  { section: "Viva", component: "External Viva",   max: 30 },
];

let STUDENT_MARKS = {};

function getAllStudents() {
  return [
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
}

function ensureMarksExist() {
  const students = getAllStudents();
  students.forEach((s) => {
    if (!STUDENT_MARKS[s.id]) {
      STUDENT_MARKS[s.id] = MARKS_TEMPLATE.map(item => ({ ...item, marks: null }));
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
    console.log(data);
    console.log("group fields:", Object.keys(data.group));
    console.log("team_code value:", data.group.team_code);

    if (!response.ok) {
      throw new Error(data.message || "Failed to load dashboard");
    }

    if (data.hasGroup) {
      STATE.teamCreated = true;
      STATE.teamId =
        data.group.team_code || data.group.group_code || data.group._id;

      STATE.projectTitle = data.group.project_title;
      STATE.category = data.group.category;
      STATE.teamRole = data.student.team_role;
      STATE.groupData = data.group;

      // Proposal state
      const proposalStatus = data.group.proposal_status;
      const proposalUrl = data.group.proposal_url;

      if (proposalUrl) {
        STATE.proposalState = proposalStatus || "pending";
        STATE.proposalFile =
          data.group.proposal_filename || data.group.proposal_url;
      } else {
        STATE.proposalState = "idle";
      }

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
          avatar_url: data.group.leader.avatar_url || "",
          gender: data.group.leader.gender || "male",
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
              avatar_url: m.avatar_url || "",
              gender: m.gender || "male",
              role: "Member",
            });
          }
        });
      }

      // Populate supervisor
      if (data.group.supervisor) {
        STATE.selectedSupervisor = data.group.supervisor._id;
        STATE.supervisorData = {
          _id: data.group.supervisor._id,
          prefix: data.group.supervisor.prefix || "",
          name: data.group.supervisor.name,
          email: data.group.supervisor.email,
          designation:
            data.group.supervisor.designation || "Faculty Member",
          research_areas:
            data.group.supervisor.research_areas || [],
          office:
            data.group.supervisor.office || "CS Department",
          office_hours:
            data.group.supervisor.office_hours ||
            "Contact supervisor",
          sup_code: data.group.supervisor.sup_code,
          whatsapp: data.group.supervisor.whatsapp || "",
          avatar_url: data.group.supervisor.avatar_url || "",
        };
      }

      updateDashboardUI();
      renderTeamTab();
      updateBannerForTeam();
      renderSupervisorTab();
    } else {
      hideDashboardForSetup();
        openSetup();
    }
  } catch (error) {
    console.error(error);
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
    STATE.teamId = data.group.team_code || data.group.group_code || data.group._id;
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
    
    if (!response.ok) {
      const errText = await response.text();
      console.warn(`team-marks endpoint returned ${response.status}:`, errText);
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();

    // Reset and rebuild from backend response
    STUDENT_MARKS = {};

    if (Array.isArray(data)) {
      data.forEach(markRecord => {
        const studentCode = markRecord.student?.student_code;
        if (studentCode) {
          STUDENT_MARKS[studentCode] = convertBackendMarks(markRecord);
        }
      });
    } else {
      console.warn("team-marks response is not an array:", data);
    }
  } catch (error) {
    console.error("Marks load error:", error);
    // Don't break — just leave STUDENT_MARKS empty and let renderEvaluation handle it
    STUDENT_MARKS = {};
  } finally {
    // ALWAYS render, even on failure
    renderEvaluation();
  }
}
// Convert backend marks format to frontend format
function convertBackendMarks(markRecord) {
  const m             = markRecord || {};
  const monthly       = m.monthly       || {};
  const submissions   = m.submissions   || {};
  const viva          = m.viva          || {};
  const documentation = m.documentation || {};
  const practical     = m.practical     || {};

  const valueFor = (component) => {
    switch (component) {
      case "October":                  return monthly.oct          ?? null;
      case "November":                 return monthly.nov          ?? null;
      case "December":                 return monthly.dec          ?? null;
      case "February":                 return monthly.feb          ?? null;
      case "March":                    return monthly.mar          ?? null;

      case "Proposal Submission":      return submissions.proposal ?? null;
      case "Progress Report":          return submissions.progress ?? null;

      // ── Similarity fields — match admin's save keys ──
      case "Progress Similarity Check": return submissions.prog_sim   ?? null;   // ← FIX
      case "Thesis Similarity Check":   return submissions.thesis_sim ?? null;   // ← FIX

      // ── Code goes into submissions in admin save, not practical ──
      case "Code / Practical Work":     return submissions.code       ?? practical.code ?? null;   // ← FIX

      // ── Thesis goes into documentation.final ──
      case "Thesis / Final Report":     return documentation.final    ?? documentation.thesis ?? null;   // ← FIX

      case "Internal Viva 1":          return viva.internal1         ?? null;
      case "Internal Viva 2":          return viva.internal2         ?? null;
      case "External Viva":            return viva.external          ?? null;

      default:                         return null;
    }
  };

  return MARKS_TEMPLATE.map(item => ({ ...item, marks: valueFor(item.component) }));
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
  // 1. Hide all subpages, show the selected one
  document.querySelectorAll(".dash-subpage")
          .forEach(p => p.classList.remove("active"));
  const t = document.getElementById("tab-" + tab);
  if (t) t.classList.add("active");

  // 2. Update sidebar active state
  document.querySelectorAll(".sb-item").forEach((i) => i.classList.remove("active"));
  if (el) el.classList.add("active");

  // 3. Update topbar title/subtitle
  document.getElementById("page-title").textContent = TITLES[tab] || tab;
  document.getElementById("page-sub").textContent = SUBS[tab] || "";

  // 4. Tab-specific logic — defer so DOM is painted first
  if (tab === "team") renderTeamTab();
  if (tab === "progress") {
    setTimeout(() => {
      if (STATE.teamCreated) {
        loadTeamMarks();
      } else {
        ensureMarksExist();
        renderEvaluation();
      }
    }, 150); 
  }
  if (tab === "project") loadProposalSection();
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
          <span>Your proposal has been submitted and is awaiting review by the department.</span>
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
          <span>Your FYP proposal has been officially approved by the Department od Computer Science.</span>
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

async function handleProposalUpload(files) {
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

  toast("Uploading proposal…", "gold");
  const result = await uploadProposalAPI(file);
  if (result.error) {
    toast("Upload failed: " + result.error, "red");
    return;
  }

  const group = result.data?.group;
  if (group) {
    STATE.groupData.proposal_url         = group.proposal_url;
    STATE.groupData.proposal_status      = group.proposal_status || "pending";
    STATE.groupData.proposal_uploaded_by = group.proposal_uploaded_by;
    STATE.groupData.proposal_uploaded_at = group.proposal_uploaded_at;
    STATE.proposalFile = group.proposal_url;
  }

  STATE.proposalState = "pending";
  setProposalState("pending");
  toast("Proposal submitted — awaiting review", "gold");
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
  console.log("renderEvaluation called, students:", getAllStudents());
  console.log("STUDENT_MARKS:", STUDENT_MARKS);
  
  const students = getAllStudents();
  
  // Make sure we have students
  if (students.length === 0) {
    console.error("No students found!");
    return;
  }
  
  // Render the tabs
  renderStudentTabs();
  
  // Render marks for the selected student
  if (STATE.selectedEvalStudent >= students.length) {
    STATE.selectedEvalStudent = 0; // Reset to first student if out of bounds
  }
  renderMarksForStudent(STATE.selectedEvalStudent);
}

function renderMarksForStudent(idx) {
  const students = getAllStudents();
  const student = students[idx];
  
  if (!student) {
    console.error("No student at index", idx);
    return;
  }
  
  console.log("Rendering marks for student:", student.id, student.name);
  
  const marks = STUDENT_MARKS[student.id];
  
  if (!marks) {
    console.error("No marks found for student:", student.id);
    console.log("Available keys in STUDENT_MARKS:", Object.keys(STUDENT_MARKS));
    
    // Show empty state
    const tbody = document.getElementById("marks-comp-tbody");
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:20px;color:var(--text-mute)">No marks available yet</td></tr>';
    }
    return;
  }

  // Calculate totals
  let totalObtained = 0;
  let totalMax = 0;
  marks.forEach((m) => {
    totalMax += m.max;
    if (m.marks !== null) totalObtained += m.marks;
  });
  const pct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;

  // Update top cards
  const evalTotalVal = document.getElementById("eval-total-val");
  const evalPctRing = document.getElementById("eval-pct-ring");
  const evalStudentLabel = document.getElementById("eval-student-name-label");

  if (evalTotalVal) evalTotalVal.textContent = totalObtained;
  if (evalPctRing) evalPctRing.innerHTML = pct + "<small>%</small>";
  if (evalStudentLabel) evalStudentLabel.textContent = student.name;

  // Update progress bar
  const progBarPct = document.getElementById("prog-bar-pct");
  const evalProgFill = document.getElementById("eval-prog-fill");
  if (progBarPct) progBarPct.textContent = pct + "%";
  if (evalProgFill) evalProgFill.style.width = pct + "%";

  // Render table, chart, and breakdown
  renderMarksTable(marks, totalObtained, totalMax);
  renderPieChart(marks);
  renderBreakdown(marks, totalObtained, totalMax);
  
  console.log("Finished rendering marks for:", student.name, "Total:", totalObtained, "/", totalMax);
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


function getMarkColor(marks, max) {
  if (marks === null) return "mark-pending";
  const pct = (marks / max) * 100;
  if (pct >= 75) return "mark-green";
  if (pct >= 50) return "mark-yellow";
  return "mark-red";
}

function renderMarksTable(marks, totalObtained, totalMax) {
  const tbody = document.getElementById("marks-comp-tbody");
  if (!tbody){
    console.error("marks-comp-tbody not found in DOM");
    return;
  }
  console.log("Rendering marks table with", marks.length, "items");
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
    sections[m.section].max     += m.max;
    if (m.marks !== null) sections[m.section].obtained += m.marks;
  });

  const labels = Object.keys(sections);
  const data   = labels.map((l) => sections[l].obtained || 0);

  const COLOR_MAP = {
    "Monthly Meetings": "#004b2d",
    "Submissions":      "#1f7a5c",
    "Documentation":    "#bfa14a",
    "Practical":        "#2a9670",
    "Viva":             "#7c3aed",
  };
  const colors = labels.map(l => COLOR_MAP[l] || "#888");

  if (marksChart) marksChart.destroy();

  marksChart = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: "#fff",
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "60%",
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#003520",
          titleFont: { family: "'DM Sans', sans-serif", size: 12, weight: "700" },
          bodyFont:  { family: "'DM Sans', sans-serif", size: 11 },
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => {
              const section = labels[ctx.dataIndex];
              const pct = sections[section].max > 0
                ? Math.round((ctx.parsed / sections[section].max) * 100)
                : 0;
              return ` ${ctx.parsed} / ${sections[section].max} marks  (${pct}%)`;
            },
          },
        },
      },
    },
  });

  // Legend
  const legend = document.getElementById("chart-legend");
  if (legend) {
    legend.innerHTML = labels.map((l, i) => {
      const pct = sections[l].max > 0
        ? Math.round((data[i] / sections[l].max) * 100) : 0;
      return `
        <div class="cl-item">
          <div class="cl-dot" style="background:${colors[i]}"></div>
          <span style="flex:1">${l}</span>
          <strong style="color:${colors[i]}">${data[i]} / ${sections[l].max}</strong>
          <span style="color:var(--text-mute);font-size:.7rem;margin-left:4px">(${pct}%)</span>
        </div>`;
    }).join("");
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

  const COLOR_MAP = {
    "Monthly Meetings": "#004b2d",
    "Submissions":      "#1f7a5c",
    "Documentation":    "#bfa14a",
    "Practical":        "#2a9670",
    "Viva":             "#7c3aed",
  };

  list.innerHTML = Object.entries(sections).map(([name, s]) => {
    const pct   = s.max > 0 ? Math.round((s.obtained / s.max) * 100) : 0;
    const color = COLOR_MAP[name] || "#004b2d";
    return `
      <div style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
          <span style="font-size:.78rem;font-weight:700;color:var(--text-soft)">${name}</span>
          <div style="display:flex;align-items:center;gap:6px">
            <strong style="font-size:.78rem;color:${color}">${s.obtained} / ${s.max}</strong>
            <span style="font-size:.68rem;color:var(--text-mute)">(${pct}%)</span>
          </div>
        </div>
        <div style="height:8px;background:var(--border-soft);border-radius:4px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:${color};border-radius:4px;transition:width .8s cubic-bezier(.34,1.56,.64,1)"></div>
        </div>
      </div>`;
  }).join("");
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

  if (!projInput || !categoryInput) {
    toast("Form fields missing", "red");
    return;
  }

  const proj = projInput.value.trim();
  const category = categoryInput.value.trim();

  if (!proj) {
    toast("Please enter the project title", "red");
    projInput.focus();
    return;
  }

  if (!category) {
    toast("Please select a project category (Web/AI/App/etc.)", "red");
    categoryInput.focus();
    return;
  }

  if (proj.length < 5) {
    toast("Project title must be at least 5 characters", "red");
    projInput.focus();
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
        
        return `<option value="${sup.id}">${formatName(sup.prefix, sup.name)}${researchAreas}</option>`;
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

  if (supPreviewName) supPreviewName.textContent = formatName(sup.prefix, sup.name);
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

  if (!STATE.projectTitle || !STATE.category) {
    toast("Project title and category are required — go back to Step 1", "red");
    return;
  }

  toast("Creating team...", "gold");

  const result = await createTeamAPI();

  if (result.error) {
    let msg = result.error;

    if (msg.toLowerCase().includes("already")) {
      msg = "You are already part of a team. Please refresh the page.";
    } else if (msg.toLowerCase().includes("not found")) {
      msg = "A team member could not be found. Check student codes.";
    }

    toast("Failed: " + msg, "red");
    return;
  }

  STATE.teamCreated = true;
  STATE.teamId =
    result.group.team_code ||
    result.group.group_code ||
    result.group._id;

  STUDENT_MARKS = {};

  updateDashboardUI();
  updateBannerForTeam();

  const selSup = SUPERVISORS.find(
    (s) => s.id === STATE.selectedSupervisor
  );

  if (result.group?.supervisor) {
    const sup = result.group.supervisor;

    STATE.supervisorData = {
      _id: sup._id,
      prefix: sup.prefix || "",
      name: sup.name,
      email: sup.email,
      designation: sup.designation || "Faculty Member",
      research_areas: sup.research_areas || [],
      office: sup.office || "CS Department",
      office_hours: sup.office_hours || "Contact supervisor",
      sup_code: sup.sup_code,
      whatsapp: sup.whatsapp || "",
      avatar_url: sup.avatar_url || "",
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

  if (selSup) {
    chips.push({
      icon: "sup",
      text: formatName(selSup.prefix, selSup.name),
    });
  }

  const svgMap = {
    id: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/></svg>`,
    proj: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>`,
    members: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>`,
    sup: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
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
// ── Update Team Info card with real created date + nearest deadline ──
  const createdEl = document.getElementById("team-created-date");
  if (createdEl && STATE.groupData?.createdAt) {
    createdEl.textContent = formatShortDate(STATE.groupData.createdAt);
  }

  const deadlineEl = document.getElementById("team-nearest-deadline");
  if (deadlineEl) {
    const nearest = getNearestDeadline(STATE.deadlines);
    if (nearest) {
      const due      = new Date(nearest.dueDate);
      const diffDays = Math.ceil((due - new Date()) / 86400000);
      const label    = nearest.type === "Other" && nearest.customName
        ? nearest.customName : nearest.type;
      const dateStr  = due.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
      const urgent   = diffDays <= 3;
      deadlineEl.innerHTML = `
        <span style="color:${urgent ? "#dc2626" : "var(--primary)"}">
          ${urgent ? "⚠ " : ""}${dateStr}
        </span>
        <span style="font-size:.72rem;color:var(--text-mute);margin-left:6px">
          ${label} · ${diffDays} day${diffDays !== 1 ? "s" : ""} left
        </span>`;
    } else {
      deadlineEl.textContent = "No upcoming deadlines";
    }
  }
  // Replace the allMembers map inside renderTeamTab:
display.innerHTML = allMembers.map(m => {
  const avatarContent = m.isYou
    ? `<img src="${user.gender === "female" ? "../../avatar/female.jpg" : "../../avatar/male.jpg"}"
            alt="avatar"
            style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block">`
    : m.initials;

  return `
    <div class="tm-item" style="margin-bottom:8px">
      <div class="tm-av" style="${m.isYou ? "padding:0;overflow:hidden" : ""}">${avatarContent}</div>
      <div>
        <div class="tm-name">${m.name}${m.isYou ? " (You)" : ""}</div>
        <div class="tm-id">${m.student_code}</div>
      </div>
      <span class="tm-role ${m.role === "Team Leader" || m.role === "Leader" ? "tm-lead" : "tm-member"}">${m.role}</span>
    </div>`;
}).join("");
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

  const setupOverlay = document.getElementById("setup-overlay");
  if (!setupOverlay) return;

  // Hide all steps, show only step 2
  [1, 2, 3, "done"].forEach(s => {
    const el = document.getElementById("setup-step-" + s);
    if (el) el.style.display = "none";
  });

  const step2 = document.getElementById("setup-step-2");
  if (step2) step2.style.display = "block";

  // ── Populate team ID display ──
  const displayTeamId = document.getElementById("display-team-id");
  if (displayTeamId) displayTeamId.textContent = STATE.teamId || "—";

  // ── Populate leader info too ──
  const leaderStdId = document.getElementById("leader-std-id");
  const leaderName  = document.getElementById("leader-name");
  const leaderAv    = document.getElementById("leader-av");
  if (leaderStdId) leaderStdId.textContent = STATE.studentId;
  if (leaderName)  leaderName.textContent  = STATE.studentName;
  if (leaderAv)    leaderAv.textContent    = initials(STATE.studentName);

  // Swap the footer to Add Member mode
  const footer = step2.querySelector(".setup-footer");
  if (footer) {
    footer.innerHTML = `
      <button class="btn btn-ghost" onclick="closeAddMemberModal()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
             stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
        Close
      </button>
      <button class="btn btn-primary" onclick="saveNewMember()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
             stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Save Member
      </button>`;
  }

  clearSearch();
  renderMemberSlots();

  setupOverlay.style.display = "flex";
}

function closeAddMemberModal() {
  const setupOverlay = document.getElementById("setup-overlay");
  if (setupOverlay) setupOverlay.style.display = "none";

  // Restore step 2 footer back to normal setup flow for next time
  const step2 = document.getElementById("setup-step-2");
  const footer = step2?.querySelector(".setup-footer");
  if (footer) {
    footer.innerHTML = `
      <button class="btn btn-ghost" onclick="backStep1()">← Back</button>
      <button class="btn btn-primary" onclick="goStep3()">
        Next: Choose Supervisor
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
             stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>`;
  }

  clearSearch();
  renderTeamTab();
}
function saveNewMember() {
  if (STATE.members.length <= memberCountBeforeModal) {
    toast("Please search and add a member first", "red");
    return;
  }
  closeAddMemberModal();
  toast("Member added successfully");
}


/* ══ Render supervisor tab ══ */
function renderSupervisorTab() {
  const card = document.getElementById("supervisor-card-body");
  if (!card) return;

  if (!STATE.supervisorData) {
    card.innerHTML = `
      <div style="text-align:center;padding:36px 20px;color:var(--text-mute)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
             stroke-linecap="round" stroke-linejoin="round"
             width="48" height="48" style="margin:0 auto 16px;color:var(--border)">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <p style="font-size:.84rem">No supervisor assigned yet.</p>
      </div>`;
    return;
  }

  const sup = STATE.supervisorData;

  // ── Build avatar (real photo OR fallback to initials) ──
  const avatarHtml = sup.avatar_url
    ? `<div class="sup-avatar" style="padding:0;overflow:hidden;background:none">
         <img src="${sup.avatar_url}" alt="${sup.name}"
              style="width:100%;height:100%;object-fit:cover;border-radius:inherit;display:block"
              onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">
         <span style="display:none;width:100%;height:100%;border-radius:inherit;
                      background:linear-gradient(135deg,var(--primary),var(--secondary));
                      color:#fff;font-weight:700;font-size:1.1rem;
                      place-items:center">
           ${initials(sup.name)}
         </span>
       </div>`
    : `<div class="sup-avatar">${initials(sup.name)}</div>`;

  // ── WhatsApp link or "Not provided" ──
  const whatsappHtml = sup.whatsapp
    ? `<a href="https://wa.me/${sup.whatsapp.replace(/^0/, "92").replace(/[^0-9]/g, "")}"
          target="_blank"
          style="display:inline-flex;align-items:center;gap:7px;color:#15803d;
                 font-weight:700;text-decoration:none;font-size:.86rem">
         <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
           <path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4a7.94 7.94 0 0 0-6.88 11.93L4 20l4.2-1.1a7.93 7.93 0 0 0 3.85.98h.01a7.94 7.94 0 0 0 5.55-13.56zm-5.55 12.21h-.01a6.6 6.6 0 0 1-3.36-.92l-.24-.14-2.49.65.66-2.43-.16-.25a6.6 6.6 0 1 1 5.6 3.09z"/>
         </svg>
         ${sup.whatsapp}
       </a>`
    : `<span style="color:var(--text-mute)">Not provided</span>`;

  card.innerHTML = `
    <div class="sup-card">
      ${avatarHtml}
      <div class="sup-info">
        <strong>${formatName(sup.prefix, sup.name) || "—"}</strong>
        <span>${sup.designation || "Faculty Member"} · Dept. of Computer Science</span>
      </div>
    </div>

    <div class="proj-row">
      <span class="proj-key">Email</span>
      <span class="proj-val">
        <a href="mailto:${sup.email || ""}"
           style="color:var(--primary);font-weight:600;text-decoration:none">
          ${sup.email || "—"}
        </a>
      </span>
    </div>

    <div class="proj-row">
      <span class="proj-key">Office</span>
      <span class="proj-val">${sup.office || "CS Department"}</span>
    </div>

    <div class="proj-row">
      <span class="proj-key">WhatsApp</span>
      <span class="proj-val">${whatsappHtml}</span>
    </div>

    <div class="proj-row">
      <span class="proj-key">Supervisor ID</span>
      <span class="proj-val">
        <span class="id-highlight id-highlight-team">${sup.sup_code || "—"}</span>
      </span>
    </div>
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
    "stat-supervisor-name":  STATE.supervisorData ? formatName(STATE.supervisorData.prefix, STATE.supervisorData.name) : "Not assigned",
    "proj-supervisor-name":  STATE.supervisorData ? formatName(STATE.supervisorData.prefix, STATE.supervisorData.name) : "Not assigned",
  };

  Object.entries(elements).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el && value) el.textContent = value;
  });

  // Update supervisor info if available
if (STATE.supervisorData) {
  const supNameElements = document.querySelectorAll(".supervisor-name");
  supNameElements.forEach((el) => {
    if (el) el.textContent = formatName(STATE.supervisorData.prefix, STATE.supervisorData.name);
  });
}
}

/* ══════════════════════════════════
   HELPERS
══════════════════════════════════ */
function formatShortDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric"
  });
}

function getNearestDeadline(deadlines) {
  if (!deadlines || !deadlines.length) return null;
  const now = new Date();
  const upcoming = deadlines
    .filter(d => new Date(d.dueDate) > now)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  return upcoming[0] || null;
}

function initials(name) {
  return (name || "")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
function formatName(prefix, name) {
  if (!prefix || !name) return name || "";
  return `${prefix}. ${name}`;
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

  // ── CASE 1: Team not yet created (during initial setup Step 2) ──
  // Just add locally; will be sent to backend in finishSetup()
  if (!STATE.teamCreated || !STATE.groupData?._id) {
    STATE.members.push({
      student_code: studentCode,
      name: name,
      initials: ini,
      role: "Member",
    });

    const memberSearch = document.getElementById("member-search");
    const searchResult = document.getElementById("search-result");
    if (memberSearch) memberSearch.value = "";
    if (searchResult) searchResult.classList.remove("show");

    renderMemberSlots();
    toast(name + " added to team ✓");
    return;
  }

  // ── CASE 2: Team already exists (clicking "Add Member" from dashboard) ──
  // Call backend API to add member to existing team
  try {
    const response = await fetch(`${API_BASE}/groups/${STATE.groupData._id}/add-member`, {
      method: "PUT",
      headers: API_HEADERS,
      body: JSON.stringify({ student_code: studentCode }),
    });

    const data = await response.json();
    console.log("Add member response:", response.status, data);

    if (!response.ok) {
      toast(data.message || "Failed to add member", "red");
      return;
    }

    // Add to local state
    STATE.members.push({
      _id: data.member?._id,
      student_code: data.member?.student_code || studentCode,
      name: data.member?.name || name,
      initials: initials(data.member?.name || name),
      role: "Member",
    });

    if (data.group) STATE.groupData = data.group;

    const memberSearch = document.getElementById("member-search");
    const searchResult = document.getElementById("search-result");
    if (memberSearch) memberSearch.value = "";
    if (searchResult) searchResult.classList.remove("show");

    renderMemberSlots();
    toast(name + " added to team ✓");

  } catch (error) {
    console.error("Add member error:", error);
    toast("Failed to add member: " + error.message, "red");
  }
}
async function uploadCV(file) {
  const user = JSON.parse(localStorage.getItem("user"));
  const formData = new FormData();
  formData.append("cv", file);  // "cv" must match upload.single("cv") in the route

  try {
      const res = await fetch(`${API_BASE}/uploads/student/cv`, {
        method: "POST",
        headers: {
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

async function uploadProposalAPI(file) {
  const groupId = STATE.groupData?._id;
  if (!groupId) return { error: "You are not in a team yet" };

  const formData = new FormData();
  formData.append("proposal", file);

  try {
    const res = await fetch(`${API_BASE}/uploads/group/${groupId}/proposal`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${user.token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Upload failed");
    return { success: true, data };
  } catch (err) {
    return { error: err.message };
  }
}

async function loadStudentDeadlines() {
  const user = JSON.parse(localStorage.getItem("user"));
  const container = document.getElementById("student-deadlines-container");
  if (!container) return;

  try {
    const res = await fetch("http://127.0.0.1:5001/api/deadlines", {
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user.token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    STATE.deadlines = Array.isArray(data) ? data : []; 
    if (!data.length) {
      container.innerHTML = `<p style="color:var(--text-mute)">No upcoming deadlines.</p>`;
      return;
    }

container.innerHTML = data.map(d => {
  const due = new Date(d.dueDate);
  const diffMs = due - new Date();
  const diffDays = Math.ceil(diffMs / 86400000);
  const expired = diffMs < 0;
  const near = !expired && diffDays <= 2;
  const label = d.type === "Other" && d.customName ? d.customName : d.type;
  const day = due.getDate().toString().padStart(2, "0");
  const mo = due.toLocaleString("en-PK", { month: "short" });
  const tagText = expired ? "Expired" : diffDays === 0 ? "Today!" : `${diffDays} days`;
  const tagCls = expired ? "tag-urgent" : near ? "tag-near" : "tag-ok";
  const bgColor = expired ? "#dc2626" : near ? "var(--gold)" : "var(--primary)";

  return `<div class="dl-item">
    <div class="dl-date" style="background:${bgColor}">
      <span class="dl-day">${day}</span>
      <span class="dl-mo">${mo}</span>
    </div>
    <div>
      <div class="dl-title">${label}</div>
      <div class="dl-desc">${d.description || "Submission deadline — 11:59 PM"}</div>
    </div>
    <span class="dl-tag ${tagCls}">${tagText}</span>
  </div>`;
}).join("");
  } catch (err) {
    container.innerHTML = `<p style="color:#dc2626">Failed to load: ${err.message}</p>`;
  }
}
function getGreeting(name, gender) {
  const hour = new Date().getHours();
  let greeting, icon;

  if      (hour >= 5  && hour < 12) { greeting = "Good Morning";   icon = "☀️"; }
  else if (hour >= 12 && hour < 17) { greeting = "Good Afternoon"; icon = "🌤️"; }
  else if (hour >= 17 && hour < 21) { greeting = "Good Evening";   icon = "🌆"; }
  else                               { greeting = "Good Night";     icon = "🌙"; }

  const title = gender === "female" ? "Ms" : "Mr";
  return `${greeting}, ${title}. ${name} ${icon}`;
}

async function loadProposalSection() {
  // If we already have groupData, use it directly
  if (STATE.groupData) {
    const proposalUrl    = STATE.groupData.proposal_url    || null;
    const proposalStatus = STATE.groupData.proposal_status || null;

    if (!proposalUrl) {
      STATE.proposalState = "idle";
    } else {
      STATE.proposalState = proposalStatus || "pending";
    }

    setProposalState(STATE.proposalState);
    return;
  }

  // No groupData yet — fetch fresh from backend
  try {
    const res  = await fetch(`${API_BASE}/students/dashboard`, {
      headers: API_HEADERS
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    if (data.hasGroup) {
      STATE.groupData = data.group;
      const proposalUrl    = data.group.proposal_url    || null;
      const proposalStatus = data.group.proposal_status || null;

      if (!proposalUrl) {
        STATE.proposalState = "idle";
      } else {
        STATE.proposalState = proposalStatus || "pending";
        STATE.proposalFile  = data.group.proposal_filename || data.group.proposal_url;
      }
    } else {
      STATE.proposalState = "idle";
    }
  } catch (err) {
    console.error("Proposal load error:", err);
    STATE.proposalState = "idle";
  }

  setProposalState(STATE.proposalState);
}
/* ══════════════════════════════════
   INIT
══════════════════════════════════ */
function initDashboard() {
  const navStdId   = document.getElementById("nav-std-id");
  const navName    = document.getElementById("nav-name");
  const navInitials = document.getElementById("nav-initials");
  const bannerName = document.getElementById("banner-name");
  const studentId  = document.getElementById("student-id");

  if (navStdId)  navStdId.textContent  = STATE.studentId;
  if (navName)   navName.textContent   = STATE.studentName;

  if (navInitials) {
    const gender    = user.gender || "male";
    const avatarSrc = gender === "female"
      ? "../../images/avatar/female.jpg"
      : "../../images/Avatars/male.jpg";

    navInitials.textContent = "";
    navInitials.style.padding = "0";
    navInitials.style.overflow = "hidden";
    navInitials.innerHTML = `<img src="${avatarSrc}"
      alt="${gender}"
      style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block">`;
  }

  // ── Pass gender to greeting ──
  if (bannerName) bannerName.textContent = getGreeting(STATE.studentName, user.gender);

  if (studentId) studentId.textContent = STATE.studentId;

  startBannerClock();
  loadDashboard();
  loadStudentDeadlines();
}

function startBannerClock() {
  function update() {
    const el = document.getElementById("banner-datetime");
    if (!el) return;
    const now = new Date();
    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const day   = days[now.getDay()];
    const date  = now.getDate();
    const month = months[now.getMonth()];
    const year  = now.getFullYear();
    let hours   = now.getHours();
    const mins  = String(now.getMinutes()).padStart(2, "0");
    const ampm  = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    el.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round" width="12" height="12">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      ${day}, ${date} ${month} ${year} &nbsp;·&nbsp; ${hours}:${mins} ${ampm}`;
  }
  update();
  setInterval(update, 1000);
}
// Start initialization when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDashboard);
} else {
  initDashboard();
}

