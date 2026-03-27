import productsSchema from "@/app/(backend)/models/shop/products/products.modal.js";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler } from "@/app/utils/db/errorhandler";
import { buildAdvancedQuery } from "@/app/utils/usefullFunction/advancedQueryBuilder.js";
import { NextResponse } from "next/server";
export const revalidate = 60;

export async function GET(request) {
    try {
        await dbConnect();
        const searchParams = request.nextUrl.searchParams;
        const { mongoQuery, } = buildAdvancedQuery(searchParams);
        const data = await productsSchema.aggregate([
            {
                $match: { isActive: true, ...mongoQuery }
            },
            {
                $lookup: {
                    from: "brand-catalogues",
                    localField: "catalogue",
                    foreignField: "_id",
                    as: "catalogueDetails"
                }
            },
            {
                $unwind: "$catalogueDetails"
            },
            {
                $project: {
                    _id: "$catalogueDetails._id",
                    displayName: "$catalogueDetails.displayName",
                    title: "$catalogueDetails.title",
                    slug: "$catalogueDetails.slug"
                }
            },
            {
                $group: {
                    _id: "$_id",
                    displayName: { $first: "$displayName" },
                    title: { $first: "$title" },
                    slug: { $first: "$slug" }
                }
            },
            {
                $project: {
                    _id: 1,
                    displayName: 1,
                    title: 1,
                    slug: 1
                }
            },
            {
                $sort: { title: 1 }
            }
        ]);
        return NextResponse.json({
            success: true,
            message: "Fetched Successfully",
            data: data,
        }, {
            status: 200
        });
    } catch (error) {
        return errorHandler(error);
    }
}
