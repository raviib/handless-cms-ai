import brand_catalogueSchema from "@/app/(backend)/models/shop/brand-catalogue/brand-catalogue.modal.js";
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
          "displayName": { $regex: input_data, $options: "i" },
        },
        {
          "title": { $regex: input_data, $options: "i" },
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
    let data = await brand_catalogueSchema.find({ ...que })
      .select("-_id -updatedAt -__v")
      .sort({ sort: 1 })
      .populate({ path: "brand", select: "displayName _id" })
      .populate({ path: "category", select: "name _id" })
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
      fileName: `brand-catalogue-list`
    });
  } catch (error) {
    return errorHandler(error);
  }
}
