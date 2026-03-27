import { ErrorHandler, errorHandler } from "@/app/utils/db/errorhandler";
import { NextResponse } from "next/server";
import RBACSchema from "@/app/(backend)/models/administrator/RBAC/RBAC.modal.js"
import { isrequired } from "@/app/utils/db/validations";
import { unstable_noStore as noStore } from 'next/cache'
export async function GET(request,) {
    noStore()
    try {
        const brands = await RBACSchema.find().sort({ sort: -1 }).lean();
        
        return NextResponse.json({
            success: true,
            message: "Fetched Successfully",
            data: brands,
        });
    } catch (error) {

        return errorHandler(error)
    }
}

export async function POST(request,) {
    try {
        const body = await request.json();
        const { name } = body
        const required_body = { name }
        const isError = isrequired(required_body);
        if (isError.is_error) {
            throw new ErrorHandler(isError.message, isError.statusCode)
        }
        const coupons = await bannerSchema.create({ name })

        return NextResponse.json({
            success: true,
            message: "Create Successfully",
            data: coupons,
        });
    } catch (error) {
        return errorHandler(error)
    }
}