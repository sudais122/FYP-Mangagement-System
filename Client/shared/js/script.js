
const API_BASE = "http://127.0.0.1:5001"
// -------- Mobile nav toggle --------
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".nav-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", menu.classList.contains("open"));
    });
  }

  // -------- Banner slider (home only) --------
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".slider-dots button");
  if (slides.length > 0) {
    let current = 0;
    const show = (i) => {
      slides.forEach((s, idx) => s.classList.toggle("active", idx === i));
      dots.forEach((d, idx) => d.classList.toggle("active", idx === i));
      current = i;
    };
    dots.forEach((d, idx) => d.addEventListener("click", () => show(idx)));
    let timer = setInterval(() => show((current + 1) % slides.length), 5001);
    const hero = document.querySelector(".hero");
    if (hero) {
      hero.addEventListener("mouseenter", () => clearInterval(timer));
      hero.addEventListener("mouseleave", () => {
        timer = setInterval(() => show((current + 1) % slides.length), 5001);
      });
    }
  }

  // -------- Login role switcher --------
  const roleButtons = document.querySelectorAll(".role-switch button");
  roleButtons.forEach((b) => {
    b.addEventListener("click", () => {
      roleButtons.forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
    });
  });

  // -------- Prevent default on login submit (demo) --------
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const activeRole = document.querySelector(".role-switch button.active");
      const role = activeRole ? activeRole.textContent : "User";
      alert(
        `Demo login successful as ${role}.\n\nIn production, this connects to your authentication backend.`,
      );
    });
  }
});
const pages = ["home", "coursera", "faq", "messages", "internship", "developers", "login"];
const navIds = ["nav-home","nav-coursera","nav-faq","nav-messages","nav-internship","nav-developers"];

const pageNames = {
  home: "Home",
  coursera: "Coursera Courses",
  faq: "FAQs",
  messages: "Messages",
  developers: "Developers",
  login: "Login",
  internship: "Internship",
};
function navigate(pg) {
  pages.forEach((p) => {
    const el = document.getElementById("page-" + p);
    if (el) el.classList.remove("active");
  });
  navIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("active");
  });
  const target = document.getElementById("page-" + pg);
  if (target) target.classList.add("active");
  if (document.getElementById("nav-" + pg))
    document.getElementById("nav-" + pg).classList.add("active");
  if (document.getElementById("mob-" + pg)) {
    document
      .querySelectorAll(".nav-mobile a")
      .forEach((a) => a.classList.remove("active"));
    document.getElementById("mob-" + pg).classList.add("active");
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.title = pageNames[pg] + " — FYP Management System";
  initReveal();
}

function toggleMobile() {
  document.getElementById("mob-menu").classList.toggle("open");
}

let currentSlide = 0;
const slides = document.querySelectorAll(".slide");
const dotsContainer = document.getElementById("dots");
slides.forEach((_, i) => {
  const d = document.createElement("div");
  d.className = "dot" + (i === 0 ? " active" : "");
  d.onclick = () => goSlide(i);
  dotsContainer.appendChild(d);
});
function goSlide(n) {
  slides[currentSlide].classList.remove("active");
  document
    .querySelectorAll(".slider-dots .dot")
    [currentSlide].classList.remove("active");
  currentSlide = n;
  slides[currentSlide].classList.add("active");
  document
    .querySelectorAll(".slider-dots .dot")
    [currentSlide].classList.add("active");
}
setInterval(() => {
  goSlide((currentSlide + 1) % slides.length);
}, 4000);

