// -------- Mobile nav toggle --------
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', menu.classList.contains('open'));
    });
  }

  // -------- Banner slider (home only) --------
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.slider-dots button');
  if (slides.length > 0) {
    let current = 0;
    const show = (i) => {
      slides.forEach((s, idx) => s.classList.toggle('active', idx === i));
      dots.forEach((d, idx) => d.classList.toggle('active', idx === i));
      current = i;
    };
    dots.forEach((d, idx) => d.addEventListener('click', () => show(idx)));
    let timer = setInterval(() => show((current + 1) % slides.length), 5000);
    const hero = document.querySelector('.hero');
    if (hero) {
      hero.addEventListener('mouseenter', () => clearInterval(timer));
      hero.addEventListener('mouseleave', () => {
        timer = setInterval(() => show((current + 1) % slides.length), 5000);
      });
    }
  }

  // -------- FAQ accordion (one open at a time) --------
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // close all
      faqItems.forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-a').style.maxHeight = null;
      });
      // open clicked (if it wasn't already open)
      if (!isOpen) {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  // -------- Login role switcher --------
  const roleButtons = document.querySelectorAll('.role-switch button');
  roleButtons.forEach(b => {
    b.addEventListener('click', () => {
      roleButtons.forEach(x => x.classList.remove('active'));
      b.classList.add('active');
    });
  });

  // -------- Prevent default on login submit (demo) --------
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const activeRole = document.querySelector('.role-switch button.active');
      const role = activeRole ? activeRole.textContent : 'User';
      alert(`Demo login successful as ${role}.\n\nIn production, this connects to your authentication backend.`);
    });
  }
});
const pages = ['home','faq','messages','developers','login'];
const navIds = ['nav-home','nav-faq','nav-messages','nav-developers'];
const pageNames = { home:'Home', faq:'FAQs', messages:'Messages', developers:'Developers', login:'Login' };

function navigate(pg) {
  pages.forEach(p => { const el = document.getElementById('page-'+p); if(el) el.classList.remove('active'); });
  navIds.forEach(id => { const el = document.getElementById(id); if(el) el.classList.remove('active'); });
  const target = document.getElementById('page-'+pg);
  if(target) target.classList.add('active');
  if(document.getElementById('nav-'+pg)) document.getElementById('nav-'+pg).classList.add('active');
  if(document.getElementById('mob-'+pg)) {
    document.querySelectorAll('.nav-mobile a').forEach(a => a.classList.remove('active'));
    document.getElementById('mob-'+pg).classList.add('active');
  }
  window.scrollTo({ top:0, behavior:'smooth' });
  document.title = pageNames[pg] + ' — FYP Management System';
  initReveal();
}

function toggleMobile() {
  document.getElementById('mob-menu').classList.toggle('open');
}

let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const dotsContainer = document.getElementById('dots');
slides.forEach((_,i) => {
  const d = document.createElement('div');
  d.className = 'dot' + (i===0 ? ' active' : '');
  d.onclick = () => goSlide(i);
  dotsContainer.appendChild(d);
});
function goSlide(n) {
  slides[currentSlide].classList.remove('active');
  document.querySelectorAll('.slider-dots .dot')[currentSlide].classList.remove('active');
  currentSlide = n;
  slides[currentSlide].classList.add('active');
  document.querySelectorAll('.slider-dots .dot')[currentSlide].classList.add('active');
}
setInterval(() => { goSlide((currentSlide+1) % slides.length); }, 4000);

