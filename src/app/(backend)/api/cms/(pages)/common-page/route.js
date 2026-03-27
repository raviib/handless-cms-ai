import common_pageSchema from "@/app/(backend)/models/cms/(pages)/common-page/common-page.modal.js";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler, ErrorHandler } from "@/app/utils/db/errorhandler";
import { isExistThenAdd } from "@/app/utils/db/validations.js";
import { DbValidator } from "@/app/utils/db/schema_validation/common-page.validation.js";
import { deleteImageIfError, getFileName } from "@/app/utils/db/upload_file.js";
import { buildAdvancedQuery } from "@/app/utils/usefullFunction/advancedQueryBuilder.js";
import { getFieldSelector } from "@/app/utils/db/fieldSelector";
import { NextResponse } from "next/server";
import { populateDynamicZone } from "@/app/utils/db/populateDynamicZone.js";
import mongoose from "mongoose";

export const revalidate = 0;
export const dynamic = 'force-dynamic';
const FILE_PATH = "/file/common-page";

export async function GET(request) {
    try {
        await dbConnect();
        const searchParams = request.nextUrl.searchParams;
        const { mongoQuery, regularQuery } = buildAdvancedQuery(searchParams);
        const { page = 1, limit = 25, input_data } = regularQuery;

        let que = { $or: [{ lang: "en" }, { lang: { $exists: false } }], ...mongoQuery };
        if (input_data) {
            const sc = { $or: [{ "displayName": { $regex: input_data, $options: "i" } }, { "name": { $regex: input_data, $options: "i" } }] };
            que.$and ? que.$and.push(sc) : (que = { ...que, ...sc });
        }

        const fieldSelector = getFieldSelector(searchParams);
        const totalDocs = await common_pageSchema.find({ ...que }).countDocuments();
        let data = await common_pageSchema.find({ ...que })
            .select(fieldSelector)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ sort: 1 })
            .populate({ path: "banner", select: "displayName _id" })
            .lean();

        // Populate dynamic zone relations
        data = await Promise.all(
            data.map(async (item) => {
                if (item.section && Array.isArray(item.section)) item.section = await populateDynamicZone(item.section, mongoose);
                return item;
            })
        );
        return NextResponse.json({ success: true, message: "Fetched Successfully", data, totalDocs }, { status: 200 });
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

        const lang = formData.get("locale") || "en";
        const rootId = formData.get("rootId");
        if (lang !== "en") {
            if (!rootId) throw new ErrorHandler("rootId is required for non-English translations", 400);
            const baseDoc = await common_pageSchema.findById(rootId);
            if (!baseDoc) throw new ErrorHandler("Base English document not found", 404);
            objToPush.lang = lang;
            objToPush.rootId = rootId;
        } else {
            objToPush.lang = "en";
        }

        const is_DbValidator = await DbValidator(objToPush);
        if (is_DbValidator.is_error) {
            await deleteImageIfError(allUploadedImages);
            throw new ErrorHandler(is_DbValidator.message, is_DbValidator.statusCode);
        }

        await common_pageSchema.create({ ...objToPush });
        return NextResponse.json({ success: true, message: "Created Successfully" }, { status: 201 });
    } catch (error) {
        await deleteImageIfError(allUploadedImages);
        return errorHandler(error);
    }
}
