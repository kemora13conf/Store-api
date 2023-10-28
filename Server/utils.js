import Client from "./Models/Client.js";
import Permissions from "./Models/Permissions.js";
import Status from "./Models/Status.js";

const response = (type, message, other=null)=>{
    let obj = {
        type: type,
        message: message,
        data: other
    }
    return obj;
}

const imagesHolder = async (req, res, next) => {
    req.images = [];
    next();
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
class httpException extends Error{
    constructor(message){
        super(message);
    }
}

async function initPermissions (req, res, next) {
    const permissions = await Permissions.find();
    const permissions_object = [
        {
            type: "create_category",
            code: Buffer.from("create_category", 'hex'),
        },
        {
            type: "edit_category",
            code: Buffer.from("edit_category", 'hex'),
        },
        {
            type: "delete_category",
            code: Buffer.from("delete_category", 'hex'),
        },
        {
            type: "create_product",
            code: Buffer.from("create_product", 'hex'),
        },
        {
            type: "edit_product",
            code: Buffer.from("edit_product", 'hex'),
        },
        {
            type: "delete_product",
            code: Buffer.from("delete_product", 'hex'),
        },
        {
            type: "create_order",
            code: Buffer.from("create_order", 'hex'),
        },
        {
            type: "edit_order",
            code: Buffer.from("edit_order", 'hex'),
        },
        {
            type: "delete_order",
            code: Buffer.from("delete_order", 'hex'),
        },
        {
            type: "create_client",
            code: Buffer.from("create_client", 'hex'),
        },
        {
            type: "edit_client",
            code: Buffer.from("edit_client", 'hex'),
        },
        {
            type: "delete_client",
            code: Buffer.from("delete_client", 'hex'),
        },
        {
            type: "edit_settings",
            code: Buffer.from("edit_settings", 'hex'),
        }
        
    ];
    if (permissions.length != permissions_object.length) {
        try {
            // delete all permissions
            await Permissions.deleteMany({});
            // Create default permission records if none exist
            let pers = await Permissions.create(permissions_object);
            next();
        } catch (error) {
            console.log(error);
        }
    }
    next();
};
async function initStatus (req, res, next) {
    const status = await Status.find();
    const status_object = [
        {
            name: "Delivered",
        },
        {
            name: "Not Processed",
        },
        {
            name: "Under Process",
        },
        {
            name: "Cancelled",
        }
    ];
    if (status.length != status_object.length) {
        try {
            // delete all permissions
            await Status.deleteMany({});
            // Create default permission records if none exist
            let pers = await Status.create(status_object);
        } catch (error) {
            console.log(error);
        }
    }
    next();
}
async function initAdmin(req, res, next){
    const admin = await Client.findOne({ role: 1 });
    if(!admin){
        try {
            const adminPermissions = await Permissions.find({});
            const admin = await new Client({
                "fullname": "Abdelghani el mouak",
                "email": "abdelghani@gmail.com",
                "phone": "0653179026",
                "password": "secret",
                "role": 1,
                "permissions": adminPermissions
            });
            await admin.save();
            next();
        }
        catch(error){
            console.log(error);
        }
    }
    next();
}


export { 
    response,
    imagesHolder,
    isInArray,
    httpException,
    initPermissions,
    initStatus,
    initAdmin
};
