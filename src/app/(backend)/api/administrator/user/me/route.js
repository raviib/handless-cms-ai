
import { NextResponse } from "next/server";
import userSchema from "@/app/(backend)/models/administrator/User";
import { ErrorHandler, errorHandler } from "@/app/utils/db/errorhandler";
import { AdminVerifyToken } from "@/app/utils/db/token_validation";
import { dbConnect } from "@/app/utils/db/connectDb";

export async function GET(req) {
    try {

        await dbConnect()
        const id = await AdminVerifyToken(req)
        const data = await userSchema.findById(id);
        if (!data) {
            throw new ErrorHandler(`User not found`, 401);
        }
        return NextResponse.json({
            success: true,
            message: "Fetched Successfully",
            user: data,

        }, {
            status: 200
        });
    } catch (error) {
        return errorHandler(error)
    }
}


