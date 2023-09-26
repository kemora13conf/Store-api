import { response } from "../../utils.js";
import multer, { diskStorage } from 'multer';
import path from 'path';
import Image from "../../Models/Image.js";
import Category from "../../Models/Category.js";
import Product from "../../Models/Product.js";

const categoryById = async (req, res, next, id) => {
    try {
        const category = await Category.findOne({ _id: id })
            .populate('gallery')
            .populate('client', 'fullname email phone image');
        if (!category) return res.status(404).json(response('error', 'Category not found!'))
        req.category = category;
        next();
    } catch (error) {
        res.status(500).json(response('error', 'Something Went wrong while fetching category. Try agin later'))
    }
}

const list = async (req, res) => {
    const { search, page, limit } = req.query;
    try {
        let categories = [];
        if (search) {
            categories = await Category.find({ name: { $regex: search, $options: 'i' } })
                .populate('gallery')
                .populate('client', 'fullname email phone image');
        }else{
            categories = await Category.find({})
                .populate('gallery')
                .populate('client', 'fullname email phone image');
        }
        const total = categories.length;
        const pages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;
        limit ? categories = categories.slice(offset, offset + limit) : '';
        res.status(200).json(response('success', 'All categories are fetched!', { categories, total, pages }))
    } catch (error) {
        res.status(500).json(response('error', 'Something Went wrong while fetching categories. Try agin later'))
    }
}

// check if a value is in an array
function isInArray(value, array){
    let flag = 0;
    array.forEach((item, index) => {
        if(item == value){
            flag++;
        }
    })
    if(flag != 0 ){
        return true;
    }
    return false
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

        const fileName = 'Categories-' + Date.now() + '.' + ext;
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
    if(images.length == 0) return res.status(400).json(response('file', 'Image is required required'))
    if(name.length < 3) return res.status(400).json(response('name', 'Name must be atleast 3 characters long'))
    if(title.length < 3) return res.status(400).json(response('title', 'Title must be atleast 3 characters long'))
    if(description.length < 3) return res.status(400).json(response('description', 'Description must be atleast 3 characters long'))
    next();
}
const create = async (req, res)=>{
    try {
        const { name, title, description } = req.body;
        const { fileError, images } = req;
        
        // checking that there is nothing wrong with uploading files
        if(fileError != undefined){
            return res.status(400).json(fileError)
        }

        // setling the uploaded images array
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
        const { category, fileError, images } = req;
        
        // checking that there is nothing wrong with uploading files
        if(fileError != undefined){
            return res.status(400).json(fileError)
        }

        // setling the uploaded images array
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
                const arr = remove.split(',');
                arr.forEach((imageId) => {
                    updated_category.gallery = updated_category.gallery.filter(image => image != imageId);
                });
            }
            else{
                return res.status(400).json(response('error', 'The input type of remove must be valid string or array'))
            }
        }

        // updating the category with the new data
        updated_category.name = name;
        updated_category.title = title;
        updated_category.description = description;
        updated_category.gallery = [...updated_category.gallery, ...IMAGES]
        
        await updated_category.populate('gallery');
        await updated_category.save()
        res.status(200).json(response('success', 'Category is updated!', updated_category))
    } catch (error) {
        // this is beeing returned when something wrong happens
        res.status(500).json(response('error', 'Something Went wrong while updating category. Try agin later ' + error.message))
    }
}

// delete category
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

// delete multiple categories
const deleteMultiple = async (req, res)=>{
    try {
        const { ids } = req.body;
        const products = await Product.find({ category: { $in: ids } });
        if (products.length != 0) return res.status(400).json(response('error', 'Some categories are used in some products. Delete those products first.'));
        await Category.deleteMany({ _id: { $in: ids } });
        res.status(200).json(response('success', 'Categories are deleted!'))
    } catch (error) {
        res.status(500).json(response('error', 'Something Went wrong while deleting categories. Try agin later ' + error.message))
    }
}

// change state
const changeState = async (req, res)=>{
    try {
        const { state } = req.body;
        const { category } = req;
        category.enabled = state;
        await category.save();
        res.status(200).json(response('success', 'Category is enabled!', category))
    } catch (error) {
        res.status(500).json(response('error', 'Something Went wrong while enabling category. Try agin later ' + error.message))
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
    deleteMultiple,
    changeState
}