import type { Metadata } from "next";
import { AnalyticsPageViews } from "@/components/AnalyticsPageViews";
import "./globals.css";

export const metadata: Metadata = {
  title: "World Cup Lab",
  description:
    "An open-source project exploring World Cup history, current team form, and the data behind football rankings.",
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
