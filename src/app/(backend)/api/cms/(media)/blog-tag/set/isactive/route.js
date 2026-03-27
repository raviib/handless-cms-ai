import blog_tagSchema from "@/app/(backend)/models/cms/(media)/blog-tag/blog-tag.modal.js";
import { dbConnect } from "@/app/utils/db/connectDb";
import { NextResponse } from "next/server";
import { errorHandler } from "@/app/utils/db/errorhandler";
import mongoose from "mongoose";

// Disable caching for this API route
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function PUT(req) {
    try {
        await dbConnect();
        const { object_ids, isActive } = await req.json();
        
        // ensure array
        const ids = Array.isArray(object_ids) ? object_ids : [object_ids];
        
        const result = await blog_tagSchema.updateMany(
            {
                _id: {
                    $in: ids.map(id => new mongoose.Types.ObjectId(id))
                }
            },
            {
                $set: { isActive }
            }
        );
        
        return NextResponse.json({
            success: true,
            message: isActive ? "Activated successfully" : "Deactivated successfully",
            updatedCount: result.modifiedCount
        });
    } catch (error) {
        return errorHandler(error);
    }
}
