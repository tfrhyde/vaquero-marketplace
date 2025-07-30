import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vaquero Market",
  description: "A community-powered marketplace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100 text-black`}
      >
        <header className="bg-white shadow p-4 sticky top-0 z-10">
          <nav className="flex justify-between items-center max-w-6xl mx-auto">
            <div className="text-xl font-bold">
              <Link href="/">Vaquero Market</Link>
            </div>
            <div className="flex gap-4 text-sm font-medium">
              <Link href="/post" className="hover:underline">
                Post
              </Link>
              <Link href="/account" className="hover:underline">
                My Listings
              </Link>
              <Link href="/favorites" className="hover:underline">
                Bookmarks
              </Link>
              <Link href="/login" className="hover:underline">
                Login
              </Link>
              <Link href="/signup" className="hover:underline">
                Sign Up
              </Link>
            </div>
          </nav>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}