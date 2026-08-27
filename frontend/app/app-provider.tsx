"use client";

import { useEffect } from "react";
import useTagStore from "@/stores/tag-store";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const loadTags = useTagStore((state) => state.loadTags);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  return <main>{children}</main>;
}
