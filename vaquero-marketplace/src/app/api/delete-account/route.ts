import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use Node.js runtime (not Edge). Needed so this server code works for this API route.
export const runtime = "nodejs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a Supabase admin client (server only).
// This uses the service role key so it can perform admin actions like deleting a user.
const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function POST(req: Request) {
  try {
    // Read the Authorization header. We expect "Bearer <access_token>".
    const auth = req.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) {
      // No token => user not authenticated, so we block the request.
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the session token with Supabase and get the user.
    const {
      data: { user },
      error: getUserError,
    } = await admin.auth.getUser(token);
    if (getUserError || !user) {
      // If token is invalid or expired we stop here.
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const userId = user.id; // we will use this id to delete all their data

    // Delete database rows this user owns.
    // Here we remove all rows from "Listings" where user_id equals this user.
    await admin.from("Listings").delete().eq("user_id", userId);

    // Try to delete their files from Storage.
    // We look under the "listings" bucket, in the folder named with their userId.
    // this deletes up to 100 files. If user had more, we would need pagination later.
    try {
      const list = await admin.storage.from("listings").list(userId, {
        limit: 100,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      });
      const names = (list.data ?? []).map((f) => `${userId}/${f.name}`);
      if (names.length) {
        await admin.storage.from("listings").remove(names);
      }
    } catch {
      // If storage cleanup fails, we continue anyway (don’t fail the whole request).
    }

    // Delete the auth user. This actually removes their account from authentication.
    const { error: delErr } = await admin.auth.admin.deleteUser(userId);
    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 400 });
    }

    // Everything succeeded
    return NextResponse.json({ success: true });
  } catch (e: any) {
    // Generic error handler (returns 500 so we know something unexpected happened).
    return NextResponse.json(
      { error: e?.message ?? "Internal error" },
      { status: 500 }
    );
  }
}
