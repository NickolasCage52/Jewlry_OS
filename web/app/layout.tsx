import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";

const fontDisplay = Cormorant_Garamond({
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "cyrillic"],
});

const fontBody = Jost({
  variable: "--font-body",
  weight: ["300", "400", "500", "600"],
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Ювелирный бизнес — операционная система",
  description: "Операционная система ювелирного бизнеса",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${fontDisplay.variable} ${fontBody.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
