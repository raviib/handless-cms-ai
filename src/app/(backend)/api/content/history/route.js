import { NextResponse } from "next/server";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler } from "@/app/utils/db/errorhandler";
import AiContentHistory from "@/app/(backend)/models/ai/ai-content-history.modal.js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/content/history?fieldId=xxx&locale=en&limit=10
 * Returns past AI generation runs for a field, newest first.
 */
export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = request.nextUrl;
        const fieldId = searchParams.get("fieldId");
        const locale = searchParams.get("locale") || "en";
        const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);

        if (!fieldId) {
            return NextResponse.json(
                { success: false, message: "fieldId is required" },
                { status: 400 }
            );
        }

        const history = await AiContentHistory.find({ fieldId, locale })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return NextResponse.json({ success: true, data: history }, { status: 200 });
    } catch (error) {
        return errorHandler(error);
    }
}

/**
 * POST /api/content/history
 * Saves a new generation run.
 * Body: { fieldId, fieldType, locale, prompt, originalValue, suggestions }
 */
export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { fieldId, fieldType = "text", locale = "en", prompt = "", originalValue = "", suggestions } = body;

        if (!fieldId || !Array.isArray(suggestions) || suggestions.length === 0) {
            return NextResponse.json(
                { success: false, message: "fieldId and suggestions are required" },
                { status: 400 }
            );
        }

        const doc = await AiContentHistory.create({
            fieldId,
            fieldType,
            locale,
            prompt,
            originalValue,
            suggestions,
        });

        return NextResponse.json({ success: true, data: doc }, { status: 201 });
    } catch (error) {
        return errorHandler(error);
    }
}
