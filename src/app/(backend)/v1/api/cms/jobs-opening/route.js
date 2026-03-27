import jobs_openingSchema from "@/app/(backend)/models/cms/jobs-opening/jobs-opening.modal.js";
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
                        "title": { $regex: input_data, $options: "i" },
                    },
                    {
                        "location": { $regex: input_data, $options: "i" },
                    },
                    {
                        "experience": { $regex: input_data, $options: "i" },
                    },
                    {
                        "positions": { $regex: input_data, $options: "i" },
                    },
                    {
                        "url": { $regex: input_data, $options: "i" },
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

        const totalDocs = await jobs_openingSchema.find({ ...que }).countDocuments();
        const totalPages = Math.ceil(totalDocs / limit);
        const data = await jobs_openingSchema.find({ ...que }).select(fieldSelector)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ sort: 1 }); // Populate table reference fields

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
