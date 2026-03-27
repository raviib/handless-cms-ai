import certificationsSchema from "@/app/(backend)/models/cms/certifications/certifications.modal.js";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler } from "@/app/utils/db/errorhandler";
import { buildAdvancedQuery } from "@/app/utils/usefullFunction/advancedQueryBuilder.js";
import { NextResponse } from "next/server";
import { getFieldSelector } from "@/app/utils/db/fieldSelector";
export const revalidate = 60;

export async function GET(request) {
    try {
        await dbConnect();
        const searchParams = request.nextUrl.searchParams;
        // Get field selector from query params
        const fieldSelector = getFieldSelector(searchParams);

        // Build advanced query with filter support
        const { mongoQuery, regularQuery } = buildAdvancedQuery(searchParams);

        const {
            page = 1,
            limit = 25,
            input_data,
        } = regularQuery;

        let que = { ...mongoQuery };

        if (input_data) {
            const searchCondition = {
                $or: [
                    { name: { $regex: input_data, $options: "i" } }
                ]
            };

            // Merge with existing query
            if (que.$and) {
                que.$and.push(searchCondition);
            } else {
                que = { ...que, ...searchCondition };
            }
        }

        const totalDocs = await certificationsSchema.find({ ...que }).countDocuments();
        const data = await certificationsSchema.find({ ...que }).select(fieldSelector)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ sort: 1 }); // Populate table reference fields

        return NextResponse.json({
            success: true,
            message: "Fetched Successfully",
            data: data,
            totalDocs: totalDocs
        }, {
            status: 200
        });
    } catch (error) {
        return errorHandler(error);
    }
}
