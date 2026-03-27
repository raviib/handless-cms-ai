import userSchema from "@/app/(backend)/models/administrator/User";
import { ErrorHandler, errorHandler } from "@/app/utils/db/errorhandler";
import { deleteImage, deleteImageIfError, deleteSelectedImages, getFileName } from "@/app/utils/db/upload_file.js";
import { isExistThenAdd, isrequired } from "@/app/utils/db/validations.js";
import { unstable_noStore as noStore } from 'next/cache';
import { NextResponse } from "next/server";
const FILE_PATH = "/file/employee"
export async function GET(request, { params }) {
    noStore();
    try {
        const { slug } = await params;
        const brand_data = await userSchema.findById(slug).populate({
            path: 'role',
            select: 'name _id'
        }).select("-createdAt -_id -updatedAt -__v ")
        return NextResponse.json({
            success: true,
            message: "Fetched Successfully",
            data: brand_data,
        }, {
            status: 200
        });
    } catch (error) {

        return errorHandler(error)
    }
}
export async function PUT(request, { params }) {
    const image_his = []
    const allUploadedImages = []
    try {
        const { slug } = await params;
        // const middleware_validation = await AdminVerifyTokenMiddleWare(request)
        // if (middleware_validation.is_error) {
        //     throw new ErrorHandler(middleware_validation.message, middleware_validation.statusCode)
        // }
        // const { _id: author } = middleware_validation;
        const formData = await request.formData();
        const filesField = JSON.parse(formData.get("filesField"))
        const objectField = JSON.parse(formData.get("objectField"))
        const objToPush = {}
        const unsetToPush = {}
        const deleteSingleImageList = JSON.parse(formData.get("deleteSingleImageList"))
        const deleteMultyImages = JSON.parse(formData.get("deleteMultyImages")) ?? {}
        const imageSingleFields = deleteSingleImageList.reduce((acc, cur) => {
            return {
                ...acc,
                [cur]: ""
            }
        }, {})
        await getFileName({ filesField, formData, objToPush, FILE_PATH, image_his, allUploadedImages })
        await isExistThenAdd({ objToPush, unsetToPush, formData, filesField, objectField })
        const { f_name, phone_no, email, pic, l_name = "", role } = objToPush
        let required_body = { f_name, phone_no, email, role }
        const is_required = isrequired(required_body);
        if (is_required.is_error) {
            throw new ErrorHandler(is_required.message, is_required.statusCode)
        }
        for (const key in deleteMultyImages) {
            if (Object.prototype.hasOwnProperty.call(deleteMultyImages, key)) {
                const data = deleteMultyImages[key];
                const { set } = data;
                objToPush[key] = set
            }
        }
        const { password, ...restObj } = objToPush

        const data = await userSchema.findByIdAndUpdate(slug, {
            $set: restObj,
            $unset: {
                ...imageSingleFields,
                ...unsetToPush
            }
        });
        await deleteImage(data, [...image_his, ...deleteSingleImageList])
        await deleteSelectedImages(deleteMultyImages)
        return NextResponse.json({
            success: true,
            message: "edit successfully",
        }, {
            status: 200,
        });
    } catch (error) {
        await deleteImageIfError(allUploadedImages);
        return errorHandler(error)
    }
}
export async function DELETE(request, { params }) {
    try {
        const { slug } = await params;
        const data = await userSchema.findByIdAndDelete(slug);
        await deleteImage(data, ["image"])
        return NextResponse.json({
            success: true,
            message: "delete successfully",
        }, {
            status: 200,
        });
    } catch (error) {
        return errorHandler(error)
    }
}