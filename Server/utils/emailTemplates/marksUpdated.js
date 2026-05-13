export function marksUpdatedTemplate({ studentName, supervisorName, groupCode, updatedSections, total }) {
  const sectionRows = updatedSections.map(s => `
    <tr>
      <td style="padding:8px 14px;font-size:.84rem;color:#1c1c1c;border-bottom:1px solid #f0f0f0">${s.label}</td>
      <td style="padding:8px 14px;font-size:.84rem;font-weight:700;color:var(--primary,#004b2d);text-align:right;border-bottom:1px solid #f0f0f0">${s.value} / ${s.max}</td>
    </tr>`).join("");

  return {
    subject: `Marks Updated — ${groupCode}`,
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:540px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
        <div style="background:linear-gradient(135deg,#003d24,#004b2d,#1f7a5c);padding:32px 36px">
          <div style="color:#fff;font-size:.95rem;font-weight:700">FYP Management System</div>
          <div style="color:rgba(191,161,74,.9);font-size:.68rem;font-weight:600;text-transform:uppercase;letter-spacing:.06em">AWKUM · CS Department</div>
          <div style="color:rgba(255,255,255,.4);font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.1em;margin-top:16px;margin-bottom:6px">Marks Update</div>
          <div style="color:#fff;font-size:1.4rem;font-weight:800">📊 Your Marks Have Been Updated</div>
        </div>
        <div style="padding:32px 36px">
          <p style="color:#1c1c1c;font-size:.95rem;font-weight:600;margin:0 0 8px">Hi ${studentName},</p>
          <p style="color:#4a5568;font-size:.86rem;line-height:1.7;margin:0 0 24px">
            Your supervisor <strong>${supervisorName}</strong> has updated your marks for team <strong>${groupCode}</strong>. Please log in to check your updated evaluation.
          </p>

          <div style="background:#f8faf8;border:1.5px solid #d4e8dc;border-radius:12px;overflow:hidden;margin-bottom:24px">
            <div style="background:rgba(0,75,45,.06);padding:12px 14px;border-bottom:1px solid #d4e8dc">
              <div style="font-size:.7rem;font-weight:700;color:#004b2d;text-transform:uppercase;letter-spacing:.08em">Updated Components</div>
            </div>
            <table style="width:100%;border-collapse:collapse">
              ${sectionRows}
            </table>
          </div>

          <div style="background:#f0faf4;border:1px solid #d4e8dc;border-radius:10px;padding:16px 20px;display:flex;align-items:center;justify-content:space-between">
            <div style="font-size:.8rem;color:#4a5568;font-weight:600">Total Marks So Far</div>
            <div style="font-size:1.4rem;font-weight:800;color:#004b2d">${total} <span style="font-size:.8rem;color:#6b7280;font-weight:600">/ 200</span></div>
          </div>
        </div>
        <div style="background:#f8faf8;border-top:1px solid #e8f0eb;padding:20px 36px;text-align:center">
          <p style="color:#9ca3af;font-size:.72rem;margin:0">AWKUM · CS Department · FYP Management System</p>
        </div>
      </div>`
  };
}