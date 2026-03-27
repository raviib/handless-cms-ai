
import { NextResponse } from "next/server";
import RBACSchema from "@/app/(backend)/models/administrator/RBAC/RBAC.modal.js";
import { ErrorHandler, errorHandler } from "@/app/utils/db/errorhandler";
import { AdminVerifyToken } from "@/app/utils/db/token_validation";
import { dbConnect } from "@/app/utils/db/connectDb";
import userSchema from "@/app/(backend)/models/administrator/User";
export async function GET(req) {
    try {
        await dbConnect()
        const id = await AdminVerifyToken(req)
        let userData = await userSchema.findById(id).select("role dev_mode");
        userData = userData.toObject()
        if (!userData) {
            throw new ErrorHandler(`User not found`, 401);
        }
        const { role, dev_mode } = userData ?? {}
        let data = await RBACSchema.findById(role);
        data = data.toObject()
        const allAccessRoute = []
        data.permissions.forEach(element => {
            if (element.view) {
                allAccessRoute.push(element.access_of)
            }
        })
        return NextResponse.json({
            success: true,
            message: "Fetched Successfully",
            data: allAccessRoute,
            dev_mode:dev_mode

        }, {
            status: 200
        });
    } catch (error) {
        return errorHandler(error)
    }
}


