import { Schema, model, models } from "mongoose";

const enquire_nowSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
        },
        phone: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        lead_type: {
            type: String,
            required: true,
        },
        requirement_type: {
            type: String,
            required: true,
        },
        product: {
            type: Schema.Types.ObjectId,
            ref: "category",
            required: true,
        },
        pageUrl: {
            type: String,
            required: true,
        },
        policy: {
            type: Boolean,
            required: true,
        },
        message: {
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

const modelName = "enquire-now";
if (process.env.NODE_ENV !== 'production' && models[modelName]) {
    delete models[modelName];
}

export default models[modelName] || model("enquire-now", enquire_nowSchema);