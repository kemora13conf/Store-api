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
    ]
},
{
    timestamps: true
})

export default models.Category || model("Category", schema)