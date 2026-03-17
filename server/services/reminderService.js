import pool from "../config/database.js";
import { sendPaymentReminderEmail, sendPaymentReminderSms } from "./notificationService.js";

export async function runDueReminders({ dryRun = false } = {}) {
  const graceDays = Number(process.env.DEFAULT_GRACE_DAYS || 7);

  // 1) Mark defaulted: overdue beyond grace period
  const defaultedRes = await pool.query(
    `
    UPDATE asset_contracts
    SET status = 'defaulted'
    WHERE status = 'active'
      AND next_due_date IS NOT NULL
      AND next_due_date < (CURRENT_DATE - ($1 || ' days')::interval)
    RETURNING id, customer_id, next_due_date, allocated_amount, total_paid
  `,
    [String(graceDays)]
  );

  // 2) Fetch due (overdue but not defaulted yet)
  const dueRes = await pool.query(
    `
    SELECT
      ac.id AS contract_id,
      ac.next_due_date,
      ac.allocated_amount,
      ac.total_paid,
      c.full_name AS customer_name,
      c.email AS customer_email,
      c.phone AS customer_phone
    FROM asset_contracts ac
    JOIN customers c ON c.id = ac.customer_id
    WHERE ac.status = 'active'
      AND ac.next_due_date IS NOT NULL
      AND ac.next_due_date <= CURRENT_DATE
      AND ac.next_due_date >= (CURRENT_DATE - ($1 || ' days')::interval)
    ORDER BY ac.next_due_date ASC
  `,
    [String(graceDays)]
  );

  const reminders = [];

  for (const row of dueRes.rows) {
    const balance = Number(row.allocated_amount) - Number(row.total_paid || 0);
    if (balance <= 0) continue;

    if (dryRun) {
      reminders.push({ contract_id: row.contract_id, dryRun: true });
      continue;
    }

    const emailResult = await sendPaymentReminderEmail({
      to: row.customer_email,
      customerName: row.customer_name,
      contractId: row.contract_id,
      nextDueDate: row.next_due_date,
      balance,
    });

    const smsResult = await sendPaymentReminderSms({ toPhone: row.customer_phone });

    reminders.push({
      contract_id: row.contract_id,
      email: emailResult,
      sms: smsResult,
    });
  }

  return {
    grace_days: graceDays,
    defaulted_count: defaultedRes.rowCount,
    defaulted_contracts: defaultedRes.rows,
    reminders_sent: reminders,
  };
}

