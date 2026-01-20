import nodemailer from "nodemailer"
import dotenv from "dotenv";
dotenv.config();

class EmailService{
    constructor(){
        this.transporter = nodemailer.createTransport({
            host:process.env.SMTP_HOST,
            port:process.env.SMTP_PORT,
            secure:false,
            auth:{

            user:process.env.SMTP_USER,
            pass:process.env.SMTP_PASS,

            },
        
        });
    }

    async sendPasswordReset(email, resetToken){
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        const mailOptions={
            from:process.env.SMTP_USER,
            to: email,
            subject:"Password Reset Requestg",
            html:`
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password. Click the link below to reset it:</p>
          <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Reset Password
          </a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
         </div>
            `,
        };
        await this.transporter.sendMail(mailOptions)
    }

}
export default EmailService