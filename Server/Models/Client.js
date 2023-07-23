import { Schema, model, models, ObjectId } from 'mongoose'

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
    password: {
        type: String,
        required: true,
    },
    phone: String,
    image: {
        type: String,
        default: 'user-default.png'
    },
    password: String,
    salt: String
},
{
    timestamps: true
})

// Pre-save middleware to encrypt the password
usersSchema.pre('save', function(next) {
    if (this.isModified('password')) {
      const encryptedPassword = CryptoJS.AES.encrypt(this.password, process.env.JWT_SECRET).toString();
      this.password = encryptedPassword;
    }
    next();
  });
usersSchema.methods = { 
    // Method to decrypt the password
    authenticate: function(password) {
        const encryptedPassword = CryptoJS.AES.encrypt(password, process.env.JWT_SECRET).toString();
        return this.password == encryptedPassword;
    },
};

export default models.Client || model("Client", schema)