import EmailService from "../utils/emailServices.js";

let emailClient;

function getEmailClient() {
  if (!emailClient) emailClient = new EmailService();
  return emailClient;
}

export async function sendPaymentReminderEmail({ to, customerName, contractId, nextDueDate, balance }) {
  if (!to) return { ok: false, skipped: true, reason: "no_email" };
  const subject = `Payment Reminder - Contract #${contractId}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
      <h2 style="margin-bottom: 6px;">Payment Reminder</h2>
      <p style="margin-top: 0;">Hello ${customerName || "Customer"},</p>
      <p>This is a friendly reminder that a payment is due for your asset contract.</p>
      <ul>
        <li><strong>Contract ID:</strong> ${contractId}</li>
        <li><strong>Next due date:</strong> ${nextDueDate || "-"}</li>
        <li><strong>Outstanding balance:</strong> ${Number(balance || 0).toLocaleString()}</li>
      </ul>
      <p>If you already paid, please ignore this message.</p>
    </div>
  `;

  const client = getEmailClient();
  await client.transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject,
    html,
  });

  return { ok: true };
}

export async function sendPaymentReminderSms({ toPhone }) {
  // Optional hook: add Twilio or another provider.
  if (!toPhone) return { ok: false, skipped: true, reason: "no_phone" };
  if (!process.env.TWILIO_ACCOUNT_SID) return { ok: false, skipped: true, reason: "sms_not_configured" };
  return { ok: false, skipped: true, reason: "not_implemented" };
}

