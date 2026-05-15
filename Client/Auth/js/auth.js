const API_BASE_URL = "http://localhost:5001";
var cur = 1;
var rtimer = null;

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
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Registration failed");

    document.getElementById("form-area").style.display = "none";
    document.getElementById("success-area").style.display = "block";

  } catch (err) {
    console.error("Register error:", err);
    Swal.fire({ icon: "error", title: "Registration failed", text: err.message });
    btn.disabled = false;
    btn.innerHTML = "Register";
  }
}

function onWaInput(input) {
  input.value = input.value.replace(/[^0-9]/g, "");
  if (input.value.length > 11) {
    input.value = input.value.slice(0, 11);
  }
  clr("wa");
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
  console.log("Sending to:", `${API_BASE_URL}/api/auth/forgot-password`, "email:", email);

  if (!email || !email.includes("@")) {
    document.getElementById("e1-email").textContent =
      "Please enter a valid email address.";
    document.getElementById("e1-email").classList.add("show");
    return;
  }

  btn.disabled = true;
  btn.textContent = "Sending...";

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
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

  if (!email) {
    document.getElementById("e-otp").textContent = "Session expired. Please go back and enter your email again.";
    document.getElementById("e-otp").classList.add("show");
    return;
  }

  if (code.length !== 6 || !/^\d{6}$/.test(code)) {
    document.getElementById("e-otp").textContent = "Please enter all 6 digits.";
    document.getElementById("e-otp").classList.add("show");
    return;
  }

  const btn = document.querySelector("#step2 .btn-primary");
  btn.disabled = true;
  btn.textContent = "Verifying...";

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp: code }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    goStep(3);

  } catch (err) {
    document.getElementById("e-otp").textContent = err.message;
    document.getElementById("e-otp").classList.add("show");
  } finally {
    btn.disabled = false;
    btn.textContent = "Verify Code";
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
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }

    btn.style.background = "#16A34A";
    btn.innerHTML = "Login Successful";

    /* ═══════════════════════════════
       STUDENT LOGIN
    ═══════════════════════════════ */
    if (data.role === "student") {

      localStorage.setItem("user", JSON.stringify({
        id: data._id,
        name: data.name,
        student_code: data.student_code,
        email: data.email,
        token: data.token,
      }));

      setTimeout(() => {
        window.location.href =
          "../Dashboards/Student/index.html";
      }, 1000);
    }

    /* ═══════════════════════════════
       SUPERVISOR / CHAIRMAN LOGIN
    ═══════════════════════════════ */
    else if (
      data.role === "supervisor" ||
      data.role === "chairman"
    ) {

localStorage.setItem("supervisor", JSON.stringify({
  id: data._id,
  name: data.name,
  prefix: data.prefix,                              
  email: data.email,
  sup_code: data.sup_code,
  department: data.department,
  designation: data.designation,                    
  whatsapp: data.whatsapp,                          
  avatar_url: data.avatar_url,                      
  role: data.role,
  is_chairman: data.is_chairman,
  token: data.token,
  force_password_change: data.force_password_change,
}));

  setTimeout(() => {
    if (data.force_password_change) {
      window.location.href = "../Dashboards/Supervisor/change-password.html";
    } else if (data.is_chairman) {
      window.location.href = "../Dashboards/Chairman/index.html";   
    } else {
      window.location.href = "../Dashboards/Supervisor/index.html"; 
    }
  }, 1000);
    }

    /* ═══════════════════════════════
       ADMIN LOGIN
    ═══════════════════════════════ */
    else if (data.role === "admin") {

      localStorage.setItem("admin", JSON.stringify({
        id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        token: data.token,
      }));

      setTimeout(() => {
        window.location.href =
          "../Dashboards/Admin/index.html";
      }, 1000);
    }

    /* ═══════════════════════════════
       UNKNOWN ROLE
    ═══════════════════════════════ */
    else {

      btn.style.background = "#DC2626";
      btn.innerHTML = "⚠ Access denied";
      btn.disabled = false;

      setTimeout(() => {
        btn.style.background = "";
        btn.innerHTML = "Sign In";
      }, 2500);
    }

  } catch (err) {

    console.error(err);

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

function goStep(n) {
  document.querySelectorAll(".step").forEach(s => s.classList.remove("active"));
  document.getElementById("step" + n)?.classList.add("active");

  // update dots
  [1,2,3,4].forEach(i => {
    const dot = document.getElementById("dot" + i);
    if (!dot) return;
    dot.classList.remove("act");
    if (i === n) dot.classList.add("act");
  });

  // update header
  const titles = ["Forgot password?","Check your email","Set new password","All done!"];
  const subs   = [
    "Enter your registered email and we'll send a verification code.",
    "Enter the 6-digit code sent to your email address.",
    "Create a strong new password for your account.",
    "Your password has been successfully updated.",
  ];
  document.getElementById("top-title").textContent = titles[n - 1];
  document.getElementById("top-sub").textContent   = subs[n - 1];
}

async function resendOtp() {
  const email = localStorage.getItem("resetEmail");
  if (!email) return;
  try {
    await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    startResend();
  } catch (err) {
    console.error("Resend failed:", err);
  }
}

function clearE(inputId, errId) {
  document.getElementById(inputId)?.classList.remove("err");
  document.getElementById(errId)?.classList.remove("show");
}