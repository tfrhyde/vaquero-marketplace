"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Header from "@/components/header";
import { div, p } from "framer-motion/client";
import { warnOptionHasBeenMovedOutOfExperimental } from "next/dist/server/config";

export default function NewListingPage() {
  const router = useRouter();

  // Using same auth gate following similar flow as listing page
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        router.push("/");
      } else {
        setIsAuthenticated(true);
      }
      setLoading(false);
    });
  }, [router]);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [itemLocation, setItemLocation] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }
  if (!isAuthenticated) return null;

  // Helper functions
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  const validate = () => {
    if (!title.trim()) return "Title is required.";
    if (!price.trim()) return "Price is required.";
    const num = Number(price);
    if (Number.isNaN(num) || num < 0)
      return "Price must be a valid non-negative number.";
    return null;
  };

  // Submit section mirroring our desktop logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      // email for dsiplay name
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        setError("You must be signed in to post.");
        setSubmitting(false);
        return;
      }
      // upload to public bucket (optional)
      let imageUrl = "";
      if (file) {
        const path = `${user.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("listings")
          .upload(path, file, { upsert: false });

        if (uploadError) throw uploadError;

        // using public url (bucket is public)
        const { data: pub } = supabase.storage
          .from("listings")
          .getPublicUrl(path);
        imageUrl = pub.publicUrl;
      }

      // Payload
      const listing = {
        user_id: String(user.id),
        display_name: String(user.email ?? "Anonymous"),
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        category: category.trim(),
        image_url: imageUrl,
        item_location: itemLocation.trim(),
        sold: false,
        created_at: new Date().toISOString(),
      };

      // Insert into "Listings"
      const { error: insertError } = await supabase
        .from("Listings")
        .insert(listing);
      if (insertError) throw insertError;

      setSuccess("Listing posted succesfully!");
      setTitle("");
      setDescription("");
      setPrice("");
      setCategory("");
      setItemLocation("");
      setFile(null);

      // no redirect yet keeping user on page (plan to redirect user to their own listings later)
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong while posting.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Post a New Listing
        </h1>

        <form onSubmit={handleSubmit} className="grid gap-4 max-w-xl">
          <input
            className="border border-gray-300 rounded px-3 py-2 w-full"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="border border-gray-300 rounded px-3 py-2 w-full min-h-[100px]"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <input
            type="number"
            step="0.01"
            className="border border-gray-300 rounded px-3 py-2 w-full"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <input
            className="border border-gray-300 rounded px-3 py-2 w-full"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <input
            className="border border-gray-300 rounded px-3 py-2 w-full"
            placeholder="Location"
            value={itemLocation}
            onChange={(e) => setItemLocation(e.target.value)}
          />
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/gif"
            onChange={handleFileChange}
            className="border border-gray-300 rounded px-3 py-2 w-full file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-100"
          />

          {error && <p className="text-red-600-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-2 px-4 rounded w-full transition"
          >
            {submitting ? "Posting..." : "Post Listing"}
          </button>
        </form>
      </main>
    </>
  );
}
