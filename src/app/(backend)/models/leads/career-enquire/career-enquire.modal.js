import { Schema, model, models } from "mongoose";

const career_enquireSchema = new Schema(
  {
        name: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        subject: {
            type: String,
            required: true,
        },
        resume: {
            type: String,
            required: true,
        },
        job_id: {
            type: Schema.Types.ObjectId,
            ref: "jobs-opening",
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

const modelName = "career-enquire";
if (process.env.NODE_ENV !== 'production' && models[modelName]) {
  delete models[modelName];
}

export default models[modelName] || model("career-enquire", career_enquireSchema);