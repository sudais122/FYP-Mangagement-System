const API_BASE_URL = "http://localhost:5001";
var cur = 1;
var rtimer = null;

var topT = [
  "Forgot password?",
  "Check your email",
  "Set new password",
  "All done!",
];
var topS = [
  "Enter your registered email and we'll send a verification code.",
  "Enter the 6-digit code sent to your email address.",
  "Create a strong new password for your account.",
  "Your password has been successfully updated.",
];
var topI = [
  '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
  '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  '<polyline points="20 6 9 17 4 12"/>',
];

async function doReg() {
  // 1. Collect values from form
  const fn  = document.getElementById("r-fn").value.trim();
  const ln  = document.getElementById("r-ln").value.trim();
  const em  = document.getElementById("r-em").value.trim();
  const wa  = document.getElementById("r-wa").value.trim();
  const pw  = document.getElementById("r-pw").value;
  const cpw = document.getElementById("r-cpw").value;
  const cv  = document.getElementById("r-cv").files[0];

  // 2. Validate (your existing validation logic)
  if (!fn) return showErr("fn");
  if (!ln) return showErr("ln");
  if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return showErr("em");
  if (!/^[0-9]{11}$/.test(wa)) return showErr("wa");
  if (pw.length < 8) return showErr("pw");
  if (pw !== cpw) return showErr("cpw");
  if (!cv) return showErr("cv");

  // 3. Build FormData (NOT JSON — because we have a file)
  const formData = new FormData();
  formData.append("name", `${fn} ${ln}`);
  formData.append("email", em);
  formData.append("whatsapp", wa);
  formData.append("password", pw);
  formData.append("cv", cv);  // ← the file

  // 4. Submit
  const btn = document.getElementById("rbtn");
  btn.disabled = true;
  btn.innerHTML = "Creating account...";

  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      // ⚠️ DO NOT set Content-Type — browser sets multipart boundary automatically
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Registration failed");

    // Success → show success panel
    document.getElementById("form-area").style.display = "none";
    document.getElementById("success-area").style.display = "block";

  } catch (err) {
    Swal.fire({ icon: "error", title: "Registration failed", text: err.message });
    btn.disabled = false;
    btn.innerHTML = `<svg ...>...</svg> Register`;
  }
}

function onWaInput(input) {
  input.value = input.value.replace(/[^0-9]/g, "");
  if (input.value.length > 11) {
    input.value = input.value.slice(0, 11);
  }
  clr("wa");
}
// otp send for forgot password
async function sendOtp(email) {
  const res = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();
  alert(data.message);
}

async function resetPassword() {
  const token = new URLSearchParams(window.location.search).get("token");
  const email = new URLSearchParams(window.location.search).get("email");
  const newPassword = document.getElementById("password").value;

  const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, email, newPassword }),
  });

  const data = await res.json();
  alert(data.message);
}

function copyFill(fid, val, el) {
  document.getElementById(fid).value = val;
  var t = el.textContent;
  el.textContent = "Copied!";
  el.style.color = "#198754";
  setTimeout(function () {
    el.textContent = t;
    el.style.color = "";
  }, 1200);
  clearE(fid, "e1-email");
}

function clearE(id, eid) {
  var i = document.getElementById(id);
  if (i) {
    i.classList.remove("err");
    i.classList.remove("ok");
  }
  var m = document.getElementById(eid);
  if (m) m.classList.remove("show");
}

async function step1Submit() {
  const email = document.getElementById("s1-email").value.trim();
  const btn = document.querySelector("#step1 .btn-primary");

  if (!email || !email.includes("@")) {
    document.getElementById("e1-email").textContent =
      "Please enter a valid email address.";
    document.getElementById("e1-email").classList.add("show");
    return;
  }

  btn.disabled = true;
  btn.textContent = "Sending...";

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    document.getElementById("otp-email-display").textContent = email;

    // Save email for next steps
    localStorage.setItem("resetEmail", email);

    goStep(2);
    startResend();
  } catch (err) {
    document.getElementById("e1-email").textContent = err.message;
    document.getElementById("e1-email").classList.add("show");
  } finally {
    btn.disabled = false;
    btn.textContent = "Send Verification Code";
  }
}
function otpMove(el, nid) {
  el.value = el.value.replace(/[^0-9]/g, "");
  if (el.value) el.classList.add("filled");
  else el.classList.remove("filled");
  if (el.value && nid) document.getElementById(nid).focus();
  document.getElementById("e-otp").classList.remove("show");
}
function otpBack(e, el, pid) {
  if (e.key === "Backspace" && !el.value && pid)
    document.getElementById(pid).focus();
}
async function step2Submit() {
  const code = ["o1", "o2", "o3", "o4", "o5", "o6"]
    .map((id) => document.getElementById(id).value)
    .join("");

  const email = localStorage.getItem("resetEmail");

  if (code.length !== 6) {
    document.getElementById("e-otp").classList.add("show");
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp: code }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    goStep(3);
  } catch (err) {
    document.getElementById("e-otp").textContent = err.message;
    document.getElementById("e-otp").classList.add("show");
  }
}

