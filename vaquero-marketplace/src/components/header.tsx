"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

// Reusable Header component for other pages.tsx
export default function Header() {
  const router = useRouter(); // router instance for navigation, ensures proper routing after logout

  // Handles the "Sign Out" click
  // Ask Supabase to end the current session (async network call)
  // After sign-out completes, send user to the homepage
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // Styling of navigation header
  return (
    <header className="w-full bg-white shadow-sm py-4 px-6 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* UTRGV logo */}
        <div className="flex items-center space-x-3">
          <img src="/UTRGV Logo.png" alt="UTRGV Logo" className="h-8 w-auto" />
          <Link href="/listing">
            <h1 className="text-2xl font-bold text-orange-600 hover:text-orange-700 transition cursor-pointer">
              Vaquero Market
            </h1>
          </Link>
        </div>

        {/* nagivation links*/}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-700">
          <Link href="/listing" className="hover:text-orange-600 transition">
            Marketplace
          </Link>
          <Link href="/post" className="hover:text-orange-600 transition">
            Post Listing
          </Link>
          <Link href="/favorites" className="hover:text-orange-600 transition">
            Bookmarks
          </Link>
          <Link href="/account" className="hover:text-orange-600 transition">
            My Account
          </Link>
        </nav>

        {/* sign out*/}
        <button
          onClick={handleSignOut}
          className="text-sm font-semibold text-red-600 hover:text-red-700 transition"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
