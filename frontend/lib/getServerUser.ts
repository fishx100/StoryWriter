import { createServerSupabase } from "./supabaseServer";

/**
 * Convenience helper for server components and route handlers to read the
 * authenticated user and session via the server Supabase client.
 */
export async function getServerUser(request?: Request, response?: any) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const supabase = createServerSupabase(request, response);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { data, error } = await supabase.auth.getUser();

  if (error) return { user: null, error };

  return { user: data?.user ?? null };
}

export async function getServerSession(request?: Request, response?: any) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const supabase = createServerSupabase(request, response);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { data, error } = await supabase.auth.getSession();

  if (error) return { session: null, error };

  return { session: data?.session ?? null };
}
