import { Router } from 'express';
import { signinRequired } from '../Auth/Controller.js';
import { permissionsList, general_settings, update_general_settings } from './Controller.js';

let router = new Router();

router.get('/general', signinRequired, general_settings)
router.put('/general', signinRequired, update_general_settings)
router.get('/permissions', signinRequired, permissionsList)

export default router;