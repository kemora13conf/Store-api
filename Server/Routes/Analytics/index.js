import { Router } from 'express';
import { signinRequired } from '../Auth/Controller.js'
import { total, order_per_month, amount_per_month, parseYear, recent_orders, invoice } from './Controller.js';

const router = new Router();

router.param('year', parseYear);

router.get('/total', signinRequired, total);
router.get('/invoice', signinRequired, invoice);
router.get('/orders/recent', signinRequired, recent_orders);
router.get('/:year/orders-per-month', signinRequired, order_per_month);
router.get('/:year/amount-per-month', signinRequired, amount_per_month);


export default router;