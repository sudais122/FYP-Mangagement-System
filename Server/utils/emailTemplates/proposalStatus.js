// Shared building blocks ──────────────────────────────────────────────

const FONT = "'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

function shell({ accent, accentSoft, badgeBg, badgeText, label, heading, body }) {
  return `
  <div style="background:#eef1f0;padding:32px 16px">
    <div style="font-family:${FONT};max-width:520px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 6px 30px rgba(0,0,0,.07)">

      <!-- Header -->
      <div style="padding:34px 38px 28px;border-bottom:1px solid #f0f0f0">
        <div style="color:#111827;font-size:.92rem;font-weight:700;line-height:1.1">FYP Management System</div>
        <div style="color:#9ca3af;font-size:.66rem;font-weight:600;text-transform:uppercase;letter-spacing:.07em;margin-top:3px">AWKUM · CS Department</div>
      </div>

      <!-- Body -->
      <div style="padding:34px 38px 12px">
        <span style="display:inline-block;background:${badgeBg};color:${badgeText};font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;padding:6px 14px;border-radius:999px">${label}</span>

        <h1 style="color:#0f172a;font-size:1.5rem;font-weight:800;margin:18px 0 22px;line-height:1.25">${heading}</h1>

        ${body}
      </div>

      <!-- Footer -->
      <div style="padding:24px 38px 30px">
        <div style="border-top:1px solid #f0f0f0;padding-top:18px">
          <p style="color:#9ca3af;font-size:.7rem;line-height:1.5;margin:0">
            This is an automated message from the FYP Management System.<br>
            AWKUM · Department of Computer Science
          </p>
        </div>
      </div>

    </div>
  </div>`;
}

function projectCard(accent, projectTitle) {
  return `
    <div style="background:#f8fafc;border:1px solid #eef0f2;border-left:3px solid ${accent};border-radius:12px;padding:18px 22px;margin:0 0 24px">
      <div style="font-size:.66rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.09em;margin-bottom:6px">Project</div>
      <div style="font-size:1rem;font-weight:700;color:#0f172a;line-height:1.4">${projectTitle}</div>
    </div>`;
}

// Templates ───────────────────────────────────────────────────────────

export function proposalApprovedTemplate({ studentName, projectTitle }) {
  const accent = "#15803d";
  const body = `
    <p style="color:#334155;font-size:.92rem;line-height:1.7;margin:0 0 22px">
      Hi <strong>${studentName}</strong>,
    </p>
    <p style="color:#475569;font-size:.88rem;line-height:1.7;margin:0 0 22px">
      Great news — your proposal has been <strong style="color:${accent}">approved</strong> by the department.
    </p>

    ${projectCard(accent, projectTitle)}

    <div style="background:#f0faf4;border-radius:12px;padding:16px 20px;text-align:center;margin-bottom:8px">
      <span style="font-size:.88rem;font-weight:700;color:${accent}">You may now proceed to the next phase of your FYP.</span>
    </div>`;

  return {
    subject: `Proposal Approved — ${projectTitle}`,
    html: shell({
      accent,
      label: "Approved",
      badgeBg: "#dcfce7",
      badgeText: "#15803d",
      heading: "Your proposal is approved",
      body,
    }),
  };
}

export function proposalRejectedTemplate({ studentName, projectTitle, reason }) {
  const accent = "#dc2626";
  const body = `
    <p style="color:#334155;font-size:.92rem;line-height:1.7;margin:0 0 22px">
      Hi <strong>${studentName}</strong>,
    </p>
    <p style="color:#475569;font-size:.88rem;line-height:1.7;margin:0 0 22px">
      Unfortunately, your proposal has been <strong style="color:${accent}">rejected</strong> by the department.
    </p>

    ${projectCard(accent, projectTitle)}

    ${reason ? `
    <div style="background:#fffbeb;border:1px solid #fde68a;border-left:3px solid #d97706;border-radius:12px;padding:16px 20px;margin-bottom:24px">
      <div style="font-size:.66rem;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Reason</div>
      <div style="font-size:.88rem;color:#78350f;line-height:1.6">${reason}</div>
    </div>` : ""}

    <p style="color:#475569;font-size:.84rem;line-height:1.7;margin:0">
      Please review the feedback and resubmit an improved proposal. Reach out to your supervisor for guidance.
    </p>`;

  return {
    subject: `Proposal Rejected — ${projectTitle}`,
    html: shell({
      accent,
      label: "Rejected",
      badgeBg: "#fee2e2",
      badgeText: "#dc2626",
      heading: "Your proposal was rejected",
      body,
    }),
  };
}