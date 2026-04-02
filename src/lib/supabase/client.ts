"use client";

import { createClient } from "@supabase/supabase-js";

const AUTH_STORAGE_KEY = "catchupdiaries-auth";

export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase environment variables are missing.");
  }

  return createClient(url, key, {
    auth: {
      flowType: "pkce",
      persistSession: true,
      storageKey: AUTH_STORAGE_KEY,
    },
  });
}
