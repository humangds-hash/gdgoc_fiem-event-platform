import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseUrl = rawUrl.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    supabaseUrl.startsWith("http") &&
    !supabaseUrl.includes("placeholder")
  );
};

// Singleton client instance or null if not configured
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Trigger Supabase Google OAuth sign in
 */
export async function signInWithGoogle() {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    if (error) throw error;
    return data;
  }

  // Graceful development simulation mode if user hasn't added Supabase keys yet
  return {
    simulated: true,
    user: {
      id: "usr_google_demo_" + Math.random().toString(36).substring(2, 8),
      email: "alex.developer@gmail.com",
      user_metadata: {
        full_name: "Alex Developer",
        avatar_url: "https://lh3.googleusercontent.com/a/default-user=s96-c",
      },
    },
  };
}
