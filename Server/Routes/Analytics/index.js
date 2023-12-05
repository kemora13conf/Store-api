import { Router } from 'express';
import { signinRequired } from '../Auth/Controller.js'
import { total } from './Controller.js';

const router = new Router();

router.get('/total', signinRequired, total);


export default router;