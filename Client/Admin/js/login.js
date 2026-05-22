function goStep(id) {
  document
    .querySelectorAll(".step")
    .forEach((s) => s.classList.remove("active"));
  const el = document.getElementById("step-" + id);
  if (el) el.classList.add("active");
  setTimeout(() => {
    const inp = el?.querySelector("input");
    if (inp) inp.focus();
  }, 100);
}
function togglePw(inputId, btn) {
  const inp = document.getElementById(inputId);
  const o = btn.querySelector(".eye-o"),
    c = btn.querySelector(".eye-c");
  if (inp.type === "password") {
    inp.type = "text";
    o.style.display = "none";
    c.style.display = "block";
  } else {
    inp.type = "password";
    o.style.display = "block";
    c.style.display = "none";
  }
}
function clearErr(g, e) {
  document.getElementById(g)?.classList.remove("has-error");
  const el = document.getElementById(e);
  if (el) el.textContent = "";
}
function setErr(g, e, m) {
  document.getElementById(g)?.classList.add("has-error");
  const el = document.getElementById(e);
  if (el) el.textContent = m;
}
function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
function btnLoad(id, on) {
  const b = document.getElementById(id);
  if (on) b.classList.add("loading");
  else b.classList.remove("loading");
}

// LOGIN
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  let ok = true;
  clearErr("grp-login-email", "err-login-email");
  clearErr("grp-login-pw", "err-login-pw");

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-pw").value;

  if (!email) {
    setErr("grp-login-email", "err-login-email", "Email is required");
    ok = false;
  }

  if (!password) {
    setErr("grp-login-pw", "err-login-pw", "Password is required");
    ok = false;
  }

  if (!ok) return;

  btnLoad("btn-login", true);

  try {
    const res = await fetch("http://127.0.0.1:5001/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    btnLoad("btn-login", false);

    if (!res.ok) {
      setErr("grp-login-pw", "err-login-pw", data.message || "Login failed");
      return;
    }

    if (data.role !== "admin") {
      setErr("grp-login-email", "err-login-email", "Access denied. Admin only");
      return;
    }

    localStorage.setItem(
      "admin",
      JSON.stringify({
        id: data._id,
        name: data.name,
        email: data.email,
        token: data.token
      })
    );

    toast("Login successful!", "green");

    setTimeout(() => {
      window.location.href = "./index.html";
    }, 1000);
  } catch (err) {
    btnLoad("btn-login", false);
    setErr("grp-login-pw", "err-login-pw", "Server not reachable");
  }
});


// TOAST
let toastTimer;
function toast(msg, type) {
  const t = document.getElementById("toast");
  t.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>' +
    msg +
    "</span>";
  t.className = "toast" + (type ? " " + type : "") + " show";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2800);
}
