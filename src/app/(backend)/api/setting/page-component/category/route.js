import { NextResponse } from "next/server";
import pageComponentSchema from "@/app/(backend)/models/setting/page-component/page-component.modal.js";
import { errorHandler } from "@/app/utils/db/errorhandler";

export const revalidate = 0;
export const dynamic = 'force-dynamic';

// GET all unique categories
export async function GET(request) {
    try {
        const categories = await pageComponentSchema.distinct("category", { 
            category: { $ne: null, $ne: "" } 
        });

        const DB_FIELDS = categories.map(cat => ({
            label: cat,
            value: cat
        }));

        return NextResponse.json({
            success: true,
            message: "Categories fetched successfully",
            data: DB_FIELDS,
        });
    } catch (error) {
        return errorHandler(error);
    }
}

// POST - Create new category (handled automatically when component is created)
export async function POST(request) {
    try {
        const body = await request.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json({
                success: false,
                message: "Category name is required"
            }, { status: 400 });
        }

        // Return the new category in the expected format
        const newCategory = { label: name, value: name };

        return NextResponse.json({
            success: true,
            message: "Category created",
            data: newCategory
        });
    } catch (error) {
        return errorHandler(error);
    }
}
