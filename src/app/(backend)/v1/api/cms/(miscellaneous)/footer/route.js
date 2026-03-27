import footerSchema from "@/app/(backend)/models/cms/(miscellaneous)/footer/footer.modal.js";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler } from "@/app/utils/db/errorhandler";
import { NextResponse } from "next/server";

export const revalidate = 60;

export async function GET(request) {
    try {
        await dbConnect();

        let data = await footerSchema.findOne(); // Populate all reference fields

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
