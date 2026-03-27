import categorySchema from "@/app/(backend)/models/shop/category/category.modal.js";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler, ErrorHandler } from "@/app/utils/db/errorhandler";
import { isExistThenAdd, isrequired } from "@/app/utils/db/validations.js";
import { DbValidator } from "@/app/utils/db/schema_validation/category.validation.js";
import { deleteImageIfError, getFileName } from "@/app/utils/db/upload_file.js";
import { buildAdvancedQuery } from "@/app/utils/usefullFunction/advancedQueryBuilder.js";
import { getFieldSelector } from "@/app/utils/db/fieldSelector";
import { NextResponse } from "next/server";
import { populateDynamicZone } from "@/app/utils/db/populateDynamicZone.js";
import mongoose from "mongoose";


export const revalidate = 0;
export const dynamic = 'force-dynamic';

const FILE_PATH = "/file/category";

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
                   "about.title": { $regex: input_data, $options: "i" },
                },
                {
                   "about.heading": { $regex: input_data, $options: "i" },
                },
                {
                   "our_range.tag": { $regex: input_data, $options: "i" },
                },
                {
                   "our_range.title": { $regex: input_data, $options: "i" },
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
        
        const totalDocs = await categorySchema.find({ ...que }).countDocuments();
        let data = await categorySchema.find({ ...que })
            .select(fieldSelector)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ sort: 1 })
            .populate({ path: "banner", select: "displayName _id" })
            .lean(); // Populate first-level relation fields

        // Populate dynamic zone relations
        data = await Promise.all(
            data.map(async (item) => {
                if (item.section && Array.isArray(item.section)) {
                    item.section = await populateDynamicZone(item.section, mongoose);
                }
                return item;
            })
        );
            
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

        await categorySchema.create({ ...objToPush });
        
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
