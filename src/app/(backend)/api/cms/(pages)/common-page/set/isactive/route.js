import common_pageSchema from "@/app/(backend)/models/cms/(pages)/common-page/common-page.modal.js";
import { dbConnect } from "@/app/utils/db/connectDb";
import { NextResponse } from "next/server";
import { errorHandler } from "@/app/utils/db/errorhandler";
import mongoose from "mongoose";

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function PUT(req) {
    try {
        await dbConnect();
        const { object_ids, isActive } = await req.json();
        const ids = (Array.isArray(object_ids) ? object_ids : [object_ids]).map(id => new mongoose.Types.ObjectId(id));
        const baseDocs = await common_pageSchema.find({ _id: { $in: ids } }).select("_id rootId").lean();
        const rootIds = baseDocs.map(d => d.rootId ?? d._id);
        const result = await common_pageSchema.updateMany(
            { $or: [{ _id: { $in: ids } }, { rootId: { $in: rootIds } }] },
            { $set: { isActive } }
        );
        return NextResponse.json({ success: true, message: isActive ? "Activated successfully" : "Deactivated successfully", updatedCount: result.modifiedCount });
    } catch (error) {
        return errorHandler(error);
    }
}
