import enquire_nowSchema from "@/app/(backend)/models/leads/enquire-now/enquire-now.modal.js";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler } from "@/app/utils/db/errorhandler";
import { buildAdvancedQuery } from "@/app/utils/usefullFunction/advancedQueryBuilder.js";
import { NextResponse } from "next/server";

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        await dbConnect();

        const searchParams = request.nextUrl.searchParams;
        const { mongoQuery } = buildAdvancedQuery(searchParams);

        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 50;
        const search = searchParams.get('search') || '';

        const query = { isActive: true, ...mongoQuery };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { displayName: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { city: { $regex: search, $options: 'i' } },
                { pageUrl: { $regex: search, $options: 'i' } }
            ];
        }

        const totalCount = await enquire_nowSchema.countDocuments(query);
        const data = await enquire_nowSchema.find(query)
          .select("_id displayName name phone city pageUrl")
          .sort({ sort: -1, name: 1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean();

        return NextResponse.json({
            success: true,
            message: "Fetched Successfully",
            data: data,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                hasMore: page * limit < totalCount
            }
        });
    } catch (error) {
        return errorHandler(error);
    }
}
