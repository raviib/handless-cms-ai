import { AdminVerifyTokenMiddleWare } from "@/app/utils/db/token_validation.js";
import { ErrorHandler, errorHandler } from "@/app/utils/db/errorhandler";
import { NextResponse } from "next/server";
import userSchema from "@/app/(backend)/models/administrator/User";
import { isrequired, validateEmail } from "@/app/utils/db/validations.js"
import bcrypt from 'bcrypt';
export async function PUT(request) {
    try {
        const middleware_validation = await AdminVerifyTokenMiddleWare(request)
        if (middleware_validation.is_error) {
            throw new ErrorHandler(middleware_validation.message, middleware_validation.statusCode)
        }
        const { _id } = middleware_validation;
        const body = await request.json();
        const { old_password, new_password, confirm_password } = body;
        let required_body = { old_password, new_password, confirm_password }
        const isError = isrequired(required_body);
        if (isError.is_error) {
            throw new ErrorHandler(isError.message, isError.statusCode)
        }
        if (!(new_password.length > 7)) {
            throw new ErrorHandler("Password must be greater than 8 characters", isError.statusCode)
        }
        if (new_password !== confirm_password) {
            throw new ErrorHandler("new password doesn't match confirm password", isError.statusCode)
        }
        if (old_password === new_password) {
            throw new ErrorHandler("old password doesn't equal to new password", isError.statusCode)
        }
        const user = await userSchema.findById(_id).select('+password');
        if (!user) {
            throw new ErrorHandler(`Email not exist`, 404)
        }
        const match = await bcrypt.compare(old_password, user.password);
        if (!match) {
            throw new ErrorHandler("current password is incorrect. please try again", isError.statusCode)
        }
        user.password = new_password;
        await user.save();
        return NextResponse.json({
            success: true,
            message: "updated",
        });
    } catch (error) {
        return errorHandler(error)
    }
}