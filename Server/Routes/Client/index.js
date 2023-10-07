import { Router } from 'express'
import { clientById, list, create, verifyInputs, upload, update, verifyUPdateInputs, client, updateTheme, updateLanguage } from './Controller.js'
import { signinRequired } from '../Auth/Controller.js';

const router = new Router();

// Decalaring the params
router.param('clientId', clientById)

// Declaring the routes
router.get('/', list)
router.post('/', upload.single('image'), verifyInputs, create)
router.put('/:clientId', signinRequired, upload.single('image'), verifyUPdateInputs, update)
router.get('/:clientId', client)
router.put('/update-theme', signinRequired, updateTheme)
router.put('/update-language', signinRequired, updateLanguage)



export default router;