import career_enquireSchema from "@/app/(backend)/models/leads/career-enquire/career-enquire.modal.js";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler } from "@/app/utils/db/errorhandler";
import { buildAdvancedQuery } from "@/app/utils/usefullFunction/advancedQueryBuilder.js";
import { NextResponse } from "next/server";

export const revalidate = 60;

export async function GET(request) {
    try {
        await dbConnect();
        return NextResponse.json({
            success: true,
            message: "Fetched Successfully",

        }, {
            status: 404
        });
    } catch (error) {
        return errorHandler(error);
    }
}
