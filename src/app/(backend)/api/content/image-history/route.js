import { NextResponse } from "next/server";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler } from "@/app/utils/db/errorhandler";
import AiImageHistory from "@/app/(backend)/models/ai/ai-image-history.modal.js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/content/image-history?fieldId=xxx&limit=10
 */
export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = request.nextUrl;
        const fieldId = searchParams.get("fieldId");
        const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);

        if (!fieldId) {
            return NextResponse.json(
                { success: false, message: "fieldId is required" },
                { status: 400 }
            );
        }

        const history = await AiImageHistory.find({ fieldId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return NextResponse.json({ success: true, data: history });
    } catch (error) {
        return errorHandler(error);
    }
}

/**
 * PATCH /api/content/image-history
 * Body: { _id: string, selectedImage: string }
 * Marks which image the user selected.
 */
export async function PATCH(request) {
    try {
        await dbConnect();
        const { _id, selectedImage } = await request.json();
        if (!_id) {
            return NextResponse.json({ success: false, message: "_id is required" }, { status: 400 });
        }
        await AiImageHistory.findByIdAndUpdate(_id, { selectedImage });
        return NextResponse.json({ success: true });
    } catch (error) {
        return errorHandler(error);
    }
}
