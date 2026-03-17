import pool from "../config/database.js";

class AssetContract {
  static async create({
    asset_id,
    customer_id,
    agent_id,
    manager_id,
    allocated_amount,
    installment_plan,
    installment_amount,
    duration_periods,
    start_date,
    expected_end_date,
    next_due_date,
  }) {
    const query = `
      INSERT INTO asset_contracts (
        asset_id, customer_id, agent_id, manager_id,
        allocated_amount, installment_plan, installment_amount,
        duration_periods, start_date, expected_end_date, next_due_date
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *`;

    const values = [
      asset_id,
      customer_id,
      agent_id,
      manager_id,
      allocated_amount,
      installment_plan,
      installment_amount,
      duration_periods,
      start_date,
      expected_end_date,
      next_due_date,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query("SELECT * FROM asset_contracts WHERE id = $1", [id]);
    return result.rows[0];
  }

  static async findByAgent(agentId) {
    const result = await pool.query(
      `SELECT ac.*, c.full_name AS customer_name, a.name AS asset_name
       FROM asset_contracts ac
       JOIN customers c ON c.id = ac.customer_id
       JOIN assets a ON a.id = ac.asset_id
       WHERE ac.agent_id = $1
       ORDER BY ac.created_at DESC`,
      [agentId]
    );
    return result.rows;
  }

  static async findAllForAdmin() {
    const result = await pool.query(
      `SELECT ac.*, c.full_name AS customer_name, a.name AS asset_name, u.email AS agent_email
       FROM asset_contracts ac
       JOIN customers c ON c.id = ac.customer_id
       JOIN assets a ON a.id = ac.asset_id
       JOIN users u ON u.id = ac.agent_id
       ORDER BY ac.created_at DESC`
    );
    return result.rows;
  }

  static async updateTotalsAfterPayment(contractId) {
    const result = await pool.query(
      `UPDATE asset_contracts ac
       SET total_paid = COALESCE((
         SELECT SUM(p.amount) FROM payments p WHERE p.contract_id = ac.id
       ), 0),
       status = CASE
         WHEN COALESCE((
           SELECT SUM(p.amount) FROM payments p WHERE p.contract_id = ac.id
         ), 0) >= ac.allocated_amount THEN 'completed'
         ELSE ac.status
       END
       WHERE ac.id = $1
       RETURNING *`,
      [contractId]
    );
    return result.rows[0];
  }
}

export default AssetContract;

