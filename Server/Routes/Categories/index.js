import {Router} from 'express'
import { list } from './Controller.js';

const router = new Router();

router.get('/', list)

export default router;