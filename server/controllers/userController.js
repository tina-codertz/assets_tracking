import pool from '../config/database.js';

class UserController {
  static async getAllUsers(req, res) {
    try {
      // Only admin can get all users
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const query = 'SELECT id, email, role, is_verified, created_at FROM users';
      const result = await pool.query(query);

      res.json({ users: result.rows });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  }
}

export default UserController;
