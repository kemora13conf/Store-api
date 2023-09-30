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


export { 
    response,
    imagesHolder,
    isInArray
};
