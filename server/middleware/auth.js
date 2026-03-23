import TokenService from "../utils/tokenService.js";



const auth = async (req, res, next) => {
    try{

        const authHeader = req.header("Authorization");
        // Expected format: "Bearer <token>"
        const token = authHeader?.startsWith("Bearer ")
          ? authHeader.slice("Bearer ".length)
          : authHeader;

        if(!token){
            return res.status(401).json({message:'Authorization required'});
        }

        const decoded = TokenService.verifyToken(token);
        if(!decoded){
            return res.status(401).json({message:"Invalid token"});
        }
        req.user = decoded;
        next();
    }catch(error){
        res.status(401).json({message:"Authentication failed"});
    }


};

export default auth
