import type { Metadata } from "next";
import { Inter, Noto_Naskh_Arabic } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const notoArabic = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  variable: "--font-ar",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Social Support Application",
  description: "Apply for financial assistance with guided steps and optional writing help.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${notoArabic.variable} min-h-screen bg-app-base font-sans text-app-text antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
