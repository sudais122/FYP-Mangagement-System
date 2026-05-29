
const LOGIN_URL = "/Client/Auth/login.html";

// ── DEBUG MODE — set false in production ───────────────────
const DEBUG = false;

function log(...args) {
  if (DEBUG) console.log("[authGuard]", ...args);
}

// ── MAIN GUARD ─────────────────────────────────────────────
function protectPage(allowedRoles = []) {

  // 1. Read all possible sessions
  let studentData    = null;
  let supervisorData = null;
  let adminData      = null;

  try { studentData    = JSON.parse(localStorage.getItem("user"))       || null; } catch(e) {}
  try { supervisorData = JSON.parse(localStorage.getItem("supervisor")) || null; } catch(e) {}
  try { adminData      = JSON.parse(localStorage.getItem("admin"))      || null; } catch(e) {}

  log("localStorage.user:",       studentData);
  log("localStorage.supervisor:", supervisorData);
  log("localStorage.admin:",      adminData);
  log("allowedRoles:",            allowedRoles);
  log("current URL:",             window.location.href);

  // 2. Detect who is logged in
  let currentUser = null;
  let currentRole = null;

  if (adminData && adminData.token) {
    currentUser = adminData;
    currentRole = "admin";
  } else if (supervisorData && supervisorData.token) {
    currentUser = supervisorData;
    currentRole = supervisorData.role || "supervisor";
  } else if (studentData && studentData.token) {
    currentUser = studentData;
    currentRole = "student";
  }

  log("detected role:", currentRole);
  log("detected user:", currentUser ? currentUser.name : "NONE");

  // 3. Nobody logged in → go to login
  if (!currentUser) {
    log("No session found → redirecting to login");
    window.location.replace(LOGIN_URL);
    return;
  }

  // 4. Check token is not expired
  try {
    const parts = currentUser.token.split(".");
    if (parts.length !== 3) throw new Error("malformed");
    const payload = JSON.parse(atob(parts[1]));
    log("token payload:", payload);

    if (payload.exp && (Date.now() / 1000) > payload.exp) {
      log("Token expired at", new Date(payload.exp * 1000));
      localStorage.removeItem("user");
      localStorage.removeItem("supervisor");
      localStorage.removeItem("admin");
      window.location.replace(LOGIN_URL);
      return;
    }
  } catch (e) {
    log("Token decode error:", e.message);
  }

  // 5. Role check
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentRole)) {
    log(` Role "${currentRole}" not in [${allowedRoles.join(", ")}] → redirecting`);
    window.location.replace(LOGIN_URL);
    return;
  }

  // 6. All good
  log(` Access granted. role=${currentRole}`);
}