const faqData = [
  {
    cat: "Coursera Courses",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
    items: [
      {
        q: "Should I opt for an internship or complete Coursera courses online?",
        a: "Both options are acceptable. Coursera online courses are preferred if you cannot secure an internship. You must complete the required number of courses before starting your FYP to fulfill the prerequisite condition.",
      },
      {
        q: "How do I register for Coursera courses?",
        a: "Visit coursera.org and sign in with your university email. Use the access link provided by your department or apply for Financial Aid. Ensure you enroll in courses from the approved list shared by the FYP coordinator.",
      },
      {
        q: "What should I do if my campus is not listed?",
        a: "Contact the IT helpdesk or your FYP coordinator. Provide your enrollment details and they will manually verify your institution so you can proceed with the Coursera registration process.",
      },
      {
        q: "What is the next step after submitting the application?",
        a: "After submission, you will receive an acknowledgment email. Your application will be reviewed within 5–7 working days. You will be notified of approval or any required corrections via the portal notification system.",
      },
      {
        q: "What is the minimum number of courses required for FYP?",
        a: "A minimum of 3 approved Coursera courses or an equivalent 6-week internship is required as a prerequisite for FYP registration. Your coordinator will verify completion before approving your proposal.",
      },
    ],
  },
  {
    cat: "Starting Your FYP Proposal",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
    items: [
      {
        q: "What are the prerequisites for FYP approval?",
        a: "To have your FYP approved, you must have completed at least 120 credit hours, cleared all prerequisite courses, completed the required Coursera courses or internship, and obtained your supervisor's signature on the proposal form.",
      },
      {
        q: "What is the maximum group size?",
        a: "The maximum group size for an FYP project is 3 students. Single-member projects are also allowed. Groups of more than 3 will not be accepted unless a special exception is granted by the department.",
      },
      {
        q: "How do I select a project category?",
        a: "Project categories include Web Development, Mobile Applications, AI/ML, Data Science, Cybersecurity, Embedded Systems, and others. Select a category aligned with your skills and your supervisor's research interests.",
      },
    ],
  },
  {
    cat: "Proposal Submission & Review",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
    items: [
      {
        q: "Which file format is allowed for proposal submission?",
        a: "Proposals must be submitted in PDF format only. The file must follow the department's official proposal template, which can be downloaded from the portal. Other formats will not be accepted.",
      },
      {
        q: "What happens after submission?",
        a: "After submission, the proposal is reviewed by the FYP committee within 10 working days. You may receive a status of Approved, Revision Required, or Rejected.",
      },
    ],
  },
];
function renderFAQ() {
  const container = document.getElementById("faq-container");
  container.innerHTML = faqData
    .map(
      (cat, ci) => `
    <div class="faq-category">
      <div class="faq-cat-title"><div class="faq-cat-icon">${cat.icon}</div>${ci + 1}. ${cat.cat}</div>
      ${cat.items
        .map(
          (item, ii) => `
        <div class="faq-item" id="faq-${ci}-${ii}">
          <div class="faq-q" onclick="toggleFAQ(${ci},${ii})"><span>${ci + 1}.${ii + 1} ${item.q}</span><div class="faq-chevron"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></div></div>
          <div class="faq-a"><p>${item.a}</p></div>
        </div>`,
        )
        .join("")}
    </div>`,
    )
    .join("");
}
let openFAQ = null;
function toggleFAQ(ci, ii) {
  const id = `faq-${ci}-${ii}`;
  const el = document.getElementById(id);
  const answer = el.querySelector(".faq-a");

  if (openFAQ && openFAQ !== id) {
    const prev = document.getElementById(openFAQ);
    prev.classList.remove("open");
    prev.querySelector(".faq-a").style.maxHeight = null;
  }

  const isOpen = el.classList.contains("open");

  if (isOpen) {
    el.classList.remove("open");
    answer.style.maxHeight = null;
    openFAQ = null;
  } else {
    el.classList.add("open");
    answer.style.maxHeight = answer.scrollHeight + "px";
    openFAQ = id;
  }
}

function initReveal() {
  setTimeout(() => {
    const revealEls = document.querySelectorAll(".page.active .reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 },
    );
    revealEls.forEach((el) => observer.observe(el));
  }, 50);
}

