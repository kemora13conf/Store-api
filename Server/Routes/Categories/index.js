import {Router} from 'express'
import { list, create, upload, verifyInputs, imagesHolder } from './Controller.js';
import { signinRequired } from "../Auth/Controller.js"

const router = new Router();

// router.param('categoryId', categoryById)

router.get('/', list)
router.post('/create-category', signinRequired, imagesHolder, upload.array('images'), verifyInputs, create)
// router.put('/upddate-category/:categoryId', signinRequired, update)
// router.delete('/delete-category/:categoryId', signinRequired, remove)


export default router;