import eventSchema from "@/app/(backend)/models/cms/event/event.modal.js";
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
        const fieldSelector = getFieldSelector(searchParams);
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
                   "name": { $regex: input_data, $options: "i" },
                },
                {
                   "location": { $regex: input_data, $options: "i" },
                },
                {
                   "link": { $regex: input_data, $options: "i" },
                }
                ]
            };
            if (que.$and) {
                que.$and.push(searchCondition);
            } else {
                que = { ...que, ...searchCondition };
            }
        }

        const totalDocs = await eventSchema.find({ ...que }).countDocuments();
        const totalPages = Math.ceil(totalDocs / limit);
        const data = await eventSchema.find({ ...que }).select(fieldSelector)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ date: -1 });

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
