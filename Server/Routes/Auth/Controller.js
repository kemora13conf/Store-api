import Client from "../../Models/Client.js";
import { response } from "../../utils.js";
import jwt from 'jsonwebtoken';


const signinRequired = async (req, res, next) => {
    const { authorization } = req.headers;
    const token = authorization && authorization.split(' ')[1];
    if (!token) return res.status(401).json(response('no_login', 'You must be logged in to access this route'))
    try {
        const { _id } = jwt.verify(token, process.env.JWT_SECRET);
        const currentUser = await Client.findById(_id);
        if (!currentUser || currentUser.role == 0) return res.status(401).json(response('no_login', 'You must be logged in to access this route'))
        currentUser.password = null;
        currentUser.salt = null;
        req.currentUser = currentUser;
        next();
    } catch (error) {
        return res.status(401).json(response('no_login', 'You must be logged in to access this route'))
    }
};

const verifyInputs = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email) return res.status(400).json(response('email', 'This field is required'))
    if (!password) return res.status(400).json(response('password', 'This field is required'))
    next();

};

const signin = async (req, res) => {
    const { email, password } = req.body;
    // check if the email = 'abdelghani@gmail.com' is not registred if not register it 
    const clientExist = await Client.findOne({ email: 'abdelghani@gmail.com' });
    if (!clientExist) {
        const admin = await new Client({
            "fullname": "Abdelghani el mouak",
            "email": "abdelghani@gmail.com",
            "phone": "0653179026",
            "password": "secret",
            "role": 1
        });
        await admin.save();
        console.log(admin)
        console.log("Admin created successfully!")
    }

    const client = await Client.findOne({ email: email});
    if (!client) return res.status(401).json(response('email', 'This email is not registered'))
    const match = client.authenticate(password);
    if (!match) return res.status(401).json(response('password', 'Incorrect password'))
    if (client.role == 0) return res.status(401).json(response('no_login', 'You must be logged in to access this route'))
    const token = jwt.sign({ _id: client._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    client.password = null;
    client.salt = null;
    res.status(200).json(response('success', 'You are logged in', { token, client }))
};
const verifyToken = async (req, res) => {
    res.status(200).json(response('success', 'You are logged in', { current_user: req.currentUser }))
}

export {
    signinRequired,
    verifyInputs,
    signin,
    verifyToken
}