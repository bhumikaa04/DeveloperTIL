const express = require('express'); 
const noteRouter = express.Router(); 

const Notes = require('../models/notes')

noteRouter.get('/', async (req, res) => {
    //we will get the userId from the frontend and then get all the notes linked to that specific id 
    try{
        const {userId} = req.query ; 

        if(!userId){
            return res.status(400).json({
                message : "UserId is necessary for access", 
                success : false
            })
        }
        const notes = await Notes.find({ userId: userId });
        return res.status(200).json({
            success: true,
            count: notes.length,
            notes: notes,
            message : 'Notes retrieved successfully'
        })
    }catch (err){
        console.error("Error fetching the notes : ", err)
        return res.status(500).json({ 
            success : false, 
            error: 'Internal Server error' , 
            message : err.message
        });
    }
}); 

noteRouter.get('/:id' , async (req, res) => {
    try{
        const {id} = req.params ; 

        const note = await Notes.findOne({noteId : id}); 
        
        if(!note){
            return res.status(404).json({
                message : "Note not found!", 
                success : false
            })
        }
        
        return res.status(200).json({
            success: true,
            note: note,
            message : 'Note retrieved successfully'
        })
    } catch(err){
        console.error("Error fetching the note : " + err);
        return res.status(500).json({
            message : "Internal Server Error", 
            success : false, 
            error : err.message
        }); 
    }
}); 

noteRouter.post('/' , async (req, res) => {
    try{
        //we will put the create notes and put them for that specific user
        const {title, content, categories, userId} = req.body ; 
        const note = new Notes({
            title, 
            content ,
            categories , 
            userId, 
        }) 

        await note.save(); 

        return res.status(201).json({
            message: 'Note created successfully',
            success : true, 
            note
        });
    }catch(err){
        console.error("Error creating the notes : " + err);
        return res.status(500).json({
            message : "Internal Server Error", 
            success : false, 
            error : err.message
        }); 
    }
})

noteRouter.patch('/:id' , async (req, res) => {
    try{
        const {id} = req.params ; 
        const updates = req.body ; 

        const note = await Notes.findOne({noteId : id}); 

        if(!note){
            return res.status(404).json({
                message : "Note not found!", 
                success : false
            })
        }

        Object.assign(note, updates);
        await note.save(); 

        res.status(200).json({
            message : "Note updated", 
            success : true, 
            note
        });

    }catch(err){
        console.error("Error updating the note : " + err);
        res.status(500).json({
            message : "Internal Server Error", 
            success : false, 
            error : err.message
        }); 
    }
})

noteRouter.delete('/:id' , async (req, res) => {
    try{
        const {id} = req.params ; 
        const note = await Notes.findOneAndDelete({noteId : id}); 

        if(!note){
            return res.status(404).json({ message: 'Note not found' });
        }

        return res.status(200).json({
            message : "Note deleted successfully", 
            success : true,  
        })
    }catch(err){
        console.error("Error deleting the note : " + err);
        return res.status(500).json({
            message : "Internal Server Error", 
            success : false, 
            error : err.message
        }); 
    }
})

module.exports = noteRouter;
