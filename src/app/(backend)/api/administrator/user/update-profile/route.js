import { AdminVerifyTokenMiddleWare } from "@/app/utils/db/token_validation.js";
import { ErrorHandler, errorHandler } from "@/app/utils/db/errorhandler";
import { NextResponse } from "next/server";
import userSchema from "@/app/(backend)/models/administrator/User";
import { isrequired, validateEmail } from "@/app/utils/db/validations.js"

export async function PUT(request) {
    try {
        const middleware_validation = await AdminVerifyTokenMiddleWare(request)
        if (middleware_validation.is_error) {
            throw new ErrorHandler(middleware_validation.message, middleware_validation.statusCode)
        }
        const { _id } = middleware_validation;
        const body = await request.json();
        const { password, ...rest } = body;
        const { f_name, phone_no, email, } = rest;
        let required_body = { f_name, phone_no, email }
        const isError = isrequired(required_body);
        if (isError.is_error) {
            throw new ErrorHandler(isError.message, isError.statusCode)
        }

        await userSchema.findByIdAndUpdate(_id, rest);
        return NextResponse.json({
            success: true,
            message: "updated",
        });
    } catch (error) {
        return errorHandler(error)
    }
}