export function supervisorCredentialsTemplate({ name, email, sup_code, password }) {
  return {
    subject: "Your FYP Supervisor Account — AWKUM CS Dept",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px">
        <div style="background:linear-gradient(135deg,#004b2d,#1f7a5c);padding:24px 28px;border-radius:10px;margin-bottom:24px">
          <h2 style="color:#fff;margin:0;font-size:1.3rem">FYP Management System</h2>
          <p style="color:rgba(255,255,255,.7);margin:4px 0 0;font-size:.85rem">AWKUM · Department of Computer Science</p>
        </div>
        <p style="color:#1c1c1c;font-size:.95rem">Dear <strong>${name}</strong>,</p>
        <p style="color:#4a5568;font-size:.88rem;line-height:1.6">
          Your supervisor account has been created. Use the credentials below to log in.
        </p>
        <div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:10px;padding:20px 24px;margin:20px 0">
          <div style="margin-bottom:14px">
            <div style="font-size:.7rem;font-weight:700;color:#6c757d;text-transform:uppercase;letter-spacing:.05em">Supervisor ID</div>
            <div style="font-family:monospace;font-size:1.1rem;font-weight:800;color:#004b2d;margin-top:4px">${sup_code}</div>
          </div>
          <div style="margin-bottom:14px">
            <div style="font-size:.7rem;font-weight:700;color:#6c757d;text-transform:uppercase;letter-spacing:.05em">Email</div>
            <div style="font-size:.9rem;color:#1c1c1c;margin-top:4px">${email}</div>
          </div>
          <div>
            <div style="font-size:.7rem;font-weight:700;color:#6c757d;text-transform:uppercase;letter-spacing:.05em">Temporary Password</div>
            <div style="font-family:monospace;font-size:1.1rem;font-weight:800;color:#dc2626;margin-top:4px">${password}</div>
          </div>
        </div>
        <p style="color:#e65c00;font-size:.82rem;font-weight:600">
          You will be required to change this password on first login.
        </p>
        <p style="color:#4a5568;font-size:.82rem;line-height:1.6">
          Please save your Supervisor ID — you will need it for all FYP-related activities.
        </p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0"/>
        <p style="color:#6c757d;font-size:.72rem;text-align:center">AWKUM · CS Department · FYP Management System</p>
      </div>
    `
  };
}