import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies as nextCookies } from "next/headers";
import { NextResponse } from "next/server";
import { parse as parseCookie } from "cookie";

/**
 * Create a server-side Supabase client for Next.js App Router server components / API routes.
 *
 * Usage (server component or route):
 *   import { createServerSupabase } from '@/lib/supabaseServer'
 *   const supabase = createServerSupabase(request)
 *
 * The function delegates to `@supabase/ssr` helpers which read/write cookies according
 * to the package's recommended patterns.
 */
export function createServerSupabase(
  request?: Request,
  response?: NextResponse | undefined,
): SupabaseClient {
  // Use createServerClient(supabaseUrl, supabaseKey, { cookies }) from @supabase/ssr
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  // Helper to read cookies from the incoming request. Prefer using the
  // Next.js `cookies()` helper when available; fall back to parsing the
  // raw Cookie header from the provided Request.
  const getAll = async () => {
    try {
      // If running inside a Next.js Route handler / server component,
      // nextCookies().getAll() is available and returns array of cookie objects.
      const nc = await (nextCookies() as any);
      if (nc && typeof (nc as any).getAll === "function") {
        const all = (nc as any).getAll();
        return all.map((c: any) => ({ name: c.name, value: c.value }));
      }
    } catch (e) {
      // ignore and fallback
    }

    if (request && typeof (request as Request).headers?.get === "function") {
      const raw = (request as Request).headers.get("cookie") || "";
      if (!raw) return [];
      const parsed = parseCookie(raw || "");
      return Object.keys(parsed).map((name) => ({ name, value: parsed[name] }));
    }

    return [];
  };

  // Helper to set cookies on the provided NextResponse. If no response is
  // provided, we warn; when `response` is present we call response.cookies.set
  // for each cookie entry returned by @supabase/ssr storage logic.
  const setAll = async (cookiesToSet: Array<any>) => {
    if (!response) {
      // When no response is provided we cannot set cookies server-side.
      // This can happen in some middleware contexts; log a warning.
      // @supabase/ssr will tolerate a no-op setAll in some scenarios.
      // eslint-disable-next-line no-console
      console.warn(
        "@supabase/ssr: setAll called without a NextResponse; cookies will not be set.",
      );
      return;
    }

    for (let i = 0; i < cookiesToSet.length; i += 1) {
      const { name, value, options } = cookiesToSet[i];
      // Map options to NextResponse.cookies.set signature
      const cookieOpts: any = {};
      if (options) {
        if (options.maxAge !== undefined) cookieOpts.maxAge = options.maxAge;
        if (options.httpOnly !== undefined)
          cookieOpts.httpOnly = options.httpOnly;
        if (options.sameSite !== undefined)
          cookieOpts.sameSite = options.sameSite;
        if (options.secure !== undefined) cookieOpts.secure = options.secure;
        if (options.path !== undefined) cookieOpts.path = options.path;
        if (options.domain !== undefined) cookieOpts.domain = options.domain;
        if (options.expires !== undefined) cookieOpts.expires = options.expires;
      }

      // @ts-ignore - NextResponse.cookies API
      response.cookies.set({ name, value: value ?? "", ...cookieOpts });
    }
  };

  // Provide the cookies abstraction expected by @supabase/ssr
  const cookiesOption = {
    getAll,
    setAll,
  };

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return createServerClient(url, key, {
    cookies: cookiesOption,
  }) as SupabaseClient;
}
