import common_pageSchema from "@/app/(backend)/models/cms/(pages)/common-page/common-page.modal.js";
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
        let data = await common_pageSchema.findOne({ slug: slug }).select(fieldSelector)
            .populate({ path: "banner" })
            .lean();

        if (!data) {
            throw new ErrorHandler("Data not found", 404);
        }

        // Populate dynamic zone relations
        if (data.section && Array.isArray(data.section)) {
            data.section = await populateDynamicZone(data.section, mongoose);
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
