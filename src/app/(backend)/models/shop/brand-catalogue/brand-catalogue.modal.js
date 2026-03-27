import { Schema, model, models } from "mongoose";

const brand_catalogueSchema = new Schema(
  {
        displayName: {
            type: String,
            required: true,
        },
        title: {
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
        image: {
            type: String,
            required: true,
        },
        brand: {
            type: Schema.Types.ObjectId,
            ref: "brands",
            required: true,
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: "category",
            required: true,
        },
        file: {
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

const modelName = "brand-catalogue";
if (process.env.NODE_ENV !== 'production' && models[modelName]) {
  delete models[modelName];
}

export default models[modelName] || model("brand-catalogue", brand_catalogueSchema);