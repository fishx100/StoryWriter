import { WorkDashboard } from "@/components/work-dashboard";
import { createServerSupabase } from "@/lib/supabaseServer";
import AuthProvider from "@/components/auth/AuthProvider";

export default async function DashboardPage() {
  // Create a server Supabase client that reads cookies via next/headers.
  const supabase = createServerSupabase();

  // Retrieve the current session on the server so we can pass it to
  // client components and avoid extra client-side fetches.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { data } = await supabase.auth.getSession();
  const session = data?.session ?? null;

  return (
    // Provide initial session to client components via a lightweight provider.
    // This avoids localStorage and relies on cookie-based SSR for persistence.
    <AuthProvider initialSession={session}>
      <WorkDashboard mode="dashboard" />
    </AuthProvider>
  );
}
