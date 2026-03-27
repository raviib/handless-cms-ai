import brand_catalogueSchema from "@/app/(backend)/models/shop/brand-catalogue/brand-catalogue.modal.js";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler } from "@/app/utils/db/errorhandler";
import { NextResponse } from "next/server";
export const revalidate = 60;

export async function GET(request) {
    try {
        await dbConnect();
        const result = await brand_catalogueSchema.aggregate([
            {
                $lookup: {
                    from: "categories", // collection name in MongoDB (check actual name)
                    localField: "category",
                    foreignField: "_id",
                    as: "categoryDetails"
                }
            },
            {
                $unwind: "$categoryDetails"
            },
            {
                $group: {
                    _id: "$categoryDetails._id",
                    name: { $first: "$categoryDetails.name" },
                    slug: { $first: "$categoryDetails.slug" }
                }
            },
            {
                $project: {
                    // _id: 0,
                    _id: "$_id",
                    name: 1,
                    slug: 1
                }
            },
            {
                $sort: { name: 1 } // optional
            }
        ]);

        return NextResponse.json({
            success: true,
            message: "Fetched Successfully",
            data: result
        }, {
            status: 200
        });
    } catch (error) {
        return errorHandler(error);
    }
}
