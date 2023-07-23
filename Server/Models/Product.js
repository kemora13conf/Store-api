import { Schema, model, models, ObjectId } from 'mongoose'

const schema = new Schema({
    name: String,
    description: String,
    price: Number,
    quantity: Number,
    category: {
        type: ObjectId,
        ref: "Category"
    },
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
export default models.Product || model("Product", schema)