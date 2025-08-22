"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Header from "@/components/header";
import Link from "next/link";

export default function userSettingsPage() {
  const router = useRouter();

  // State variables to handle loading state, authentication, and user details
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // State variables for preferences
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // State variables for delete account functionality
  const [showDelete, setShowDelete] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Fetch user session and check if authenticated
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setUserEmail(session.user.email ?? null);
      } else {
        // Redirect to home page if user is not authenticated
        router.push("/");
      }
      setLoading(false);
    });
  }, [router]);

  // Function to delete the user's account
  const deleteAccount = async () => {
    try {
      setDeleting(true); // start deleting process
      setDeleteError(null); // reset any previous error messages
      
      // Fetch the session and access token
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not signed in.");

      // Make a request to the API to delete the account
      const res = await fetch("/api/delete-account", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      // Handle any error that occurs during the API call
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to delete account.");
      }

      // Sign out the user and redirect to the homepage
      await supabase.auth.signOut();
      router.push("/");
    } catch (e: any) {
      // If an error occurs, update the error state
      setDeleteError(e.message ?? "Something went wrong.");
      setDeleting(false);
    }
  };

  // Show loading state while waiting for user data
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Loading settings…</div>
      </div>
    );
  }

  // If not authenticated, do not render anything
  if (!isAuthenticated) return null;

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-gray-600">
            <i className="ri-settings-3-line" aria-hidden="true" />
            Settings
          </div>
          <h1 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
            Account and{" "}
            <span className="bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
              Preferences
            </span>
            .
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your profile, preferences, and security.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Account
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Signed in as{" "}
                    <span className="font-medium">{userEmail}</span>
                  </p>
                </div>
                <Link
                  href="/account"
                  className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
                  title="Back to dashboard"
                >
                  <i className="ri-dashboard-line" aria-hidden="true" />
                  Dashboard
                </Link>
              </div>
            </section>

            {/* Preferences */}
            <section className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold text-gray-900">
                Preferences
              </h2>
              <div className="mt-4 divide-y">
                {/* Email alerts */}
                <div className="py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Email alerts</p>
                    <p className="text-sm text-gray-600">
                      Get notified about replies and offers.
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={emailAlerts}
                      onChange={() => setEmailAlerts((v) => !v)}
                    />
                    <div className="h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-orange-500 transition-colors" />
                    <span
                      className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow
                                      transition-transform peer-checked:translate-x-5"
                    />
                  </label>
                </div>
                <div className="py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Dark mode</p>
                    <p className="text-sm text-gray-600">
                      Reduce eye strain with a darker palette.
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={darkMode}
                      onChange={() => setDarkMode((v) => !v)}
                    />
                    <div className="h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-orange-500 transition-colors" />
                    <span
                      className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow
                                      transition-transform peer-checked:translate-x-5"
                    />
                  </label>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold text-gray-900">Security</h2>
              <p className="mt-1 text-sm text-gray-600">
                Keep your account protected.
              </p>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push("/");
                }}
                className="mt-4 w-full rounded-lg  bg-orange-500 hover:bg-orange-600 text-white font-semibold
             px-4 py-3 shadow-lg focus:outline-none
             focus:ring-2 focus:ring-orange-300"
              >
                Sign out
              </button>
            </section>

            {/* Danger zone  to delete account*/}
            <section className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold text-red-600">
                Danger zone
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Permanently remove your account and data.
              </p>

              {!showDelete ? (
                <button
                  onClick={() => setShowDelete(true)}
                  className="mt-4 w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2.5
                             font-semibold text-red-700 hover:bg-red-100"
                >
                  Delete account
                </button>
              ) : (
                <div className="mt-4 space-y-3">
                  <div className="rounded-lg border bg-red-50 p-3 text-sm text-red-800">
                    Type <span className="font-semibold">DELETE</span> to
                    confirm. This action is irreversible.
                  </div>
                  <input
                    autoFocus
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Type DELETE to confirm"
                    className="w-full rounded-md border px-3 py-2"
                  />
                  {deleteError && (
                    <p className="text-sm text-red-600">{deleteError}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowDelete(false);
                        setConfirmText("");
                        setDeleteError(null);
                      }}
                      className="flex-1 rounded-lg border px-4 py-2.5 font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={deleteAccount}
                      disabled={confirmText !== "DELETE" || deleting}
                      className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 font-semibold text-white
                                 disabled:opacity-60 hover:bg-red-700"
                    >
                      {deleting ? "Deleting…" : "Confirm delete"}
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
