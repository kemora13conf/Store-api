import { Schema, model, models, ObjectId } from 'mongoose'

const schema = new Schema({
    amount: Number,
    quantity: Number,
    product: {
        type: ObjectId,
        ref: "Product"
    },

},
{
    timestamps: true
})
export default models.Item || model("Item", schema)