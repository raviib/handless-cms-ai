import { Schema, model, models } from "mongoose";

const footerSchema = new Schema(
  {
        logo: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        buttonName: {
            type: String,
            required: true,
        },
        link: {
            type: String,
            required: true,
        },
        links: [{
            title: {
                type: String,
            },
            link: {
                type: String,
            },
            isbold: {
                type: Boolean,
                required: true,
            },
            links: [{
                title: {
                    type: String,
                    required: true,
                },
                link: {
                    type: String,
                    required: true,
                },
                isbold: {
                    type: Boolean,
                    required: true,
                },
            }],
        }],
        bottom_links: [{
            title: {
                type: String,
                required: true,
            },
            value: {
                type: String,
                required: true,
            },
            type: {
                type: String,
                required: true,
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

const modelName = "footer";
if (process.env.NODE_ENV !== 'production' && models[modelName]) {
  delete models[modelName];
}

export default models[modelName] || model("footer", footerSchema);