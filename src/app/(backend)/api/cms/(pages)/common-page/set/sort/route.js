import common_pageSchema from "@/app/(backend)/models/cms/(pages)/common-page/common-page.modal.js";
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
        if (!dataToUpdate || !Array.isArray(dataToUpdate))
            return NextResponse.json({ success: false, message: "Invalid data format." }, { status: 400 });

        await Promise.all(dataToUpdate.map(async (item) => {
            const id = item._id || item.id;
            const baseDoc = await common_pageSchema.findById(id).select("_id rootId").lean();
            if (!baseDoc) return;
            const rootId = baseDoc.rootId ?? baseDoc._id;
            return common_pageSchema.updateMany({ $or: [{ _id: id }, { rootId }] }, { $set: { sort: item.sort } });
        }));

        return NextResponse.json({ success: true, message: "Sort order updated (all translations synced)" });
    } catch (error) {
        return errorHandler(error);
    }
}
