import multer, { diskStorage } from "multer";
import path from 'path'
import Product from "../../Models/Product.js"
import { response } from "../../utils.js"
import Image from "../../Models/Image.js";

const productById = async (req, res, next, id)=>{
    try {
        const product = await Product.findOne({ _id: id })
        if(!product) return res.status(404).json(response('error', 'Product not found.'))
        req.product = product
        next()
    } catch (error) {
        res.status(500).json(response('error','Something went wrong while fetching product. Try again later ' + error.message))
    }
}
const list = async (req, res) => {
    try {
        const products = await Product.find({quantity: { $ne: 0 }})
            .populate('category', 'name description')
            .populate('gallery')
        return res.status(200).json(response('success', 'products fetched successfully.', products))
    } catch (error) {
        res.status(500).json(response('error','Something went wrong while fetching products. Try again later ' + error.message))
    }
}

const productsByCategory = async (req, res)=>{
    const { category} = req;
    try {
        const products = await Product.find({category: category._id, quantity: { $ne: 0 }}).populate('gallery')
        return res.status(200).json(response('success', 'products fetched successfully.', products))
    } catch (error) {
        return res.status(500).json(response('error','Something went wrong while fetching products. Try again later ' + error.message))
    }
}

const storage = diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(path.resolve(),'Public/Images'));
    },
    filename: function (req, file, cb) {
        const ext = file.originalname.split('.')[1];
        const fileName = Date.now() + '.' + ext;
        if (fileName) req.images = [...req.images, fileName]
        cb(null, fileName);
    }
})
const upload = multer({ storage: storage })

const verifyInputs = (req, res, next)=>{
    const { name, description, price, quantity, category } = req.body
    const { images } = req;
    if(!name) return res.status(400).json(response('name', 'This field is required'))
    if(!description) return res.status(400).json(response('description', 'This field is required'))
    if(!price) return res.status(400).json(response('price', 'This field is required'))
    if(!quantity) return res.status(400).json(response('quantity', 'This field is required'))
    if(!category) return res.status(400).json(response('category', 'This field is required'))
    
    if(name.length < 3) return res.status(400).json(response('name', 'Name must be atleast 3 characters long'))
    if(description.length < 3) return res.status(400).json(response('description', 'Description must be atleast 3 characters long'))
    if(price <= 0) return res.status(400).json(response('price', 'Please enter a valid price.'));
    if(quantity <= 0) return res.status(400).json(response('quantity', 'Please enter a valid quantity.'))
    next();
}
const create = async (req, res)=>{
    try {
        const { name, description, price, quantity, category } = req.body
        const { images } = req;
        const imagesArr = images.map(image => {
            return {
                name: image,
                src: `/assets/Images/${image}`,
                client: req.currentUser._id,
            }
        })
        let IMAGES = await Image.insertMany(imagesArr);
        IMAGES = IMAGES.map(image => image._id);
        const product = await Product.create({
            name,
            description,
            price,
            quantity,
            category,
            gallery: IMAGES,
        });
        res.status(200).json(response('success', 'Product is created!', product))
    } catch (error) {
        res.status(500).json(response('error', 'Something Went wrong while creating product. Try agin later ' + error.message))
    }
}

const verifyUpdateInputs = (req, res, next) => {
    const { name, description, price, quantity, category } = req.body;
    if(!name) return res.status(400).json(response('name', 'This field is required'))
    if(!description) return res.status(400).json(response('description', 'This field is required'))
    if(!price) return res.status(400).json(response('price', 'This field is required'))
    if(!quantity) return res.status(400).json(response('quantity', 'This field is required'))
    if(!category) return res.status(400).json(response('category', 'This field is required'))
    
    if(name.length < 3) return res.status(400).json(response('name', 'Name must be atleast 3 characters long'))
    if(description.length < 3) return res.status(400).json(response('description', 'Description must be atleast 3 characters long'))
    if(price <= 0) return res.status(400).json(response('price', 'Please enter a valid price.'));
    if(quantity <= 0) return res.status(400).json(response('quantity', 'Please enter a valid quantity.'))
    next();
}
const update = async (req, res) => {
    try {
        const { name, description, price, quantity, category, remove } = req.body;
        const { product, images } = req;
        let IMAGES = [];
        if(images.length != 0){
            const imagesArr = images.map(image => {
                return {
                    name: image,
                    src: `/assets/Images/${image}`,
                    client: req.currentUser._id,
                }
            })
            IMAGES = await Image.insertMany(imagesArr);
            IMAGES = IMAGES.map(image => image._id);
        }
        const updated_product = await Product.findOne({ _id: product._id });
        if (typeof remove != undefined) {
            if(typeof remove == 'string'){
                updated_product.gallery = updated_product.gallery.filter(image => image != remove);
            }
            else if(typeof remove == 'object'){
                remove.forEach((imageId) => {
                    updated_product.gallery = updated_product.gallery.filter(image => image != imageId);
                });
            }
            else{
                return res.status(400).json(response('error', 'The input type of remove must be valid string or array'))
            }
        }
        updated_product.name = name;
        updated_product.description = description;
        updated_product.price = price;
        updated_product.quantity = quantity;
        updated_product.category = category;
        updated_product.gallery = [...updated_product.gallery, ...IMAGES]
        await updated_product.save()
        res.status(200).json(response('success', 'Product is updated!', updated_product))
    } catch (error) {
        res.status(500).json(response('error', 'Something Went wrong while updating product. Try agin later ' + error.message))
    }
}

const remove = async (req, res)=>{
    try {
        const { product } = req;
        await product.deleteOne({ _id: product._id });
        res.status(200).json(response('success', 'product is deleted!'))
    } catch (error) {
        res.status(500).json(response('error', 'Something Went wrong while deleting category. Try agin later ' + error.message))
    }
}
export {
    productById,
    productsByCategory,
    list,
    upload, 
    verifyInputs,
    create,
    verifyUpdateInputs,
    update,
    remove,
}