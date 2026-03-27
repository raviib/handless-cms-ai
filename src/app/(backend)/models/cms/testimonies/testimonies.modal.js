import { Schema, model, models } from "mongoose";

const testimoniesSchema = new Schema(
  {
        person_name: {
            type: String,
        },
        company: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        thumbnail_image: {
            type: String,
        },
        enumeration: {
            type: String,
        },
        video: {
            type: String,
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

const modelName = "testimonies";
if (process.env.NODE_ENV !== 'production' && models[modelName]) {
  delete models[modelName];
}

export default models[modelName] || model("testimonies", testimoniesSchema);