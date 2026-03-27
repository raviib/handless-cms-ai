import { Schema, model, models } from "mongoose";

const formFieldSchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            unique: [true, "name already exist"]
        },
    },
    {
        timestamps: true,
    }
);




export default models["formFields"] || model("formFields", formFieldSchema);
