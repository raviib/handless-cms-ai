

import { NextResponse } from "next/server";
import userSchema from "@/app/(backend)/models/administrator/User";
import { AdminVerifyTokenMiddleWare } from "@/app/utils/db/token_validation";
import { errorHandler, ErrorHandler } from "@/app/utils/db/errorhandler";
export async function GET(request) {
    try {

        const middleware_validation = await AdminVerifyTokenMiddleWare(request)
        if (middleware_validation.is_error) {
            throw new ErrorHandler(middleware_validation.message, middleware_validation.statusCode)
        }
        const { _id } = middleware_validation;
        let user = await userSchema.findById(_id).populate({
            path: 'role',
            populate: {
                path: 'permissions.access_of',
                select: "name pageName _id"
            }
        })
        user = user.toObject()
        let permissions = user.role.permissions.map(ele => {
            const { access_of, ...restData } = ele
            return ({
                ...restData,
                ...ele.access_of
            })
        })
        user["role"]["permissions"] = permissions;
        return NextResponse.json({
            success: true,
            message: "Fetched Successfully",
            data: user,
        });
    } catch (error) {

        return errorHandler(error)
    }
}