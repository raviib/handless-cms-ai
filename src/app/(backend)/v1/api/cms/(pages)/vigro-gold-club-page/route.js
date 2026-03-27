import vigro_gold_club_pageSchema from "@/app/(backend)/models/cms/(pages)/vigro-gold-club-page/vigro-gold-club-page.modal.js";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler } from "@/app/utils/db/errorhandler";
import { NextResponse } from "next/server";
import { getFieldSelector } from "@/app/utils/db/fieldSelector";
export const revalidate = 60;

export async function GET(request) {
    try {
        await dbConnect();
        const searchParams = request.nextUrl.searchParams;
        const fieldSelector = getFieldSelector(searchParams);
        let data = await vigro_gold_club_pageSchema.findOne().select(fieldSelector);
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
