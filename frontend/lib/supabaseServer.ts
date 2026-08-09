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
    // If a NextResponse was provided, prefer writing cookies to it so the
    // response returned to the browser includes Set-Cookie headers.
    if (response) {
      for (let i = 0; i < cookiesToSet.length; i += 1) {
        const { name, value, options } = cookiesToSet[i];
        const cookieOpts: any = {};
        if (options) {
          if (options.maxAge !== undefined) cookieOpts.maxAge = options.maxAge;
          if (options.httpOnly !== undefined) cookieOpts.httpOnly = options.httpOnly;
          if (options.sameSite !== undefined) cookieOpts.sameSite = options.sameSite;
          if (options.secure !== undefined) cookieOpts.secure = options.secure;
          if (options.path !== undefined) cookieOpts.path = options.path;
          if (options.domain !== undefined) cookieOpts.domain = options.domain;
          if (options.expires !== undefined) cookieOpts.expires = options.expires;
        }

        // @ts-ignore - NextResponse.cookies API
        response.cookies.set({ name, value: value ?? "", ...cookieOpts });
      }
      return;
    }

    // If no NextResponse was provided (typical in server components), try
    // to use Next.js `cookies()` setter which writes Set-Cookie headers for
    // the current server component render. This enables session refresh
    // flows and cookie updates when server components access auth.
    try {
      const nc = await (nextCookies() as any);
      if (nc && typeof nc.set === "function") {
        for (let i = 0; i < cookiesToSet.length; i += 1) {
          const { name, value, options } = cookiesToSet[i];
          const cookieObj: any = { name, value: value ?? "" };
          if (options) {
            if (options.httpOnly !== undefined) cookieObj.httpOnly = options.httpOnly;
            if (options.sameSite !== undefined) cookieObj.sameSite = options.sameSite;
            if (options.path !== undefined) cookieObj.path = options.path;
            if (options.domain !== undefined) cookieObj.domain = options.domain;
            if (options.secure !== undefined) cookieObj.secure = options.secure;
            if (options.expires !== undefined) cookieObj.expires = options.expires;
            if (options.maxAge !== undefined) cookieObj.maxAge = options.maxAge;
          }
          nc.set(cookieObj);
        }
        return;
      }
    } catch (e) {
      // ignore and fallthrough to warning
    }

    // Fallback: cannot set cookies in this environment.
    // eslint-disable-next-line no-console
    console.warn(
      "@supabase/ssr: setAll called without a writable response; cookies may not be set.",
    );
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
