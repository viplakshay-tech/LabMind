import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import PageShell from "@/components/navigation/PageShell";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LabMind — Smart Laboratory",
  description:
    "AI-powered smart laboratory platform for engineering students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body suppressHydrationWarning>
  <PageShell>{children}</PageShell>
</body>
    </html>
  );
}