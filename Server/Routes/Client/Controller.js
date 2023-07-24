import { response } from "../../utils.js"
import Client from '../../Models/Client.js'

const all = async (req, res)=>{
    try {
        const clients = await Client.find({});
        res.status(200).json(response('success', 'All client are fetched!', clients))
    } catch (err) {
        res.status(500).json(
            response(
                'error',
                'Something Went wrong while fetching user. Try agin later'
            )
        )
    }
}

const create = async (req, res)=>{
    try {
        const client = await new Client(req.body);
        await client.save();
        res.status(200).json(response('success', 'New Account created', client))
    } catch (err) {
        res.status(500).json(
            response(
                'error',
                'Something Went wrong while creating account. Try agin later. ' + err.message
            )
        )
    }
}



export { all, create }