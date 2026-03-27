import jobs_openingSchema from "@/app/(backend)/models/cms/jobs-opening/jobs-opening.modal.js";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler, ErrorHandler } from "@/app/utils/db/errorhandler";
import { isExistThenAdd, isrequired } from "@/app/utils/db/validations.js";
import { DbValidator } from "@/app/utils/db/schema_validation/jobs-opening.validation.js";
import { deleteImageIfError, getFileName } from "@/app/utils/db/upload_file.js";
import { buildAdvancedQuery } from "@/app/utils/usefullFunction/advancedQueryBuilder.js";
import { getFieldSelector } from "@/app/utils/db/fieldSelector";
import { NextResponse } from "next/server";


export const revalidate = 0;
export const dynamic = 'force-dynamic';

const FILE_PATH = "/file/jobs-opening";

export async function GET(request) {
    try {
        await dbConnect();
        const searchParams = request.nextUrl.searchParams;
        
        // Build advanced query with filter support
        const { mongoQuery, regularQuery } = buildAdvancedQuery(searchParams);
        
        const {
            page = 1,
            limit = 25,
            input_data,
        } = regularQuery;
        
        let que = { ...mongoQuery };

        if (input_data) {
            const searchCondition = {
                $or: [
                {
                   "title": { $regex: input_data, $options: "i" },
                },
                {
                   "location": { $regex: input_data, $options: "i" },
                },
                {
                   "experience": { $regex: input_data, $options: "i" },
                },
                {
                   "positions": { $regex: input_data, $options: "i" },
                },
                {
                   "url": { $regex: input_data, $options: "i" },
                }
                ]
            };
            
            // Merge with existing query
            if (que.$and) {
                que.$and.push(searchCondition);
            } else {
                que = { ...que, ...searchCondition };
            }
        }
        
        // Get field selector from query params
        const fieldSelector = getFieldSelector(searchParams);
        
        const totalDocs = await jobs_openingSchema.find({ ...que }).countDocuments();
        let data = await jobs_openingSchema.find({ ...que })
            .select(fieldSelector)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ sort: 1 }); // Populate first-level relation fields

            
        return NextResponse.json({
            success: true,
            message: "Fetched Successfully",
            data: data,
            totalDocs: totalDocs
        }, {
            status: 200
        });
    } catch (error) {
        return errorHandler(error);
    }
}

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

        await jobs_openingSchema.create({ ...objToPush });
        
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
