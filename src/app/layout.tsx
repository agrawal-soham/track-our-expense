import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrackOurExpense — Smart Group Trip Expense Splitter",
  description: "Track, split, and settle group trip expenses seamlessly with real-time math, timeline views, and peer approval settlements.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TrackOurExpense",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
