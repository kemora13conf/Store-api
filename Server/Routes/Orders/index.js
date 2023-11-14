import { Router } from 'express';
import { signinRequired } from "../Auth/Controller.js"
import { response } from '../../utils.js';
import { list, orderById, invoice, create, stateList, update_status, deleteMultiple } from './Controller.js';
import { productById } from '../Products/Controllers.js';
import { clientById } from '../Client/Controller.js';

const router = new Router();

// Params
router.param('orderId', orderById)
router.param('productId', productById)
router.param('clientId', clientById)

// Routes
router.get('/', signinRequired, list)
router.get('/all-states', signinRequired, stateList)
router.post('/', signinRequired, create)
router.get('/:orderId', (req, res)=>{return res.status(200).json(response('success', 'Order fetched successfully.', req.order))})
router.get('/:orderId/invoice', signinRequired, invoice)
router.put('/:orderId/status', signinRequired, update_status)
router.delete('/delete-multiple', signinRequired, deleteMultiple)

export default router;