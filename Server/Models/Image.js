import { Schema, model, models, ObjectId } from 'mongoose'

const schema = new Schema({
    name: String,
    src: String,
    parent: ObjectId
},
{
    timestamps: true
})
export default models.Image || model("Image", schema)