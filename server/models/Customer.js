import pool from "../config/database.js";

class Customer {
  static async create({ full_name, phone, email, address, id_number, created_by }) {
    const query = `
      INSERT INTO customers (full_name, phone, email, address, id_number, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`;
    const values = [full_name, phone, email, address, id_number, created_by];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAllByUser(user) {
    if (user.role === "admin" || user.role === "manager") {
      const result = await pool.query("SELECT * FROM customers ORDER BY created_at DESC");
      return result.rows;
    }

    const result = await pool.query(
      "SELECT * FROM customers WHERE created_by = $1 ORDER BY created_at DESC",
      [user.id]
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query("SELECT * FROM customers WHERE id = $1", [id]);
    return result.rows[0];
  }
}

export default Customer;

