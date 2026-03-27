import { Schema, model, models } from "mongoose";

const brandsSchema = new Schema(
  {
        displayName: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        slug: {
            type: String,
            required: true,
        },
        logo: {
            type: String,
            required: true,
        },
        image: {
            type: String,
        },
        short_description: {
            type: String,
        },
        categorys: {
            type: [{ type: Schema.Types.ObjectId, ref: "category", required: true }],
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

const modelName = "brands";
if (process.env.NODE_ENV !== 'production' && models[modelName]) {
  delete models[modelName];
}

export default models[modelName] || model("brands", brandsSchema);