import { response } from "../../utils.js"
import Client from '../../Models/Client.js'
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(path.resolve(),'Public/Profile-images'));
    },
    filename: function (req, file, cb) {
        // get the file extension
        const ext = file.originalname.split('.')[1];
        const fileName = Date.now() + '.' + ext;
        if (fileName) req.body.image = fileName;
        cb(null, fileName);
    }
});
const upload = multer({ storage: storage });

const clientById = async (req, res, next, clientId)=>{
    console.log(clientId)
    const { lang } = req;
    try{
        const client = await Client.findById(clientId);
        if (!client) 
            return res
                    .status(400)
                    .json(response("error", lang.client + " " + lang.not_found + "!"));
        client.password = null;
        client.salt = null;
        req.client = client;
        next();
    } catch (error) {
        res
        .status(500)
        .json(
            response(
            "error",
            lang.something_wrong +
                " " +
                lang.fetching +
                " " +
                lang.product +
                ". " +
                lang.try_again_later +
                " " +
                error.message
            )
        );
    }
}

const list = async (req, res)=>{
    const { lang } = req;
    let { search, searchby, orderby, page, limit } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    searchby = searchby ? searchby.toLocaleLowerCase() : "all";
    orderby = orderby ? orderby.toLocaleLowerCase() : "fullname";
    
    try {
        let clients = [];
        if(search){
            if(searchby == 'all'){
                clients = await Client.find({ 
                    $or: [
                        { fullname: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } },
                        { phone: { $regex: search, $options: 'i' } },
                    ]
                })
            }else{
                clients = await Client.find({ [searchby]: { $regex: search, $options: 'i' } })
            }
        }else{
            clients = await Client.find()
        }
        if (orderby == "fullname") {
            clients.sort((a, b) => {
                if (a.fullname < b.fullname) return -1;
                if (a.fullname > b.fullname) return 1;
                return 0;
            });
        } else if (orderby == "email") {
            clients.sort((a, b) => {
                if (a.email < b.email) return -1;
                if (a.email > b.email) return 1;
                return 0;
            });
        } else if (orderby == "phone") {
            clients.sort((a, b) => {
                if (a.phone < b.phone) return -1;
                if (a.phone > b.phone) return 1;
                return 0;
            });
        }
        
        const total = clients.length;
        const pages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;
        limit ? (clients = clients.slice(offset, offset + limit)) : "";
        res.status(200).json(
        response("success", lang.data_fetched_successfully, {
            clients,
            total,
            pages,
        })
        );
    } catch (err) {
        res.status(500).json(
            response(
                'error',
                'Something Went wrong while fetching user. Try agin later. ' + err.message
            )
        )
    }
}

function isEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
}

const verifyInputs = async (req, res, next)=>{
    const { fullname, email, phone, password, re_password } = req.body;
    if (!fullname) return res.status(400).json(response('fullname', 'This field is required'))
    if (!email) return res.status(400).json(response('email', 'This field is required'))
    if (!phone) return res.status(400).json(response('phone', 'This field is required'))
    if (!password) return res.status(400).json(response('password', 'This field is required'))
    if (!re_password) return res.status(400).json(response('re_password', 'This field is required'))
    if(fullname.length < 3 || fullname.length > 20) return res.status(400).json(response('fullname', 'Fullname must be between 3 and 20 characters'))
    if(phone.length < 9 || phone.length > 15) return res.status(400).json(response('phone', 'Please enter a valid phone number'))
    if(password.length < 6 || password.length > 20) return res.status(400).json(response('password', 'Password must be between 6 and 20 characters'))
    if(password !== re_password) return res.status(400).json(response('re_password', 'Password does not match'))
    if (!isEmail(email)) return res.status(400).json(response('email', 'Invalid email address'))
    const client = await Client.findOne({ email });
    if (client) return res.status(400).json(response('email', 'Email already exists'))
    next();
}
const create = async (req, res)=>{
    const { lang, currentUser } = req;
    if(!currentUser.can_edit_client()) return res.status(401).json(response('error', lang.no_permission))
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
const verifyUPdateInputs = async (req, res, next)=>{
    const { fullname, email, phone } = req.body;
    if (!fullname) return res.status(400).json(response('fullname', 'This field is required'))
    if (!email) return res.status(400).json(response('email', 'This field is required'))
    if (!phone) return res.status(400).json(response('phone', 'This field is required'))
    if(fullname.length < 3 || fullname.length > 20) return res.status(400).json(response('fullname', 'Fullname must be between 3 and 20 characters'))
    if (!isEmail(email)) return res.status(400).json(response('email', 'Invalid email address'))
    if(phone.length < 9 || phone.length > 15) return res.status(400).json(response('phone', 'Please enter a valid phone number'))
    if(req.client.email != email){
        const client = await Client.findOne({ email });
        if (client) return res.status(400).json(response('email', 'This email already taken'))
    }
    next();
};
const update = async (req, res)=>{
    if (req.body.image == 'null') delete req.body.image;
    try {
        const client = await Client.findOneAndUpdate({ _id: req.client._id }, req.body, { new: true });
        res.status(200).json(response('success', 'Your Account updated', client))
    } catch (err) {
        res.status(500).json(
            response(
                'error',
                'Something Went wrong while creating account. Try agin later. ' + err.message
            )
        )
    }
}

const client = async (req, res)=>{
    try {
        res.status(200).json(response('success', 'Client fetched!', req.client))
    } catch (err) {
        res.status(500).json(
            response(
                'error',
                'Something Went wrong while fetching user. Try agin later'
            )
        )
    }
}
const updateTheme = async (req, res)=>{
    try {
        const { currentUser } = req;
        const client = await Client.findOneAndUpdate({ _id: currentUser._id }, { theme: req.body.theme }, { new: true });
        res.status(200).json(response('success', 'Client fetched!', client.theme))
    } catch (err) {
        res.status(500).json(
            response(
                'error',
                'Something Went wrong while fetching user. Try agin later'
            )
        )
        console.log(err.message)
    }
}
const updateLanguage = async (req, res)=>{
    try {
        const { currentUser } = req;
        const client = await Client.findOneAndUpdate({ _id: currentUser._id }, { language  : req.body.language }, { new: true });
        res.status(200).json(response('success', 'Client fetched!', client.language))
    } catch (err) {
        res.status(500).json(
            response(
                'error',
                'Something Went wrong while fetching user. Try agin later'
            )
        )
    }
}

export { 
    clientById,
    list, 
    create, 
    verifyInputs, 
    upload, 
    update, 
    verifyUPdateInputs,
    client,
    updateTheme,
    updateLanguage
}