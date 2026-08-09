"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    setLoading(true);
    try {
      // Call server-side logout to ensure httpOnly auth cookies are cleared.
      await fetch("/api/auth/logout", { method: "POST" });
      // Also call client signOut to notify client SDK and clear client-side state.
      try {
        await signOut();
      } catch (e) {
        // ignore client sign-out errors
      }
      router.push("/login");
    } catch (err) {
      // ignore for now
      router.push("/login");
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="px-3 py-1 border rounded text-black bg-white hover:bg-gray-50"
      disabled={loading}
    >
      {loading ? "Signing out…" : "Logout"}
    </button>
  );
}
