import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler } from "@/app/utils/db/errorhandler";
import { NextResponse } from "next/server";
export const revalidate = 60;

export async function GET(request) {
    try {
        await dbConnect();

        return NextResponse.json({
            success: true,
            message: "not found",

        }, {
            status: 404
        });
    } catch (error) {
        return errorHandler(error);
    }
}
