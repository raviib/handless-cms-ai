import { Schema, model, models } from "mongoose";

const eventSchema = new Schema(
  {
        title: {
            type: String,
            required: true,
        },
        name: {
            type: String,
        },
        date: {
            type: String,
            required: true,
        },
        thumbnail_image: {
            type: String,
        },
        location: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
        link: {
            type: String,
        },
        image: {
            type: [String],
        },
        sort: {
            type: Number,
            default: -1
        },
        isActive: {
            type: Boolean,
            default: true
        }
  },
  {
    timestamps: true,
  }
);

const modelName = "event";
if (process.env.NODE_ENV !== 'production' && models[modelName]) {
  delete models[modelName];
}

export default models[modelName] || model("event", eventSchema);