import eventSchema from "@/app/(backend)/models/cms/event/event.modal.js";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler } from "@/app/utils/db/errorhandler";
import { NextResponse } from "next/server";

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function DELETE(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { ids } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({
                success: false,
                message: "No IDs provided for deletion"
            }, {
                status: 400
            });
        }

        // Delete multiple documents
        const result = await eventSchema.deleteMany({
            _id: { $in: ids }
        });

        return NextResponse.json({
            success: true,
            message: `Successfully deleted ${result.deletedCount} items`,
            deletedCount: result.deletedCount
        }, {
            status: 200
        });
    } catch (error) {
        return errorHandler(error);
    }
}
