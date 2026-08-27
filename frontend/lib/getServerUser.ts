import type { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "./supabaseServer";

/** Returns the authenticated user from a verified Supabase session. */
export async function getServerUser(
  request?: NextRequest,
  response?: NextResponse,
) {
  const supabase = await createServerSupabase(request, response);
  const { data, error } = await supabase.auth.getUser();

  if (error) return { user: null, error };

  return { user: data.user };
}

/** Returns the current server-side session, if one exists. */
export async function getServerSession(
  request?: NextRequest,
  response?: NextResponse,
) {
  const supabase = await createServerSupabase(request, response);
  const { data, error } = await supabase.auth.getSession();

  if (error) return { session: null, error };

  return { session: data.session };
}
