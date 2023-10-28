import mongoose from 'mongoose'
const { Schema, model, models, ObjectId } = mongoose

const schema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    title: String,
    description: String,
    enabled: {
        type: Boolean,
        default: true   
    },
    gallery: [
        {
            type: ObjectId,
            ref: "Image"
        }
    ],
    client: {
        type: ObjectId,
        ref: "Client"
    }
},
{
    timestamps: true
})

export default models.Category || model("Category", schema)
