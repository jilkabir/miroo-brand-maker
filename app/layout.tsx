import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Miroo Brand Maker",
  description:
    "Analyze a website and generate brand color ideas, voice direction, and social media content suggestions."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
