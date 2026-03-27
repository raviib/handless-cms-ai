import userSchema from "@/app/(backend)/models/administrator/User";
import { NextResponse } from "next/server";
import { errorHandler } from "@/app/utils/db/errorhandler";
import mongoose from "mongoose";

export async function PUT(req) {
    try {
        const { object_ids, isActive } = await req.json();
        
        // ensure array
        const ids = Array.isArray(object_ids) ? object_ids : [object_ids];
        
        const result = await userSchema.updateMany(
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