"use client";

import { useEffect, useState } from "react";

import { fetchJson } from "@/lib/api";
import { DashboardHeader } from "../dashboard/dashboard-header";
import { WorklistSection } from "../dashboard/worklist-section";
import { Work } from "@/types/work";
import { InlineMessage } from "../common/inline-message";

type WorkDashboardProps = {};

export function WorkDashboard({}: WorkDashboardProps) {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

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

    void loadWorks();

    return () => {
      active = false;
    };
  }, []);

  const totalWorks = works.length;

  return (
    <main className="sw-page-shell">
      <div className="sw-inter-section-layout">
        <DashboardHeader totalWorks={totalWorks} />

        <WorklistSection works={works} setWorks={setWorks} />

        {loading && <InlineMessage type="info" message="Loading works..." />}
        {error && <InlineMessage type="error" message={error} />}
      </div>
    </main>
  );
}
