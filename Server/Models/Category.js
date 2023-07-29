import mongoose from 'mongoose'
const { Schema, model, models, ObjectId } = mongoose

const schema = new Schema({
    name: String,
    title: String,
    description: String,
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