import about_us_pageSchema from "@/app/(backend)/models/cms/(pages)/about-us-page/about-us-page.modal.js";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler, ErrorHandler } from "@/app/utils/db/errorhandler";
import { isExistThenAdd } from "@/app/utils/db/validations.js";
import { DbValidator } from "@/app/utils/db/schema_validation/about-us-page.validation.js";
import { deleteImageIfError, getFileName } from "@/app/utils/db/upload_file.js";
import { getFieldSelector } from "@/app/utils/db/fieldSelector";
import { NextResponse } from "next/server";

export const revalidate = 0;
export const dynamic = 'force-dynamic';
const FILE_PATH = "/file/about-us-page";

async function getBaseDoc(fieldSelector) {
    let base = await about_us_pageSchema
        .findOne({ $or: [{ lang: "en" }, { lang: { $exists: false } }] })
        .select(fieldSelector)
            .populate({ path: "banner", select: "displayName _id" });
    if (!base) return null;
    if (!base.lang) {
        await about_us_pageSchema.findByIdAndUpdate(base._id, { $set: { lang: "en", rootId: base._id } });
        base.lang = "en";
        base.rootId = base._id;
    }
    return base;
}

export async function GET(request) {
    try {
        await dbConnect();
        const searchParams = request.nextUrl.searchParams;
        const lang = searchParams.get("lang") || "en";
        const fieldSelector = getFieldSelector(searchParams);
        const base = await getBaseDoc(fieldSelector);
        if (!base) return NextResponse.json({ success: true, message: "Fetched Successfully", data: {} }, { status: 200 });
        if (lang === "en") return NextResponse.json({ success: true, message: "Fetched Successfully", data: base }, { status: 200 });
        const rootId = base.rootId ?? base._id;
        const translation = await about_us_pageSchema.findOne({ rootId, lang }).select(fieldSelector)
            .populate({ path: "banner", select: "displayName _id" });
        return NextResponse.json({ success: true, message: "Fetched Successfully", data: translation ?? base, isFallback: !translation }, { status: 200 });
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
        const lang = formData.get("locale") || "en";
        const objToPush = {};
        const unsetToPush = {};

        await getFileName({ filesField, formData, objToPush, FILE_PATH, allUploadedImages });
        await isExistThenAdd({ objToPush, unsetToPush, formData, filesField, objectField });

        const is_DbValidator = await DbValidator(objToPush);
        if (is_DbValidator.is_error) {
            await deleteImageIfError(allUploadedImages);
            throw new ErrorHandler(is_DbValidator.message, is_DbValidator.statusCode);
        }

        const baseRecord = await getBaseDoc(null);

        if (lang === "en") {
            if (baseRecord) {
                await about_us_pageSchema.findByIdAndUpdate(
                    baseRecord._id,
                    { $set: { ...objToPush, lang: "en", rootId: baseRecord._id }, ...(Object.keys(unsetToPush).length > 0 ? { $unset: unsetToPush } : {}) },
                    { new: true, runValidators: true }
                );
                return NextResponse.json({ success: true, message: "Updated Successfully" }, { status: 200 });
            } else {
                await about_us_pageSchema.create({ ...objToPush, lang: "en" });
                return NextResponse.json({ success: true, message: "Created Successfully" }, { status: 201 });
            }
        }

        if (!baseRecord) throw new ErrorHandler("Save the English version first before adding translations.", 400);
        const rootId = baseRecord.rootId ?? baseRecord._id;
        const translation = await about_us_pageSchema.findOne({ rootId, lang });
        if (translation) {
            await about_us_pageSchema.findByIdAndUpdate(
                translation._id,
                { $set: objToPush, ...(Object.keys(unsetToPush).length > 0 ? { $unset: unsetToPush } : {}) },
                { new: true }
            );
            return NextResponse.json({ success: true, message: "Translation Updated Successfully" }, { status: 200 });
        } else {
            await about_us_pageSchema.create({ ...objToPush, lang, rootId });
            return NextResponse.json({ success: true, message: "Translation Created Successfully" }, { status: 201 });
        }
    } catch (error) {
        await deleteImageIfError(allUploadedImages);
        return errorHandler(error);
    }
}
