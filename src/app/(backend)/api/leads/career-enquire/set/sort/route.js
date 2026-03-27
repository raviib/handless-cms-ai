import career_enquireSchema from "@/app/(backend)/models/leads/career-enquire/career-enquire.modal.js";
import { dbConnect } from "@/app/utils/db/connectDb";
import { NextResponse } from "next/server";
import { errorHandler } from "@/app/utils/db/errorhandler";

// Disable caching for this API route
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function PUT(req) {
    try {
        await dbConnect();
        const { updates, sortData } = await req.json();
        
        // Support both formats: updates (new) and sortData (old)
        const dataToUpdate = updates || sortData;
        
        if (!dataToUpdate || !Array.isArray(dataToUpdate)) {
            return NextResponse.json({
                success: false,
                message: "Invalid data format. Expected array of updates.",
            }, { status: 400 });
        }
        
        // Update sort order for multiple items
        const updatePromises = dataToUpdate.map(item => 
            career_enquireSchema.findByIdAndUpdate(
                item._id || item.id, 
                { sort: item.sort }
            )
        );
        
        await Promise.all(updatePromises);
        
        return NextResponse.json({
            success: true,
            message: "Sort order updated successfully",
        });
    } catch (error) {
        return errorHandler(error);
    }
}
