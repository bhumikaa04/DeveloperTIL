const express = require('express');
const jwt = require('jsonwebtoken'); 
const {authenticate , authorize } = require("../middlewares/auth"); 
const userRouter = express.Router();
const User = require('../models/user'); 


//helper to generate the JWT token 
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, userId: user.userId, role: user.role },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '7d' }
  );
};

// --------------------------------------------------------------
// PUBLIC ROUTES 
// --------------------------------------------------------------

userRouter.post('/register' , async(req, res) => {
    try{
        const {name, username, email, role , password} = req.body ; 

        if(!name || !username || !email || !password){
            return res.status(400).json({
                success: false, 
                message : 'Name, Username, Email , Password are required'
            })
        }

        //an existing user 
        const existingUser = await User.findOne({username : username});
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'User with this username already exists.',
          });
        }

        const user = new User({ name, username, email, password, role });
        await user.save();

        const token = generateToken(user); 

        return res.status(201).json({
          success: true,
          message: 'User registered successfully',
          token,
          user: {
            _id: user._id,
            userId: user.userId,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
          },
        });
    }catch(err){
        console.error('Error registering user:', err);
        return res.status(500).json({
          success: false,
          message: 'Internal Server Error',
          error: err.message,
        });
    }
})


userRouter.post('/login', async(req, res) =>{
    try{
        const {identifier, password} = req.body ; 
        if(!identifier || !password){
            return res.status(400).json({
                success : false, 
                message : 'Identifier and Password are required'
            }); 
        }

        const user = await User.findByEmailOrUsername(identifier); 
        if(!user){
            return res.status(401).json({
              success: false,
              message: 'Invalid credentials.',
            });
        } 

        const isMatch = await user.comparePassword(password); 
        if(!isMatch){
            return res.status(401).json({
              success: false,
              message: 'Invalid credentials.',
            });
        }

        const token = generateToken(user); 

        return res.status(200).json({
            success: true, 
            message : "Logged In Successfully", 
            token , 
            user : {
                _id: user._id,
                userId : user.userId, 
                name : user.name, 
                username : user.username , 
                role : user.role 
            }
        })
    }catch(err){
        return res.status(500).json({
          success: false,
          message: 'Internal Server Error',
          error: err.message,
        });
    }
})
// --------------------------------------------------------------
// PRIVATE ROUTES 
// --------------------------------------------------------------
//get a user
userRouter.get('/:userId' ,authenticate,  async(req, res) => {
    try{
        const {userId} = req.params ; 
        const user = await User.findOne({userId : userId}); 

        if(!user){
            return res.status(404).json({
                success :false, 
                message : "userId not found"
            }); 
        }

        return res.status(200).json({
            success : true , 
            message : "User retrieved" , 
            user
        })
    }catch(err){
        console.error("Error fetching the user : " + err); 
        return res.status(500).json({
            success : false , 
            message : "Internal Server Error" , 
            error : err.message 
        })
    }
})


//delete a user
userRouter.delete('/:userId' ,authenticate, authorize('admin'), async(req, res) => {
    try{
        const {userId} = req.params ; 
        const user = await User.findOneAndDelete({userId : userId}); 

        if(!user){
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({
            message : "User deleted successfully", 
            success : true,  
        })
    }catch(err){
        console.error("Error deleting the user : " + err); 
        return res.status(500).json({
            success : false , 
            message : "Internal Server Error" , 
            error : err.message 
        })
    }
})

module.exports = userRouter; 