import pool from "../config/database.js";

class ReportController {
  static async adminSummary(req, res) {
    try {
      const [assets, contracts, payments, outstanding] = await Promise.all([
        pool.query("SELECT COUNT(*) AS total_assets FROM assets"),
        pool.query(
          "SELECT COUNT(*) AS active_contracts FROM asset_contracts WHERE status = 'active'"
        ),
        pool.query("SELECT COALESCE(SUM(amount),0) AS total_payments FROM payments"),
        pool.query(
          "SELECT COALESCE(SUM(allocated_amount - total_paid),0) AS outstanding_balance FROM asset_contracts WHERE status IN ('active','defaulted')"
        ),
      ]);

      res.json({
        total_assets: Number(assets.rows[0].total_assets),
        active_contracts: Number(contracts.rows[0].active_contracts),
        total_payments: Number(payments.rows[0].total_payments),
        outstanding_balance: Number(outstanding.rows[0].outstanding_balance),
      });
    } catch (error) {
      console.error("Admin summary error:", error);
      res.status(500).json({ message: "Failed to fetch summary" });
    }
  }

  static async weeklyReturns(req, res) {
    try {
      const result = await pool.query(
        `
        SELECT date_trunc('week', paid_on) AS week,
               SUM(amount) AS total_amount
        FROM payments
        GROUP BY week
        ORDER BY week DESC
        LIMIT 12
      `
      );

      res.json({ data: result.rows });
    } catch (error) {
      console.error("Weekly returns error:", error);
      res.status(500).json({ message: "Failed to fetch weekly returns" });
    }
  }

  static async monthlyReturns(req, res) {
    try {
      const result = await pool.query(
        `
        SELECT date_trunc('month', paid_on) AS month,
               SUM(amount) AS total_amount
        FROM payments
        GROUP BY month
        ORDER BY month DESC
        LIMIT 12
      `
      );

      res.json({ data: result.rows });
    } catch (error) {
      console.error("Monthly returns error:", error);
      res.status(500).json({ message: "Failed to fetch monthly returns" });
    }
  }

  static async defaulters(req, res) {
    try {
      const result = await pool.query(
        `
        SELECT ac.*, c.full_name AS customer_name
        FROM asset_contracts ac
        JOIN customers c ON c.id = ac.customer_id
        WHERE ac.status = 'defaulted'
      `
      );

      res.json({ contracts: result.rows });
    } catch (error) {
      console.error("Defaulters error:", error);
      res.status(500).json({ message: "Failed to fetch defaulters" });
    }
  }

  static async pnl(req, res) {
    try {
      const from = req.query.from ? new Date(req.query.from) : new Date(Date.now() - 30 * 864e5);
      const to = req.query.to ? new Date(req.query.to) : new Date();

      const fromStr = from.toISOString().slice(0, 10);
      const toStr = to.toISOString().slice(0, 10);

      const [revenueRes, cogsRes, outstandingRes] = await Promise.all([
        pool.query(
          "SELECT COALESCE(SUM(amount),0) AS revenue FROM payments WHERE paid_on BETWEEN $1 AND $2",
          [fromStr, toStr]
        ),
        pool.query(
          `
          SELECT COALESCE(SUM(a.initial_value),0) AS cogs
          FROM asset_contracts ac
          JOIN assets a ON a.id = ac.asset_id
          WHERE ac.start_date BETWEEN $1 AND $2
            AND ac.status <> 'cancelled'
        `,
          [fromStr, toStr]
        ),
        pool.query(
          "SELECT COALESCE(SUM(allocated_amount - total_paid),0) AS outstanding_balance FROM asset_contracts WHERE status IN ('active','defaulted')"
        ),
      ]);

      const revenue = Number(revenueRes.rows[0].revenue);
      const cogs = Number(cogsRes.rows[0].cogs);
      const gross_profit = revenue - cogs;
      const outstanding_balance = Number(outstandingRes.rows[0].outstanding_balance);

      res.json({
        from: fromStr,
        to: toStr,
        revenue,
        cogs,
        gross_profit,
        outstanding_balance,
      });
    } catch (error) {
      console.error("P&L error:", error);
      res.status(500).json({ message: "Failed to fetch P&L report" });
    }
  }
}

export default ReportController;

