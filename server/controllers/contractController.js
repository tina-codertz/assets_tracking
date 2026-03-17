import AssetContract from "../models/AssetContract.js";
import { addPeriods, toISODateString } from "../utils/dateUtils.js";

class ContractController {
  static async create(req, res) {
    try {
      const agent_id = req.user.id;
      const manager_id = req.body.manager_id || null;

      const startDate = req.body.start_date ? new Date(req.body.start_date) : new Date();
      const plan = req.body.installment_plan;
      const duration = Number(req.body.duration_periods);

      const nextDue = toISODateString(addPeriods(startDate, plan, 1));
      const expectedEnd = Number.isFinite(duration)
        ? toISODateString(addPeriods(startDate, plan, duration))
        : null;

      const contract = await AssetContract.create({
        ...req.body,
        agent_id,
        manager_id,
        start_date: toISODateString(startDate),
        next_due_date: req.body.next_due_date || nextDue,
        expected_end_date: req.body.expected_end_date || expectedEnd,
      });

      res.status(201).json({ contract });
    } catch (error) {
      console.error("Create contract error:", error);
      res.status(500).json({ message: "Failed to create contract" });
    }
  }

  static async list(req, res) {
    try {
      let contracts;
      if (req.user.role === "admin") {
        contracts = await AssetContract.findAllForAdmin();
      } else if (req.user.role === "agent") {
        contracts = await AssetContract.findByAgent(req.user.id);
      } else {
        // Managers currently see all contracts; could be scoped later
        contracts = await AssetContract.findAllForAdmin();
      }

      res.json({ contracts });
    } catch (error) {
      console.error("List contracts error:", error);
      res.status(500).json({ message: "Failed to fetch contracts" });
    }
  }
}

export default ContractController;

