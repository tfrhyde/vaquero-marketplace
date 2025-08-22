"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Header from "@/components/header";
import Link from "next/link";

// Type for a listing object
type Listing = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string | null;
  image_url: string | null;
  item_location: string | null;
  display_name: string | null;
  created_at: string;
};

export default function FavoritesPage() {
  const router = useRouter();
  // Local state
  const [loading, setLoading] = useState(true); // page loading
  const [bookmarks, setBookmarks] = useState<Listing[]>([]);  // users bookmarked listings
  const [error, setError] = useState<string | null>(null);  // error messages


  // Check session and fetch bookmarks
  useEffect(() => {
    (async () => {
      // Get logged-in user
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push("/"); //redirect to home if not logged in
        return;
      }

      // Query Bookmarks joined with Listings
      const { data, error } = await supabase
        .from("Bookmarks")
        .select("Listings(*)") // pull full listing details
        .eq("user_id", session.user.id);

      if (error) {
        setError(error.message);
      } else {
        // Flatten out Listings objects into array
        const listings = (data || [])
          .map((row: any) => row.Listings)
          .filter(Boolean);
        setBookmarks(listings);
      }

      setLoading(false);
    })();
  }, [router]);

  // Laoding status
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Loading bookmarks…</div>
      </div>
    );
  }

  // Render bookamrks page
  return (
    <>
      <Header />
      <main className="p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Bookmarks</h1>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {bookmarks.length === 0 ? (
          <p className="text-gray-600">You have no bookmarks yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition p-4"
              >
                <img
                  src={listing.image_url || "/placeholder.png"}
                  alt={listing.title}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
                <h2 className="text-lg font-semibold">{listing.title}</h2>
                <p className="text-gray-700 text-sm mb-2 line-clamp-2">
                  {listing.description}
                </p>
                <div className="text-orange-600 font-bold mb-3">
                  ${listing.price}
                </div>
                <Link
                  href={`/listing/${listing.id}`}
                  className="text-sm text-orange-600 hover:underline"
                >
                  View Details →
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
