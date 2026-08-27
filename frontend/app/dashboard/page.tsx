import { WorkDashboard } from "@/components/ui/work/work-dashboard";
import { createServerSupabase } from "@/lib/supabaseServer";
import AuthProvider from "@/components/auth/AuthProvider";

export default async function DashboardPage() {
  const supabase = await createServerSupabase();

  const { data: userData } = await supabase.auth.getUser();
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData?.session ?? null;

  if (!userData?.user) {
    throw new Error("Unauthenticated");
  }

  return (
    <AuthProvider initialSession={session}>
      <WorkDashboard/>
    </AuthProvider>
  );
}
