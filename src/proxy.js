import next from 'next';
import { NextResponse } from 'next/server'

async function fetchData(url, token) {
    try {
        const { value = null } = token;
        let myHeaders = new Headers();
        myHeaders.append("x-admin-token", value);
        let requestOptions = {
            method: "GET",
            headers: myHeaders,
            cache: "no-store",
        };
        const response = await fetch(url, requestOptions);

        if (!response.ok) {
            return null
        }
        return await response.json();
    } catch (error) {
        return null;
    }
}


export async function proxy(request) {
    try {
        const { pathname } = request.nextUrl;
        const isAdminRoute = /^\/admin\/.*/.test(pathname);
        const isV1ApiRoute = /^\/v1\/api\/.*/.test(pathname);

        const hasToken = request.cookies.has("token");
        const hasRefreshToken = request.cookies.has("refreshToken");
        const authToken = request.cookies.get("token");
        if (isAdminRoute) {
            // Check if user has access token
            if (hasToken) {
                const data = await fetchData(`${process.env.NEXT_PUBLIC_BACKEND_URL}/administrator/user/me`, authToken);

                // If access token is invalid, redirect to login (client will handle refresh)
                if (!data || !data?.user || !data?.user?.isActive) {
                    const response = NextResponse.redirect(new URL('/private/login', request.url));
                    response.cookies.delete("token");
                    response.cookies.delete("refreshToken");
                    return response;
                }
            } else if (hasRefreshToken) {
                // No access token but has refresh token - redirect to login page
                // The login page can check for refresh token and attempt refresh
                return NextResponse.redirect(new URL('/private/login', request.url));
            } else {
                // No tokens at all
                return NextResponse.redirect(new URL('/private/login', request.url));
            }
        }
        if (isV1ApiRoute) {
            const authHeader = request.headers.get("authorization");

            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return NextResponse.json(
                    { success: false, message: "Unauthorized: Bearer token missing", },
                    { status: 401 }
                );
            }
            const bearerToken = authHeader.split(" ")[1];
            if (bearerToken !== process.env.V1_SECRET_TOKEN) {
                return NextResponse.json(
                    { success: false, message: "Unauthorized: Invalid token" },
                    { status: 401 }
                );
            }
        }

        if (pathname === "/private/login") {
            if (hasToken) {
                const data = await fetchData(`${process.env.NEXT_PUBLIC_BACKEND_URL}/administrator/user/me`, authToken);
                if (data && data.user && data.user.isActive) {
                    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
                }
            }
        }
    } catch (error) {
        console.error('Proxy error:', error);
    }
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/private/login',
        '/v1/api/:path*',
        '/((?!img|!api|_next/static|_next/image|favicon.ico|favicon.ico).*)'
    ],
}