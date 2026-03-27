import { customerVerifyTokenMiddleware } from "@/app/utils/db/token_validation.js";
import { ErrorHandler, errorHandler } from "@/app/utils/db/errorhandler";
import { NextResponse } from "next/server";
export async function PUT(request) {
    try {
        const middleware_validation = await customerVerifyTokenMiddleware(request)
        if (middleware_validation.is_error) {
            throw new ErrorHandler(middleware_validation.message, middleware_validation.statusCode)
        }
        const { _id } = middleware_validation;
        return NextResponse.json({
            success: true,
            _id
        }, {
            status: 200,
        });
    } catch (error) {
        return errorHandler(error)
    }
}