import formFieldSchema from "@/app/(backend)/models/setting/formFields/form.field.js";
import { NextResponse } from "next/server";
import { errorHandler } from "@/app/utils/db/errorhandler";
export async function GET(request) {
    try {
        const data = await formFieldSchema.find({}).select({ name: 1, _id: 0 }).lean()

        const DB_FIELDS = data.map((ele => {
            return { value: ele.name, label: ele.name }
        }))
        return NextResponse.json({
            success: true,
            data: DB_FIELDS,
        }, {
            status: 200,
        });
    } catch (error) {
        return errorHandler(error)
    }
}