import { Schema, model, models } from "mongoose";

const headerSchema = new Schema(
  {
        displayName: {
            type: String,
            required: true,
        },
        logo: {
            type: String,
            required: true,
        },
        list: [{
            name: {
                type: String,
                required: true,
            },
            link: {
                type: String,
            },
            image: {
                type: String,
            },
            list: [{
                name: {
                    type: String,
                    required: true,
                },
                link: {
                    type: String,
                    required: true,
                },
                logo: {
                    type: String,
                    required: true,
                },
                content: {
                    type: String,
                    required: true,
                },
            }],
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

const modelName = "header";
if (process.env.NODE_ENV !== 'production' && models[modelName]) {
  delete models[modelName];
}

export default models[modelName] || model("header", headerSchema);