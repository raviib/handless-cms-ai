import bannerSchema from "@/app/(backend)/models/cms/banner/banner.modal.js";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler } from "@/app/utils/db/errorhandler";
import { NextResponse } from "next/server";
import { buildAdvancedQuery } from "@/app/utils/usefullFunction/advancedQueryBuilder.js";

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const { mongoQuery, regularQuery } = buildAdvancedQuery(searchParams);
        const { input_data } = regularQuery;

        let que = { $or: [{ lang: "en" }, { lang: { $exists: false } }], ...mongoQuery };
        if (input_data) {
            const sc = { $or: [{ "displayName": { $regex: input_data, $options: "i" } }, { "title": { $regex: input_data, $options: "i" } }] };
            que.$and ? que.$and.push(sc) : (que = { ...que, ...sc });
        }

        await dbConnect();
        let data = await bannerSchema.find(que)
            .select("-_id -updatedAt -__v -lang -rootId")
            .sort({ sort: 1 })
            .lean();

        let KeyArray = [];
        data = data.map((ele, i) => { if (i === 0) KeyArray = Object.keys(ele); return { ...ele }; });

        return NextResponse.json({ success: true, message: "Fetched Successfully", excelData: data, KeyArray, fileName: "banner-list" });
    } catch (error) {
        return errorHandler(error);
    }
}
