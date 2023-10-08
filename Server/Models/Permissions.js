import mongoose from 'mongoose'
const { Schema, model, models, ObjectId } = mongoose

const schema = new Schema({
    type: {
        type: String,
        required: true,
        trim: true,
        minLength: 3,
        maxLength: 20,
    },
    code: Buffer,
})

export default models.Permissions || model("Permissions", schema);