function startResend() {
  var link = document.getElementById("resend-link");
  var s = 30;
  link.className = "disabled";
  link.textContent = "Resend in " + s + "s";
  if (rtimer) clearInterval(rtimer);
  rtimer = setInterval(function () {
    s--;
    if (s > 0) {
      link.textContent = "Resend in " + s + "s";
    } else {
      clearInterval(rtimer);
      link.className = "";
      link.textContent = "Resend code";
    }
  }, 1000);
}

function onPw(v) {
  ["b1", "b2", "b3", "b4"].forEach(function (id) {
    document.getElementById(id).className = "sb";
  });
  var lbl = document.getElementById("str-lbl");
  if (!v) {
    lbl.textContent = "Enter a password to check strength";
    lbl.style.color = "#adb5bd";
    return;
  }
  var s = 0;
  if (v.length >= 8) s++;
  if (/[A-Z]/.test(v)) s++;
  if (/[0-9]/.test(v)) s++;
  if (/[^A-Za-z0-9]/.test(v)) s++;
  var cls = s <= 1 ? "w" : s === 2 ? "m" : "g";
  var labels = [
    "Too short",
    "Weak — add numbers & uppercase",
    "Medium — try a special character",
    "Strong password",
  ];
  var cols = { w: "#dc3545", m: "#fd7e14", g: "#198754" };
  for (var i = 0; i < s; i++)
    document.getElementById(["b1", "b2", "b3", "b4"][i]).classList.add(cls);
  lbl.textContent = labels[Math.max(0, s - 1)];
  lbl.style.color = cols[cls] || "#adb5bd";
}

function togPw(id, eid) {
  var i = document.getElementById(id);
  var show = i.type === "password";
  i.type = show ? "text" : "password";
  document.getElementById(eid).innerHTML = show
    ? '<path d="M17.94 17.94A10 10 0 0 1 12 20c-7 0-11-8-11-8a18 18 0 0 1 5.06-5.94M9.9 4.24A9 9 0 0 1 12 4c7 0 11 8 11 8a18 18 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>'
    : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
}

async function step3Submit() {
  const password = document.getElementById("s3-pw").value;
  const confirmPassword = document.getElementById("s3-cpw").value;
  const email = localStorage.getItem("resetEmail");

  if (!password || password.length < 8) {
    document.getElementById("e3-pw").classList.add("show");
    return;
  }

  if (password !== confirmPassword) {
    document.getElementById("e3-cpw").classList.add("show");
    return;
  }

  const btn = document.querySelector("#step3 .btn-primary");
  btn.disabled = true;
  btn.textContent = "Resetting...";

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    goStep(4);
  } catch (err) {
    alert(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "Reset Password";
  }
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
  document.getElementById("student-register-section").style.display =
    role === "student" ? "block" : "none";
}

