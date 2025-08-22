'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Header from '@/components/header';
import ListingFeed from '@/components/ListingFeed'; 

export default function AllListingsPage() {
  const router = useRouter();

  // Local state
  const [loading, setLoading] = useState(true);  // tracks loading while checking auth
  const [isAuthenticated, setIsAuthenticated] = useState(false);  // whether user is logged in


  // Check if the user is logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        // If not logged in → redirect to home/login
        router.push('/');
      } else {
         // If logged in → mark authenticated and stop loading
        setIsAuthenticated(true);
        setLoading(false);
      }
    });
  }, [router]);

   // Loading state while waiting for session check
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Loading listings...</div>
      </div>
    );
  }

  // If user is not authenticated, render nothing
  if (!isAuthenticated) return null;

  // Render marketplace page when authenticated
  return (
    <>
      <Header />
      <main className="p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Explore Marketplace
        </h1>
        <ListingFeed />
      </main>
    </>
  );
}
