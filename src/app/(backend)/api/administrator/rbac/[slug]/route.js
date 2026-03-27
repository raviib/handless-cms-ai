import { NextResponse } from "next/server";
import RBACSchema from "@/app/(backend)/models/administrator/RBAC/RBAC.modal.js"
import { ErrorHandler, errorHandler } from "@/app/utils/db/errorhandler";
import { isrequired } from "@/app/utils/db/validations.js";

import { unstable_noStore as noStore } from 'next/cache';
export async function GET(request, { params }) {
    noStore();
    try {
        const { slug } = await params;
        let RBAC_Access = await RBACSchema.findById(slug)
            .populate("permissions.access_of")
            .select("-createdAt -_id -updatedAt -__v -isDeleteAble")
        RBAC_Access = RBAC_Access.toObject();
        RBAC_Access = {
            ...RBAC_Access,
            permissions: RBAC_Access.permissions.map((ele) => {

                return {
                    create: ele.create,
                    delete: ele.delete,
                    edit: ele.edit,
                    view: ele.view,
                    name: ele?.access_of?.name,
                    category: ele?.access_of?.category,
                    under: ele?.access_of?.under,
                    access_of: ele?.access_of?._id
                }
            })
        }
        return NextResponse.json({
            success: true,
            message: "Fetched Successfully",
            data: RBAC_Access,
        }, {
            status: 200
        });
    } catch (error) {
        return errorHandler(error)
    }
}
export async function PUT(request, { params }) {
    try {
        // Parse the request body
        const { slug } = await params;
        const body = await request.json();

        // Destructure required fields from the request body
        const { name } = body;
        const requiredBody = { name };
        const isError = isrequired(requiredBody);
        if (isError.is_error) {
            throw new ErrorHandler(isError.message, isError.statusCode);
        }
        const rbac = await RBACSchema.findByIdAndUpdate(slug, body);
        return NextResponse.json({
            success: true,
            message: "updated"
        }, { status: 200 });

    } catch (error) {
        // Handle errors
        return errorHandler(error);
    }
}
export async function DELETE(request, { params }) {
    try {
        const { slug } = await params;
        await RBACSchema.findByIdAndDelete(slug);
        return NextResponse.json({
            success: true,
            message: "delete successfully",
        }, {
            status: 200,
        });
    } catch (error) {
        return errorHandler(error)
    }
}