import mongoose from 'mongoose'
const { Schema, model, models, ObjectId } = mongoose
import CryptoJS from 'crypto-js';

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
    salt: String
},
{
    timestamps: true
})

// Pre-save middleware to encrypt the password
schema.pre('save', function(next) {
    if (this.isModified('password')) {
      const encryptedPassword = CryptoJS.AES.encrypt(this.password, process.env.JWT_SECRET).toString();
      this.password = encryptedPassword;
    }
    next();
  });
schema.methods = { 
    // Method to decrypt the password
    authenticate: function(password) {
        const encryptedPassword = CryptoJS.AES.encrypt(password, process.env.JWT_SECRET).toString();
        return this.password == encryptedPassword;
    },
};

export default models.Client || model("Client", schema)