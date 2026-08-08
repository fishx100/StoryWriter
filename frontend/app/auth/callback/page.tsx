"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // The server-side PKCE exchange is handled at `/api/auth/callback` and
    // will redirect the browser to `/dashboard` with cookies set. This page
    // is a passive landing for any client-side errors; do not parse URL
    // fragments or perform client-side token handling.
    if (searchParams.get("error")) {
      setError(searchParams.get("error"));
    }
  }, [searchParams]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="p-6 bg-white rounded shadow">
        <h2 className="text-lg font-medium">Finalizing sign-in…</h2>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>
    </main>
  );
}
