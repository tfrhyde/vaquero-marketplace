'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
import Link from 'next/link';

type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  item_location: string;
  sold: boolean;
  created_at: string;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    async function fetchListings() {
      const { data, error } = await supabase
        .from('Listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) console.error('Error fetching listings:', error);
      else setListings(data || []);
    }

    fetchListings();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Marketplace Listings</h1>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <Link key={listing.id} href={`/listing/${listing.id}`} className="card">
            <div className="overflow-hidden rounded">
              <Image
                src={listing.image_url}
                alt={listing.title}
                width={400}
                height={250}
                className="object-cover w-full h-48 rounded"
              />
              <div className="mt-2">
                <h2 className="text-lg font-semibold">{listing.title}</h2>
                <p className="text-gray-600">${listing.price}</p>
                <p className="text-sm text-gray-500">{listing.category} – {listing.item_location}</p>
                {listing.sold && (
                  <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold bg-red-200 text-red-800 rounded">
                    SOLD
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
