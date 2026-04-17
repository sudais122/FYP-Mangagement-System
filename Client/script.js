/* =========================================================
   FYP Management System — Global Scripts
   ========================================================= */

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