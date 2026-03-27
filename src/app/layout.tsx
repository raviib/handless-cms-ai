import type { Metadata } from "next";
import { Inter, League_Spartan } from "next/font/google";
import "./globals.css"
import StoreProvider from "@/app/store/Provider.jsx"

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const leagueSpartan = League_Spartan({
    subsets: ["latin"],
    variable: "--font-league-spartan",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Admin Panel",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${inter.variable} ${leagueSpartan.variable}`}>
            <head>
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
