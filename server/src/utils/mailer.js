import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';

const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;

if (!user || !pass) {
  throw new Error('Missing EMAIL_USER or EMAIL_PASS in .env');
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: { user, pass }
});

transporter.verify()
  .then(() => console.log('Mail server ready'))
  .catch(err => console.error('Mail server connection failed:', err));

export async function sendEmail({ to, subject, text, html }) {
  
  const normalize = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === 'string') {
      const cleaned = value.trim();
      if (!cleaned) return [];
      return cleaned.split(/[;,]\s*/).filter(Boolean);
    }
    return [];
  };

  const recipients = normalize(to);

  if (recipients.length === 0) {
    console.error("Email send failed: No recipients defined");
    throw new Error("No recipients defined (missing 'to')");
  }

  const mailOptions = {
    from: user,
    to: recipients.join(', '),
    subject,
    text,
    html
  };

  console.log("Sending email:", {
    from: mailOptions.from,
    to: mailOptions.to,
    subject
  });

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response || info);
    return info;
  } catch (err) {
    console.error("sendMail() error:", err);
    throw err;
  }
}
