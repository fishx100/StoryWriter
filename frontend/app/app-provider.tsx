"use client";

import { useEffect } from "react";
import useTagStore from "@/stores/tag-store";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const loadTags = useTagStore((s: any) => s.loadTags);

  useEffect(() => {
    loadTags();
  }, []);

  return <>{children}</>;
}
