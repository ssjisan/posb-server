import nodemailer from "nodemailer";

export const paymentReceivedMail = async ({
  to,
  name,
  registrationId,
  courseName,
}) => {
  try {
    // ✅ Create transporter (same Gmail config)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // ✅ HTML template (similar look & feel)
    const htmlTemplate = `
      <div style="background-color:#fafafa; padding:24px; font-family:Arial, sans-serif; color:#ffffff;">
        <!-- Header with logo -->
        <div style="text-align:center; padding-bottom:12px; border-bottom:2px solid #ffffff;">
          <img src="https://res.cloudinary.com/dkppv2xbi/image/upload/v1757143071/Logo_1_dmh87s.png" 
               alt="POSB Logo" style="height:48px;" />
        </div>

        <!-- Payment Image -->
        <div style="text-align:center; margin-top:24px;">
          <img src="https://res.cloudinary.com/dkppv2xbi/image/upload/v1757142557/congrats_srqxys.png" 
               alt="Payment Received" style="width:100%; max-width:160px; height:auto;" />
        </div>

        <!-- Content -->
        <div style="margin-top:24px; background:#ffffff; color:#111827; padding:20px; border-radius:8px;">
          <p style="font-size:14px; margin:0 0 12px 0;">Hello, ${name}</p>
          <p style="font-size:14px; margin:0 0 12px 0;">
            Thank you for submitting your payment information for the course: <strong>${courseName}</strong>.
          </p>
          <p style="font-size:14px; margin:0 0 12px 0;">
            Your Registration ID: <strong style="color:#114285;">${registrationId}</strong>
          </p>
          <p style="font-size:14px; margin:0 0 12px 0;">
            Please wait while we verify your payment. You will be notified by email once your payment is 
            <strong>approved</strong> or <strong>rejected</strong>.
          </p>
          <p style="font-size:14px; margin:0;">Best regards,<br/>
            <strong>Paediatric Orthopaedic Society of Bangladesh</strong>
          </p>
        </div>

        <!-- Footer -->
        <div style="text-align:center; margin-top:24px; font-size:10px; color:#111827;">
          <a href="https://insighttechglobal.com" target="_blank" 
             style="color:#111827; text-decoration:none;">
            © insighttechglobal.com
          </a>
        </div>
      </div>
    `;

    // ✅ Send mail
    await transporter.sendMail({
      from: "bdposb@gmail.com",
      to,
      subject: "Thank you for your payment submission",
      html: htmlTemplate,
      text: `Hi ${name}, we received your payment info for ${courseName}. Your Registration ID is ${registrationId}. Please wait for verification.`,
    });

    console.log(`📧 Payment mail sent successfully to ${to}`);
  } catch (error) {
    console.error("❌ Error sending payment received mail:", error);
  }
};
