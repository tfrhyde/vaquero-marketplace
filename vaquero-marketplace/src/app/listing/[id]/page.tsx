import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function ListingPage({ params }: { params: { id: string } }) {
  const { data: listing, error } = await supabase
    .from('Listings')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !listing) {
    return <p className="text-center mt-10 text-red-600">Listing not found.</p>;
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <img src={listing.image_url} alt={listing.title} className="w-full h-60 object-cover rounded" />
      <h1 className="text-2xl font-bold mt-4">{listing.title}</h1>
      <p className="text-gray-600 mt-2">${listing.price}</p>
      <p className="text-sm text-gray-500">{listing.category} — {listing.item_location}</p>
      <p className="mt-4">{listing.description}</p>
      {listing.sold && (
        <span className="inline-block mt-2 px-2 py-1 bg-red-200 text-red-800 text-xs font-semibold rounded">
          SOLD
        </span>
      )}
    </div>
  );
}
