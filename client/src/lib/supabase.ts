import { createClient } from "@supabase/supabase-js";

const rawUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseUrl = rawUrl?.replace(/\/+$/, "").replace(/\/rest\/v1$/i, "");
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

export const supabaseConfigError =
  !supabaseUrl || !publishableKey
    ? "This web build is missing its Supabase configuration."
    : null;

export const supabase = createClient(
  supabaseUrl || "https://invalid-configuration.supabase.co",
  publishableKey || "missing-publishable-key",
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  },
);
