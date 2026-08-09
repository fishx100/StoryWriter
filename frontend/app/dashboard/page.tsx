import { WorkDashboard } from "@/components/work-dashboard";
import { createServerSupabase } from "@/lib/supabaseServer";
import AuthProvider from "@/components/auth/AuthProvider";

export default async function DashboardPage() {
  // Create a server Supabase client that reads cookies via next/headers.
  const supabase = createServerSupabase();

  // Retrieve the authenticated user from Supabase Auth server to ensure the
  // session/user is validated server-side. Also retrieve the session so we
  // can pass it to client components for initial state.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { data: userData } = await supabase.auth.getUser();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData?.session ?? null;

  // If there's no authenticated user, render a redirect on the server.
  // This keeps protected server pages consistent with middleware behavior.
  if (!userData?.user) {
    // Server-side redirect
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    throw new Error("Unauthenticated");
  }

  return (
    // Provide initial session to client components via a lightweight provider.
    // This avoids localStorage and relies on cookie-based SSR for persistence.
    <AuthProvider initialSession={session}>
      <WorkDashboard mode="dashboard" />
    </AuthProvider>
  );
}
