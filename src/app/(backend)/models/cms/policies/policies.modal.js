import { Schema, model, models } from "mongoose";

const policiesSchema = new Schema(
  {
        title: {
            type: String,
            required: true,
        },
        thumbnail_image: {
            type: String,
            required: true,
        },
        pdf: {
            type: String,
            required: true,
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

const modelName = "policies";
if (process.env.NODE_ENV !== 'production' && models[modelName]) {
  delete models[modelName];
}

export default models[modelName] || model("policies", policiesSchema);