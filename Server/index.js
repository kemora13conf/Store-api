import express from 'express';

const app = express();

app.get('/', (req,res)=>{ res.json({id:'hello world!'})})


export default app