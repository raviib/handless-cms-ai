import { NextResponse } from "next/server";
import pageComponentSchema from "@/app/(backend)/models/setting/page-component/page-component.modal.js";
import { ErrorHandler, errorHandler } from "@/app/utils/db/errorhandler";
import { isExistThenAdd, isrequired } from "@/app/utils/db/validations.js";

export const revalidate = 0;
export const dynamic = 'force-dynamic';

// GET API
export async function GET(request) {
    try {
        const { searchParams } = request.nextUrl;

        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 100;
        const search = searchParams.get("search") || "";
        const input_data = searchParams.get("input_data") || "";
        const ids = searchParams.get("ids") || "";

        const skip = (page - 1) * limit;
        const query = {};

        // If IDs are provided, fetch by IDs
        if (ids) {
            const idArray = ids.split(',').map(id => id.trim()).filter(id => id);
            query._id = { $in: idArray };
            
            const data = await pageComponentSchema
                .find(query)
                .sort({ sort: 1, createdAt: -1 })
                .lean();

            return NextResponse.json({
                success: true,
                message: "Fetched Successfully",
                data,
                totalDocs: data.length,
                page: 1,
                totalPages: 1,
            });
        }

        if (search || input_data) {
            const searchTerm = search || input_data;
            query.$or = [
                { name: { $regex: searchTerm, $options: "i" } }
            ];
        }

        const totalDocs = await pageComponentSchema.countDocuments(query);

        const data = await pageComponentSchema
            .find(query)
            .sort({ sort: 1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        return NextResponse.json({
            success: true,
            message: "Fetched Successfully",
            data,
            totalDocs,
            page,
            totalPages: Math.ceil(totalDocs / limit),
        });
    } catch (error) {
        return errorHandler(error);
    }
}

// POST API
export async function POST(request) {
    try {
        const formData = await request.formData();
        const objToPush = {};
        const unsetToPush = {};

        await isExistThenAdd({ 
            objToPush, 
            unsetToPush, 
            formData, 
            filesField: [], 
            objectField: ["fields"] 
        });

        const { name, category } = objToPush;

        const required = isrequired({ name });
        if (required.is_error) {
            throw new ErrorHandler(required.message, required.statusCode);
        }

        // Generate component key
        const slugify = (text) => {
            return text
                .toString()
                .toLowerCase()
                .trim()
                .replace(/\s+/g, '-')
                .replace(/[^\w\-]+/g, '')
                .replace(/\-\-+/g, '-');
        };
        
        const categorySlug = category ? slugify(category) : 'general';
        const nameSlug = slugify(name);
        const componentKey = `${categorySlug}.${nameSlug}`;

        // Check if componentKey already exists
        const exists = await pageComponentSchema.findOne({ componentKey });
        if (exists) {
            throw new ErrorHandler(
                `Component "${name}" in category "${category || 'general'}" already exists. Component key: ${componentKey}`,
                400
            );
        }

        objToPush.componentKey = componentKey;
        if (!objToPush.category) {
            objToPush.category = 'general';
        }

        const data = await pageComponentSchema.create(objToPush);

        return NextResponse.json(
            {
                success: true,
                message: "Component created successfully",
                data,
            },
            { status: 201 }
        );
    } catch (error) {
        return errorHandler(error);
    }
}
