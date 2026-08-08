"use client";

import { useEffect } from "react";
import useTagStore from "@/stores/tag-store";
import LogoutButton from "@/components/navigation/logout-button";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const loadTags = useTagStore((s: any) => s.loadTags);

  useEffect(() => {
    loadTags();
  }, []);

  return (
    <>
      <header className="w-full bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-2 flex justify-end">
          <LogoutButton />
        </div>
      </header>
      <main>{children}</main>
    </>
  );
}
