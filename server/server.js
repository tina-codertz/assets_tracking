import app from './app.js';
import dotenv from 'dotenv';
import cron from "node-cron";
import { runDueReminders } from "./services/reminderService.js";

dotenv.config();

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Daily reminder job (runs at 08:00 server time). Disable with REMINDERS_CRON_ENABLED=false.
const cronEnabled = String(process.env.REMINDERS_CRON_ENABLED || "true") === "true";
if (cronEnabled) {
  cron.schedule("0 8 * * *", async () => {
    try {
      await runDueReminders({ dryRun: false });
    } catch (e) {
      console.error("Reminder cron failed:", e);
    }
  });
}
