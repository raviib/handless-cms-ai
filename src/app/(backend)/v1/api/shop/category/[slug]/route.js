import categorySchema from "@/app/(backend)/models/shop/category/category.modal.js";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler } from "@/app/utils/db/errorhandler";
import { getFieldSelector } from "@/app/utils/db/fieldSelector";
import { populateDynamicZone } from "@/app/utils/db/populateDynamicZone.js";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
export const revalidate = 60;

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const searchParams = request.nextUrl.searchParams;
        const fieldSelector = getFieldSelector(searchParams);
        const { slug } = await params;


        const data = await categorySchema.findOne({ slug: slug }).select(fieldSelector)
            .populate({ path: "banner", match: { isActive: true } })
            .lean();

        // Populate dynamic zone relations
        if (data.section && Array.isArray(data.section)) {
            data.section = await populateDynamicZone(data.section, mongoose);
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
