"use client";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import { CssBaseline, ThemeProvider } from "@mui/material";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import { Roboto } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import React from "react";

import theme from "@/lib/theme";

const roboto = Roboto({
    weight: ["300", "400", "500", "700"],
    subsets: ["latin"],
    display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="no" className={roboto.className}>
            <InitColorSchemeScript />

            <ThemeProvider theme={theme} defaultMode={"system"}>
                <CssBaseline enableColorScheme />
                <UserProvider>
                    <NuqsAdapter>
                        <body>{children}</body>
                    </NuqsAdapter>
                </UserProvider>
            </ThemeProvider>
        </html>
    );
}
