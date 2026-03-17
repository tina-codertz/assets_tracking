import pool from "../config/database.js";

class Payment {
  static async create({ contract_id, amount, paid_on, payment_method, reference, recorded_by }) {
    const query = `
      INSERT INTO payments (
        contract_id, amount, paid_on, payment_method, reference, recorded_by
      )
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *`;

    const values = [contract_id, amount, paid_on, payment_method, reference, recorded_by];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByContract(contractId) {
    const result = await pool.query(
      "SELECT * FROM payments WHERE contract_id = $1 ORDER BY paid_on DESC, created_at DESC",
      [contractId]
    );
    return result.rows;
  }

  static async aggregateByPeriod({ from, to, groupBy = "week" }) {
    const dateTruncUnit = groupBy === "month" ? "month" : "week";
    const result = await pool.query(
      `
      SELECT
        date_trunc($1, paid_on) AS period,
        SUM(amount) AS total_amount
      FROM payments
      WHERE paid_on BETWEEN $2 AND $3
      GROUP BY period
      ORDER BY period ASC
    `,
      [dateTruncUnit, from, to]
    );
    return result.rows;
  }
}

export default Payment;

