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
        const lang = searchParams.get("lang") || "en";
        const { mongoQuery, regularQuery } = buildAdvancedQuery(searchParams);

        const {
            page = 1,
            limit = 25,
            input_data,
        } = regularQuery;

        // Filter by lang: match exact lang OR fall back to English docs that have no translation
        let que = {
            isActive: true,
            $or: [{ lang }, { lang: { $exists: false } }],
            ...mongoQuery,
        };

        // If requesting a non-English lang, prefer translated docs but exclude
        // English-only docs that already have a translation in the requested lang
        if (lang !== "en") {
            const translatedRootIds = await common_pageSchema
                .find({ lang, isActive: true })
                .distinct("rootId");
            que = {
                isActive: true,
                $or: [
                    { lang },
                    { $and: [{ $or: [{ lang: "en" }, { lang: { $exists: false } }] }, { _id: { $nin: translatedRootIds } }] },
                ],
                ...mongoQuery,
            };
        }

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
