import { NextResponse } from "next/server";
import { generateAccessToken, generateRefreshToken, getTokenExpiry } from "@/app/lib/auth.server";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    // Get refresh token from cookies
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { message: "No refresh token found" },
        { status: 401 }
      );
    }

    // Verify refresh token directly using jwt
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.NEXT_PUBLIC_JWT_SECRET_KEY);
    } catch (error) {
      return NextResponse.json(
        { message: "Invalid or expired refresh token" },
        { status: 401 }
      );
    }

    // Check if it's actually a refresh token
    if (!decoded || decoded.type !== 'refresh') {
      return NextResponse.json(
        { message: "Invalid refresh token type" },
        { status: 401 }
      );
    }

    // Generate new access token with compatible payload
    const newAccessToken = generateAccessToken({
      id: decoded.id || decoded.userId,           // Backward compatibility
      userId: decoded.userId || decoded.id,       // New format
      email: decoded.email,
    });

    if (!newAccessToken) {
      return NextResponse.json(
        { message: "Failed to generate new token" },
        { status: 500 }
      );
    }

    // Get token expiry
    const tokenExpiry = getTokenExpiry(newAccessToken);

    // Set new access token cookie
    const response = NextResponse.json({
      message: "Token refreshed successfully",
      tokenExpiry: tokenExpiry?.toISOString(),
    });

    // Set the new access token cookie
    response.cookies.set("token", newAccessToken, {
      httpOnly: true,
      secure: true, // Always use secure for HTTPS
      sameSite: "lax",
      expires: tokenExpiry,
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { message: "Token refresh failed" },
      { status: 500 }
    );
  }
}