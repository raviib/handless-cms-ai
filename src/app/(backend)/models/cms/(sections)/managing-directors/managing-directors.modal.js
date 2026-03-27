import { Schema, model, models } from "mongoose";

const managing_directorsSchema = new Schema(
  {
        title: {
            type: String,
            required: true,
        },
        sub_title: {
            type: String,
            required: true,
        },
        directors: [{
            name: {
                type: String,
                required: true,
            },
            designation: {
                type: String,
                required: true,
            },
            description: {
                type: String,
                required: true,
            },
            image: {
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

const modelName = "managing-directors";
if (process.env.NODE_ENV !== 'production' && models[modelName]) {
  delete models[modelName];
}

export default models[modelName] || model("managing-directors", managing_directorsSchema);