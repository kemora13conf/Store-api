import multer, { diskStorage } from "multer";
import path from 'path'
import Product from "../../Models/Product.js"
import Category from "../../Models/Category.js";
import { isInArray, response } from "../../utils.js"
import Image from "../../Models/Image.js";

const productById = async (req, res, next, id)=>{
    try {
        const product = await Product.findOne({ _id: id })
        .populate('gallery')
        .populate('client', '_id fullname email phone image')
        .populate('category', 'name')

        if(!product) return res.status(404).json(response('error', 'Product not found.'))
        req.product = product
        next()
    } catch (error) {
        res.status(500).json(response('error','Something went wrong while fetching product. Try again later ' + error.message))
    }
}
const list = async (req, res) => {
    let { search, searchby, orderby, page, limit } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    searchby = searchby ? searchby.toLocaleLowerCase() : 'all';
    orderby = orderby ? orderby.toLocaleLowerCase() : 'name';
    try {
        let products = [];
        if (search) {
            if(searchby == 'all'){
                products = await Product.find({ 
                    $or: [
                        { name: { $regex: search, $options: 'i' } },
                        { 'category.name': { $regex: search, $options: 'i' } },
                        { description: { $regex: search, $options: 'i' } },
                    ]
                })
                    .populate('gallery')
                    .populate('client', '_id fullname email phone image')
                    .populate('category', 'name')
                    .collation({ locale: 'en', strength: 2 }) // make the search case insensitive
                    .sort({ [orderby]: 'asc' }); // sort the result ascendinly
            }else{
                if(searchby == 'price' || searchby == 'quantity'){
                    products = await Product.find({ [searchby]: search })
                        .populate('gallery')
                        .populate('client', '_id fullname email phone image')
                        .populate('category', 'name')
                        .collation({ locale: 'en', strength: 2 }) // make the search case insensitive
                        .sort({ [orderby]: 'asc' }); // sort the result ascendinly
                }else{
                    products = await Product.find({ [searchby]: { $regex: search, $options: 'i' } })
                    .populate('gallery')
                    .populate('client', '_id fullname email phone image')
                    .populate('category', 'name')
                    .collation({ locale: 'en', strength: 2 }) // make the search case insensitive
                    .sort({ [orderby]: 'asc' }); // sort the result ascendinly
                }

            }
        }else{
            products = await Product.find()
                .populate('gallery')
                .populate('client', '_id fullname email phone image')
                .populate('category', 'name')
                .collation({ locale: 'en', strength: 2 }) // make the search case insensitive
                .sort({ [orderby]: 'asc' }); // sort the result ascendinly
        }
        const total = products.length;
        const pages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;
        limit ? products = products.slice(offset, offset + limit) : '';
        res.status(200).json(response('success', 'All products are fetched!', { products, total, pages }))
    } catch (error) {
        res.status(500).json(response('error', 'Something Went wrong while fetching products. Try agin later ' + error.message))
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
        const { images } = req;
        const ALLOWEDEXT = ['png','jpg', 'jpeg', 'webp']

        // separating the name from the extension.
        const nameArr = file.originalname.split('.'); // array: [name, ext]
        const ext = nameArr[nameArr.length - 1]; // extension
        
        // checking the allowed filetypes
        if(!isInArray(ext.toLocaleLowerCase(), ALLOWEDEXT)){
            req.fileError = response('file', 'An authorized file format')
        }

        const fileName = 'Products-' + Date.now() + '.' + ext;
        if (fileName) req.images = [...images, fileName]
        cb(null, fileName);
    }
})
const upload = multer({ storage: storage })

const verifyInputs = async (req, res, next)=>{
    const { name, description, price, quantity, category } = req.body
    const { images } = req;
    if(!name) return res.status(400).json(response('name', 'This field is required'))
    if(!description) return res.status(400).json(response('description', 'This field is required'))
    if(!price) return res.status(400).json(response('price', 'This field is required'))
    if(!quantity) return res.status(400).json(response('quantity', 'This field is required'))
    if(!category) return res.status(400).json(response('category', 'This field is required'))

    // check the category by name
    const catName = await Category.findOne({ name: category });
    if(!catName){
        return res.status(400).json(response('category', 'Please enter a valid category name.'));
    }else{
        req.body.category = catName._id;
    }

    if(name.length < 3) return res.status(400).json(response('name', 'Name must be atleast 3 characters long'))
    if(description.length < 3) return res.status(400).json(response('description', 'Description must be atleast 3 characters long'))
    if(price <= 0) return res.status(400).json(response('price', 'Please enter a valid price.'));
    if(quantity <= 0) return res.status(400).json(response('quantity', 'Please enter a valid quantity.'))
    next();
}
const create = async (req, res)=>{
    try {
        const { name, description, price, quantity, category } = req.body
        const { fileError, images } = req;

        // checking that there is nothing wrong with uploading files
        if(fileError != undefined){
            return res.status(400).json(fileError)
        }
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
        console.log(product);
        console.log(category)
        res.status(200).json(response('success', 'Product is created!', product))
    } catch (error) {
        res.status(500).json(response('error', 'Something Went wrong while creating product. Try agin later ' + error.message))
    }
}

const verifyUpdateInputs = async (req, res, next) => {
    const { name, description, price, quantity, category } = req.body;
    if(!name) return res.status(400).json(response('name', 'This field is required'))
    if(!description) return res.status(400).json(response('description', 'This field is required'))
    if(!price) return res.status(400).json(response('price', 'This field is required'))
    if(!quantity) return res.status(400).json(response('quantity', 'This field is required'))
    if(!category) return res.status(400).json(response('category', 'This field is required'))
    
    // check the category by name
    const catName = await Category.findOne({ name: category });
    if(!catName){
        return res.status(400).json(response('category', 'Please enter a valid category name.'));
    }else{
        req.body.category = catName._id;
    }

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
        await updated_product.populate('gallery');
        await updated_product.populate('client', '_id fullname email phone image');
        await updated_product.populate('category', 'name');
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

const deleteMultiple = async (req, res)=>{
    try {
        const { ids } = req.body;
        console.log(ids)
        const products = await Product.deleteMany({ _id: { $in: ids } });
        res.status(200).json(response('success', 'products are deleted!'))
    } catch (error) {
        res.status(500).json(response('error', 'Something Went wrong while deleting products. Try agin later ' + error.message))
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
    deleteMultiple,
}