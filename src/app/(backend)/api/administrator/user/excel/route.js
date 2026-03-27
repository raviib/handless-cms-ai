

import userSchema from "@/app/(backend)/models/administrator/User";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler } from "@/app/utils/db/errorhandler";
import { NextResponse } from "next/server";
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
        let leads = await userSchema.find({
 
            dev_mode: false,
            ...que
        }).populate({
            path: 'role',
            select: "name -_id"
        }).select("-_id -updatedAt -__v -pic -password -dev_mode -isActive").sort({ createdAt: -1 }).lean();

        let KeyArray = []
        leads = leads.map((ele, index) => {
            if (index === 1) {
                KeyArray = Object.keys(ele).filter(ele => ele !== "country_code")
            }
            return {
                ...ele,
                role: `${ele.role.name}`,
            }
        })
      
        return NextResponse.json({
            success: true,
            message: "Fetched Successfully",
            excelData: leads,
            KeyArray: KeyArray,
            fileName: `employee-list`
        });
    } catch (error) {
   
        return errorHandler(error)
    }
}