"use client";

import { useEffect, useMemo, useState } from "react";
import useTagStore from "@/stores/tag-store";

import { fetchJson } from "@/lib/api";
import { DashboardHeader } from "./ui/dashboard/dashboard-header";
import { WorklistSection } from "./ui/dashboard/worklist-section";
import { Work } from "@/types/work";

type WorkDashboardProps = {
  mode: "dashboard" | "works";
};

export function WorkDashboard({ mode }: WorkDashboardProps) {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const isTagsLoaded = useTagStore.getState().isLoaded;

    async function loadWorks() {
      try {
        const data = await fetchJson<Work[]>("/api/works");
        if (active) {
          setWorks(data);
        }
      } catch {
        if (active) {
          setError("Unable to load works right now.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    // Only load works after tags are loaded (ensures tag reference data available)
    if (isTagsLoaded) {
      void loadWorks();
    } else {
      // subscribe to tagStore changes once
      const unsubscribe = useTagStore.subscribe(
      (state) => state.isLoaded,
      (isLoaded) => {
        if (isLoaded) {
          void loadWorks();
          unsubscribe();
        }
      }
    );
    }

    return () => {
      active = false;
    };
  }, []);

  const totalWorks = useMemo(() => works.length, [works]);

  return (
    <main className="sw-page-shell">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <DashboardHeader totalWorks={totalWorks} />

        <WorklistSection works={works} setWorks={setWorks} />
      </div>
    </main>
  );
}
