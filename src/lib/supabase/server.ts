import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const AUTH_STORAGE_KEY = "catchupdiaries-auth";

export async function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase environment variables are missing.");
  }

  const cookieStore = await cookies();

  return createClient(url, key, {
    auth: {
      flowType: "pkce",
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: true,
      storageKey: AUTH_STORAGE_KEY,
      storage: {
        getItem(key) {
          return Promise.resolve(cookieStore.get(key)?.value ?? null);
        },
        setItem(key, value) {
          const options = {
            path: "/",
            sameSite: "lax" as const,
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 365,
          };
          cookieStore.set(key, value, options);
          return Promise.resolve();
        },
        removeItem(key) {
          cookieStore.delete(key);
          return Promise.resolve();
        },
      },
    },
  });
}
