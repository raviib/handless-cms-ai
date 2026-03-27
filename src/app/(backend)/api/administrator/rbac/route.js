import { customerVerifyTokenMiddleware } from "@/app/utils/db/token_validation.js";
import { isrequired } from "@/app/utils/db/validations";
import { ErrorHandler, errorHandler } from "@/app/utils/db/errorhandler";
import { NextResponse } from "next/server";
import RBACSchema from "@/app/(backend)/models/administrator/RBAC/RBAC.modal.js"
export async function GET(request) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = {}
        for (const que of searchParams) {
            query[que[0]] = que[1];
        }
        const {
            page = 1,
            limit = 100,
            input_data,
        } = query;
        let que = {};

        if (input_data) {
            que.$or = [
                {
                    name: { $regex: input_data, $options: "i" },
                },
            ];
        }
        const totalDocs = await RBACSchema.find({ ...que }).countDocuments();
        const blogList = await RBACSchema.find({ ...que }).skip((page - 1) * limit).limit(limit).sort({ sort: -1 });
        return NextResponse.json({
            success: true,
            message: "Fetched Successfully",
            data: blogList,
            totalDocs: totalDocs
        }, {
            status: 200
        });
    } catch (error) {
        return errorHandler(error)
    }
}

export async function POST(request) {
    try {
        // Parse the request body
        const body = await request.json();

        // Destructure required fields from the request body
        const { name } = body;
        const requiredBody = { name };
        const isError = isrequired(requiredBody);
        if (isError.is_error) {
            throw new ErrorHandler(isError.message, isError.statusCode);
        }
        const { permissions, ...other } = body;
        // Create new RBAC entry in the database
        const rbac = await RBACSchema.create({
            ...body,
            isDeleteAble: false, // Ensure `isDeleteAble` is set to false
        });

        // Return a success response
        return NextResponse.json({
            success: true,
            message: "created"
        }, { status: 201 }); // 201 for resource creation

    } catch (error) {
        // Handle errors
        return errorHandler(error);
    }
}
