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
document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();
  let ok = true;
  clearErr("grp-login-email", "err-login-email");
  clearErr("grp-login-pw", "err-login-pw");
  const em = document.getElementById("login-email").value.trim(),
    pw = document.getElementById("login-pw").value;
  if (!em) {
    setErr("grp-login-email", "err-login-email", "Email is required");
    ok = false;
  } else if (!isEmail(em)) {
    setErr("grp-login-email", "err-login-email", "Enter a valid email");
    ok = false;
  }
  if (!pw) {
    setErr("grp-login-pw", "err-login-pw", "Password is required");
    ok = false;
  } else if (pw.length < 6) {
    setErr("grp-login-pw", "err-login-pw", "Minimum 6 characters");
    ok = false;
  }
  if (!ok) return;
  btnLoad("btn-login", true);
  setTimeout(() => {
    btnLoad("btn-login", false);
    toast("Login successful! Redirecting…", "green");
    setTimeout(() => {
      window.location.href = "supervisor.html";
    }, 1200);
  }, 1600);
});

// FORGOT
document.getElementById("forgotForm").addEventListener("submit", function (e) {
  e.preventDefault();
  clearErr("grp-forgot-email", "err-forgot-email");
  const em = document.getElementById("forgot-email").value.trim();
  if (!em) {
    setErr("grp-forgot-email", "err-forgot-email", "Email is required");
    return;
  }
  if (!isEmail(em)) {
    setErr("grp-forgot-email", "err-forgot-email", "Enter a valid email");
    return;
  }
  btnLoad("btn-send-otp", true);
  setTimeout(() => {
    btnLoad("btn-send-otp", false);
    document.getElementById("otp-email-display").textContent = em;
    goStep("otp");
    startOtpTimer();
    toast("Verification code sent to " + em, "green");
  }, 1500);
});

// OTP INPUTS
const otpInputs = document.querySelectorAll(".otp-input");
otpInputs.forEach((inp, i) => {
  inp.addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "");
    if (this.value) {
      this.classList.add("filled");
      if (i < 5) otpInputs[i + 1].focus();
    } else this.classList.remove("filled");
  });
  inp.addEventListener("keydown", function (e) {
    if (e.key === "Backspace" && !this.value && i > 0) {
      otpInputs[i - 1].focus();
      otpInputs[i - 1].value = "";
      otpInputs[i - 1].classList.remove("filled");
    }
  });
  inp.addEventListener("paste", function (e) {
    e.preventDefault();
    const d = (e.clipboardData || window.clipboardData)
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    d.split("").forEach((ch, j) => {
      if (otpInputs[j]) {
        otpInputs[j].value = ch;
        otpInputs[j].classList.add("filled");
      }
    });
    if (d.length > 0) otpInputs[Math.min(d.length, 5)].focus();
  });
});

// OTP TIMER
let otpInterval;
function startOtpTimer() {
  clearInterval(otpInterval);
  let sec = 120;
  const el = document.getElementById("otp-countdown"),
    rb = document.getElementById("resend-btn");
  rb.disabled = true;
  document.getElementById("otp-timer").style.display = "";
  otpInterval = setInterval(() => {
    sec--;
    const m = Math.floor(sec / 60),
      s = sec % 60;
    el.textContent =
      String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
    if (sec <= 0) {
      clearInterval(otpInterval);
      rb.disabled = false;
      document.getElementById("otp-timer").style.display = "none";
    }
  }, 1000);
}
function resendOtp() {
  otpInputs.forEach((i) => {
    i.value = "";
    i.classList.remove("filled", "error");
  });
  document.getElementById("err-otp").textContent = "";
  startOtpTimer();
  toast("New code sent!", "green");
}

// VERIFY OTP
function verifyOtp() {
  const code = Array.from(otpInputs)
    .map((i) => i.value)
    .join("");
  document.getElementById("err-otp").textContent = "";
  otpInputs.forEach((i) => i.classList.remove("error"));
  if (code.length < 6) {
    document.getElementById("err-otp").textContent =
      "Please enter the full 6-digit code";
    otpInputs.forEach((i) => {
      if (!i.value) i.classList.add("error");
    });
    return;
  }
  btnLoad("btn-verify-otp", true);
  setTimeout(() => {
    btnLoad("btn-verify-otp", false);
    clearInterval(otpInterval);
    goStep("new-pw");
    toast("Code verified!", "green");
  }, 1200);
}

// NEW PASSWORD
document.getElementById("newPwForm").addEventListener("submit", function (e) {
  e.preventDefault();
  let ok = true;
  clearErr("grp-new-pw", "err-new-pw");
  clearErr("grp-confirm-pw", "err-confirm-pw");
  const pw = document.getElementById("new-pw").value,
    cpw = document.getElementById("confirm-pw").value;
  if (!pw) {
    setErr("grp-new-pw", "err-new-pw", "Password is required");
    ok = false;
  } else if (pw.length < 6) {
    setErr("grp-new-pw", "err-new-pw", "Minimum 6 characters");
    ok = false;
  }
  if (!cpw) {
    setErr("grp-confirm-pw", "err-confirm-pw", "Please confirm your password");
    ok = false;
  } else if (pw !== cpw) {
    setErr("grp-confirm-pw", "err-confirm-pw", "Passwords do not match");
    ok = false;
  }
  if (!ok) return;
  btnLoad("btn-reset-pw", true);
  setTimeout(() => {
    btnLoad("btn-reset-pw", false);
    goStep("success");
  }, 1400);
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
