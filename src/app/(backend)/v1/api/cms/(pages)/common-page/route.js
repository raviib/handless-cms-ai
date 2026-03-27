import common_pageSchema from "@/app/(backend)/models/cms/(pages)/common-page/common-page.modal.js";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler } from "@/app/utils/db/errorhandler";
import { buildAdvancedQuery } from "@/app/utils/usefullFunction/advancedQueryBuilder.js";
import { populateDynamicZone } from "@/app/utils/db/populateDynamicZone.js";
import mongoose from "mongoose";
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
                   "displayName": { $regex: input_data, $options: "i" },
                },
                {
                   "name": { $regex: input_data, $options: "i" },
                }
                ]
            };
            if (que.$and) {
                que.$and.push(searchCondition);
            } else {
                que = { ...que, ...searchCondition };
            }
        }

        const totalDocs = await common_pageSchema.find({ ...que }).countDocuments();
        const totalPages = Math.ceil(totalDocs / limit);
        const data = await common_pageSchema.find({ ...que }).select(fieldSelector)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ sort: 1 })
            .populate({ path: "banner", match: { isActive: true } })
            .lean();

        // Populate dynamic zone relations
        for (const item of data) {
            if (item.section && Array.isArray(item.section)) {
                item.section = await populateDynamicZone(item.section, mongoose);
            }
        }

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
