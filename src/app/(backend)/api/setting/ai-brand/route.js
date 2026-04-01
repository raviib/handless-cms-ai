import { NextResponse } from "next/server";
import { dbConnect } from "@/app/utils/db/connectDb";
import AiBrandSetting from "@/app/(backend)/models/ai/ai-brand-setting.modal.js";
import { errorHandler } from "@/app/utils/db/errorhandler";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET — return the singleton brand setting (create with defaults if missing)
export async function GET() {
    try {
        await dbConnect();
        let doc = await AiBrandSetting.findOne({ slug: "default" }).lean();
        if (!doc) {
            doc = await AiBrandSetting.create({ slug: "default" });
        }
        return NextResponse.json({ success: true, data: doc });
    } catch (error) {
        return errorHandler(error);
    }
}

// PUT — upsert the singleton brand setting
export async function PUT(request) {
    try {
        await dbConnect();
        const body = await request.json();

        // Never allow overwriting the slug
        delete body.slug;
        delete body._id;
        delete body.__v;

        const doc = await AiBrandSetting.findOneAndUpdate(
            { slug: "default" },
            { $set: body },
            { upsert: true, new: true, runValidators: true }
        ).lean();

        return NextResponse.json({ success: true, message: "Saved successfully", data: doc });
    } catch (error) {
        return errorHandler(error);
    }
}
