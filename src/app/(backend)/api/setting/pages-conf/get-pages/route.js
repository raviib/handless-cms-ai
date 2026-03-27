import { NextResponse } from "next/server";
import pageConfSchema from "@/app/(backend)/models/setting/pages-conf/pages-conf.modal.js";
import { errorHandler } from "@/app/utils/db/errorhandler";

// Disable caching for this API route
export const revalidate = 0;
export async function GET() {
    try {
        const data = await pageConfSchema.find({}).select("name category under").sort("under");
        return NextResponse.json({
            success: true,
            message: "Fetched Successfully",
            data: data,
        });
    } catch (error) {
        return errorHandler(error)
    }
}

// export async function GET() {
//     try {
//         const data = await pageConfSchema.aggregate([

//             {
//                 $group: {
//                     _id: "$under", // Group by the "name" field
//                     values: {
//                         $push: {
//                             _id: "$_id", // Include only the _id
//                             name: "$name" // Include the name field
//                         }

//                     }
//                 }
//             }, {
//                 $project: {
//                     _id: 0, // Exclude the default _id field
//                     name: "$_id", // Rename _id to name
//                     values: 1 // Include the array_of_values field
//                 }
//             }
//         ])
//         return NextResponse.json({
//             success: true,
//             message: "Fetched Successfully",
//             data: data,
//         });
//     } catch (error) {
//         return errorHandler(error)
//     }
// }