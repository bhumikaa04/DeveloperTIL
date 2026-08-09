const { Timestamp } = require('bson');
const mongoose = require('mongoose')

const noteSchema = new mongoose.Schema({
    noteId : {
        type : String, 
        required : true,
        unique : true , 
        default : function(){
            //generating the custom noteId
            return `NOTE_ID_${Date.now()}_${Math.random().toString(36).substring(2,5)}`
        }
    },
    title : {
        type : String , 
        default : "Untitled Note", 
        trim : true, 
        required : [true , "Title is required"], 
    }, 
    content : {
        type : String, 
        default : "",
        trim : true, 
        required : [true , "Content is required"], 
    }, 
    categories : {
        type : [String], 
        default : []
    }, 
    userId : {
        type : mongoose.Schema.Types.ObjectId , 
        ref : 'User', 
        required : [true, "UserId is required"]
    },
    version: {
        type: Number,
        default: 1
    }
}, {timestamps : true})

//pre-save middleware 
noteSchema.pre('save' , function(next){
    if(this.isModified('content') && !this.isNew){
        this.version += 1; 
    }
    next(); 
}) ; 

const Notes = mongoose.model('Notes' , noteSchema); 
module.exports = Notes; 