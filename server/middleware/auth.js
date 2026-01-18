import TokenService from "../utils/tokenService.js";



const auth = async (req,resizeBy,next) =>{
    try{

        const token = req.header('Authorization')?.replace('Bearer',"");

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
