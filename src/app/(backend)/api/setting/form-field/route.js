import formFieldSchema from "@/app/(backend)/models/setting/formFields/form.field.js";
import { ErrorHandler, errorHandler } from "@/app/utils/db/errorhandler";
import { isrequired } from "@/app/utils/db/validations.js";
import { NextResponse } from "next/server";
import { isValidVariableName } from '@/app/utils/db/validations';
export async function GET(request) {

    try {
        const searchParams = request.nextUrl.searchParams;
        const query = {}
        for (const que of searchParams) {
            query[que[0]] = que[1];
        }
        const {
            page = 1,
            limit = 100,
            input_data,
        } = query;
        let que = {};

        if (input_data) {
            que.$or = [
                {
                    name: { $regex: input_data, $options: "i" },
                }
            ];
        }
        const totalDocs = await formFieldSchema
            .find({ ...que })
            .countDocuments();
        const Fields = await formFieldSchema.find({ ...que }).skip((page - 1) * limit)
            .limit(limit)
            .sort({ sort: -1 });
        return NextResponse.json({
            success: true,
            message: "Fetched Successfully",
            data: Fields,
            totalDocs: totalDocs
        }, {
            status: 200
        });
    } catch (error) {
        return errorHandler(error)
    }
}

export async function POST(request) {
    try {
        const formData = await request.json();
        const {
            name
        } = formData;
        if (!isValidVariableName(name)) {
            throw new ErrorHandler(`${name} Not an Valid field`, 400)
        }
        const required_body = { name };
        const isError = isrequired(required_body);
        if (isError.is_error) {
            throw new ErrorHandler(isError.message, isError.statusCode)
        }
        await formFieldSchema.create({
            name
        });

        return NextResponse.json({
            success: true,
            message: "created",
        }, {
            status: 201,
        });
    } catch (error) {
        return errorHandler(error)
    }
}