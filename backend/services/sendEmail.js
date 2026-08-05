import axios from "axios";

const brevo = axios.create({
    baseURL: "https://api.brevo.com/v3",
    headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

export const sendResetEmail = async (toEmail, resetLink) => {
    return brevo.post("/smtp/email", {
        sender: {
            name: "Blink",
            email: "ikhuemoisaigaga@gmail.com",
        },
        to: [
            {
                email: toEmail,
            },
        ],
        subject: "Reset your Blink Password",
        htmlContent: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Reset Password</title>
</head>

<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0"
style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.08);">

<tr>
<td
style="background:linear-gradient(135deg,#6D28D9,#8B5CF6);padding:35px;text-align:center;">

<h1 style="margin:0;color:#fff;font-size:32px;">
⚡ Blink
</h1>

<p style="margin:10px 0 0;color:#ede9fe;font-size:15px;">
Connect. Share. Discover.
</p>

</td>
</tr>

<tr>
<td style="padding:40px;">

<h2 style="margin-top:0;color:#111827;">
Reset your password
</h2>

<p style="font-size:16px;line-height:1.7;color:#4b5563;">
Hi there,
</p>

<p style="font-size:16px;line-height:1.7;color:#4b5563;">
We received a request to reset the password for your
<strong>Blink</strong> account.
If this was you, click the button below to create a new password.
</p>

<div style="text-align:center;margin:40px 0;">

<a href="${resetLink}"
style="
background:#6D28D9;
color:#ffffff;
padding:16px 36px;
text-decoration:none;
font-size:16px;
font-weight:bold;
border-radius:10px;
display:inline-block;
">
Reset Password
</a>

</div>

<p style="font-size:15px;color:#6b7280;line-height:1.7;">
This link will expire in
<strong>30 minutes</strong>.
</p>

<p style="font-size:15px;color:#6b7280;line-height:1.7;">
If you didn't request a password reset, you can safely ignore this email.
Your password will remain unchanged.
</p>

<hr style="border:none;border-top:1px solid #e5e7eb;margin:35px 0;">

<p style="font-size:13px;color:#9ca3af;word-break:break-all;">
If the button doesn't work, copy and paste this link into your browser:
</p>

<p style="font-size:13px;color:#6D28D9;word-break:break-all;">
${resetLink}
</p>

</td>
</tr>

<tr>
<td
style="background:#f9fafb;padding:24px;text-align:center;font-size:12px;color:#9ca3af;">

© ${new Date().getFullYear()} Blink. All rights reserved.

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`,
    });
};