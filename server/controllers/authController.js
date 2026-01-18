import User from "../models/User.js";
import TokenService from "../utils/tokenService.js";
import EmailService from "../utils/emailServices.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

class AuthController {

  // ----------------- LOGIN -----------------
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!user.is_verified) {
        return res.status(403).json({ message: "Please verify your email first" });
      }

      const token = TokenService.generateToken(user);

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        token,
      });

    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  }

  // ----------------- FORGOT PASSWORD -----------------
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

      // Save token + expiry to database
      await User.setResetToken(email, resetToken, expiresAt);

      // Send email
      await EmailService.sendPasswordReset(email, resetToken);

      res.json({ message: "Password reset email sent" });

    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process request" });
    }
  }

  // ----------------- RESET PASSWORD -----------------
  static async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { password } = req.body;

      // Find user by reset token and check expiry
      const user = await User.findByResetToken(token);
      if (!user || new Date() > new Date(user.reset_token_expires)) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.updatePassword(user.id, hashedPassword);

      // Clear reset token
      await User.clearResetToken(user.id);

      res.json({ message: "Password reset successful" });

    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  }

  // ----------------- GET PROFILE -----------------
  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ user });

    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  }
}

export default AuthController;
