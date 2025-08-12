// Client component, use React hooks and call Supabase from the browser
// Server components cant use useEffect/useState or run this client-side query
"use client";

import { useEffect, useState } from "react"; // state and side effects (fetch data)
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link"; // client side navigation

// TypeScript interface describing one listing row we expect back from the database
// one listing is one row
interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  item_location: string;
  display_name: string;
  image_url: string;
  sold: boolean;
  created_at: string;
}

// React component to fetch active listings and render them on a responsive grid
export default function ListingFeed() {
  // List starts empty and we display loading flag
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch latest listings that are unsold from supabase
  useEffect(() => {
    const fetchListings = async () => {
      // selecting all columns, only unsold items, and fetching newest first by using created_at
      const { data, error } = await supabase
        .from("Listings")
        .select("*")
        .eq("sold", false)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching listings:", error);
      } else {
        setListings(data || []);
      }

      setLoading(false);
    };

    fetchListings();
  }, []);

  // Rendering "Loading Listings..." while listins load
  if (loading) {
    return <p className="text-center text-gray-600">Loading listings...</p>;
  }
  // If no listings are active
  if (listings.length === 0) {
    return (
      <p className="text-center text-gray-600">No active listings available.</p>
    );
  }

  // Success Sate: render the listing grid
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <Link
          key={listing.id}
          href={`/listing/${listing.id}`}
          className="bg-white shadow rounded p-4 hover:shadow-md transition"
        >
          <img
            src={listing.image_url}
            alt={listing.title}
            className="w-full h-48 object-cover rounded mb-3"
          />
          <h3 className="text-xl font-semibold text-gray-800">
            {listing.title}
          </h3>
          <p className="text-gray-500">${listing.price}</p>
          <p className="text-sm text-gray-600">{listing.item_location}</p>
          <p className="text-sm text-gray-600 italic">
            Posted by {listing.display_name}
          </p>
        </Link>
      ))}
    </div>
  );
}
