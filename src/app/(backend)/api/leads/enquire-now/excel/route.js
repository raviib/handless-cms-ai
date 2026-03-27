import enquire_nowSchema from "@/app/(backend)/models/leads/enquire-now/enquire-now.modal.js";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler } from "@/app/utils/db/errorhandler";
import { NextResponse } from "next/server";
import { buildAdvancedQuery } from "@/app/utils/usefullFunction/advancedQueryBuilder.js"

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const { mongoQuery, regularQuery } = buildAdvancedQuery(searchParams);
    const { input_data } = regularQuery;

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
      if (que.$and) {
        que.$and.push(searchCondition);
      } else {
        que = { ...que, ...searchCondition };
      }
    }

    await dbConnect();
    let data = await enquire_nowSchema.find({ ...que })
      .select("-_id -updatedAt -__v")
      .sort({ sort: 1 })
      .populate({ path: "product", select: "name _id" })
      .lean();

    let KeyArray = [];
    data = data.map((ele, index) => {
      if (index === 0) KeyArray = Object.keys(ele);
      return { ...ele };
    });

    return NextResponse.json({
      success: true,
      message: "Fetched Successfully",
      excelData: data,
      KeyArray: KeyArray,
      fileName: `enquire-now-list`
    });
  } catch (error) {
    return errorHandler(error);
  }
}
