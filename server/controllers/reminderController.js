import { runDueReminders } from "../services/reminderService.js";

class ReminderController {
  static async run(req, res) {
    try {
      const dryRun = String(req.query.dryRun || "false") === "true";
      const result = await runDueReminders({ dryRun });
      res.json(result);
    } catch (error) {
      console.error("Reminder run error:", error);
      res.status(500).json({ message: "Failed to run reminders" });
    }
  }
}

export default ReminderController;

