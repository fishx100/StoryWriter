export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export async function fetchJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  // Try to attach a Supabase access token when running in the browser.
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };

  if (typeof window !== "undefined") {
    try {
      // import lazily to avoid SSR import of browser-only client
      // eslint-disable-next-line @typescript-eslint/no-var-requires,global-require
      const { getBrowserSupabase } = require("./supabaseClient");
      const supabase = getBrowserSupabase();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }
    } catch (e) {
      // ignore — proceed without auth header
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentLength = response.headers.get("content-length");
  if (contentLength === "0") {
    return undefined as T;
  }

  const text = await response.text();
  if (!text.trim()) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}
