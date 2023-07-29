import { response } from "../../utils.js";
import multer, { diskStorage } from 'multer';
import path from 'path';
import Image from "../../Models/Image.js";
import Category from "../../Models/Category.js";


const list = async (req, res) => {
    try {
        const categories = await Category.find({});
        res.status(200).json(response('success', 'All categories are fetched!', categories))
    } catch (error) {
        res.status(500).json(response('error', 'Something Went wrong while fetching categories. Try agin later'))
    }
}
const imagesHolder = async (req, res, next) => {
    req.images = [];
    next();
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
    const { name, title, description } = req.body
    if(!name || !title || !description){
        res.status(400).json(response('error', 'All fields are required'))
    }
    if(name.length < 3){
        res.status(400).json(response('error', 'Name must be atleast 3 characters long'))
    }
    if(title.length < 3){
        res.status(400).json(response('error', 'Title must be atleast 3 characters long'))
    }
    if(description.length < 3){
        res.status(400).json(response('error', 'Description must be atleast 3 characters long'))
    }
    next();
}
const create = async (req, res)=>{
    try {
        const { name, title, description } = req.body;
        const { images } = req;
        const imagesArr = images.map(image => {
            return {
                name: image,
                src: `/assets/Profile-images/${image}`,
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
        res.status(500).json(response('error', 'Something Went wrong while fetching categories. Try agin later ' + error.message))
    }
}

export {
    list,
    upload,
    verifyInputs,
    imagesHolder,
    create,
}