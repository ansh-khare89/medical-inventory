import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { MainLayoutShell } from "@/components/MainLayoutShell";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Shiva Agro",
  description: "Modern, fast, responsive Inventory Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 min-h-screen flex text-slate-900`}
      >
        <MainLayoutShell>{children}</MainLayoutShell>
        <Toaster />
      </body>
    </html>
  );
}
