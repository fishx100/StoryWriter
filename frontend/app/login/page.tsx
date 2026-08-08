"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithGoogle, getSession } from "@/lib/auth";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleGoogle() {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      // signInWithGoogle will redirect the browser to Supabase/Google
    } catch (err: any) {
      setError(err?.message ?? "Failed to start Google sign-in");
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const session = await getSession();
        if (mounted && session) {
          router.push("/dashboard");
        }
      } catch (_) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded shadow">
        <h1 className="text-2xl font-semibold mb-2">StoryWriter</h1>
        <p className="text-sm text-gray-500 mb-6">Your writing workspace.</p>

        {error && <div className="text-red-600 mb-4">{error}</div>}

        <button
          onClick={handleGoogle}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border rounded bg-white hover:bg-gray-50 text-black"
          disabled={loading}
        >
          {loading ? "Starting…" : "Continue with Google"}
        </button>
      </div>
    </main>
  );
}
