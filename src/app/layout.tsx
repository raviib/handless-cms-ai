import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"
import StoreProvider from "@/app/store/Provider.jsx"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Admin Panel",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet" />
                <link rel="icon" type="image/ico" href="/favicon.ico" />
            </head>
            <body className={inter.className}>
                <StoreProvider>
                    {children}
                </StoreProvider>
            </body>
        </html>
    );
}

export const dynamic = 'force-dynamic'
export const revalidate = 0
