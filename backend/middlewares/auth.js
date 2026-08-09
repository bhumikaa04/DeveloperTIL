const jwt = require('jsonwebtoken'); 
const dotenv = require('dotenv'); 

dotenv.config(); 

//1. Authentication Middleware : verifies the JWT token 

// const authenticate = (req, res, next) => {
//     const authHeader = req.headers.authorization ; 

//     if(!authHeader || !authHeader.startsWith('Bearer ')){
//         return res.status(401).json({
//             success : false,
//             message : 'Access Denied. No token provided'
//         }); 
//     }

//     const token = authHeader.split(' ')[1]; 

//     try{
//         const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback secret'); 

//         //attach to req.user 
//         req.user = decoded ; 
//         next(); 
//     }catch(err){
//         return res.status(401).json({
//           success: false,
//           message: 'Invalid or expired token.',
//         });
//     }; 
// }

const authenticate = (req, res, next) => {
    console.log("\n========== AUTH CHECK ==========");

    const authHeader = req.headers.authorization;

    console.log("Authorization header:", authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log("❌ AUTH HEADER MISSING OR INVALID");

        return res.status(401).json({
            success: false,
            message: 'Access Denied. No token provided'
        });
    }

    const token = authHeader.split(' ')[1];

    console.log("Token exists:", !!token);
    console.log("Token length:", token?.length);

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'fallback secret'
        );

        console.log("✅ JWT VERIFIED");
        console.log("Decoded:", decoded);

        req.user = decoded;
        next();

    } catch (err) {

        console.log("❌ JWT VERIFY FAILED");
        console.log("JWT error:", err.name);
        console.log("JWT message:", err.message);

        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token.',
            error: err.message
        });
    }
};

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