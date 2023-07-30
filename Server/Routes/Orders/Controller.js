import Order from './Models/Order.js';

const orderById = async (req, res, next, id) => {
    try {
        const order = await Order.findById(id)
                            .populate('status')
                            .populate({
                                path: 'items',
                                populate: {
                                    path: 'product',
                                    model: 'Product'
                                }
                            });
        if(!order) return res.status(400).json(response('error', 'Order not found.'))
        req.order = order;
        next();
    } catch (error) {
        res.status(500).json(response('error', 'Something went wrong while fetching order. Try again later.'))
    }
}

const list = async (req, res) => {
    try {
        const orders = await Order.find()
                            .populate('status')
                            .populate({
                                path: 'items',
                                populate: {
                                    path: 'product',
                                    model: 'Product'
                                }
                            });
        return res.status(200).json(response('success', 'Orders fetched successfully.', orders))
    } catch (error) {
        res.status(500).json(response('error','Something went wrong while fetching orders. Try again later.'))
    }
}

const ordersByProduct = async (req, res) => {
    const { product } = req;
    try {
        const orders = await Order.find({ items: { $elemMatch: { product: product } } })
                            .populate('status')
                            .populate({
                                path: 'items',
                                populate: {
                                    path: 'product',
                                    model: 'Product'
                                }
                            });
        return res.status(200).json(response('success', 'Orders fetched successfully.', orders))
    } catch (error) {
        res.status(500).json(response('error','Something went wrong while fetching orders. Try again later.'))
    }
}
const ordersByClient = async (req, res) => {
    const { client } = req;
    try {
        const orders = await Order.find({ client: client })
                            .populate('status')
                            .populate({
                                path: 'items',
                                populate: {
                                    path: 'product',
                                    model: 'Product'
                                }
                            });
        return res.status(200).json(response('success', 'Orders fetched successfully.', orders))
    } catch (error) {
        res.status(500).json(response('error','Something went wrong while fetching orders. Try again later.'))
    }
}

const remove = async (req, res) => {
    try {
        const order = req.order;
        await Order.deleteOne({ _id: order._id })
        return res.status(200).json(response('success', 'Order deleted successfully.'))
    } catch (error) {
        res.status(500).json(response('error','Something went wrong while deleting order. Try again later.'))
    }
}

export { 
    orderById,
    list,
    ordersByProduct,
    remove,
    ordersByClient,
}