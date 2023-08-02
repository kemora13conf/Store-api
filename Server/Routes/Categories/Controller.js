import { response } from "../../utils.js";
import multer, { diskStorage } from 'multer';
import path from 'path';
import Image from "../../Models/Image.js";
import Category from "../../Models/Category.js";
import Product from "../../Models/Product.js";

const categoryById = async (req, res, next, id) => {
    try {
        const category = await Category.findOne({ _id: id });
        if (!category) return res.status(404).json(response('error', 'Category not found!'))
        req.category = category;
        next();
    } catch (error) {
        res.status(500).json(response('error', 'Something Went wrong while fetching category. Try agin later'))
    }
}

const list = async (req, res) => {
    try {
        const categories = await Category.find({})
            .populate('gallery')
            .populate('client', 'fullname email phone image');
        res.status(200).json(response('success', 'All categories are fetched!', categories))
    } catch (error) {
        res.status(500).json(response('error', 'Something Went wrong while fetching categories. Try agin later'))
    }
}

const storage = diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(path.resolve(),'Public/Images'));
    },
    filename: function (req, file, cb) {
        const { images } = req;
        const ext = file.originalname.split('.')[1];
        const fileName = Date.now() + '.' + ext;
        if (fileName) req.images = [...images, fileName]
        cb(null, fileName);
    }
})
const upload = multer({ storage: storage })

const verifyInputs = (req, res, next)=>{
    const { name, title, description } = req.body
    const { images } = req;
    if(!name) return res.status(400).json(response('name', 'This field is required'))
    if(!title) return res.status(400).json(response('title', 'This field is required'))
    if(!description) return res.status(400).json(response('description', 'This field is required'))
    // console.log(images)
    // if(images.length == 0) return res.status(400).json(response('images', 'Atleast one image required'))
    if(name.length < 3) return res.status(400).json(response('name', 'Name must be atleast 3 characters long'))
    if(title.length < 3) return res.status(400).json(response('title', 'Title must be atleast 3 characters long'))
    if(description.length < 3) return res.status(400).json(response('description', 'Description must be atleast 3 characters long'))
    next();
}
const create = async (req, res)=>{
    try {
        const { name, title, description } = req.body;
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
        const category = await Category.create({
            name,
            title,
            description,
            gallery: IMAGES,
            client: req.currentUser._id,
        });
        res.status(200).json(response('success', 'Category is created!', category))
    } catch (error) {
        res.status(500).json(response('error', 'Something Went wrong while creating category. Try agin later ' + error.message))
    }
}
const verifyUpdateInputs = (req, res, next) => {
    const { name, title, description } = req.body
    if(!name) return res.status(400).json(response('name', 'This field is required'))
    if(!title) return res.status(400).json(response('title', 'This field is required'))
    if(!description) return res.status(400).json(response('description', 'This field is required'))
    if(name.length < 3) return res.status(400).json(response('name', 'Name must be atleast 3 characters long'))
    if(title.length < 3) return res.status(400).json(response('title', 'Title must be atleast 3 characters long'))
    if(description.length < 3) return res.status(400).json(response('description', 'Description must be atleast 3 characters long'))
    next();
}
const update = async (req, res) => {
    try {
        let { name, title, description, remove } = req.body;
        const { category, images } = req;
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
        const updated_category = await Category.findOne({ _id: category._id });
        if (typeof remove != undefined) {
            if(typeof remove == 'string'){
                updated_category.gallery = updated_category.gallery.filter(image => image != remove);
            }
            else if(typeof remove == 'object'){
                remove.forEach((imageId) => {
                    updated_category.gallery = updated_category.gallery.filter(image => image != imageId);
                });
            }
            else{
                return res.status(400).json(response('error', 'The input type of remove must be valid string or array'))
            }
        }
        updated_category.name = name;
        updated_category.title = title;
        updated_category.description = description;
        updated_category.gallery = [...updated_category.gallery, ...IMAGES]
        await updated_category.save()
        res.status(200).json(response('success', 'Category is updated!', updated_category))
    } catch (error) {
        res.status(500).json(response('error', 'Something Went wrong while updating category. Try agin later ' + error.message))
    }
}

// const removeImage = async (req, res)=>{
//     try {
//         const { imageId } = req.body;
//         await Image.deleteOne({ _id: imageId });
//         res.status(200).json(response('success', 'Image is deleted!'))
//     } catch (error) {
//         res.status(500).json(response('error', 'Something Went wrong while deleting image. Try agin later ' + error.message))
//     }
// }

const remove = async (req, res)=>{
    try {
        const { category } = req;
        const products = await Product.find({ category: category._id });
        if (products.length != 0) return res.status(400).json(response('error', 'This category is used in some products. Delete those products first.'));
        await Category.deleteOne({ _id: category._id });
        res.status(200).json(response('success', 'Category is deleted!'))
    } catch (error) {
        res.status(500).json(response('error', 'Something Went wrong while deleting category. Try agin later ' + error.message))
    }
}

export {
    categoryById,
    list,
    upload,
    verifyInputs,
    create,
    verifyUpdateInputs,
    update,
    remove,
}