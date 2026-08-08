import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "missing_code");
      return NextResponse.redirect(loginUrl);
    }

    // Prepare a redirect response to /dashboard; we'll pass this response
    // into createServerSupabase so the SSR helper can write Set-Cookie headers
    // when exchanging the code for a session.
    const redirectUrl = new URL("/dashboard", request.url);
    const res = NextResponse.redirect(redirectUrl);

    // Create server supabase client with the response so cookies are written
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const supabase = createServerSupabase(request, res);

    // Exchange the authorization code for a session on the server.
    // Pass the raw authorization code string per Supabase API
    // @ts-ignore
    const { data, error } = await supabase.auth.exchangeCodeForSession(
      code as string,
    );

    if (error) {
      console.error("exchangeCodeForSession failed:", error);
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "exchange_failed");
      return NextResponse.redirect(loginUrl);
    }

    // The response `res` has been mutated by createServerSupabase / exchange
    // to include Set-Cookie headers. Return it so the browser receives cookies
    // and is redirected to the protected app page.
    return res;
  } catch (err) {
    console.error("Error in /api/auth/callback:", err);
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "server_error");
    return NextResponse.redirect(loginUrl);
  }
}
