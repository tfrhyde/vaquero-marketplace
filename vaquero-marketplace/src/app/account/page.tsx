'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AccountPage() {

type Listing = {
  id: string;
  title: string;
  price: number;
  category: string;
};

  const [listings, setListings] = useState<Listing[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUserListings = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        router.push('/login');
        return;
      }

      const { data } = await supabase
        .from('Listings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setListings(data || []);
    };

    fetchUserListings();
  }, [router]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Listings</h1>
      {listings.map((listing: Listing) => (
        <div key={listing.id} className="border-b py-4">
          <h2 className="font-semibold">{listing.title}</h2>
          <p>${listing.price}</p>
          <p className="text-sm text-gray-500">{listing.category}</p>
        </div>
      ))}
    </div>
  );
}
