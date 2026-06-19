export function otpEmailTemplate({ name, otp }) {
  const FONT = "'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
  const accent = "#15803d";

  return {
    subject: "Reset Your Password — FYP Management AWKUM",
    html: `
    <div style="background:#eef1f0;padding:32px 16px">
      <div style="font-family:${FONT};max-width:520px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 6px 30px rgba(0,0,0,.07)">

        <!-- HEADER -->
        <div style="padding:34px 38px 28px;border-bottom:1px solid #f0f0f0">
          <div style="color:#111827;font-size:.92rem;font-weight:700;line-height:1.1">FYP Management System</div>
          <div style="color:#9ca3af;font-size:.66rem;font-weight:600;text-transform:uppercase;letter-spacing:.07em;margin-top:3px">AWKUM · CS Department</div>
        </div>

        <!-- BODY -->
        <div style="padding:34px 38px 12px">

          <span style="display:inline-block;background:#dcfce7;color:${accent};font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;padding:6px 14px;border-radius:999px">Password Reset</span>

          <h1 style="color:#0f172a;font-size:1.5rem;font-weight:800;margin:18px 0 22px;line-height:1.25">Verify your request</h1>

          <p style="color:#334155;font-size:.92rem;line-height:1.7;margin:0 0 18px">
            Hi <strong>${name}</strong>,
          </p>
          <p style="color:#475569;font-size:.88rem;line-height:1.7;margin:0 0 26px">
            We received a request to reset your password. Enter the 6-digit code below to continue. It's valid for <strong style="color:${accent}">15 minutes</strong>.
          </p>

          <!-- OTP BOX -->
          <div style="background:#f8fafc;border:1px solid #eef0f2;border-radius:14px;padding:26px 20px;text-align:center;margin-bottom:24px">
            <div style="font-size:.66rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.09em;margin-bottom:16px">
              Verification Code
            </div>

            <!-- OTP CODE — single block, mobile-safe -->
            <div style="background:#ffffff;border:1.5px solid #d4e8dc;border-radius:12px;padding:16px 12px;font-family:'Courier New',monospace;font-size:2rem;font-weight:800;color:${accent};letter-spacing:.4em;text-indent:.4em;text-align:center">${otp}</div>

            <div style="margin-top:16px;font-size:.74rem;color:#94a3b8">
              Expires in <strong>15 minutes</strong>
            </div>
          </div>

          <!-- STUDENT ID NOTE -->
          <div style="background:#f8fafc;border:1px solid #eef0f2;border-left:3px solid #94a3b8;border-radius:12px;padding:14px 18px;margin-bottom:14px">
            <p style="color:#475569;font-size:.82rem;margin:0;line-height:1.6">
              Your <strong>Student ID</strong> stays the same — only your login password will be reset.
            </p>
          </div>

          <!-- WARNING -->
          <div style="background:#fff5f5;border:1px solid #fecaca;border-left:3px solid #dc2626;border-radius:12px;padding:14px 18px;margin-bottom:8px">
            <p style="color:#b91c1c;font-size:.82rem;margin:0;font-weight:600;line-height:1.6">
              Never share this code with anyone. Our team will never ask for it.
            </p>
          </div>

        </div>

        <!-- FOOTER -->
        <div style="padding:24px 38px 30px">
          <div style="border-top:1px solid #f0f0f0;padding-top:18px">
            <p style="color:#9ca3af;font-size:.7rem;line-height:1.5;margin:0">
              This is an automated message from the FYP Management System.<br>
              AWKUM · Department of Computer Science
            </p>
          </div>
        </div>

      </div>
    </div>
    `
  };
}