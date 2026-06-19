import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "AXXEL — Digit Sum Trading",
  description:
    "A real-time 6-player multiplayer trading game. Trade contracts on the unknown sum of a secret 6-digit number revealed one digit at a time.",
  keywords: ["trading", "game", "multiplayer", "digit sum", "AXXEL"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
