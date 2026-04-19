export const otpEmailTemplate = (otp) => {
  return `
  <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
    
    <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 30px; border-radius: 10px; text-align: center;">
      
      <h2 style="color: #333;">Password Reset Request</h2>
      
      <p style="color: #555; font-size: 14px;">
        Use the OTP below to reset your password. This code will expire in 10 minutes.
      </p>

      <div style="margin: 30px 0;">
        <span style="
          display: inline-block;
          padding: 15px 30px;
          font-size: 24px;
          letter-spacing: 5px;
          font-weight: bold;
          color: #ffffff;
          background-color: #007bff;
          border-radius: 8px;
        ">
          ${otp}
        </span>
      </div>

      <p style="color: #999; font-size: 12px;">
        If you did not request this, please ignore this email.
      </p>

      <hr style="margin: 30px 0;" />

      <p style="font-size: 12px; color: #aaa;">
        © ${new Date().getFullYear()} FYP Management System
      </p>
    
    </div>
  </div>
  `;
};