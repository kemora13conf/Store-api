import { response } from "../../utils";


const list = async (req, res) => {
    try {
        const categories = await Category.find({});
        res.status(200).json(response('success', 'All categories are fetched!', categories))
    } catch (error) {
        res.status(500).json(response('error', 'Something Went wrong while fetching categories. Try agin later'))
    }
}

const create = (req, res)=>{
    try {
            
    } catch (error) {
        res.status(500).json(response('error', 'Something Went wrong while fetching categories. Try agin later'))
    }
}

export {
    list
}