const faqData = [
  { cat:'Coursera Courses', icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`, items:[
    { q:'Should I opt for an internship or complete Coursera courses online?', a:'Both options are acceptable. Coursera online courses are preferred if you cannot secure an internship. You must complete the required number of courses before starting your FYP to fulfill the prerequisite condition.' },
    { q:'How do I register for Coursera courses?', a:'Visit coursera.org and sign in with your university email. Use the access link provided by your department or apply for Financial Aid. Ensure you enroll in courses from the approved list shared by the FYP coordinator.' },
    { q:'What should I do if my campus is not listed?', a:'Contact the IT helpdesk or your FYP coordinator. Provide your enrollment details and they will manually verify your institution so you can proceed with the Coursera registration process.' },
    { q:'What is the next step after submitting the application?', a:'After submission, you will receive an acknowledgment email. Your application will be reviewed within 5–7 working days. You will be notified of approval or any required corrections via the portal notification system.' },
    { q:'What is the minimum number of courses required for FYP?', a:'A minimum of 3 approved Coursera courses or an equivalent 6-week internship is required as a prerequisite for FYP registration. Your coordinator will verify completion before approving your proposal.' },
  ]},
  { cat:'Starting Your FYP Proposal', icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`, items:[
    { q:'What are the prerequisites for FYP approval?', a:'To have your FYP approved, you must have completed at least 120 credit hours, cleared all prerequisite courses, completed the required Coursera courses or internship, and obtained your supervisor\'s signature on the proposal form.' },
    { q:'What is the maximum group size?', a:'The maximum group size for an FYP project is 3 students. Single-member projects are also allowed. Groups of more than 3 will not be accepted unless a special exception is granted by the department.' },
    { q:'How do I select a project category?', a:'Project categories include Web Development, Mobile Applications, AI/ML, Data Science, Cybersecurity, Embedded Systems, and others. Select a category aligned with your skills and your supervisor\'s research interests.' },
  ]},
  { cat:'Proposal Submission & Review', icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`, items:[
    { q:'Which file format is allowed for proposal submission?', a:'Proposals must be submitted in PDF format only. The file must follow the department\'s official proposal template, which can be downloaded from the portal. Other formats will not be accepted.' },
    { q:'What happens after submission?', a:'After submission, the proposal is reviewed by the FYP committee within 10 working days. You may receive a status of Approved, Revision Required, or Rejected.' },
  ]},
];

function renderFAQ() {
  const container = document.getElementById('faq-container');
  container.innerHTML = faqData.map((cat,ci) => `
    <div class="faq-category">
      <div class="faq-cat-title"><div class="faq-cat-icon">${cat.icon}</div>${ci+1}. ${cat.cat}</div>
      ${cat.items.map((item,ii) => `
        <div class="faq-item" id="faq-${ci}-${ii}">
          <div class="faq-q" onclick="toggleFAQ(${ci},${ii})"><span>${ci+1}.${ii+1} ${item.q}</span><div class="faq-chevron"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></div></div>
          <div class="faq-a"><p>${item.a}</p></div>
        </div>`).join('')}
    </div>`).join('');
}
let openFAQ = null;
function toggleFAQ(ci,ii) {
  const id = `faq-${ci}-${ii}`;
  const el = document.getElementById(id);
  if(openFAQ && openFAQ!==id) { document.getElementById(openFAQ)?.classList.remove('open'); document.getElementById(openFAQ)?.querySelector('.faq-q')?.classList.remove('open-q'); }
  const isOpen = el.classList.contains('open');
  el.classList.toggle('open');
  el.querySelector('.faq-q').classList.toggle('open-q', !isOpen);
  openFAQ = isOpen ? null : id;
}

function initReveal() {
  setTimeout(() => {
    const revealEls = document.querySelectorAll('.page.active .reveal');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if(e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
    }, { threshold:0.1 });
    revealEls.forEach(el => observer.observe(el));
  }, 50);
}

let currentRole = 'student';
function setRole(role, el) {
  currentRole = role;
  document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const labels = { student:'Student ID / Registration No.', supervisor:'Faculty ID / Email', admin:'Admin Username' };
  const placeholders = { student:'e.g. CS-2022-0123', supervisor:'e.g. faculty@awkum.edu.pk', admin:'e.g. admin' };
  document.getElementById('id-label').textContent = labels[role];
  document.getElementById('login-id').placeholder = placeholders[role];

  /* Show Register button for Student only */
  const regSection = document.getElementById('student-register-section');
  regSection.style.display = role === 'student' ? 'block' : 'none';
}

function toggleLoginPw() {
  const inp = document.getElementById('login-pw');
  const eye = document.getElementById('pw-eye');
  const isText = inp.type === 'text';
  inp.type = isText ? 'password' : 'text';
  eye.innerHTML = isText
    ? `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`
    : `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`;
}

function handleLogin() {
  const id = document.getElementById('login-id').value.trim();
  const pw = document.getElementById('login-pw').value;
  const btn = document.querySelector('.btn-login');

  if (!id || !pw) {
    btn.style.background = '#DC2626';
    btn.textContent = '⚠ Please fill in all fields';
    setTimeout(() => {
      btn.style.background = '';
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg> Sign In`;
    }, 2000);
    return;
  }

  btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" opacity=".3"/><path d="M21 12a9 9 0 0 0-9-9"/></svg> Signing in…`;
  btn.disabled = true;

  setTimeout(() => {
    btn.innerHTML = `✓ Welcome, ${currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}!`;
    btn.style.background = '#15803D';

    setTimeout(() => {
      btn.disabled = false;
      btn.style.background = '';
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg> Sign In`;

      // ── REDIRECT BASED ON ROLE ──
      if (currentRole === 'student') {
        window.location.href = '/Users/mehboobali/FYP-Mangagement-System/Client/Student Dashboard/std.html';
      } else {
        navigate('home');
      }

    }, 1600);
  }, 1200);
}
const ss = document.createElement('style');
ss.textContent = '@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}';
document.head.appendChild(ss);

renderFAQ();
initReveal();