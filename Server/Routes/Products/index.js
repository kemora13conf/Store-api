import { Router } from 'express';
import { categoryById } from '../Categories/Controller.js';
import { signinRequired } from "../Auth/Controller.js"
import { imagesHolder, response } from '../../utils.js';
import { create, list, productById, productsByCategory, remove, deleteMultiple, update, upload, verifyInputs, verifyUpdateInputs, changeState } from './Controllers.js';

const router = new Router();

// Params
router.param('productId', productById)
router.param('categoryById', categoryById)

// Routes
router.get('/', list)
router.get('/:productId', (req, res)=>{return res.status(200).json(response('success', 'Product fetched successfully.', req.product))})
router.get('/by-category/:categoryById', productsByCategory)
router.post('/create', signinRequired, imagesHolder, upload.array('images'), verifyInputs, create)

router.put('/update/:productId', signinRequired, imagesHolder, upload.array('images'), verifyUpdateInputs, update)
router.put('/change-state/:productId', signinRequired, changeState)


router.delete('/delete-multiple', signinRequired, deleteMultiple)
router.delete('/:productId', signinRequired, remove)

export default router;