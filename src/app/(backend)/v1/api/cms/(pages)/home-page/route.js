import home_pageSchema from "@/app/(backend)/models/cms/(pages)/home-page/home-page.modal.js";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler } from "@/app/utils/db/errorhandler";
import { populateDynamicZone } from "@/app/utils/db/populateDynamicZone.js";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getFieldSelector } from "@/app/utils/db/fieldSelector";
export const revalidate = 60;

export async function GET(request) {
    try {
        await dbConnect();
        const searchParams = request.nextUrl.searchParams;
        const fieldSelector = getFieldSelector(searchParams);
        let data = await home_pageSchema.findOne().select(fieldSelector)
            .populate({ path: "banner", match: { isActive: true } })
            .lean();
        if (!data) {
            data = {};
        }

        // Populate dynamic zone relations
        if (data.sections && Array.isArray(data.sections)) {
            data.sections = await populateDynamicZone(data.sections, mongoose);
        }

        return NextResponse.json({
            success: true,
            message: "Fetched Successfully",
            data: data
        }, {
            status: 200
        });
    } catch (error) {
        return errorHandler(error);
    }
}
