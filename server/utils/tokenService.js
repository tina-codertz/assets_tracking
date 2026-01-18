import  jwt  from "jsonwebtoken";
import  dotenv  from "dotenv";

dotenv.config();

class TokenService{
    static generateToken(user){
        return jwt.sign(
            {id: user.id, email:user.email, role:user.role},
            process.env.JWT_SECRET ,
            {expiresIn:"24h"}
        );
    }

    static verifyToken(token){
        try{
            return jwt.verify(token, process.env.JWT_SECRET)
        }catch(error){
            return null;
        }

    }

    static generateResetToken(){
        return crypto.randomBytes(32).toString("hex")
    }
}
export default TokenService