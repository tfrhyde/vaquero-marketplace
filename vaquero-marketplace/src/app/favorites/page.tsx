'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Matches Supabase join structure: Listings is an array
type BookmarkWithListing = {
  listing_id: string;
  Listings: {
    id: string;
    title: string;
    price: number;
    category: string;
  }[];
};

export default function FavoritesPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkWithListing[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchBookmarks() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('Bookmarks')
        .select('listing_id, Listings(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bookmarks:', error.message);
      } else {
        setBookmarks((data ?? []) as BookmarkWithListing[]);
      }
    }

    fetchBookmarks(); // Suppress ESLint warning by defining inside useEffect
  }, [router]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Bookmarked Listings</h1>
      {bookmarks
        .filter((b) => b.Listings.length > 0)
        .map((b) => {
          const listing = b.Listings[0];
          return (
            <div key={b.listing_id} className="border-b py-4">
              <h2 className="font-semibold">{listing.title}</h2>
              <p>${listing.price}</p>
              <p className="text-sm text-gray-500">{listing.category}</p>
            </div>
          );
        })}
    </div>
  );
}