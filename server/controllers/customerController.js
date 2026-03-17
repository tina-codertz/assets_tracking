import Customer from "../models/Customer.js";

class CustomerController {
  static async create(req, res) {
    try {
      const payload = { ...req.body, created_by: req.user.id };
      const customer = await Customer.create(payload);
      res.status(201).json({ customer });
    } catch (error) {
      console.error("Create customer error:", error);
      res.status(500).json({ message: "Failed to create customer" });
    }
  }

  static async list(req, res) {
    try {
      const customers = await Customer.findAllByUser(req.user);
      res.json({ customers });
    } catch (error) {
      console.error("List customers error:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  }
}

export default CustomerController;

