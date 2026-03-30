import { Schema, model, models } from "mongoose";

const corporate_responsibilitySchema = new Schema(
  {
        name: {
            type: String,
            required: true,
        },
        thumbnail_image: {
            type: String,
            required: true,
        },
        images: {
            type: [String],
        },
        year: {
            type: String,
        },
        date: {
            type: String,
        },
        content: {
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

const modelName = "corporate-responsibility";
if (process.env.NODE_ENV !== 'production' && models[modelName]) {
  delete models[modelName];
}

export default models[modelName] || model("corporate-responsibility", corporate_responsibilitySchema);