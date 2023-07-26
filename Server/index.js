import express from 'express';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
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

// Handling static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Handling midlwares
app.use(express.json())
app.use('/profile-images', express.static(path.join(__dirname, './../Public/Profile-images')));

// Importing the routes
import clientRouter from './Routes/Client/index.js'
import authRouter from './Routes/Auth/index.js'
import { response } from './utils.js';

// Using the routes
app.use('/api/clients', clientRouter)
app.use('/api/auth', authRouter)

app.use('/*', (req, res)=>{
    res.json(response('Not Found', 'This endpoint does not exist'))
})

export default app