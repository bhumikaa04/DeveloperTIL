const mongoose = require('mongoose'); 
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    userId : {
        type : String, 
        required : [true, "User ID is required"],
        unique : true , 
        default : function(){
            //generating the custom userId
            return `USER_ID_${Date.now()}_${Math.random().toString(36).substring(2,5)}`
        }
    }, 
    name : {
        type : String, 
        required : [true, "Name is required"], 
        trim : true, 
        minlength: [2, "Name must be at least 2 characters"],
        maxlength: [50, "Name cannot exceed 50 characters"],
        default : "USER"
    }, 
    username :{
        type : String , 
        required : [true, "Username is required"] , 
        unique : true , 
        trim : true, 
        lowercase : true, 
        minlength: [2, "Username must be at least 2 characters"],
        maxlength: [50, "Username cannot exceed 50 characters"], 
        match :[
            /^[a-zA-Z0-9_]+$/, 
            "Usernames can only be alphabets, numbers and underscores."
        ]
    }, 
    email : {
        type : String , 
        required : [true, "Email is required"] , 
        lowercase : true, 
        trim : true ,
        match : [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ ,
            "Please provide a valid email address"
        ]
    }, 
    password : {
        type : String, 
        required : [true, "Password is required"] , 
        minlength : [6, "Password length must be minum of 6 characters."], 
        select : false , //doesnot expose password in queries 
    }, 
    role :{
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    profilePicture: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        maxlength: [500, "Bio cannot exceed 500 characters"],
        trim: true,
        default: ""
    },
} , {timestamps : true}); 
// ✅ Pre-save: username middleware
userSchema.pre('save', async function () {
  // If password wasn't modified, skip hashing
  if (!this.isModified('password')) return;

  // Hash the password using async/await cleanly
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

//add a middleware to hash the password

//compares the passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ✅ Static method: Find by email or username
userSchema.statics.findByEmailOrUsername = function(identifier) {
    return this.findOne({
        $or: [
            { email: identifier.toLowerCase() },
            { username: identifier.toLowerCase() }
        ]
    }).select('+password');
};

// ✅ Static method: Create with validation
userSchema.statics.createUser = async function(userData) {
    const user = new this(userData);
    await user.save();
    return user;
};

const User = mongoose.model("User", userSchema); 
module.exports = User; 