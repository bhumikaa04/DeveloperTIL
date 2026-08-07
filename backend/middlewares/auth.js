const jwt = require('jsonwebtoken'); 
const dotenv = require('dotenv'); 

dotenv.config(); 

//1. Authentication Middleware : verifies the JWT token 

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization ; 

    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({
            success : false,
            message : 'Access Denied. No token provided'
        }); 
    }

    const token = authHeader.split(' ')[1]; 

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback secret'); 

        //attach to req.user 
        req.user = decoded ; 
        next(); 
    }catch(err){
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token.',
        });
    }; 
}

//step 2 : authorization middleware: restricts by role 
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: You do not have permission to perform this action.',
          });
        }
        next();
    }
}

module.exports = { authenticate, authorize };