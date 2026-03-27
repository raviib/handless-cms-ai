import { ErrorHandler, errorHandler } from "@/app/utils/db/errorhandler";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const options = {
            expires: new Date(0), // Set to epoch time to clear cookie
            httpOnly: true,
            secure: true, // Always use secure for HTTPS
            sameSite: "lax",
            path: "/",
        };
        
        const response = NextResponse.json({
            message: "logout successful",
            success: true,
        });
        
        // Clear both access and refresh tokens
        response.cookies.set("token", "", options);
        response.cookies.set("refreshToken", "", options);
        
        return response;
    } catch (error) {
        return errorHandler(error)
    }
}