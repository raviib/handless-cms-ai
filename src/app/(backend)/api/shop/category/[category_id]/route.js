import categorySchema from "@/app/(backend)/models/shop/category/category.modal.js";
import { dbConnect } from "@/app/utils/db/connectDb";
import { ErrorHandler, errorHandler } from "@/app/utils/db/errorhandler";
import { DbValidator } from "@/app/utils/db/schema_validation/category.validation.js";
import { deleteImage, deleteImageIfError, deleteSelectedImages, getFileName } from "@/app/utils/db/upload_file.js";
import { isExistThenAdd, isrequired } from "@/app/utils/db/validations.js";
import { NextResponse } from "next/server";
import { populateDynamicZone } from "@/app/utils/db/populateDynamicZone.js";
import mongoose from "mongoose";


export const revalidate = 0;
export const dynamic = 'force-dynamic';

const FILE_PATH = "/file/category";

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { category_id } = await params;
        let data = await categorySchema.findById(category_id)
            .populate({ path: "banner", select: "displayName _id" })
            .lean();

        if (!data) {
            throw new ErrorHandler("Data not found", 404);
        }

        // Populate dynamic zone relations
        if (data.section && Array.isArray(data.section)) {
            data.section = await populateDynamicZone(data.section, mongoose);
        }

        return NextResponse.json({
            success: true,
            message: "Fetched Successfully",
            data: data
        });
    } catch (error) {
        return errorHandler(error);
    }
}

export async function PUT(request, { params }) {
    const allUploadedImages = [];
    try {
        await dbConnect();
        const { category_id } = await params;
        const formData = await request.formData();
        const filesField = JSON.parse(formData.get("filesField") || "[]");
        const objectField = JSON.parse(formData.get("objectField") || "[]");
        const deleteMultyImages = JSON.parse(formData.get("deleteMultyImages") || "[]");
        const deleteSingleImageList = JSON.parse(formData.get("deleteSingleImageList") || "[]");

        const objToPush = {};
        const unsetToPush = {};

        await getFileName({ filesField, formData, objToPush, FILE_PATH, allUploadedImages });
        await isExistThenAdd({ objToPush, unsetToPush, formData, filesField, objectField });

        const is_DbValidator = await DbValidator(objToPush);
        if (is_DbValidator.is_error) {
            await deleteImageIfError(allUploadedImages);
            throw new ErrorHandler(is_DbValidator.message, is_DbValidator.statusCode);
        }

        const data = await categorySchema.findByIdAndUpdate(
            category_id,
            { $set: objToPush, $unset: unsetToPush },
            { new: true }
        );

        if (!data) {
            await deleteImageIfError(allUploadedImages);
            throw new ErrorHandler("Data not found", 404);
        }

        await deleteSelectedImages(deleteMultyImages);
        await deleteImage(deleteSingleImageList);

        return NextResponse.json({
            success: true,
            message: "Updated Successfully",
            data: data
        });
    } catch (error) {
        await deleteImageIfError(allUploadedImages);
        return errorHandler(error);
    }
}

export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        const { category_id } = await params;
        const data = await categorySchema.findByIdAndDelete(category_id);

        if (!data) {
            throw new ErrorHandler("Data not found", 404);
        }

        return NextResponse.json({
            success: true,
            message: "Deleted Successfully"
        });
    } catch (error) {
        return errorHandler(error);
    }
}
