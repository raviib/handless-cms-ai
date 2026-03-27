import csr_pageSchema from "@/app/(backend)/models/cms/(pages)/csr-page/csr-page.modal.js";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler } from "@/app/utils/db/errorhandler";
import { NextResponse } from "next/server";
import { getFieldSelector } from "@/app/utils/db/fieldSelector";
export const revalidate = 60;

export async function GET(request) {
    try {
        await dbConnect();
        const searchParams = request.nextUrl.searchParams;
        // Get field selector from query params
        const fieldSelector = getFieldSelector(searchParams);
        let data = await csr_pageSchema.findOne().select(fieldSelector)
            .populate({ path: "banner", match: { isActive: true } }); // Populate all reference fields
        if (!data) {
            data = {};
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
