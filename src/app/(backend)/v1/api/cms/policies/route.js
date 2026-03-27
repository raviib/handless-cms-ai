import policiesSchema from "@/app/(backend)/models/cms/policies/policies.modal.js";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler } from "@/app/utils/db/errorhandler";
import { buildAdvancedQuery } from "@/app/utils/usefullFunction/advancedQueryBuilder.js";
import { NextResponse } from "next/server";

export const revalidate = 60;

export async function GET(request) {
    try {
        await dbConnect();
        const searchParams = request.nextUrl.searchParams;
        
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
                {
                   "title": { $regex: input_data, $options: "i" },
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

        const totalDocs = await policiesSchema.find({ ...que }).countDocuments();
        const data = await policiesSchema.find({ ...que })
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({  sort: 1}); // Populate table reference fields

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
