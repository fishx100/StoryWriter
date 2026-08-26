"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SectionPanel } from "@/components/layout/section-panel";
import { InlineMessage } from "@/components/ui/common/inline-message";
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
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to start Google sign-in",
      );
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
  }, [router]);

  return (
    <main className="sw-page-shell flex items-center justify-center">
      <div className="w-full max-w-md">
        <SectionPanel title="StoryWriter">
          <div className="sw-section-layout">
            <h1 className="sw-heading-big">Your writing workspace.</h1>

            {error && <InlineMessage type="error" message={error} />}

            <button
              onClick={handleGoogle}
              className="sw-important-button mt-3 w-full disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Starting…" : "Continue with Google"}
            </button>
          </div>
        </SectionPanel>
      </div>
    </main>
  );
}
