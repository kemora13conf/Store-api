import mongoose from 'mongoose'
const { Schema, model, models, ObjectId } = mongoose

const schema = new Schema({
    name: String,
    description: String,
    price: Number,
    quantity: Number,
    sold: {
        type: Number,
        default: 0
    },
    client: {
        type: ObjectId,
        ref: "User"
    },
    enabled: {
        type: Boolean,
        default: true
    },
    category: {
        type: ObjectId,
        ref: "Category",
        required: true
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