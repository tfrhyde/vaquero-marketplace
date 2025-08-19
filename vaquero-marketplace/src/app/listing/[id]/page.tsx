"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Header from "@/components/header";
import Link from "next/link";

type Listing = {
  id: string;
  user_id: string;
  display_name: string | null;
  title: string;
  description: string | null;
  price: number;
  category: string | null;
  image_url: string | null;
  item_location: string | null;
  sold: boolean;
  created_at: string;
};

export default function ListingDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [listing, setListing] = useState<Listing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [bookmarking, setBookmarking] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false); //track state


  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push("/");
        return;
      }
      setIsAuthenticated(true);
      setUserId(session.user.id);


      const { data, error } = await supabase
        .from("Listings")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setListing(data as Listing);
      }

      if (session.user.id && params.id) {
        const { data: bm } = await supabase
          .from("Bookmarks")
          .select("id")
          .eq("user_id", session.user.id)
          .eq("listing_id", params.id)
          .single();
        setIsBookmarked(!!bm);
      }

      setLoading(false);
    })();
  }, [params.id, router]);


  const handleBookmark = async () => {
    if (!userId || !listing) return;
  
    setBookmarking(true);
    try {
      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from("Bookmarks")
          .delete()
          .eq("user_id", userId)
          .eq("listing_id", listing.id);

        if (error) {
          alert(`Error removing bookmark: ${error.message}`);
        } else {
          setIsBookmarked(false);
        }
      } else {
        // Add bookmark
        const { error } = await supabase
          .from("Bookmarks")
          .insert([{ user_id: userId, listing_id: listing.id }]);

        if (error) {
          alert(`Error bookmarking: ${error.message}`);
        } else {
          setIsBookmarked(true);
        }
      }
    } finally {
      setBookmarking(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Loading listing…</div>
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (error || !listing) {
    return (
      <>
        <Header />
        <main className="p-8 max-w-6xl mx-auto">
          <p className="text-red-600">
            Could not load listing: {error ?? "Not found."}
          </p>
          <Link
            href="/listing"
            className="text-orange-600 underline mt-4 inline-block"
          >
            ← Back to Marketplace
          </Link>
        </main>
      </>
    );
  }

  const isEmail = listing.display_name && listing.display_name.includes("@");
  const sellerEmail = isEmail ? listing.display_name : null;
  const subject = `Inquiry about "${listing.title}"`;
  const body = `Hi,\n\nI'm interested in your listing "${listing.title}". Is it still available?\n\nThanks!`;
  const mailtoHref = sellerEmail
    ? `mailto:${sellerEmail}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`
    : undefined;

  return (
    <>
      <Header />
      <main className="p-8 max-w-6xl mx-auto">
        <Link
          href="/listing"
          className="text-orange-600 underline mb-4 inline-block"
        >
          ← Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <img
              src={listing.image_url || "/placeholder.png"}
              alt={listing.title}
              className="w-full h-96 object-cover"
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {listing.title}
            </h1>

            <div className="text-2xl font-semibold text-gray-800 mb-4">
              ${listing.price}
              {listing.sold && (
                <span className="ml-3 text-sm px-2 py-1 rounded bg-gray-200 text-gray-700 align-middle">
                  Sold
                </span>
              )}
            </div>

            <div className="space-y-2 text-gray-700 mb-6">
              <div>
                <span className="font-semibold">Posted:</span>{" "}
                {new Date(listing.created_at).toLocaleString()}
              </div>
              {listing.category && (
                <div>
                  <span className="font-semibold">Category:</span>{" "}
                  {listing.category}
                </div>
              )}
              {listing.item_location && (
                <div>
                  <span className="font-semibold">Location:</span>{" "}
                  {listing.item_location}
                </div>
              )}
              {listing.display_name && (
                <div>
                  <span className="font-semibold">Seller:</span>{" "}
                  {isEmail ? (
                    <a
                      className="text-orange-600 underline"
                      href={`mailto:${listing.display_name}`}
                    >
                      {listing.display_name}
                    </a>
                  ) : (
                    listing.display_name
                  )}
                </div>
              )}
            </div>

            {listing.description && (
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-gray-800 whitespace-pre-line">
                  {listing.description}
                </p>
              </div>
            )}
            {sellerEmail && (

            <div className="mt-6 flex items-center gap-4">
            <a
              href={mailtoHref}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Contact Seller
            </a>

            <button
              onClick={handleBookmark}
              disabled={bookmarking}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded font-semibold transition ${
                isBookmarked
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              {bookmarking
                ? "Processing..."
                : isBookmarked
                ? "Remove from Bookmarks"
                : "Add to Bookmarks"}
            </button>
            </div>
            
            )}
          </div>
        </div>
      </main>
    </>
  );
}
