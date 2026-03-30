import about_us_pageSchema from "@/app/(backend)/models/cms/(pages)/about-us-page/about-us-page.modal.js";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler } from "@/app/utils/db/errorhandler";
import { NextResponse } from "next/server";
import { getFieldSelector } from "@/app/utils/db/fieldSelector";
export const revalidate = 60;

export async function GET(request) {
    try {
        await dbConnect();
        const searchParams = request.nextUrl.searchParams;
        const lang = searchParams.get("lang") || "en";
        const fieldSelector = getFieldSelector(searchParams);

        // Fetch the base English document
        let data = await about_us_pageSchema
            .findOne({ $or: [{ lang: "en" }, { lang: { $exists: false } }] })
            .select(fieldSelector)
            .populate({ path: "banner", match: { isActive: true } });

        if (!data) {
            return NextResponse.json({ success: true, message: "Fetched Successfully", data: {} }, { status: 200 });
        }

        // If a non-English locale is requested, try to find the translation
        if (lang !== "en") {
            const rootId = data.rootId ?? data._id;
            const translation = await about_us_pageSchema
                .findOne({ rootId, lang })
                .select(fieldSelector)
            .populate({ path: "banner", match: { isActive: true } });

            if (translation) {
                data = translation;
            }
            // else fall through and return the English base as fallback
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
