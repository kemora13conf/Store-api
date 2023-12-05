import express from 'express';
import mongoose from 'mongoose';
import Cors from 'cors';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import fs from 'fs';
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
app.use(express.json()) // parsing all the comming requests's body from json.npm run dev
const options = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: '*'
}
app.use(Cors(options))

// assets
app.use('/assets', express.static(path.join(__dirname, './../Public/')));

// Logging the requests
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

// load the language to the app
app.use((req, res, next) => {
  let lang = req.headers.lang || "English";
  let langPath = path.join(__dirname, `../Public/Languages/${lang}/default.json`);
  fs.readFile(langPath, (err, data) => {
    if (err) {
      // if the language file not found, load the default language
      langPath = path.join(__dirname, `../Public/Languages/English/default.json`);
      fs.readFile(langPath, (err, data) => {
        if (err) {
          // if the default language file not found, return an error
          console.log(err);
          res.status(500).json({
            status: "error",
            message: "Internal server error",
            error: err,
          });
        } else {
          req.lang = JSON.parse(data);
          next();
        }
      });
    } else {
      req.lang = JSON.parse(data);
      next();
    }
  });
});

// Importing the routes
import clientRouter from './Routes/Client/index.js'
import authRouter from './Routes/Auth/index.js'
import categoryRouter from './Routes/Categories/index.js'
import productRouter from './Routes/Products/index.js'
import orderRouter from './Routes/Orders/index.js'
import { initAdmin, initPermissions, initStatus, response } from './utils.js';
import settigs from './Routes/Settings/index.js';
import Analytics from './Routes/Analytics/index.js';
import multer from 'multer';

// Using the routes
app.use(initPermissions)
app.use(initAdmin)
app.use(initStatus)
app.use('/api/auth', authRouter)
app.use('/api/analytics', Analytics)
app.use('/api/clients', clientRouter)
app.use('/api/categories', categoryRouter)
app.use('/api/products', productRouter)
app.use('/api/orders', orderRouter)
app.use('/api/settings', settigs)

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    res.status(400).json(JSON.parse(err.message));
  }
});

app.use('/*', (req, res)=>{
    res.json(response('not_found', 'This endpoint does not exist'))
})

export default app