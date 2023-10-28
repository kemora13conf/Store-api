import mongoose from 'mongoose'
const { Schema, model, models, ObjectId } = mongoose

const schema = new Schema({
    transaction_id: String,
    paid: {
        type: Boolean,
        default: false
    },
    amount: Number,
    status: {
        type: ObjectId,
        ref: "Status",
        default: {
            name: "Not Processed"
        }
    },
    client: {
        type: ObjectId,
        ref: "Client"
    },
    items: [{
        type: ObjectId,
        ref: "Item"
    }]
},
{
    timestamps: true
})
export default models.Order || model("Order", schema)