export function proposalApprovedTemplate({ studentName, groupCode, projectTitle }) {
  return {
    subject: `Proposal Approved — ${groupCode}`,
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:540px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
        <div style="background:linear-gradient(135deg,#003d24,#004b2d,#1f7a5c);padding:32px 36px">
          <div style="color:#fff;font-size:.95rem;font-weight:700">FYP Management System</div>
          <div style="color:rgba(191,161,74,.9);font-size:.68rem;font-weight:600;text-transform:uppercase;letter-spacing:.06em">AWKUM · CS Department</div>
          <div style="color:rgba(255,255,255,.4);font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.1em;margin-top:16px;margin-bottom:6px">Proposal Status Update</div>
          <div style="color:#fff;font-size:1.4rem;font-weight:800">Proposal Approved</div>
        </div>
        <div style="padding:32px 36px">
          <p style="color:#1c1c1c;font-size:.95rem;font-weight:600;margin:0 0 8px">Hi ${studentName},</p>
          <p style="color:#4a5568;font-size:.86rem;line-height:1.7;margin:0 0 24px">
            Great news! Your team's proposal for <strong>${projectTitle}</strong> has been <strong style="color:#15803d">approved</strong> by the department.
          </p>
          <div style="background:#f0faf4;border:1.5px solid #d4e8dc;border-left:4px solid #15803d;border-radius:12px;padding:20px 24px;margin-bottom:24px">
            <div style="font-size:.7rem;font-weight:700;color:#6c757d;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">Team Details</div>
            <div style="font-size:.88rem;color:#1c1c1c"><strong>Team:</strong> ${groupCode}</div>
            <div style="font-size:.88rem;color:#1c1c1c;margin-top:4px"><strong>Project:</strong> ${projectTitle}</div>
          </div>
          <div style="background:#f0faf4;border:1px solid #d4e8dc;border-radius:10px;padding:16px;text-align:center">
            <div style="font-size:.88rem;font-weight:700;color:#15803d">You may now proceed to the next phase of your FYP.</div>
          </div>
        </div>
        <div style="background:#f8faf8;border-top:1px solid #e8f0eb;padding:20px 36px;text-align:center">
          <p style="color:#9ca3af;font-size:.72rem;margin:0">AWKUM · CS Department · FYP Management System</p>
        </div>
      </div>
    `
  };
}

export function proposalRejectedTemplate({ studentName, groupCode, projectTitle, reason }) {
  return {
    subject: `Proposal Rejected — ${groupCode}`,
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:540px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
        <div style="background:linear-gradient(135deg,#7f1d1d,#991b1b,#dc2626);padding:32px 36px">
          <div style="color:#fff;font-size:.95rem;font-weight:700">FYP Management System</div>
          <div style="color:rgba(255,200,200,.8);font-size:.68rem;font-weight:600;text-transform:uppercase;letter-spacing:.06em">AWKUM · CS Department</div>
          <div style="color:rgba(255,255,255,.4);font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.1em;margin-top:16px;margin-bottom:6px">Proposal Status Update</div>
          <div style="color:#fff;font-size:1.4rem;font-weight:800">Proposal Rejected</div>
        </div>
        <div style="padding:32px 36px">
          <p style="color:#1c1c1c;font-size:.95rem;font-weight:600;margin:0 0 8px">Hi ${studentName},</p>
          <p style="color:#4a5568;font-size:.86rem;line-height:1.7;margin:0 0 24px">
            Unfortunately, your team's proposal for <strong>${projectTitle}</strong> has been <strong style="color:#dc2626">rejected</strong> by the department.
          </p>
          <div style="background:#fff5f5;border:1.5px solid #fecaca;border-left:4px solid #dc2626;border-radius:12px;padding:20px 24px;margin-bottom:24px">
            <div style="font-size:.7rem;font-weight:700;color:#6c757d;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">Team Details</div>
            <div style="font-size:.88rem;color:#1c1c1c"><strong>Team:</strong> ${groupCode}</div>
            <div style="font-size:.88rem;color:#1c1c1c;margin-top:4px"><strong>Project:</strong> ${projectTitle}</div>
          </div>
          ${reason ? `
          <div style="background:#fffbeb;border:1px solid #fde68a;border-left:4px solid #d97706;border-radius:10px;padding:16px 20px;margin-bottom:24px">
            <div style="font-size:.7rem;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Rejection Reason</div>
            <div style="font-size:.88rem;color:#78350f;line-height:1.6">${reason}</div>
          </div>` : ""}
          <p style="color:#4a5568;font-size:.82rem;line-height:1.6">
            Please review the feedback and resubmit an improved proposal. Contact your supervisor for guidance.
          </p>
        </div>
        <div style="background:#f8faf8;border-top:1px solid #e8f0eb;padding:20px 36px;text-align:center">
          <p style="color:#9ca3af;font-size:.72rem;margin:0">AWKUM · CS Department · FYP Management System</p>
        </div>
      </div>
    `
  };
}