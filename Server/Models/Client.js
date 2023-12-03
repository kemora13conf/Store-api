import mongoose from 'mongoose'
const { Schema, model, models, ObjectId } = mongoose
import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';

const schema = new Schema({
    fullname: {
        type: String,
        required: true,
        trim: true,
        minLength: 3,
        maxLength: 20,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minLength: 3,
        maxLength: 50,
    },
    phone: String,
    image: {
        type: String,
        default: 'user-default.png'
    },
    password: {
        type: String,
        required: true,
    },
    salt: {
        type: String,
        default: uuidv4()
    },
    role:{
        type: Number,
        default: 0,
    },
    status:{
        type: Number,
        default: 0,
    },
    permissions: [
        {
            type: ObjectId,
            ref: "Permissions"
        }
    ],
    settings: {
        type: ObjectId,
        ref: "Settings"
    },
},
{
    timestamps: true
})

// Pre-save middleware to encrypt the password
schema.pre('save', function(next) {
    if (this.isModified('password')) {
        const encryptedInputPassword = CryptoJS.SHA256(this.password + this.salt).toString();   
        this.password = encryptedInputPassword;
    }
    next();
  });

schema.methods = {
    // Method to compare and authenticate the password
    authenticate: function(text) {
        const encryptedInputPassword = CryptoJS.SHA256(text + this.salt).toString(); 
        console.log(encryptedInputPassword, ' ', this.password)
        return this.password === encryptedInputPassword;
    },
};

export default models.Client || model("Client", schema)