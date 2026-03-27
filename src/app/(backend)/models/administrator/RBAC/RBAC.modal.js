import { Schema, model, models } from "mongoose";
import "@/app/(backend)/models/setting/pages-conf/pages-conf.modal.js"; // Make sure this import points to the correct file.

// Define a schema for RBAC (Role-Based Access Control)
const rbacSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true, // Trim leading/trailing spaces
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        isDeleteAble: {
            type: Boolean,
            default: false,
        },
        permissions: [
            {
                create: {
                    type: Boolean,
                    default: false,
                },
                delete: {
                    type: Boolean,
                    default: false,
                },
                edit: {
                    type: Boolean,
                    default: false,
                },
                view: {
                    type: Boolean,
                    default: false,
                },
                access_of: {
                    type: Schema.Types.ObjectId,
                    required: [true, "Access of is required"],
                    ref: "pages-confs", // Ensure this ref matches your model name for "pages-confs"
                },
            }]
    },
    { timestamps: true }
);

// Create or reuse the RBAC model
const Rbac = models.rbacs || model("rbacs", rbacSchema);

export default Rbac;
