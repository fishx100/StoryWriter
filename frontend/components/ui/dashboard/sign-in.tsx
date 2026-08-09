"use client";

import { useAuth } from "@/components/auth/AuthProvider";

export function SignIn() {
  const { user } = useAuth();

  return (
    <div className="rounded-2xl border border-slate-200/10 bg-slate-900 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Signed in as</p>
      <p className="mt-1 text-sm font-medium text-slate-100">
        {user?.email ?? "Unknown"}
      </p>
    </div>
  );
}
