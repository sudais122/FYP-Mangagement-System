
  const newPasswordInput = document.getElementById('newPassword');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const strengthIndicator = document.getElementById('strengthIndicator');
  const strengthFill = document.getElementById('strengthFill');
  const strengthText = document.getElementById('strengthText');
  const errorMessage = document.getElementById('errorMessage');
  const errorText = document.getElementById('errorText');
  const submitBtn = document.getElementById('submitBtn');
  const passwordForm = document.getElementById('passwordForm');

  // Password requirements
  const requirements = {
    length: { regex: /.{8,}/, element: document.getElementById('req-length') },
    uppercase: { regex: /[A-Z]/, element: document.getElementById('req-uppercase') },
    lowercase: { regex: /[a-z]/, element: document.getElementById('req-lowercase') },
    number: { regex: /[0-9]/, element: document.getElementById('req-number') },
    special: { regex: /[!@#$%^&*(),.?":{}|<>]/, element: document.getElementById('req-special') }
  };

  // Toggle password visibility
  function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    const isPassword = input.type === 'password';
    
    input.type = isPassword ? 'text' : 'password';
    
    button.innerHTML = isPassword 
      ? `<svg viewBox="0 0 24 24">
          <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
        </svg>`
      : `<svg viewBox="0 0 24 24">
          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
        </svg>`;
  }

  // Check password strength
  function checkPasswordStrength(password) {
    let strength = 0;
    let metRequirements = 0;

    // Check each requirement
    for (const [key, req] of Object.entries(requirements)) {
      const isMet = req.regex.test(password);
      req.element.classList.toggle('met', isMet);
      if (isMet) {
        strength += 20;
        metRequirements++;
      }
    }

    // Update strength indicator
    if (password.length === 0) {
      strengthIndicator.style.display = 'none';
      return false;
    }

    strengthIndicator.style.display = 'block';
    strengthFill.className = 'strength-fill';
    
    if (metRequirements <= 2) {
      strengthFill.classList.add('weak');
      strengthText.className = 'strength-text weak';
      strengthText.textContent = 'Weak password';
    } else if (metRequirements <= 4) {
      strengthFill.classList.add('medium');
      strengthText.className = 'strength-text medium';
      strengthText.textContent = 'Medium strength';
    } else {
      strengthFill.classList.add('strong');
      strengthText.className = 'strength-text strong';
      strengthText.textContent = 'Strong password';
    }

    return metRequirements === 5;
  }

  // Validate passwords match
  function validatePasswordsMatch() {
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (confirmPassword.length === 0) {
      confirmPasswordInput.classList.remove('error', 'success');
      return true;
    }

    if (newPassword === confirmPassword) {
      confirmPasswordInput.classList.remove('error');
      confirmPasswordInput.classList.add('success');
      return true;
    } else {
      confirmPasswordInput.classList.remove('success');
      confirmPasswordInput.classList.add('error');
      return false;
    }
  }

  // Show error message
  function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
    errorMessage.style.display = 'flex';
  }

  // Hide error message
  function hideError() {
    errorMessage.classList.add('hidden');
    errorMessage.style.display = 'none';
  }

  // Event listeners
  newPasswordInput.addEventListener('input', function() {
    const isValid = checkPasswordStrength(this.value);
    hideError();
    
    if (this.value.length > 0) {
      if (isValid) {
        this.classList.remove('error');
        this.classList.add('success');
      } else {
        this.classList.remove('success');
        this.classList.add('error');
      }
    } else {
      this.classList.remove('error', 'success');
    }
    
    validatePasswordsMatch();
  });

  confirmPasswordInput.addEventListener('input', function() {
    validatePasswordsMatch();
    hideError();
  });

  // Form submission
 passwordForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  hideError();

  const newPassword = newPasswordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  // Validate requirements
  const allRequirementsMet = Object.values(requirements).every(
    req => req.regex.test(newPassword)
  );
  if (!allRequirementsMet) {
    showError('Please ensure your password meets all requirements above.');
    newPasswordInput.focus();
    return;
  }

  // Validate match
  if (newPassword !== confirmPassword) {
    showError('Passwords do not match. Please try again.');
    confirmPasswordInput.focus();
    return;
  }

  // ✅ REAL API CALL
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span>Updating Password...</span>';

  try {
    // Get supervisor token from localStorage
    const sup = JSON.parse(localStorage.getItem("supervisor"));
    if (!sup || !sup.token) {
      showError('Session expired. Please login again.');
      window.location.href = 'login.html';
      return;
    }

    const res = await fetch("http://127.0.0.1:5001/api/supervisors/change-password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${sup.token}`
      },
      body: JSON.stringify({
        newPassword:     newPassword,
        confirmPassword: confirmPassword
      })
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.message || 'Failed to update password. Please try again.');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>Set Password & Continue</span>';
      return;
    }

    sup.force_password_change = false;
    localStorage.setItem("supervisor", JSON.stringify(sup));

    submitBtn.innerHTML = '<span>Password Updated! Redirecting...</span>';
    setTimeout(() => {
      window.location.href = '/Client/Auth/login.html';
    }, 1200);

  } catch (err) {
    console.error(err);
    showError('Network error — could not connect to server.');
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>Set Password & Continue</span>';
  }
});

  // Initial state
  hideError();
