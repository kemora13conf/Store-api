import { Router } from 'express'
import { signin, signinRequired, verifyInputs, verifyToken } from './Controller.js';

const router = new Router();

router.post('/signin', verifyInputs, signin)
router.get('/verify-token', signinRequired, verifyToken)

export default router