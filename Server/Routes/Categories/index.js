import {Router} from 'express'
import { categoryById, list, create, update, remove } from './Controller.js';
import { signinRequired } from "../Auth/Controller.js"

const router = new Router();

router.param('categoryId', categoryById)

router.get('/', list)
router.post('/create-cateory', signinRequired, create)
router.put('/upddate-category/:categoryId', signinRequired, update)
router.delete('/delete-category/:categoryId', signinRequired, remove)


export default router;