import { Schema, model, models } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "@/app/(backend)/models/administrator/RBAC/RBAC.modal.js"
const userSchema = new Schema(
    {
        pic: {
            type: String,
        },
        f_name: {
            type: String,
            required: [true, "first name is required "],
        },
        l_name: {
            type: String,
        },
        phone_no: {
            type: Number,
            required: [true, "phone number is required "],
            unique: [true, "phone already exist"]
        },
        email: {
            type: String,
            required: [true, "email is required "],
            unique: [true, "email already exist"]
        },
        password: {
            type: String,
            required: [true, "password is required "],
            minLength: [8, "password must be at least 8 characters"],
            select: false,
        },
        role: {
            type: Schema.Types.ObjectId,
            required: [true, "Access of is required"],
            ref: "rbacs",
        },
        dev_mode: {
            type: Boolean,
            default: false
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

userSchema.methods.encryptPassword = async function () {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
};

userSchema.statics.comparePassword = async function (password, hash) {
    return await bcrypt.compare(password, hash);
};

userSchema.methods.generateToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET);
};

// create hash password
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

export default models.User || model("User", userSchema);