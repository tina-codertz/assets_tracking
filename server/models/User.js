import pool from "../config/database.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";


class User {
    static async create ({email, password,role}){
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `INSERT INTO users(email,password,role, is_verified)
        VALUES($1,$2,$3,$4)
        RETURNING id, email, role, created_at`;
        const result = await pool.query(query,[email,hashedPassword,role,false]);
        return result.rows[0]
    }
    static async findByEmail(email){
        const query = 'SELECT * FROM users WHERE email =$1';
        const result = await pool.query(query,[email]);
        return result.rows[0];
    }

    static async findById(id){
        const query = "SELECT id, email, role, is_verified, created_at FROM users WHERE id = $1";
        const result = await pool.query(query,[id]);
        return result.rows[0]
    }
    static async updatePassword(id, password){
        const hashedPassword = await bcrypt.hash(password,10);
        const query = 'UPDATE users SET password = $1 WHERE id=$2 RETURNING id, email';
        const result = await pool.query(query,[hashedPassword, id]);
        return result.rows[0]

    }
     static async setResetToken(email,token){
        const expires = new Date();
        expires.setHours(expires.getHours() + 1); // token expires in 1 hour

        const query = 
        `UPDATE users SET  reset_password_token =$1, reset_password_expires = $2
        WHERE email = $3 RETURNING id,email`;
        const result = await pool.query(query,[token,expires,email]);
        return result.rows [0]
     }

     static async findResetToken(token){
        const query =
        `SELECT * FROM users WHERE reset_password_token=$1 AND reset_password_expires > NOW()`;
        const result = await pool.query(query,[token]);
        return result.rows[0];
     }
     static async clearResetToken(id){
        const query =
        `UPDATE users SET reset_password_token=NULL WHERE id=$1`;
        await pool.query(query,[id])
     }
     static async verifyUser(id){
        const query = `UPDATE users SET is_verified = true WHERE id =$1 RETURNING *`;
        const result = await pool.query(query,[id]);
        return result.rows[0]
     }
};
export default User