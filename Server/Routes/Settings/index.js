import { Router } from 'express';
import { signinRequired } from '../Auth/Controller.js';
import { permissionsList } from './Controller.js';

let router = new Router();

router.get('/', (req, res) => {
    res.send('Hello from the server');
});

router.get('/permissions', signinRequired, permissionsList)

export default router;