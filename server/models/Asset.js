import pool from "../config/database.js";

class Asset {
  static async create({
    name,
    description,
    category,
    initial_value,
    allocated_amount,
    profit_margin,
    installment_plan,
    installment_amount,
    duration_periods,
    created_by,
  }) {
    const query = `
      INSERT INTO assets (
        name, description, category,
        initial_value, allocated_amount, profit_margin,
        installment_plan, installment_amount, duration_periods,
        created_by
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *`;

    const values = [
      name,
      description,
      category,
      initial_value,
      allocated_amount,
      profit_margin,
      installment_plan,
      installment_amount,
      duration_periods,
      created_by,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async update(id, fields) {
    const keys = Object.keys(fields);
    if (keys.length === 0) return this.findById(id);

    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
    const values = [...keys.map((k) => fields[k]), id];

    const query = `UPDATE assets SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async remove(id) {
    await pool.query("DELETE FROM assets WHERE id = $1", [id]);
  }

  static async findById(id) {
    const result = await pool.query("SELECT * FROM assets WHERE id = $1", [id]);
    return result.rows[0];
  }

  static async findAll() {
    const result = await pool.query("SELECT * FROM assets ORDER BY created_at DESC");
    return result.rows;
  }
}

export default Asset;

