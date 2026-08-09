const dotenv = require('dotenv');
dotenv.config(); 
const express = require('express'); 
const mongoose = require('mongoose'); 
const cors = require('cors'); 
const { timeStamp } = require('node:console'); 
const noteRouter = require('./routes/notes.routes'); 
const userRouter = require('./routes/users.routes'); 

const app = express();
//middleware 
app.use(cors()); 
app.use(express.json()); 

//API Routes
app.use('/notes', noteRouter); 
app.use('/user' , userRouter); 

//health check 
app.get('/' , (req, res) => {
    res.json({
        status : 'OK', 
        message : "Server is running", 
        timeStamp : new Date().toISOString()
    })
})

// Connect to MongoDB
mongoose.connect(process.env.MONGO_DB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
