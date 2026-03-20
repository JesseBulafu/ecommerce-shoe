import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import { NextFontWithVariable } from "next/dist/compiled/@next/font";
import ThemeProvider from "@/components/ThemeProvider";


const jost: NextFontWithVariable = Jost({ subsets: ["latin"], variable: "--font-jost" });

export const metadata: Metadata = {
  title: "Arstra — Premium Sneakers",
  description: "Premium Arstra sneakers — browse and shop the latest collection.",
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
      suppressHydrationWarning
    >
      
      <body className="min-h-full flex flex-col bg-light-100 text-dark-900 transition-colors duration-300">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
      
    </html>
  );
}
