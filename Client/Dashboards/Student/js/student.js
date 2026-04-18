const titles = {
  overview: "Dashboard",
  project: "My Project",
  supervisor: "Supervisor",
  feedback: "Feedback",
  deadlines: "Deadlines",
  notifications: "Notifications",
};
const subs = {
  overview: "Welcome back — here's your project overview",
  project: "AI-Based Exam Proctoring System",
  supervisor: "Dr. Aftab Ahmad — FYP Coordinator",
  feedback: "Comments and reviews from your supervisors",
  deadlines: "All submission and evaluation dates",
  notifications: "Your recent alerts and updates",
};

function switchTab(tab, clickedEl) {
  document
    .querySelectorAll(".dash-subpage")
    .forEach((el) => el.classList.remove("active"));
  const target = document.getElementById("tab-" + tab);
  if (target) target.classList.add("active");

  document
    .querySelectorAll(".sb-item")
    .forEach((el) => el.classList.remove("active"));
  if (clickedEl) clickedEl.classList.add("active");

  document.getElementById("page-title").textContent = titles[tab] || tab;
  document.getElementById("page-sub").textContent = subs[tab] || "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}
