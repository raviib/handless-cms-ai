import contact_us_pageSchema from "@/app/(backend)/models/cms/(pages)/contact-us-page/contact-us-page.modal.js";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler, ErrorHandler } from "@/app/utils/db/errorhandler";
import { isExistThenAdd, isrequired } from "@/app/utils/db/validations.js";
import { DbValidator } from "@/app/utils/db/schema_validation/contact-us-page.validation.js";
import { deleteImageIfError, getFileName } from "@/app/utils/db/upload_file.js";
import { getFieldSelector } from "@/app/utils/db/fieldSelector";
import { NextResponse } from "next/server";


export const revalidate = 0;
export const dynamic = 'force-dynamic';

const FILE_PATH = "/file/contact-us-page";

export async function GET(request) {
    try {
        await dbConnect();
        const searchParams = request.nextUrl.searchParams;
        
        // Get field selector from query params
        const fieldSelector = getFieldSelector(searchParams);

        let data = await contact_us_pageSchema.findOne()
            .select(fieldSelector)
            .populate({ path: "banner", select: "displayName _id" }); // Populate all reference fields

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
        let record = await contact_us_pageSchema.findOne();

        if (record) {
            await contact_us_pageSchema.findByIdAndUpdate(
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
            await contact_us_pageSchema.create({ ...objToPush });
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
