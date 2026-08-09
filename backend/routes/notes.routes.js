const express = require('express'); 
const noteRouter = express.Router(); 
const {authenticate} = require('../middlewares/auth'); 
const mongoose = require('mongoose'); 
const Notes = require('../models/notes'); 

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

//get the heatmap 
noteRouter.get('/heatmap', authenticate, async (req, res) => {
    console.log("heatmap point hit"); 
    console.log('User from token:', req.user);
    try {
        const { userId, startDate, endDate } = req.query;

        // Validate userId
        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }

        // Build date filter
        const dateFilter = { 
            userId: new mongoose.Types.ObjectId(userId) 
        };

        if (startDate && endDate) {
            // Use the provided date range
            dateFilter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate + 'T23:59:59.999Z')
            };
        } else {
            // Default to last 30 days if no dates provided
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            dateFilter.createdAt = { $gte: thirtyDaysAgo };
        }

        console.log('Heatmap query:', { userId, startDate, endDate, dateFilter }); // Debug log

        const heatmapData = await Notes.aggregate([
            {
                $match: dateFilter  // ← USE the dateFilter here!
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    count: 1
                }
            },
            {
                $sort: { date: 1 }  // Optional: sort by date
            }
        ]);

        return res.json(heatmapData);

    } catch (err) {
        console.error('Heatmap error:', err);
        return res.status(500).json({
            message: 'Error generating the heatmap stats',
            error: err.message
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
