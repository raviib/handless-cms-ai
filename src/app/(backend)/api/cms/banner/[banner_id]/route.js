import bannerSchema from "@/app/(backend)/models/cms/banner/banner.modal.js";
import { dbConnect } from "@/app/utils/db/connectDb";
import { ErrorHandler, errorHandler } from "@/app/utils/db/errorhandler";
import { DbValidator } from "@/app/utils/db/schema_validation/banner.validation.js";
import { deleteImage, deleteImageIfError, deleteSelectedImages, getFileName } from "@/app/utils/db/upload_file.js";
import { isExistThenAdd } from "@/app/utils/db/validations.js";
import { syncLocaleFields } from "@/app/utils/db/syncLocaleFields.js";
import { NextResponse } from "next/server";

export const revalidate = 0;
export const dynamic = 'force-dynamic';
const FILE_PATH = "/file/banner";
const SHARED_FIELDS = ["sort","isActive"];

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { banner_id } = await params;
        const lang = request.nextUrl.searchParams.get("lang") || "en";

        let baseDoc = await bannerSchema.findById(banner_id);
        if (!baseDoc) throw new ErrorHandler("Data not found", 404);

        if (!baseDoc.lang) {
            await bannerSchema.findByIdAndUpdate(baseDoc._id, { $set: { lang: "en", rootId: baseDoc._id } });
            baseDoc.lang = "en";
            baseDoc.rootId = baseDoc._id;
        }

        if (lang === "en") return NextResponse.json({ success: true, message: "Fetched Successfully", data: baseDoc });

        const rootId = baseDoc.rootId ?? baseDoc._id;
        let translation = await bannerSchema.findOne({ rootId, lang });
        return NextResponse.json({ success: true, message: "Fetched Successfully", data: translation ?? baseDoc, isFallback: !translation });
    } catch (error) {
        return errorHandler(error);
    }
}

export async function PUT(request, { params }) {
    const allUploadedImages = [];
    try {
        await dbConnect();
        const { banner_id } = await params;
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

        const lang = formData.get("locale") || "en";
        let targetId = banner_id;

        if (lang !== "en") {
            let baseDoc = await bannerSchema.findById(banner_id);
            if (!baseDoc) throw new ErrorHandler("Base document not found", 404);
            if (!baseDoc.lang) {
                await bannerSchema.findByIdAndUpdate(baseDoc._id, { $set: { lang: "en", rootId: baseDoc._id } });
                baseDoc.lang = "en";
                baseDoc.rootId = baseDoc._id;
            }
            const rootId = baseDoc.rootId ?? baseDoc._id;
            const translation = await bannerSchema.findOne({ rootId, lang });
            if (translation) {
                targetId = translation._id;
            } else {
                await bannerSchema.create({ ...objToPush, lang, rootId });
                return NextResponse.json({ success: true, message: "Translation Created Successfully" });
            }
        }

        const data = await bannerSchema.findByIdAndUpdate(targetId, { $set: objToPush, $unset: unsetToPush }, { new: true });
        if (!data) { await deleteImageIfError(allUploadedImages); throw new ErrorHandler("Data not found", 404); }

        await syncLocaleFields(bannerSchema, targetId, objToPush, SHARED_FIELDS);
        await deleteSelectedImages(deleteMultyImages);
        await deleteImage(deleteSingleImageList);

        return NextResponse.json({ success: true, message: "Updated Successfully", data });
    } catch (error) {
        await deleteImageIfError(allUploadedImages);
        return errorHandler(error);
    }
}

export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        const { banner_id } = await params;
        const data = await bannerSchema.findByIdAndDelete(banner_id);
        if (!data) throw new ErrorHandler("Data not found", 404);
        return NextResponse.json({ success: true, message: "Deleted Successfully" });
    } catch (error) {
        return errorHandler(error);
    }
}
