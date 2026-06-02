import type { Metadata } from "next";
import { AnalyticsPageViews } from "@/components/AnalyticsPageViews";
import "./globals.css";

export const metadata: Metadata = {
  title: "World Cup Prediction Lab",
  description: "An explainable 2026 World Cup prediction model weekend project.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AnalyticsPageViews />
        {children}
      </body>
    </html>
  );
}
