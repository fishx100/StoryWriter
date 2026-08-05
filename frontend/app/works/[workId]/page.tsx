"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

import { fetchJson } from "@/lib/api";
import type { Work } from "@/types/work";
import { SideNavigationPanel } from "@/components/navigation/side-navigation-panel";
import { WorkOverviewSection } from "@/components/ui/work/work-overview-section";
import { SceneListSection } from "@/components/ui/work/scene-list-section";
import { CharacterListSection } from "@/components/ui/work/character-list-section";

type WorkPageProps = {
  params: Promise<{ workId: string }>;
};

export default function WorkPage({ params }: WorkPageProps) {
  const { workId } = use(params);
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<
    "overview" | "scenes" | "characters"
  >("overview");

  useEffect(() => {
    let active = true;

    async function loadWork() {
      try {
        const workData = await fetchJson<Work>(`/api/works/${workId}`);
        if (active) setWork(workData);
      } catch (e) {
        console.error("Unable to load work.", e);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadWork();

    return () => {
      active = false;
    };
  }, [workId]);

  if (loading) {
    return (
      <main className="sw-page-shell">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-slate-200/10 bg-slate-950/80 p-6">
          Loading work...
        </div>
      </main>
    );
  }

  if (!work) {
    return (
      <main className="sw-page-shell">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-slate-200/10 bg-slate-950/80 p-6">
          <p className="text-slate-300">Work not found.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="sw-page-shell">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
        <SideNavigationPanel
          backLink="/dashboard"
          options={[
            { id: "overview" as const, label: "Overview" },
            { id: "scenes" as const, label: "Scenes" },
            { id: "characters" as const, label: "Characters" },
          ]}
          onSelectOption={(optionId) => {
            setSelectedItem(optionId as "overview" | "scenes" | "characters");
          }}
        />

        {selectedItem === "overview" ? (
          <div className="flex-col gap-6 flex-1">
            <WorkOverviewSection work={work} />
          </div>
        ) : null}

        {selectedItem === "scenes" ? (
          <div className="flex-col gap-6 flex-1">
            <SceneListSection work={work} />
          </div>
        ) : null}
        {selectedItem === "characters" ? (
          <div className="flex-col gap-6 flex-1">
            <CharacterListSection work={work} />
          </div>
        ) : null}
      </div>
    </main>
  );
}
