import { Router } from 'express'
import { clientById, list, create, verifyInputs, upload, update, verifyUPdateInputs, client, updateTheme, updateLanguage, remove, deleteMultiple } from './Controller.js'
import { signinRequired } from '../Auth/Controller.js';

const router = new Router();

// Decalaring the params
router.param('clientId', clientById)

// Declaring the routes
router.get('/', signinRequired, list)
router.post('/', signinRequired, upload.single('image'), verifyInputs, create)

// update theme and language for the current user
router.put('/update-theme', signinRequired, updateTheme)
router.put('/update-language', signinRequired, updateLanguage)

router.put('/:clientId', signinRequired, upload.single('image'), verifyUPdateInputs, update)
router.get('/:clientId', client)

// deletign routes
router.delete('/delete-multiple', signinRequired, deleteMultiple)
router.delete('/:clientId', signinRequired, remove)

export default router;