import { Schema, model, models } from "mongoose";

const jobs_openingSchema = new Schema(
  {
        title: {
            type: String,
            required: true,
        },
        slug: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
        experience: {
            type: String,
            required: true,
        },
        positions: {
            type: String,
            required: true,
        },
        url: {
            type: String,
        },
        skills: {
            type: String,
            required: true,
        },
        jobDescription: {
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

const modelName = "jobs-opening";
if (process.env.NODE_ENV !== 'production' && models[modelName]) {
  delete models[modelName];
}

export default models[modelName] || model("jobs-opening", jobs_openingSchema);