import { Resend } from "resend";

export async function sendEmail({ to, subject, html }) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const data = await resend.emails.send({
      from: "FYP Management AWKUM <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    console.log("Email sent:", data);

    return { success: true, data };
  } catch (err) {
    console.error("Email send failed:", err);

    return {
      success: false,
      error: err.message,
    };
  }
}