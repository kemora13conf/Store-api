const response = (type, message, other=null)=>{
    let obj = {
        type: type,
        message: message,
        data: other
    }
    return obj;
}

export { response };