import enquire_nowSchema from "@/app/(backend)/models/leads/enquire-now/enquire-now.modal.js";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler, ErrorHandler } from "@/app/utils/db/errorhandler";
import { DbValidator } from "@/app/utils/db/schema_validation/enquire-now.validation.js";
import { NextResponse } from "next/server";
export async function POST(req) {
    try {
        const data = await req.json();

        await dbConnect();
        const is_DbValidator = await DbValidator(data);
        if (is_DbValidator.is_error) {
            throw new ErrorHandler(is_DbValidator.message, is_DbValidator.statusCode);
        }
        await enquire_nowSchema.create({ ...data });
        return NextResponse.json({
            success: true,
            message: "Enquiry submitted successfully",
        }, {
            status: 201,
        });

    } catch (error) {

        return errorHandler(error);
    }
}
