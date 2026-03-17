import AssetContract from "../models/AssetContract.js";

class ContractController {
  static async create(req, res) {
    try {
      const agent_id = req.user.id;
      const manager_id = req.body.manager_id || null;

      const contract = await AssetContract.create({
        ...req.body,
        agent_id,
        manager_id,
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

