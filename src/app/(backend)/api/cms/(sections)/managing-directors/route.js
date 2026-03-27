import managing_directorsSchema from "@/app/(backend)/models/cms/(sections)/managing-directors/managing-directors.modal.js";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler, ErrorHandler } from "@/app/utils/db/errorhandler";
import { isExistThenAdd, isrequired } from "@/app/utils/db/validations.js";
import { DbValidator } from "@/app/utils/db/schema_validation/managing-directors.validation.js";
import { deleteImageIfError, getFileName } from "@/app/utils/db/upload_file.js";
import { NextResponse } from "next/server";


export const revalidate = 0;
export const dynamic = 'force-dynamic';

const FILE_PATH = "/file/managing-directors";

export async function GET(request) {
    try {
        await dbConnect();

        let data = await managing_directorsSchema.findOne(); // Populate all reference fields

        if (!data) {
            data = {};
        }

        return NextResponse.json({
            success: true,
            message: "Fetched Successfully",
            data: data
        }, {
            status: 200
        });
    } catch (error) {
        return errorHandler(error);
    }
}


export async function PUT(request) {
    const allUploadedImages = [];
    try {
        await dbConnect();

        const formData = await request.formData();
        const filesField = JSON.parse(formData.get("filesField") || "[]");
        const objectField = JSON.parse(formData.get("objectField") || "[]");
        const objToPush = {};
        const unsetToPush = {};

        await getFileName({ filesField, formData, objToPush, FILE_PATH, allUploadedImages });
        await isExistThenAdd({ objToPush, unsetToPush, formData, filesField, objectField });

        // Add validation based on DB schema
        const is_DbValidator = await DbValidator(objToPush);
        if (is_DbValidator.is_error) {
            await deleteImageIfError(allUploadedImages);
            throw new ErrorHandler(is_DbValidator.message, is_DbValidator.statusCode);
        }

        // Find the first record or create if doesn't exist
        let record = await managing_directorsSchema.findOne();

        if (record) {
            await managing_directorsSchema.findByIdAndUpdate(
                record._id,
                { ...objToPush, ...(Object.keys(unsetToPush).length > 0 ? { $unset: unsetToPush } : {}) },
                { new: true, runValidators: true }
            );

            return NextResponse.json({
                success: true,
                message: "Updated Successfully",
            }, {
                status: 200,
            });
        } else {
            // Create new record if none exists
            await managing_directorsSchema.create({ ...objToPush });
            return NextResponse.json({
                success: true,
                message: "Update Successfully",
            }, {
                status: 201,
            });
        }
    } catch (error) {
        await deleteImageIfError(allUploadedImages);
        return errorHandler(error);
    }
}
