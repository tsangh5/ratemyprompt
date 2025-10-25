import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Suspense } from "react";
import { Providers } from "./providers";
import { Header } from "@/components/Header";
import { LoadingBar } from "@/components/LoadingBar";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rate My Prompt - Share and Rate AI Prompts",
  description: "A community platform for sharing and rating AI prompts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${instrumentSans.variable} font-sans antialiased`}
        >
          <Providers>
            <Suspense fallback={null}>
              <LoadingBar />
            </Suspense>
            <Header />
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
