import brand_catalogueSchema from "@/app/(backend)/models/shop/brand-catalogue/brand-catalogue.modal.js";
import { dbConnect } from "@/app/utils/db/connectDb";
import { ErrorHandler, errorHandler } from "@/app/utils/db/errorhandler";
import { DbValidator } from "@/app/utils/db/schema_validation/brand-catalogue.validation.js";
import { deleteImage, deleteImageIfError, deleteSelectedImages, getFileName } from "@/app/utils/db/upload_file.js";
import { isExistThenAdd, isrequired } from "@/app/utils/db/validations.js";
import { NextResponse } from "next/server";


export const revalidate = 0;
export const dynamic = 'force-dynamic';

const FILE_PATH = "/file/brand-catalogue";

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { brand_catalogue_id } = await params;
        let data = await brand_catalogueSchema.findById(brand_catalogue_id)
            .populate({ path: "brand", select: "displayName _id" })
            .populate({ path: "category", select: "name _id" });

        if (!data) {
            throw new ErrorHandler("Data not found", 404);
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
        const { brand_catalogue_id } = await params;
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

        const data = await brand_catalogueSchema.findByIdAndUpdate(
            brand_catalogue_id,
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
        const { brand_catalogue_id } = await params;
        const data = await brand_catalogueSchema.findByIdAndDelete(brand_catalogue_id);

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
