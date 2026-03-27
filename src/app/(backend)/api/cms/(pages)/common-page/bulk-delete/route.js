import common_pageSchema from "@/app/(backend)/models/cms/(pages)/common-page/common-page.modal.js";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler } from "@/app/utils/db/errorhandler";
import { NextResponse } from "next/server";

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function DELETE(request) {
    try {
        await dbConnect();
        const { ids } = await request.json();
        if (!ids || !Array.isArray(ids) || ids.length === 0)
            return NextResponse.json({ success: false, message: "No IDs provided" }, { status: 400 });

        const baseDocs = await common_pageSchema.find({ _id: { $in: ids } }).select("_id rootId").lean();
        const rootIds = baseDocs.map(d => d.rootId ?? d._id);
        const result = await common_pageSchema.deleteMany({ $or: [{ _id: { $in: ids } }, { rootId: { $in: rootIds } }] });

        return NextResponse.json({ success: true, message: `Deleted ${result.deletedCount} items (including translations)`, deletedCount: result.deletedCount }, { status: 200 });
    } catch (error) {
        return errorHandler(error);
    }
}
