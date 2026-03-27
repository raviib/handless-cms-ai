import pageConfSchema from "@/app/(backend)/models/setting/pages-conf/pages-conf.modal.js";
import { NextResponse } from "next/server";
import { errorHandler } from "@/app/utils/db/errorhandler";

// Disable caching for this API route
export const revalidate = 0;
export async function GET(request) {
    try {
        const data = await pageConfSchema.find({}).select({ name: 1, pageName: 1, get_url: 1, entry_title: 1, under: 1, _id: 0 }).lean()

        return NextResponse.json({
            success: true,
            data: data,
        }, {
            status: 200,
        });
    } catch (error) {
        return errorHandler(error)
    }
}