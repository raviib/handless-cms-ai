import { Schema, model, models } from "mongoose";

const blog_tagSchema = new Schema(
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
            unique: true,
            trim: true,
            lowercase: true,
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

const modelName = "blog-tag";
if (process.env.NODE_ENV !== 'production' && models[modelName]) {
  delete models[modelName];
}

export default models[modelName] || model("blog-tag", blog_tagSchema);