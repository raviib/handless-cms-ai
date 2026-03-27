import { Schema, model, models } from "mongoose";

const certificationsSchema = new Schema(
  {
        displayName: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        name: {
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

const modelName = "certifications";
if (process.env.NODE_ENV !== 'production' && models[modelName]) {
  delete models[modelName];
}

export default models[modelName] || model("certifications", certificationsSchema);