import blogSchema from "@/app/(backend)/models/cms/(media)/blog/blog.modal.js";
import { dbConnect } from "@/app/utils/db/connectDb";
import { ErrorHandler, errorHandler } from "@/app/utils/db/errorhandler";
import { populateDynamicZone } from "@/app/utils/db/populateDynamicZone.js";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getFieldSelector } from "@/app/utils/db/fieldSelector";
export const revalidate = 60;

export async function GET(request, { params }) {
    try {
        await dbConnect();

        const searchParams = request.nextUrl.searchParams;
        // Get field selector from query params
        const fieldSelector = getFieldSelector(searchParams);
        const { slug } = await params;
        let data = await blogSchema.findOne({ slug: slug }).select(fieldSelector)
            .populate({ path: "tag", match: { isActive: true } })
            .lean();

        if (!data) {
            throw new ErrorHandler("Data not found", 404);
        }

        return NextResponse.json({
            success: true,
            message: "Fetched Successfully",
            data: data
        });
    } catch (error) {
        return errorHandler(error);
    }
}
