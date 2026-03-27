import blog_tagSchema from "@/app/(backend)/models/cms/(media)/blog-tag/blog-tag.modal.js";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler } from "@/app/utils/db/errorhandler";
import { buildAdvancedQuery } from "@/app/utils/usefullFunction/advancedQueryBuilder.js";
import { NextResponse } from "next/server";

// Disable caching for this API route
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        await dbConnect();
        
        // Get search params
        const searchParams = request.nextUrl.searchParams;
        const { mongoQuery } = buildAdvancedQuery(searchParams);
        
        // Pagination params
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 50; // Default 50 items per page
        const search = searchParams.get('search') || '';
        
        // Build query
        const query = { isActive: true, ...mongoQuery };
        
        // Add search functionality
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { displayName: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Get total count for pagination
        const totalCount = await blog_tagSchema.countDocuments(query);
        
        // Get paginated data
        const data = await blog_tagSchema.find(query)
          .select("_id displayName name")
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
