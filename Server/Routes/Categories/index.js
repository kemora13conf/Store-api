import {Router} from 'express'
import { list, category, create, upload, verifyInputs, verifyUpdateInputs, categoryById, update, remove, changeState, deleteMultiple } from './Controller.js';
import { response, imagesHolder } from "../../utils.js"
import { signinRequired } from "../Auth/Controller.js"

const router = new Router();

router.param('categoryId', categoryById);

router.get('/', list)
router.get('/:categoryId', category)
router.post('/create', signinRequired, imagesHolder, upload.array('images'), verifyInputs, create)

router.put('/update/:categoryId', signinRequired, imagesHolder, upload.array('images'), verifyUpdateInputs, update)
router.put('/change-state/:categoryId', signinRequired, changeState)

router.delete('/delete-multiple', signinRequired, deleteMultiple)
router.delete('/:categoryId', signinRequired, remove)


export default router;