import type { ReactNode } from "react";
import AuthProvider from "@/components/auth/AuthProvider";
import { createServerSupabase } from "@/lib/supabaseServer";

export default async function WorkLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getSession();

  return <AuthProvider initialSession={data.session}>{children}</AuthProvider>;
}
