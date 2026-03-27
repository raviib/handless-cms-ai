

import { NextResponse } from "next/server";
import userSchema from "@/app/(backend)/models/administrator/User";
import { isrequired, isExistThenAdd } from "@/app/utils/db/validations";
import { ErrorHandler, errorHandler } from "@/app/utils/db/errorhandler";
import { dbConnect } from "@/app/utils/db/connectDb";
import { deleteImageIfError, getFileName } from "@/app/utils/db/upload_file.js";
import { AdminVerifyTokenMiddleWare } from "@/app/utils/db/token_validation";
const FILE_PATH = "/file/employee"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = {};
    for (const que of searchParams) {
      query[que[0]] = que[1];
    }
    const { input_data, page = 1, limit = 15, } = query;
    let que = {};
    if (input_data) {
      que.$or = [
        {
          f_name: { $regex: input_data, $options: "i" },
        },
        {
          l_name: { $regex: input_data, $options: "i" },
        },
        {
          email: { $regex: input_data, $options: "i" },
        },
      ];
    }
    await dbConnect()
    const middleware_validation = await AdminVerifyTokenMiddleWare(request)
    const { _id } = middleware_validation;
    const totalDocs = await userSchema
      .find({
        _id: {
          $ne: _id
        },
        dev_mode: false, ...que
      })
      .countDocuments();
    const user = await userSchema.find({
      _id: {
        $ne: _id
      },
      dev_mode: false,
      ...que
    }).skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 }).lean();
    return NextResponse.json({
      success: true,
      message: "Fetched Successfully",
      data: user,
      totalDocs: totalDocs
    });
  } catch (error) {
    return errorHandler(error)
  }
}

export async function POST(request) {
  const image_his = []
  const allUploadedImages = []
  try {
    await dbConnect()
    const formData = await request.formData();
    const filesField = JSON.parse(formData.get("filesField"))
    const objectField = JSON.parse(formData.get("objectField"))
    const objToPush = {}
    const unsetToPush = {}
    await getFileName({ filesField, formData, objToPush, FILE_PATH, image_his, allUploadedImages })
    await isExistThenAdd({ objToPush, unsetToPush, formData, filesField, objectField })
    const { f_name, phone_no, email, pic, l_name = "", role } = objToPush
    let required_body = { f_name, phone_no, email, role }
    const isError = isrequired(required_body);
    if (isError.is_error) {
      throw new ErrorHandler(isError.message, isError.statusCode)
    }
    const data = await userSchema.create({ f_name, l_name, phone_no, email, password: `${f_name}@setup`, role: role._id },);
    return NextResponse.json({
      success: true,
      message: "user created",
      data
    }, {
      status: 201,
    });
  } catch (error) {
    await deleteImageIfError(allUploadedImages);
    return errorHandler(error)
  }
}

export async function PUT(request) {
  try {

    return NextResponse.json();
  } catch (error) {
    return NextResponse.json(error.message, {
      status: 400,
    });
  }
}

export async function DELETE(request) {
  try {
    return NextResponse.json({});
  } catch (error) {
    return NextResponse.json(error.message, {
      status: 400,
    });
  }
}