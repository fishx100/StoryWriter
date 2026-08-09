import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

const PROTECTED_PREFIXES = ["/dashboard", "/works", "/settings"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect specific prefixes
  if (!PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  try {
    // Prepare a response so `createServerSupabase` can write Set-Cookie
    // headers if the SDK needs to refresh the session.
    const res = NextResponse.next();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const supabase = createServerSupabase(request as unknown as Request, res);

    // Use getUser() which verifies the session with the Supabase Auth server.
    // This avoids trusting the raw user object from storage/cookies.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return res;
  } catch (err) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/works/:path*", "/settings/:path*"],
};
