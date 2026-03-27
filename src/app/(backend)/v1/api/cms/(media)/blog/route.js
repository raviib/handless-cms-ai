import blogSchema from "@/app/(backend)/models/cms/(media)/blog/blog.modal.js";
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

        let que = { isActive: true, ...mongoQuery };

        if (input_data) {
            const searchCondition = {
                $or: [
                {
                   "displayName": { $regex: input_data, $options: "i" },
                },
                {
                   "name": { $regex: input_data, $options: "i" },
                }
                ]
            };

            // Merge with existing query
            if (que.$and) {
                que.$and.push(searchCondition);
            } else {
                que = { ...que, ...searchCondition };
            }
        }

        const totalDocs = await blogSchema.find({ ...que }).countDocuments();
        const totalPages = Math.ceil(totalDocs / limit);
        const data = await blogSchema.find({ ...que }).select(fieldSelector)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ date: -1 })
            .populate({ path: "tag", match: { isActive: true } }); // Populate table reference fields

        return NextResponse.json({
            success: true,
            message: "Fetched Successfully",
            data: data,
            pagination: {
                totalDocs,
                totalPages,
                currentPage: page,
                limit,
            },
        }, {
            status: 200
        });
    } catch (error) {
        return errorHandler(error);
    }
}
