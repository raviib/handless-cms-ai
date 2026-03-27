import career_enquireSchema from "@/app/(backend)/models/leads/career-enquire/career-enquire.modal.js";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler, ErrorHandler } from "@/app/utils/db/errorhandler";
import { DbValidator } from "@/app/utils/db/schema_validation/career-enquire.validation.js";
import { deleteImageIfError, getFileName } from "@/app/utils/db/upload_file.js";
import { isExistThenAdd } from "@/app/utils/db/validations.js";
import { NextResponse } from "next/server";

export const revalidate = 60;


const FILE_PATH = "/file/career-enquire";

export async function POST(request) {
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

        await career_enquireSchema.create({ ...objToPush });
        
        return NextResponse.json({
            success: true,
            message: "Created Successfully",
        }, {
            status: 201,
        });
    } catch (error) {
        await deleteImageIfError(allUploadedImages);
        return errorHandler(error);
    }
}
