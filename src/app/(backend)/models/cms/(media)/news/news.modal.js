import { Schema, model, models } from "mongoose";

const newsSchema = new Schema(
  {
        name: {
            type: String,
            required: true,
        },
        thumbnail_image: {
            type: String,
            required: true,
        },
        url: {
            type: String,
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

const modelName = "news";
if (process.env.NODE_ENV !== 'production' && models[modelName]) {
  delete models[modelName];
}

export default models[modelName] || model("news", newsSchema);