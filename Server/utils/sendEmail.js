import { Resend } from "resend";

export async function sendEmail({ to, subject, html }) {
  console.log("=== sendEmail called ===");
  console.log("To:", to);
  console.log("RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY);

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const data = await resend.emails.send({
      from: "FYP Management AWKUM <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    console.log("Resend response:", JSON.stringify(data));

    if (data.error) {
      return { success: false, error: data.error.message };
    }

    return { success: true, data };

  } catch (err) {
    console.error("Email failed:", err.message);
    return { success: false, error: err.message };
  }
}