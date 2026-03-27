import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken'
import { ErrorHandler, errorHandler } from "@/app/utils/db/errorhandler";
export async function GET(request) {

    try {
        let token;

        if (request.headers.get("x-api-token")) {
            token = request.headers.get("x-api-token") ?? null;
        }
        if (!token) {
            throw new ErrorHandler(`Token Not Provide`, 401);
        }
        token = token.split(" ")[1]
        const data = jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET_KEY, {
            algorithm: 'HS256'
        });
        return NextResponse.json({
            success: true,
        }, {
            status: 200,
        });
    } catch (error) {

        return errorHandler(error)
    }

}