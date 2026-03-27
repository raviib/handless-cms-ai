import blogSchema from "@/app/(backend)/models/cms/(media)/blog/blog.modal.js";
import { dbConnect } from "@/app/utils/db/connectDb";
import { NextResponse } from "next/server";
import { errorHandler } from "@/app/utils/db/errorhandler";

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function PUT(req) {
    try {
        await dbConnect();
        const { updates, sortData } = await req.json();
        const dataToUpdate = updates || sortData;

        if (!dataToUpdate || !Array.isArray(dataToUpdate)) {
            return NextResponse.json({
                success: false,
                message: "Invalid data format. Expected array of updates.",
            }, { status: 400 });
        }

        await Promise.all(
            dataToUpdate.map(item =>
                blogSchema.findByIdAndUpdate(item._id || item.id, { sort: item.sort })
            )
        );

        return NextResponse.json({
            success: true,
            message: "Sort order updated successfully",
        });
    } catch (error) {
        return errorHandler(error);
    }
}
