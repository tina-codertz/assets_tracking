import Asset from "../models/Asset.js";

class AssetController {
  static async create(req, res) {
    try {
      const asset = await Asset.create({ ...req.body, created_by: req.user.id });
      res.status(201).json({ asset });
    } catch (error) {
      console.error("Create asset error:", error);
      res.status(500).json({ message: "Failed to create asset" });
    }
  }

  static async list(req, res) {
    try {
      const assets = await Asset.findAll();
      res.json({ assets });
    } catch (error) {
      console.error("List assets error:", error);
      res.status(500).json({ message: "Failed to fetch assets" });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const asset = await Asset.update(id, req.body);
      res.json({ asset });
    } catch (error) {
      console.error("Update asset error:", error);
      res.status(500).json({ message: "Failed to update asset" });
    }
  }

  static async remove(req, res) {
    try {
      const { id } = req.params;
      await Asset.remove(id);
      res.status(204).send();
    } catch (error) {
      console.error("Delete asset error:", error);
      res.status(500).json({ message: "Failed to delete asset" });
    }
  }
}

export default AssetController;

