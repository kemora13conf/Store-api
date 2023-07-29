import mongoose from 'mongoose'
const { Schema, model, models, ObjectId } = mongoose

const schema = new Schema({
    name: String,
    src: String,
    client: {
        type: ObjectId,
        ref: "Client"
    }
},
{
    timestamps: true
})
export default models.Image || model("Image", schema)