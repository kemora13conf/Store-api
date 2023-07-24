import express from 'express';
import mongoose from 'mongoose';
import Config from 'dotenv';
Config.config();

const app = express();

// Connecting to the database
mongoose.connect(process.env.MONGO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true, 
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

app.get('/', (req,res)=>{ res.json({id:'hello world!'})})

// Handling midlwares
app.use(express.json())

// Importing the routes
import clientRouter from './Routes/Client/index.js'
app.use('/api/clients', clientRouter)


export default app