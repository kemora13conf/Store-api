import Client from "../../Models/Client.js";
import { response } from "../../utils.js";
import jwt from 'jsonwebtoken';
import CurrentUser from "./CurrentUser.js";
import Permissions from "../../Models/Permissions.js";


const signinRequired = async (req, res, next) => {
    const { authorization } = req.headers;
    const token = authorization && authorization.split(' ')[1];
    if (!token) return res.status(401).json(response('no_login', 'You must be logged in to access this route'))
    try {
        const { _id } = jwt.verify(token, process.env.JWT_SECRET);
        let currentUser = await Client.findById(_id).populate('permissions', 'type').populate('image');
        if (!currentUser || currentUser.role == 0) return res.status(401).json(response('no_login', 'You must be logged in to access this route'))
        currentUser = new CurrentUser(currentUser);
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
    const client = await Client.findOne({ email: email}).populate('permissions', 'type');
    if (!client) return res.status(401).json(response('email', 'This email is not registered'))
    const match = client.authenticate(password);
    if (!match) return res.status(401).json(response('password', 'Incorrect password'))
    if (client.role == 0) return res.status(401).json(response('no_login', 'You must be logged in to access this route'))
    const token = jwt.sign({ _id: client._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const currentUser = new CurrentUser(client);

    res.status(200).json(response('success', 'You are logged in', { token, currentUser }))
};
const verifyToken = async (req, res) => {
    console.log(req.currentUser.can_edit_client())
    res.status(200).json(response('success', 'You are logged in', { current_user: req.currentUser }))
}

export {
    signinRequired,
    verifyInputs,
    signin,
    verifyToken
}