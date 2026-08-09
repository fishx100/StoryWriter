import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  try {
    // Prepare a redirect response so createServerSupabase can write Set-Cookie
    // headers to clear Supabase auth cookies when signing out.
    const redirectUrl = new URL("/login", request.url);
    const res = NextResponse.redirect(redirectUrl);

    // Create server supabase client with the response so cookies are written
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const supabase = createServerSupabase(request, res);

    // Call signOut on the server client; this will clear auth cookies via
    // the @supabase/ssr cookie helpers and the provided NextResponse.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await supabase.auth.signOut();

    return res;
  } catch (err) {
    // On error, redirect to login anyway.
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
}