let currentRole = "student";
function setRole(role, el) {
  currentRole = role;
  document
    .querySelectorAll(".role-tab")
    .forEach((t) => t.classList.remove("active"));
  el.classList.add("active");
  const labels = {
    student: "Student ID / Registration No.",
    supervisor: "Faculty ID / Email",
    admin: "Admin Username",
  };
  const placeholders = {
    student: "e.g. CS-2022-0123",
    supervisor: "e.g. faculty@awkum.edu.pk",
    admin: "e.g. admin",
  };
  document.getElementById("id-label").textContent = labels[role];
  document.getElementById("login-id").placeholder = placeholders[role];

  /* Show Register button for Student only */
  const regSection = document.getElementById("student-register-section");
  regSection.style.display = role === "student" ? "block" : "none";
}

function toggleLoginPw() {
  const inp = document.getElementById("login-pw");
  const eye = document.getElementById("pw-eye");
  const isText = inp.type === "text";
  inp.type = isText ? "password" : "text";
  eye.innerHTML = isText
    ? `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`
    : `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`;
}

function handleLogin() {
  const id = document.getElementById("login-id").value.trim();
  const pw = document.getElementById("login-pw").value;
  const btn = document.querySelector(".btn-login");

  if (!id || !pw) {
    btn.style.background = "#DC2626";
    btn.textContent = "⚠ Please fill in all fields";
    setTimeout(() => {
      btn.style.background = "";
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg> Sign In`;
    }, 2000);
    return;
  }

  btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" opacity=".3"/><path d="M21 12a9 9 0 0 0-9-9"/></svg> Signing in…`;
  btn.disabled = true;

  setTimeout(() => {
    btn.innerHTML = `✓ Welcome, ${currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}!`;
    btn.style.background = "#15803D";

    setTimeout(() => {
      btn.disabled = false;
      btn.style.background = "";
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg> Sign In`;

      // ── REDIRECT BASED ON ROLE ──
      if (currentRole === "student") {
        window.location.href =
          "/Users/mehboobali/FYP-Mangagement-System/Client/Student Dashboard/std.html";
      } else {
        navigate("home");
      }
    }, 1600);
  }, 1200);
}
const ss = document.createElement("style");
ss.textContent =
  "@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}";
document.head.appendChild(ss);

// ══════════════════ COURSERA DATA ══════════════════
const courseraData = [
  {
    cat: "Python Programming",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
    courses: [
      {
        name: "Introduction to Python Programming",
        desc: "Basic introduction to Python programming.",
      },
      {
        name: "Python Programming Essentials",
        desc: "Essential programming concepts in Python.",
      },
      {
        name: "Python Classes and Inheritance",
        desc: "Understanding object-oriented programming in Python.",
      },
      {
        name: "Select Topics in Python: Django",
        desc: "Introduction to Django framework for web development.",
      },
    ],
  },
  {
    cat: "Java Programming",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3a1 1 0 0 1 1 1v9a4 4 0 1 1-8 0V4a1 1 0 0 1 1-1z" transform="rotate(90 5 9)"/><path d="M12 8v8"/><path d="M16 12h-8"/></svg>`,
    courses: [
      {
        name: "Java Programming: Principles of Software Design",
        desc: "Design principles and software development.",
      },
      {
        name: "Java Programming: Solving Problems with Software",
        desc: "Problem-solving using Java.",
      },
      {
        name: "Java Programming: Arrays, Lists, and Structured Data",
        desc: "Working with data structures in Java.",
      },
      {
        name: "Introduction to Java and Object-Oriented Programming",
        desc: "Basics of Java and OOP principles.",
      },
      {
        name: "Introduction to Java Programming: Fundamental Concepts",
        desc: "Fundamental Java concepts and syntax.",
      },
    ],
  },
  {
    cat: "Web Development",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
    courses: [
      {
        name: "Programming Foundations with JavaScript, HTML and CSS",
        uni: "Duke University",
        desc: "Introduction to core web technologies.",
      },
      {
        name: "Developing Front-End Apps with React",
        desc: "React front-end development.",
      },
      {
        name: "Server-side Development with NodeJS",
        desc: "Backend development with Node.js and MongoDB.",
      },
    ],
  },
  {
    cat: "Writing Skills",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>`,
    courses: [
      {
        name: "Writing Skills for University Success",
        desc: "Develop academic writing skills.",
      },
      {
        name: "Writing and Editing: Word Choice and Word Order",
        desc: "Improve writing clarity and precision.",
      },
      {
        name: "Writing and Editing: Structure and Organization",
        desc: "Structure and organization skills.",
      },
      {
        name: "Getting Started with Essay Writing",
        desc: "Foundations of essay writing.",
      },
    ],
  },
  {
    cat: "Speaking Skills",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`,
    courses: [
      {
        name: "English for Effective Business Speaking",
        desc: "Enhance business communication skills.",
      },
      {
        name: "Speaking Skills for University Success",
        desc: "Improve academic speaking skills.",
      },
    ],
  },
  {
    cat: "Data Science & AI",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
    courses: [
      {
        name: "Machine Learning Specialization",
        desc: "Foundations of supervised and unsupervised learning.",
      },
      {
        name: "Data Science Methodology",
        desc: "Methodology for solving data science problems.",
      },
      {
        name: "Applied Data Science with Python",
        desc: "Practical data analysis using Python libraries.",
      },
    ],
  },
];
// ══════════════════ COURSERA RENDER ══════════════════
function renderCoursera() {
  const grid = document.getElementById("coursera-grid");
  if (!grid) return;
  grid.innerHTML = courseraData
    .map(
      (cat, ci) => `
    <div class="course-cat" id="course-cat-${ci}">
      <div class="cc-header" onclick="toggleCourseCat(${ci})">
        <div class="cc-header-left">
          <div class="cc-icon">${cat.icon}</div>
          <div>
            <div class="cc-title">${cat.cat}</div>
            <div class="cc-count">${cat.courses.length} course${cat.courses.length > 1 ? "s" : ""}</div>
          </div>
        </div>
        <div class="cc-chevron">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>
      <div class="cc-body">
        <ul class="course-list">
          ${cat.courses
            .map(
              (c) => `
            <li class="course-item">
              <span class="course-bullet"></span>
              <div>
                <div class="course-name">${c.name}</div>
                <div class="course-desc">${c.desc}</div>
              </div>
            </li>`,
            )
            .join("")}
        </ul>
      </div>
    </div>`,
    )
    .join("");
}

let openCourseCat = null;
function toggleCourseCat(ci) {
  const id = `course-cat-${ci}`;
  const el = document.getElementById(id);

  // If another category is open, close it first
  if (openCourseCat && openCourseCat !== id) {
    const prev = document.getElementById(openCourseCat);
    if (prev) prev.classList.remove("open");
  }

  // Toggle the clicked one
  const isOpen = el.classList.contains("open");
  if (isOpen) {
    el.classList.remove("open");
    openCourseCat = null;
  } else {
    el.classList.add("open");
    openCourseCat = id;
  }
}

function togglePipMute() {
  const vid = document.getElementById("pip-video-el");
  const icon = document.getElementById("pip-mute-icon");
  if (!vid || !icon) return;
  vid.muted = !vid.muted;
  icon.innerHTML = vid.muted
    ? '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>'
    : '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>';
}

function togglePipPlay() {
  const vid = document.getElementById("pip-video-el");
  const icon = document.getElementById("pip-play-icon");
  if (!vid || !icon) return;
  if (vid.paused) {
    vid.play();
    icon.innerHTML =
      '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
  } else {
    vid.pause();
    icon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
  }
}

// Make the PiP draggable
(function makePipDraggable() {
  const pip = document.getElementById("pip-video");
  if (!pip) return;
  let isDown = false,
    offsetX = 0,
    offsetY = 0;

  pip.addEventListener("mousedown", (e) => {
    if (e.target.closest("button")) return;
    if (pip.classList.contains("expanded")) return; // no dragging when expanded
    isDown = true;
    const rect = pip.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    pip.style.transition = "none";
    pip.style.cursor = "grabbing";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    let x = e.clientX - offsetX;
    let y = e.clientY - offsetY;
    x = Math.max(8, Math.min(window.innerWidth - pip.offsetWidth - 8, x));
    y = Math.max(8, Math.min(window.innerHeight - pip.offsetHeight - 8, y));
    pip.style.left = x + "px";
    pip.style.top = y + "px";
    pip.style.right = "auto";
    pip.style.bottom = "auto";
  });

  document.addEventListener("mouseup", () => {
    if (isDown) {
      isDown = false;
      pip.style.transition = "";
      pip.style.cursor = "";
    }
  });
})();

function togglePipExpand() {
  const pip = document.getElementById("pip-video");
  const expandIcon = document.getElementById("pip-expand-icon");
  if (!pip || !expandIcon) return;

  // Create backdrop if it doesn't exist
  let backdrop = document.getElementById("pip-backdrop");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.id = "pip-backdrop";
    backdrop.className = "pip-backdrop";
    backdrop.onclick = togglePipExpand; // click backdrop to shrink back
    document.body.appendChild(backdrop);
  }

  const isExpanded = pip.classList.contains("expanded");

  if (isExpanded) {
    // Shrink back to corner
    pip.classList.remove("expanded");
    backdrop.classList.remove("show");
    // Restore inline styles cleared
    pip.style.left = "";
    pip.style.top = "";
    pip.style.right = "";
    pip.style.bottom = "";
    // Switch icon back to "expand"
    expandIcon.innerHTML =
      '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>';
  } else {
    // Expand to big screen
    pip.classList.add("expanded");
    backdrop.classList.add("show");
    // Switch icon to "shrink/minimize"
    expandIcon.innerHTML =
      '<polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/>';
  }
}
function closePip() {
  const pip = document.getElementById("pip-video");
  const backdrop = document.getElementById("pip-backdrop");
  if (!pip) return;
  pip.classList.add("closing");
  if (backdrop) backdrop.classList.remove("show");
  // Stop video and remove from DOM after animation
  setTimeout(() => {
    const vid = document.getElementById("pip-video-el");
    if (vid) {
      vid.pause();
      vid.removeAttribute("src");
      vid.load();
    }
    pip.remove();
    if (backdrop) backdrop.remove();
  }, 350);
}
// Close expanded PiP on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const pip = document.getElementById("pip-video");
    if (pip && pip.classList.contains("expanded")) {
      togglePipExpand();
    }
  }
});
// ══════════════════ PIP — SEEK / PROGRESS ══════════════════
function seekPip(e) {
  const vid = document.getElementById("pip-video-el");
  const bar = e.currentTarget;
  if (!vid || !vid.duration || isNaN(vid.duration)) return;
  const rect = bar.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  vid.currentTime = pct * vid.duration;
}

function formatPipTime(sec) {
  if (isNaN(sec) || !isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Update progress bar continuously
(function setupPipProgress() {
  const vid = document.getElementById("pip-video-el");
  if (!vid) return;

  const fill = document.getElementById("pip-progress-fill");
  const thumb = document.getElementById("pip-progress-thumb");
  const time = document.getElementById("pip-time");

  vid.addEventListener("timeupdate", () => {
    if (!vid.duration) return;
    const pct = (vid.currentTime / vid.duration) * 100;
    if (fill) fill.style.width = pct + "%";
    if (thumb) thumb.style.left = pct + "%";
    if (time) {
      time.textContent = `${formatPipTime(vid.currentTime)} / ${formatPipTime(vid.duration)}`;
    }
  });

  // Keyboard shortcuts: ← / → to seek 5 seconds
  document.addEventListener("keydown", (e) => {
    const pip = document.getElementById("pip-video");
    if (!pip) return;
    // Only when video is hovered or expanded
    const isExpanded = pip.classList.contains("expanded");
    if (!isExpanded && !pip.matches(":hover")) return;

    // Don't interfere with form inputs
    if (e.target.matches("input, textarea, select")) return;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      vid.currentTime = Math.min(vid.duration || 0, vid.currentTime + 5);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      vid.currentTime = Math.max(0, vid.currentTime - 5);
    }
  });
})();
async function loadHomepageDeadlines() {
  const container = document.getElementById("dates-grid");
  if (!container) return;

  const colors = ["var(--primary)", "var(--secondary)", "var(--gold)", "#5B4A9E", "#A0522D", "#2D6A9E"];

  try {
    const res = await fetch(`${API_BASE}/api/deadlines`);
    const data = await res.json();

    if (!data || !data.length) {
      container.innerHTML = `<p style="color:var(--text-mute);text-align:center;grid-column:1/-1">No deadlines posted yet.</p>`;
      return;
    }

// Replace the container.innerHTML = data.map(...) block in loadHomepageDeadlines()

container.innerHTML = data.map((d, i) => {
  const due      = new Date(d.dueDate);
  const now      = new Date();
  const diffMs   = due - now;
  const diffDays = Math.ceil(diffMs / 86400000);
  const expired  = diffDays < 0;
  const today    = diffDays === 0;
  const near     = !expired && !today && diffDays <= 2;
  const label    = d.type === "Other" && d.customName ? d.customName : d.type;

  const day   = due.getDate().toString().padStart(2, "0");
  const month = due.toLocaleString("en-PK", { month: "short" }).toUpperCase();
  const year  = due.getFullYear();

  // Status config
  const status = expired
    ? { text: "Expired",   cls: "dl-expired", dot: "#dc2626" }
    : today
    ? { text: "Due Today!", cls: "dl-today",   dot: "#f59e0b" }
    : near
    ? { text: `${diffDays} day${diffDays > 1 ? "s" : ""} left`, cls: "dl-near", dot: "#f59e0b" }
    : { text: `${diffDays} days left`,  cls: "dl-active", dot: "#15803d" };

  // Icon per type
  const icons = {
    "Proposal Submission": `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>`,
    "SRS Submission":      `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 13 12 16 16 12"/>`,
    "Documentation":       `<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>`,
    "Presentation":        `<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/>`,
    "Final Report":        `<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>`,
    "Other":               `<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>`,
  };
  const iconPath = icons[d.type] || icons["Other"];

  return `
    <div class="date-card ${status.cls} reveal" style="animation-delay:${(i % 3) * 0.07}s">
      <div class="dl-left">
        <div class="dl-date-block">
          <span class="dl-day">${day}</span>
          <span class="dl-month">${month}</span>
          <span class="dl-year">${year}</span>
        </div>
      </div>
      <div class="dl-divider"></div>
      <div class="dl-body">
        <div class="dl-top-row">
          <div class="dl-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                 stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
              ${iconPath}
            </svg>
          </div>
          <h4 class="dl-title">${label}</h4>
          <span class="dl-badge ${status.cls}">
            <span class="dl-dot" style="background:${status.dot}"></span>
            ${status.text}
          </span>
        </div>
        <p class="dl-desc">${d.description || "Submission deadline — 11:59 PM"}</p>
        <div class="dl-meta">
          <span class="dl-time-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round" width="11" height="11">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            11:59 PM
          </span>
          <span class="dl-cal-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round" width="11" height="11">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            ${due.toLocaleDateString("en-PK", { weekday: "long" })}
          </span>
        </div>
      </div>
    </div>`;
}).join("");

    initReveal();
  } catch (e) {
    container.innerHTML = `<p style="color:#dc2626;grid-column:1/-1">Failed to load deadlines.</p>`;
    console.error("Deadlines load failed:", e);
  }
}

/* ══════════════════════════════════════
   INTERNSHIP PAGE JS
══════════════════════════════════════ */
let internFile = null;

function handleInternFile(file) {
  if (!file) return;
  const allowed = ["application/pdf"];
  const errEl   = document.getElementById("intern-error");

  if (!allowed.includes(file.type)) {
    showInternError("Only PDF, JPG, PNG or WEBP files are allowed.");
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    showInternError("File must be under 10 MB.");
    return;
  }

  internFile = file;
  hideInternError();

  const nameEl = document.getElementById("intern-file-name");
  nameEl.textContent = "✓ " + file.name;
  nameEl.style.display = "block";

  const dz = document.getElementById("intern-dropzone");
  dz.style.borderColor  = "var(--primary)";
  dz.style.background   = "rgba(0,75,45,.04)";
}

function handleInternDrop(e) {
  e.preventDefault();
  document.getElementById("intern-dropzone").classList.remove("drag-over");
  const file = e.dataTransfer?.files?.[0];
  if (file) handleInternFile(file);
}

function showInternError(msg) {
  const el = document.getElementById("intern-error");
  el.textContent    = msg;
  el.style.display  = "block";
}

function hideInternError() {
  const el = document.getElementById("intern-error");
  el.style.display = "none";
}
function formatCnic(input) {
  // Strip all non-digits
  let digits = input.value.replace(/\D/g, "").slice(0, 13);

  let formatted = "";
  if (digits.length <= 5) {
    formatted = digits;
  } else if (digits.length <= 12) {
    formatted = digits.slice(0, 5) + "-" + digits.slice(5);
  } else {
    formatted = digits.slice(0, 5) + "-" + digits.slice(5, 12) + "-" + digits.slice(12);
  }

  input.value = formatted;
}
async function submitInternshipLetter() {
  const name       = document.getElementById("intern-name").value.trim();
  const cnic       = document.getElementById("intern-cnic").value.trim();
  const discipline = document.getElementById("intern-discipline").value;
  const btn        = document.getElementById("intern-submit-btn");

  hideInternError();

  // Validate
  if (!name)       { showInternError("Please enter your full name."); return; }
const rawCnic = cnic.replace(/\D/g, "");
  if (rawCnic.length !== 13) {
    showInternError("Please enter a valid 13-digit CNIC (e.g. 16102-1234567-8).");
    return;
  }
  if (!discipline) { showInternError("Please select your discipline."); return; }
  if (!internFile) { showInternError("Please upload your acceptance letter file."); return; }

  // Build form data
  const formData = new FormData();
  formData.append("full_name",   name);
  formData.append("cnic", rawCnic);
  formData.append("discipline",  discipline);

  // File saved as studentname.pdf on the server
  const safeName = name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
  const ext      = internFile.name.split(".").pop();
  const renamedFile = new File([internFile], `${safeName}.${ext}`, { type: internFile.type });
  formData.append("acceptance_letter", renamedFile);

  btn.disabled    = true;
  btn.textContent = "Uploading…";

  try {
    const res = await fetch(`${API_BASE}/api/internship/submit`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Upload failed");

    // Show success
    document.getElementById("intern-upload-form").style.display = "none";
    document.getElementById("intern-success").style.display     = "block";

  } catch (err) {
    showInternError(err.message);
    btn.disabled    = false;
    btn.innerHTML   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
                           stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                         <polyline points="20 6 9 17 4 12"/>
                       </svg> Submit Acceptance Letter`;
  }
}

function resetInternForm() {
  document.getElementById("intern-upload-form").style.display = "block";
  document.getElementById("intern-success").style.display     = "none";
  document.getElementById("intern-name").value        = "";
  document.getElementById("intern-cnic").value        = "";
  document.getElementById("intern-discipline").value  = "";
  document.getElementById("intern-file-name").style.display = "none";
  document.getElementById("intern-file-input").value  = "";
  const dz = document.getElementById("intern-dropzone");
  dz.style.borderColor = "";
  dz.style.background  = "";
  internFile = null;
  hideInternError();
}
loadHomepageDeadlines();
renderCoursera();
renderFAQ();
initReveal();
