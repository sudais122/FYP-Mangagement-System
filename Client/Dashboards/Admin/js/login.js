/* =============================================
   ADMIN LOGIN — script.js
   ============================================= */

// ── DOM References ──────────────────────────
const form       = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const pwInput    = document.getElementById('password');
const togglePw   = document.getElementById('togglePw');
const eyeOpen    = document.getElementById('eye-open');
const eyeClosed  = document.getElementById('eye-closed');
const btnLogin   = document.getElementById('btnLogin');
const spinner    = document.getElementById('spinner');
const toast      = document.getElementById('toast');

// ── Password Visibility Toggle ───────────────
togglePw.addEventListener('click', () => {
    const isPassword = pwInput.type === 'password';
    pwInput.type     = isPassword ? 'text' : 'password';
    eyeOpen.style.display   = isPassword ? 'none'  : 'block';
    eyeClosed.style.display = isPassword ? 'block' : 'none';
});

// ── Validation Helpers ────────────────────────
function setError(fieldId, message) {
    const group = document.getElementById('group-' + fieldId);
    const err   = document.getElementById('err-'   + fieldId);
    group.classList.add('has-error');
    err.textContent = message;
}

function clearError(fieldId) {
    const group = document.getElementById('group-' + fieldId);
    const err   = document.getElementById('err-'   + fieldId);
    group.classList.remove('has-error');
    err.textContent = '';
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function validate() {
    let valid = true;

    // Email
    if (!emailInput.value.trim()) {
        setError('email', 'Email address is required.');
        valid = false;
    } else if (!isValidEmail(emailInput.value)) {
        setError('email', 'Please enter a valid email address.');
        valid = false;
    } else {
        clearError('email');
    }

    // Password
    if (!pwInput.value) {
        setError('password', 'Password is required.');
        valid = false;
    } else if (pwInput.value.length < 6) {
        setError('password', 'Password must be at least 6 characters.');
        valid = false;
    } else {
        clearError('password');
    }

    return valid;
}

// ── Clear errors on input ─────────────────────
emailInput.addEventListener('input', () => clearError('email'));
pwInput.addEventListener('input',    () => clearError('password'));

// ── Simulate Login (replace with real API call) ─
function simulateLogin() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Demo: accept any valid email + password ≥ 6 chars
            // In production, replace this with a real fetch() to your backend
            const demoEmail = emailInput.value.trim().toLowerCase();
            const demoPass  = pwInput.value;

            if (demoEmail && demoPass.length >= 6) {
                resolve({ success: true, user: demoEmail });
            } else {
                reject(new Error('Invalid credentials.'));
            }
        }, 1800);
    });
}

// ── Show / Hide Toast ─────────────────────────
function showToast() {
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ── Form Submit ───────────────────────────────
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validate()) return;

    // Loading state
    btnLogin.classList.add('loading');
    btnLogin.querySelector('.btn-text').textContent = 'Signing in…';

    try {
        const result = await simulateLogin();

        if (result.success) {
            showToast();

            // Redirect after toast (replace '#' with your dashboard URL)
            setTimeout(() => {
                window.location.href = '#dashboard';
            }, 2200);
        }
    } catch (err) {
        // Show server-level error on password field
        setError('password', 'Incorrect email or password. Please try again.');
        shake(btnLogin);
    } finally {
        btnLogin.classList.remove('loading');
        btnLogin.querySelector('.btn-text').textContent = 'Sign In';
    }
});

// ── Shake animation on error ──────────────────
function shake(el) {
    el.style.animation = 'none';
    el.offsetHeight; // reflow
    el.style.animation = 'shake .45s cubic-bezier(.36,.07,.19,.97) both';
    el.addEventListener('animationend', () => el.style.animation = '', { once: true });
}

// Inject shake keyframes dynamically
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
@keyframes shake {
    10%, 90% { transform: translateX(-3px); }
    20%, 80% { transform: translateX(5px); }
    30%, 50%, 70% { transform: translateX(-6px); }
    40%, 60% { transform: translateX(6px); }
}`;
document.head.appendChild(shakeStyle);

// ── Social Button Handlers ────────────────────
document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const label = btn.textContent.trim();
        // Replace with actual OAuth logic
        console.log(`OAuth with: ${label}`);
        alert(`${label} OAuth not configured yet. Connect your OAuth provider here.`);
    });
});

// ── Remember Me — persist email ───────────────
const rememberCheck = document.getElementById('remember');

// Load saved email on page load
window.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('adminEmail');
    if (saved) {
        emailInput.value        = saved;
        rememberCheck.checked   = true;
    }
});

// Save or remove on change
rememberCheck.addEventListener('change', () => {
    if (rememberCheck.checked && emailInput.value.trim()) {
        localStorage.setItem('adminEmail', emailInput.value.trim());
    } else {
        localStorage.removeItem('adminEmail');
    }
});

// ── Keyboard: submit on Enter inside inputs ───
[emailInput, pwInput].forEach(input => {
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') form.dispatchEvent(new Event('submit'));
    });
});