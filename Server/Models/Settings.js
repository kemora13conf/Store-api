import mongoose from "mongoose";
const { Schema, model, models, ObjectId } = mongoose;

const schema = new Schema({
  language: {
    type: String,
    default: "English",
  },

  theme: {
    type: String,
    default: "light",
  },
  currency: {
    type: String,
    default: "USD",
  },
});

export default models.Settings || model("Settings", schema);
