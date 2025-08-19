"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Header from "@/components/header";
import Link from "next/link";

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userListings, setUserListings] = useState<any[]>([]);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [editing, setEditing] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setUserEmail(session.user.email ?? null);

        const { data: listings, error } = await supabase
          .from("Listings")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        if (!error) setUserListings(listings || []);
      } else {
        router.push("/");
      }
      setLoading(false);
    });
  }, [router]);

  const toggleSold = async (id: string, sold: boolean) => {
    setActionLoadingId(id);
    setActionError(null);
    const { data, error } = await supabase
      .from("Listings")
      .update({ sold: !sold })
      .eq("id", id)
      .select("*")
      .single();

    if (error) setActionError(error.message);
    else
      setUserListings((prev) =>
        prev.map((l) => (l.id === id ? { ...l, ...data } : l))
      );
    setActionLoadingId(null);
  };

  const deleteListing = async (id: string) => {
    const ok = window.confirm("Delete this listing? This cannot be undone.");
    if (!ok) return;
    setActionLoadingId(id);
    setActionError(null);
    const { error } = await supabase.from("Listings").delete().eq("id", id);
    if (error) {
      setActionError(error.message);
      setActionLoadingId(null);
      return;
    }
    setUserListings((prev) => prev.filter((l) => l.id !== id));
    setActionLoadingId(null);
  };

  const openEdit = (l: any) => {
    setEditing(l);
    setEditTitle(l.title ?? "");
    setEditPrice(String(l.price ?? ""));
    setEditCategory(l.category ?? "");
    setEditLocation(l.item_location ?? "");
    setEditDescription(l.description ?? "");
    setEditFile(null);
    setActionError(null);
  };

  const closeEdit = () => {
    setEditing(null);
    setEditTitle("");
    setEditPrice("");
    setEditCategory("");
    setEditLocation("");
    setEditDescription("");
    setEditFile(null);
    setSaving(false);
    setActionError(null);
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    setActionError(null);

    try {
      let image_url: string | null = editing.image_url ?? null;

      if (editFile) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const uid = session?.user?.id;
        if (!uid) throw new Error("Not signed in");
        const path = `${uid}/${Date.now()}_${editFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("listings")
          .upload(path, editFile, { upsert: false });
        if (uploadError) throw uploadError;
        const { data: pub } = supabase.storage
          .from("listings")
          .getPublicUrl(path);
        image_url = pub.publicUrl;
      }

      const update = {
        title: editTitle.trim(),
        price: Number(editPrice),
        category: editCategory.trim(),
        item_location: editLocation.trim(),
        description: editDescription.trim(),
        image_url,
      };

      const { data, error } = await supabase
        .from("Listings")
        .update(update)
        .eq("id", editing.id)
        .select("*")
        .single();

      if (error) throw error;

      setUserListings((prev) =>
        prev.map((l) => (l.id === editing.id ? { ...l, ...data } : l))
      );
      closeEdit();
    } catch (e: any) {
      setActionError(e.message ?? "Failed to save changes.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Loading your account...</div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <>
      <Header />
      <main className="p-8 max-w-6xl mx-auto">
        <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-md shadow-sm mb-6">
          <h1 className="text-3xl font-bold text-orange-600 mb-2">
            Welcome to your dashboard
          </h1>
          {userEmail && (
            <p className="text-gray-700 text-lg">
              Signed in as <span className="font-semibold">{userEmail}</span>
            </p>
          )}
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Link href="/post">
            <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition cursor-pointer">
              <div className="text-orange-500 mb-3">
                <div className="text-orange-500 mb-3">
                  <i className="ri-add-line text-[32px]" aria-hidden="true" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-1">Post a Listing</h3>
              <p className="text-sm text-gray-600">
                Create a new item to sell or trade.
              </p>
            </div>
          </Link>

          <Link href="/listing">
            <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition cursor-pointer">
              <div className="text-orange-500 mb-3">
                <i className="ri-grid-line text-[32px]" />
              </div>
              <h3 className="text-xl font-semibold mb-1">View Marketplace</h3>
              <p className="text-sm text-gray-600">
                Explore items posted by other students.
              </p>
            </div>
          </Link>

          <Link href="/favorites">
            <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition cursor-pointer">
              <div className="text-orange-500 mb-3">
                <i className="ri-bookmark-line text-[32px]" />
              </div>
              <h3 className="text-xl font-semibold mb-1">Bookmarks</h3>
              <p className="text-sm text-gray-600">
                Quickly access your saved listings.
              </p>
            </div>
          </Link>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Your Activity
          </h2>
          <Link
            href="/account/myListings"
            className="text-orange-600 font-medium hover:underline"
          >
            View All{" "}
          </Link>
          <div className="bg-white p-6 rounded-lg shadow-sm text-gray-600 text-sm">
            {userListings.length === 0 ? (
              <p>
                No recent activity yet. Start posting or bookmarking listings!
              </p>
            ) : (
              <>
                <ul className="divide-y">
                  {userListings.map((l) => (
                    <li key={l.id} className="py-3">
                      <div className="flex items-center gap-4">
                        <Link
                          href={`/listing/${l.id}`}
                          className="flex items-center gap-4 flex-1 hover:bg-gray-50 rounded-md px-2 py-2"
                        >
                          <img
                            src={l.image_url || "/placeholder.png"}
                            alt={l.title || "Listing image"}
                            className="h-16 w-16 object-cover rounded flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 truncate">
                              {l.title}
                              {l.sold && (
                                <span className="ml-2 text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                                  Sold
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              ${l.price} •{" "}
                              {new Date(l.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </Link>

                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(l)}
                            className=" bg-orange-500 hover:bg-orange-600 text-white font-semibold px-3 py-2 rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => toggleSold(l.id, l.sold)}
                            disabled={actionLoadingId === l.id}
                            className="bg-gray-800 hover:bg-gray-900 disabled:opacity-60 text-white font-semibold px-3 py-2 rounded"
                          >
                            {l.sold ? "Mark Available" : "Mark Sold"}
                          </button>
                          <button
                            onClick={() => deleteListing(l.id)}
                            disabled={actionLoadingId === l.id}
                            className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold px-3 py-2 rounded"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                {actionError && (
                  <p className="text-sm text-red-600 mt-3">{actionError}</p>
                )}
              </>
            )}
          </div>
        </section>

        <Link
          href="/userSettings"
          className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2
             bg-orange-500 hover:bg-orange-600 text-white font-semibold
             px-4 py-3 rounded-full shadow-lg focus:outline-none
             focus:ring-2 focus:ring-orange-300"
          aria-label="Open settings"
          title="Settings"
        >
          <i className="ri-settings-3-line text-lg" aria-hidden="true" />
          <span>Settings</span>
        </Link>

        {editing && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Edit Listing</h3>
              <div className="grid gap-3">
                <input
                  className="border border-gray-300 rounded px-3 py-2 w-full"
                  placeholder="Title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <input
                  type="number"
                  step="0.01"
                  className="border border-gray-300 rounded px-3 py-2 w-full"
                  placeholder="Price"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                />
                <input
                  className="border border-gray-300 rounded px-3 py-2 w-full"
                  placeholder="Category"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                />
                <input
                  className="border border-gray-300 rounded px-3 py-2 w-full"
                  placeholder="Location"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                />
                <textarea
                  className="border border-gray-300 rounded px-3 py-2 w-full min-h-[100px]"
                  placeholder="Description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/gif"
                  onChange={(e) => setEditFile(e.target.files?.[0] ?? null)}
                  className="border border-gray-300 rounded px-3 py-2 w-full file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-100"
                />
                {actionError && (
                  <p className="text-sm text-red-600">{actionError}</p>
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={closeEdit}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    disabled={saving}
                    className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold px-4 py-2 rounded"
                  >
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
