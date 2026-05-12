export function supervisorOtpTemplate({ name, otp }) {
  const digits = otp.split("");
  return {
    subject: "Reset Your Password — FYP Management AWKUM",
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:540px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">

        <!-- HEADER -->
        <div style="background:linear-gradient(135deg,#003d24 0%,#004b2d 50%,#1f7a5c 100%);padding:32px 36px;position:relative">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
            <div>
              <div style="color:#fff;font-size:.95rem;font-weight:700;line-height:1.2">FYP Management System</div>
              <div style="color:rgba(191,161,74,.9);font-size:.68rem;font-weight:600;text-transform:uppercase;letter-spacing:.06em">AWKUM · CS Department</div>
            </div>
          </div>
          <div style="color:rgba(255,255,255,.35);font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.1em;margin-bottom:6px">Password Reset Request</div>
          <div style="color:#fff;font-size:1.4rem;font-weight:800;letter-spacing:-.02em">Supervisor Account</div>
        </div>

        <!-- BODY -->
        <div style="padding:32px 36px">

          <p style="color:#1c1c1c;font-size:.95rem;font-weight:600;margin:0 0 8px">Hi ${name},</p>
          <p style="color:#4a5568;font-size:.86rem;line-height:1.7;margin:0 0 28px">
            We received a request to reset your password. Enter the 6-digit verification code below to continue. This code is valid for <strong style="color:#004b2d">15 minutes</strong>.
          </p>

          <!-- OTP BOX -->
          <div style="background:#f8faf8;border:1.5px solid #d4e8dc;border-radius:14px;padding:28px 24px;text-align:center;margin-bottom:24px">
            <div style="font-size:.68rem;font-weight:700;color:#6c757d;text-transform:uppercase;letter-spacing:.1em;margin-bottom:18px">
              Verification Code
            </div>

            <!-- OTP DIGITS — table layout for email client compatibility -->
            <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto">
              <tr>
                ${digits.map(d => `
                  <td style="padding:0 4px">
                    <div style="
                      width:48px;
                      height:56px;
                      background:#ffffff;
                      border:2px solid #004b2d;
                      border-radius:10px;
                      font-family:'Courier New',monospace;
                      font-size:1.6rem;
                      font-weight:800;
                      color:#004b2d;
                      text-align:center;
                      line-height:56px;
                      box-shadow:0 2px 8px rgba(0,75,45,.1);
                    ">${d}</div>
                  </td>
                `).join("")}
              </tr>
            </table>

            <div style="margin-top:16px;font-size:.75rem;color:#6c757d">
              Expires in <strong>15 minutes</strong>
            </div>
          </div>

          <!-- SUPERVISOR ID NOTE -->
          <div style="background:#fffbeb;border:1px solid #fde68a;border-left:4px solid #bfa14a;border-radius:10px;padding:14px 16px;margin-bottom:16px">
            <div style="display:flex;align-items:center;gap:8px">
              <p style="color:#7a6020;font-size:.82rem;margin:0;font-weight:600;line-height:1.5">
                Your <strong>Supervisor ID</strong> remains unchanged. Only your login password will be reset.
              </p>
            </div>
          </div>

          <!-- WARNING -->
          <div style="background:#fff5f5;border:1px solid #fecaca;border-left:4px solid #dc2626;border-radius:10px;padding:14px 16px;margin-bottom:24px">
            <p style="color:#dc2626;font-size:.82rem;margin:0;font-weight:600">
               Never share this code with anyone. Our team will never ask for it.
            </p>
          </div>
        </div>

        <!-- FOOTER -->
        <div style="background:#f8faf8;border-top:1px solid #e8f0eb;padding:20px 36px;text-align:center">
          <p style="color:#9ca3af;font-size:.72rem;margin:0;line-height:1.6">
            This is an automated message from the FYP Management System<br/>
            <strong style="color:#6b7280">AWKUM · Department of Computer Science</strong>
          </p>
        </div>

      </div>
    `
  };
}