import mongoose from 'mongoose'
const { Schema, model, models, ObjectId } = mongoose

const schema = new Schema({
    name: {
        type: String,
        enum: ["Cancelled", "Delivered", "Not Processed", "Under Process"]
    }
},
{
    timestamps: true
})
export default models.Status || model("Status", schema)