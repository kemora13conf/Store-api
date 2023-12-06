import { Router } from 'express';
import { signinRequired } from '../Auth/Controller.js'
import { total, order_per_month } from './Controller.js';

const router = new Router();

router.param('year', (req, res, next, year)=>{
  req.year = year ? parseInt(year) : new Date().getFullYear();
  next();
});

router.get('/total', signinRequired, total);
router.get('/:year/orders-per-month', signinRequired, order_per_month);


export default router;