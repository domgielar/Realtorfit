import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz"],
  weight: "variable",
});

export const metadata: Metadata = {
  title: "RealtorFit — Find the realtor that fits you",
  description:
    "Match with realtors based on your budget, goals, and style — not just location.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[--color-paper] text-[--color-ink]">
        {children}
      </body>
    </html>
  );
}
