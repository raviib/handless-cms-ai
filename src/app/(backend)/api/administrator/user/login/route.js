import userSchema from "@/app/(backend)/models/administrator/User";
import { isrequired } from "@/app/utils/db/validations";
import { ErrorHandler, errorHandler } from "@/app/utils/db/errorhandler";
import bcrypt from 'bcrypt';
import { NextResponse } from "next/server";
import { dbConnect } from "@/app/utils/db/connectDb";
import { generateAccessToken, generateRefreshToken, getTokenExpiry } from "@/app/lib/auth.server";

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request) {
    try {
        await dbConnect()
        const body = await request.json();
        const { email, password } = body;
        const isError = isrequired({ email, password });
        if (isError.is_error) {
            throw new ErrorHandler(isError.message, isError.statusCode);
        }
        const user = await userSchema.findOne({ email: email }).select('+password')
        if (!user) {
            throw new ErrorHandler(`Email not exist`, 404)
        }

        if (!user.isActive) {
            throw new ErrorHandler(`You don’t have access to log in. Please contact your administrator if you believe this is an error.`, 404)
        }

        const match = await bcrypt.compare(password, user.password);
        if (match) {
            // Generate both access and refresh tokens with compatible payload structure
            const accessToken = generateAccessToken({
                id: user._id,        // Keep 'id' for backward compatibility
                userId: user._id,    // Also include 'userId' for new system
                email: user.email,
                role: user.role,
            });
            const refreshToken = generateRefreshToken({
                id: user._id,        // Keep 'id' for backward compatibility
                userId: user._id,    // Also include 'userId' for new system
                email: user.email,
                role: user.role,
            });

            if (!accessToken || !refreshToken) {
                throw new ErrorHandler('Failed to generate tokens', 500);
            }

            // Get token expiry dates
            const accessTokenExpiry = getTokenExpiry(accessToken);
            const refreshTokenExpiry = getTokenExpiry(refreshToken);

            const { password, ...others } = user._doc;

            const response = NextResponse.json({
                message: "Login successful",
                success: true,
                data: others,
                tokenExpiry: accessTokenExpiry?.toISOString(),
                refreshTokenExpiry: refreshTokenExpiry?.toISOString(),
            });

            // Set access token cookie (15 minutes)
            response.cookies.set("token", accessToken, {
                httpOnly: true,
                secure: Boolean(process.env.NODE_ENV === "production"),
                sameSite: "lax",
                path: "/",
                expires: accessTokenExpiry,
            });

            // Set refresh token cookie (7 days)
            response.cookies.set("refreshToken", refreshToken, {
                httpOnly: true,
                secure: Boolean(process.env.NODE_ENV === "production"),
                sameSite: "lax",
                expires: refreshTokenExpiry,
            });

            return response;
        } else {
            throw new ErrorHandler(`passwords do not match`, 400)
        }
    } catch (error) {
        return errorHandler(error)
    }
}