function togglePw() {
  const inp = document.getElementById("login-pw");
  const eye = document.getElementById("pw-eye");
  if (!inp || !eye) return;
  const show = inp.type === "password";
  inp.type = show ? "text" : "password";
  eye.innerHTML = show
    ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`
    : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
}

async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById("login-id").value.trim();
  const password = document.getElementById("login-pw").value;
  const btn = document.getElementById("signin-btn");

  if (!email || !password) {
    btn.style.background = "#DC2626";
    btn.innerHTML = "⚠ Please fill all fields";
    setTimeout(() => {
      btn.style.background = "";
      btn.innerHTML = "Sign In";
    }, 2000);
    return;
  }

  btn.disabled = true;
  btn.innerHTML = "Signing in...";

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }

    btn.style.background = "#16A34A";
    btn.innerHTML = "Login Successful";

    if (data.role === "student") {
      localStorage.setItem("user", JSON.stringify({
        id: data._id,
        name: data.name,
        student_code: data.student_code,
        token: data.token,
      }));
      setTimeout(() => {
        window.location.href = "../Dashboards/Student/index.html";
      }, 1000);

    } else if (data.role === "supervisor") {
      localStorage.setItem("supervisor", JSON.stringify({
        id: data._id,
        name: data.name,
        sup_code: data.sup_code,
        token: data.token,
        force_password_change: data.force_password_change,
      }));
      setTimeout(() => {
        if (data.force_password_change) {
          window.location.href = "../Dashboards/Supervisor/change-password.html";
        } else {
          window.location.href = "../Dashboards/Supervisor/index.html";
        }
      }, 1000);

    } else if (data.role === "admin") {
      localStorage.setItem("admin", JSON.stringify({
        id: data._id,
        name: data.name,
        email: data.email,
        token: data.token,
      }));
      setTimeout(() => {
        window.location.href = "../Dashboards/Admin/index.html";
      }, 1000);

    } else {
      btn.style.background = "#DC2626";
      btn.innerHTML = "⚠ Access denied";
      btn.disabled = false;
    }

  } catch (err) {
    console.log(err);
    btn.style.background = "#DC2626";
    btn.innerHTML = "⚠ " + err.message;
    setTimeout(() => {
      btn.style.background = "";
      btn.innerHTML = "Sign In";
    }, 2500);
    btn.disabled = false;
  }
}
//Register Javascript logic
function togPw(id, eyeId) {
  const i   = document.getElementById(id);
  const eye = document.getElementById(eyeId);
  if (!i || !eye) return;
  const show = i.type === "password";
  i.type = show ? "text" : "password";
  eye.innerHTML = show
    ? '<path d="M17.94 17.94A10 10 0 0 1 12 20c-7 0-11-8-11-8a18 18 0 0 1 5.06-5.94M9.9 4.24A9 9 0 0 1 12 4c7 0 11 8 11 8a18 18 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>'
    : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
}

function onPw(v) {
  ["b1", "b2", "b3", "b4"].forEach(function (id) {
    document.getElementById(id).className = "sb";
  });
  var lbl = document.getElementById("str-lbl");
  if (!v) {
    lbl.textContent = "Enter a password to check strength";
    lbl.style.color = "#adb5bd";
    return;
  }
  var s = 0;
  if (v.length >= 8) s++;
  if (/[A-Z]/.test(v)) s++;
  if (/[0-9]/.test(v)) s++;
  if (/[^A-Za-z0-9]/.test(v)) s++;
  var cls = s <= 1 ? "w" : s === 2 ? "m" : "g";
  var labels = [
    "Too short",
    "Weak — add numbers & uppercase",
    "Medium — try a special character",
    "Strong password",
  ];
  var cols = { w: "#dc3545", m: "#fd7e14", g: "#198754" };
  for (var i = 0; i < s; i++)
    document.getElementById(["b1", "b2", "b3", "b4"][i]).classList.add(cls);
  lbl.textContent = labels[Math.max(0, s - 1)];
  lbl.style.color = cols[cls] || "#adb5bd";
}

function onCV(inp) {
  if (inp.files && inp.files[0]) {
    var f = inp.files[0];
    var kb = Math.round(f.size / 1024);
    var size = kb > 1024 ? Math.round(kb / 102.4) / 10 + " MB" : kb + " KB";
    document.getElementById("cv-zone").classList.add("has");
    document.getElementById("cv-lbl").textContent = f.name;
    document.getElementById("cv-sub").textContent = size + " — ready to upload";
    clr("cv");
  }
}

function clr(key) {
  var inp = document.getElementById("r-" + key);
  var msg = document.getElementById("e-" + key);
  if (inp) inp.classList.remove("err");
  if (msg) msg.classList.remove("show");
}
function showErr(key, msg) {
  var inp = document.getElementById("r-" + key);
  var m = document.getElementById("e-" + key);
  if (inp) inp.classList.add("err");
  if (m) {
    m.classList.add("show");
    if (msg) m.textContent = msg;
  }
}
