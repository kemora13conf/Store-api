import { Router } from 'express'
import { all, create } from './Controller.js'

const router = new Router();

router.get('/', all)
router.post('/create-account', create)

export default router;