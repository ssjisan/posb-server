import nodemailer from "nodemailer";

// ------------------ MAIL HELPERS ------------------

// Approve mail template
export const sendApproveEmail = async ({
  to,
  name,
  registrationId,
  courseName,
  registrationURL,
}) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const htmlTemplate = `
      <div style="background-color:#fafafa; padding:24px; font-family:Arial, sans-serif; color:#111827;">
        <div style="text-align:center; padding-bottom:12px;">
          <img src="https://res.cloudinary.com/dkppv2xbi/image/upload/v1757143071/Logo_1_dmh87s.png" 
               alt="POSB Logo" style="height:48px;" />
        </div>

        <div style="margin-top:24px; background:#ffffff; padding:20px; border-radius:8px;">
          <p>Hello, ${name}</p>
          <p>✅ Your payment has been <strong>confirmed</strong> for the course <strong>${courseName}</strong>.</p>
          <p>Your Registration ID: <strong style="color:#114285;">${registrationId}</strong></p>
          <p>You can track your registration status here:</p>
          <div style="text-align:center; margin-top:12px;">
            <a href="${registrationURL}" 
               style="display:inline-block; background:#114285; color:#fff; padding:12px 24px; border-radius:6px; text-decoration:none;">
               Track Registration
            </a>
          </div>
          <p style="margin-top:12px;">Thanks for registering with us.</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject: "Payment Confirmed - POSB",
      html: htmlTemplate,
      text: `Hello ${name}, your payment has been confirmed for ${courseName}. Registration ID: ${registrationId}.`,
    });
  } catch (error) {
    console.error("Error sending approve email:", error);
  }
};

// Reject mail template
export const sendRejectEmail = async ({
  to,
  name,
  registrationId,
  courseName,
  remarks,
  registrationURL,
}) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const htmlTemplate = `
      <div style="background-color:#fafafa; padding:24px; font-family:Arial, sans-serif; color:#111827;">
        <div style="text-align:center; padding-bottom:12px;">
          <img src="https://res.cloudinary.com/dkppv2xbi/image/upload/v1757143071/Logo_1_dmh87s.png" 
               alt="POSB Logo" style="height:48px;" />
        </div>

        <div style="margin-top:24px; background:#ffffff; padding:20px; border-radius:8px;">
          <p>Hello, ${name}</p>
          <p>❌ Unfortunately, your registration for the course <strong>${courseName}</strong> with ID <strong>${registrationId}</strong> has been <strong>rejected</strong>.</p>

          ${
            remarks
              ? `<p style="background-color:#fee2e2; color:#b91c1c; padding:8px; border-radius:4px;"><strong>Remarks:</strong> ${remarks}</p>`
              : ""
          }

          <p style="margin-top:16px; text-align:center;">
            <a href="${registrationURL}" 
               style="display:inline-block; background-color:#ef4444; color:#fff; padding:10px 16px; border-radius:6px; text-decoration:none; font-weight:bold;">
              Track Registration
            </a>
          </p>

          <p style="margin-top:12px;">Thank you for your interest.</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject: "Registration Rejected - POSB",
      html: htmlTemplate,
      text: `Hello ${name}, unfortunately your registration for ${courseName} with ID ${registrationId} has been rejected. Remarks: ${
        remarks || "N/A"
      }`,
    });
  } catch (error) {
    console.error("Error sending reject email:", error);
  }
};
