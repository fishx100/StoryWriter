import { getBrowserSupabase } from "./supabaseClient";

export async function signInWithGoogle(): Promise<void> {
  const supabase = getBrowserSupabase();
  const { error, data } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      // Redirect back to the app callback which will finalize the session
      redirectTo: `${location.origin}/api/auth/callback`,
    },
  });

  if (error) throw error;

  // data may include a url for the redirect; the browser will normally be redirected automatically.
  return;
}

export async function signOut(): Promise<void> {
  const supabase = getBrowserSupabase();
  await supabase.auth.signOut();
}

export async function getSession() {
  const supabase = getBrowserSupabase();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}
