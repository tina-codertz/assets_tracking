import Payment from "../models/Payment.js";
import AssetContract from "../models/AssetContract.js";
import { addPeriods, toISODateString } from "../utils/dateUtils.js";

class PaymentController {
  static async create(req, res) {
    try {
      const recorded_by = req.user.id;
      const payload = { ...req.body, recorded_by };

      const payment = await Payment.create(payload);
      const contract = await AssetContract.updateTotalsAfterPayment(payment.contract_id);

      // Schedule logic: if completed, clear next_due_date; otherwise push due date by 1 period from payment date.
      const paymentDate = payment.paid_on ? new Date(payment.paid_on) : new Date();
      const nextDue =
        contract.status === "completed"
          ? null
          : toISODateString(addPeriods(paymentDate, contract.installment_plan, 1));

      const updated = await AssetContract.updateSchedule(contract.id, {
        next_due_date: nextDue,
      });

      res.status(201).json({ payment, contract: updated });
    } catch (error) {
      console.error("Create payment error:", error);
      res.status(500).json({ message: "Failed to record payment" });
    }
  }

  static async listByContract(req, res) {
    try {
      const { contractId } = req.params;
      const payments = await Payment.findByContract(contractId);
      res.json({ payments });
    } catch (error) {
      console.error("List payments error:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  }
}

export default PaymentController;

