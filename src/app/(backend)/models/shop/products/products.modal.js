import { Schema, model, models } from "mongoose";

const productsSchema = new Schema(
  {
        full_name: {
            type: String,
            required: true,
        },
        slug: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        name: {
            type: String,
            required: true,
        },
        code: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        images: {
            type: [String],
            required: true,
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: "category",
            required: true,
        },
        catalogue: {
            type: Schema.Types.ObjectId,
            ref: "brand-catalogue",
            required: true,
        },
        specifications: [{
            name: {
                type: String,
                required: true,
            },
            type: {
                type: String,
                required: true,
            },
        }],
        product_finish: [{
            name: {
                type: String,
                required: true,
            },
            image: {
                type: String,
            },
        }],
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

const modelName = "products";
if (process.env.NODE_ENV !== 'production' && models[modelName]) {
  delete models[modelName];
}

export default models[modelName] || model("products", productsSchema);