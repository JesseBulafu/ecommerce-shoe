import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import { NextFontWithVariable } from "next/dist/compiled/@next/font";


const jost: NextFontWithVariable = Jost({ subsets: ["latin"], variable: "--font-jost" });

export const metadata: Metadata = {
  title: "Ecommerce Shoe Store",
  description: "Premium Nike sneakers — browse and shop the latest collection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jost.variable} h-full antialiased`}
    >
      
      <body className="min-h-full flex flex-col">{children}</body>
      
    </html>
  );
}
