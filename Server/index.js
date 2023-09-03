import express from 'express';
import mongoose from 'mongoose';
import Cors from 'cors';
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
const options = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: '*'
}
app.use(Cors(options))
app.use('/assets', express.static(path.join(__dirname, './../Public/')));
app.use((req, res, next) => {
  console.log(
    "Coming : [ " +
      req.method +
      " Request ] " +
      res.statusCode +
      " " +
      req.url +
      " [ " +
      new Date().toDateString() +
      " ]"
  );
  next();
});

// Importing the routes
import clientRouter from './Routes/Client/index.js'
import authRouter from './Routes/Auth/index.js'
import categoryRouter from './Routes/Categories/index.js'
import productRouter from './Routes/Products/index.js'
import { response } from './utils.js';

// Using the routes
app.use('/api/auth', authRouter)
app.use('/api/clients', clientRouter)
app.use('/api/categories', categoryRouter)
app.use('/api/products', productRouter)

app.use('/*', (req, res)=>{
    res.json(response('Not Found', 'This endpoint does not exist'))
})

export default app