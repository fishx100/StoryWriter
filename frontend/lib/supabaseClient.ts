import { SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";
import { parse as parseCookie } from "cookie";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Defer throwing until the client is actually used so dev environment can load other pages.
  // Consumers should handle missing env during runtime.
  // eslint-disable-next-line no-console
  console.warn(
    "Supabase env vars are not set: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
  );
}

declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var __supabase_client: SupabaseClient | undefined;
}

export function getBrowserSupabase(): SupabaseClient {
  if (typeof window === "undefined") {
    throw new Error("getBrowserSupabase must be called from the browser");
  }

  if (!globalThis.__supabase_client) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
      );
    }

    // Provide a cookie-storage adapter so the browser client stores PKCE
    // artifacts in cookies compatible with the server `createServerClient`.
    const cookies = {
      // Read all cookies available to document and return as array of { name, value }
      getAll: async () => {
        const raw = typeof document !== "undefined" ? document.cookie : "";
        if (!raw) return [];
        const parsed = parseCookie(raw || "");
        return Object.keys(parsed).map((name) => ({
          name,
          value: parsed[name] ?? "",
        }));
      },
      // Read a single cookie by name
      get: (name: string) => {
        if (typeof document === "undefined") return null;
        const parsed = parseCookie(document.cookie || "");
        return parsed[name] ?? null;
      },
      // Set all cookies supplied by the SDK using document.cookie.
      // Note: httpOnly cannot be set from JS; options with httpOnly will be ignored here.
      setAll: async (cookiesToSet: Array<any>) => {
        if (typeof document === "undefined") return;
        const isLocalhost =
          location.hostname === "localhost" ||
          location.hostname === "127.0.0.1";
        const isHttp = location.protocol === "http:";
        for (let i = 0; i < cookiesToSet.length; i += 1) {
          const { name, value, options } = cookiesToSet[i];
          let cookieStr = `${name}=${encodeURIComponent(value ?? "")}`;
          if (options) {
            if (options.maxAge !== undefined)
              cookieStr += `; Max-Age=${options.maxAge}`;
            if (options.expires !== undefined)
              cookieStr += `; Expires=${new Date(options.expires).toUTCString()}`;
            if (options.path !== undefined)
              cookieStr += `; Path=${options.path}`;
            else cookieStr += `; Path=/`;
            if (options.domain !== undefined)
              cookieStr += `; Domain=${options.domain}`;
            // In dev (http + localhost) skip the Secure flag so cookies are set
            if (options.secure && !(isLocalhost && isHttp))
              cookieStr += `; Secure`;
            if (options.sameSite) cookieStr += `; SameSite=${options.sameSite}`;
          } else {
            cookieStr += `; Path=/`;
          }
          // Set the cookie in the browser
          document.cookie = cookieStr;
        }
      },
      // Set a single cookie
      set: (name: string, value: string, options?: any) => {
        if (typeof document === "undefined") return;
        const isLocalhost =
          location.hostname === "localhost" ||
          location.hostname === "127.0.0.1";
        const isHttp = location.protocol === "http:";
        let cookieStr = `${name}=${encodeURIComponent(value ?? "")}`;
        if (options) {
          if (options.maxAge !== undefined)
            cookieStr += `; Max-Age=${options.maxAge}`;
          if (options.expires !== undefined)
            cookieStr += `; Expires=${new Date(options.expires).toUTCString()}`;
          if (options.path !== undefined) cookieStr += `; Path=${options.path}`;
          else cookieStr += `; Path=/`;
          if (options.domain !== undefined)
            cookieStr += `; Domain=${options.domain}`;
          if (options.secure && !(isLocalhost && isHttp))
            cookieStr += `; Secure`;
          if (options.sameSite) cookieStr += `; SameSite=${options.sameSite}`;
        } else {
          cookieStr += `; Path=/`;
        }
        document.cookie = cookieStr;
      },
      // Remove a cookie by setting it expired
      remove: (name: string, options?: any) => {
        if (typeof document === "undefined") return;
        let cookieStr = `${name}=; Expires=${new Date(0).toUTCString()}; Path=${options?.path ?? "/"};`;
        if (options?.domain) cookieStr += ` Domain=${options.domain};`;
        document.cookie = cookieStr;
      },
    };

    // Use the SSR-provided browser factory so it uses the same cookie storage
    // contract as the server client.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    globalThis.__supabase_client = createBrowserClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        auth: {
          flowType: "pkce",
          detectSessionInUrl: false,
          persistSession: false,
        },
        cookies,
      },
    ) as SupabaseClient;
  }

  return globalThis.__supabase_client as SupabaseClient;
}

export type { SupabaseClient };
