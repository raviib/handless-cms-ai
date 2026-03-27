import enquire_nowSchema from "@/app/(backend)/models/leads/enquire-now/enquire-now.modal.js";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler, ErrorHandler } from "@/app/utils/db/errorhandler";
import { isExistThenAdd, isrequired } from "@/app/utils/db/validations.js";
import { DbValidator } from "@/app/utils/db/schema_validation/enquire-now.validation.js";
import { deleteImageIfError, getFileName } from "@/app/utils/db/upload_file.js";
import { buildAdvancedQuery } from "@/app/utils/usefullFunction/advancedQueryBuilder.js";
import { getFieldSelector } from "@/app/utils/db/fieldSelector";
import { NextResponse } from "next/server";


export const revalidate = 0;
export const dynamic = 'force-dynamic';

const FILE_PATH = "/file/enquire-now";

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
                   "name": { $regex: input_data, $options: "i" },
                },
                {
                   "email": { $regex: input_data, $options: "i" },
                },
                {
                   "phone": { $regex: input_data, $options: "i" },
                },
                {
                   "city": { $regex: input_data, $options: "i" },
                },
                {
                   "pageUrl": { $regex: input_data, $options: "i" },
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
        
        const totalDocs = await enquire_nowSchema.find({ ...que }).countDocuments();
        let data = await enquire_nowSchema.find({ ...que })
            .select(fieldSelector)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ sort: 1 })
            .populate({ path: "product", select: "name _id" }); // Populate first-level relation fields

            
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

        await enquire_nowSchema.create({ ...objToPush });
        
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
