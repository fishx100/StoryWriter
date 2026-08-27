import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

function getConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  return { url, key };
}

/**
 * Creates a typed Supabase client for Server Components, route handlers, and
 * middleware. Pass both request and response outside Server Components so
 * refreshed auth cookies are returned to the browser.
 */
export async function createServerSupabase(
  request?: NextRequest,
  response?: NextResponse,
): Promise<SupabaseClient> {
  const { url, key } = getConfig();
  const cookieStore = request ? undefined : await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        if (request) {
          return request.cookies.getAll().map(({ name, value }) => ({
            name,
            value,
          }));
        }

        return cookieStore?.getAll() ?? [];
      },
      setAll(cookiesToSet: CookieToSet[]) {
        if (response) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
          return;
        }

        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore?.set(name, value, options);
          });
        } catch {
          // Server Components cannot write cookies. Middleware refreshes them.
        }
      },
    },
  });
}
