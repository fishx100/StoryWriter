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
      await signOut();
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
