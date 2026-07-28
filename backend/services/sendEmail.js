import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.BREVO_SMTP_LOGIN,
        pass: process.env.BREVO_SMTP_KEY
    }
});

export const sendResetEmail = async (toEmail, resetLink) => {
    await transporter.sendMail({
        from: "Blink <noreply@yourdomain.com>",
        to: toEmail,
        subject: "Reset your Blink password",
        html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                <h2>Reset your password</h2>
                <p>We received a request to reset your Blink password. Click the button below to choose a new one. This link expires in 30 minutes.</p>
                <a href="${resetLink}" style="display:inline-block; padding:12px 24px; background:#7c3aed; color:#fff; text-decoration:none; border-radius:8px; font-weight:bold;">
                    Reset Password
                </a>
                <p style="color:#666; font-size:12px; margin-top:24px;">
                    If you didn't request this, you can safely ignore this email.
                </p>
            </div>
        `
    });
};