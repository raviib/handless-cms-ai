import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    // Generate API access token (for external APIs)
    const token = jwt.sign(
      { 
        from: "Admin Dashboard",
        type: 'api',
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.NEXT_PUBLIC_JWT_SECRET_KEY,
      { 
        expiresIn: '30s', // 30 seconds for API calls
        algorithm: 'HS256'
      }
    );

    return NextResponse.json({
      success: true,
      token: token
    });

  } catch (error) {
    console.error('Error generating API access token:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate token'
    }, { status: 500 });
  }
}