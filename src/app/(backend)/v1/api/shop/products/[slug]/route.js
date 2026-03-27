import productsSchema from "@/app/(backend)/models/shop/products/products.modal.js";
import brand_catalogueSchema from "@/app/(backend)/models/shop/brand-catalogue/brand-catalogue.modal.js";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler, ErrorHandler } from "@/app/utils/db/errorhandler";
import { buildAdvancedQuery } from "@/app/utils/usefullFunction/advancedQueryBuilder.js";
import { NextResponse } from "next/server";
import { getFieldSelector } from "@/app/utils/db/fieldSelector";
export const revalidate = 60;

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { slug } = await params;
        const searchParams = request.nextUrl.searchParams;
        const fieldSelector = getFieldSelector(searchParams);
        const { mongoQuery, regularQuery } = buildAdvancedQuery(searchParams);
        const { catalogue = "" } = regularQuery;
        let que = { ...mongoQuery };
        const catalogueData = await brand_catalogueSchema.findOne({ slug: catalogue, isActive: true }).select("_id");
        if (!catalogueData) {
            throw new ErrorHandler('catalogue not found', 404)
        }
        const data = await productsSchema.findOne({ slug: slug, catalogue: catalogueData._id, ...que }).select(fieldSelector)
            .populate({ path: "catalogue", match: { isActive: true }, select: { title: 1 } })
        if (!data) {
            throw new ErrorHandler('data not found', 404)
        }
        return NextResponse.json({
            success: true,
            message: "Fetched Successfully",
            data: data
        }, {
            status: 200
        });
    } catch (error) {
        return errorHandler(error);
    }
}
