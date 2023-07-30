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

export { 
    response,
    imagesHolder
};