"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { LoadingPanel } from "@/components/ui/loading-panel";

import { fetchJson } from "@/lib/api";
import type { Work } from "@/types/work";
import { SideNavigationPanel } from "@/components/navigation/side-navigation-panel";
import { WorkOverviewSection } from "@/components/ui/work/work-overview-section";
import { SceneListSection } from "@/components/ui/work/scene-list-section";
import { CollectionListSection } from "@/components/ui/layout/collection-list-section";
import characterTemplate from "@/templates/character.json";
import type { CollectionTemplate } from "@/types/collection";

type WorkPageProps = {
  params: Promise<{ workId: string }>;
};

export default function WorkPage({ params }: WorkPageProps) {
  const { workId } = use(params);
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        if (active) setError("Unable to load work.");
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
    /* @todo: custom error message */
    return (
      <main className="sw-page-shell">
        <LoadingPanel hasError={error !== null} backline="/dashboard" />
      </main>
    );
  } else if (work) {
    return (
      <main className="sw-page-shell">
        <div className="sw-page-with-side-panel-layout">
          <SideNavigationPanel
            backLink="/dashboard"
            /* @todo: avoid hardcoding options */
            options={[
              { id: "overview" as const, label: "Overview" },
              { id: "scenes" as const, label: "Scenes" },
              { id: "characters" as const, label: "Characters" },
            ]}
            onSelectOption={(optionId) => {
              setSelectedItem(optionId as "overview" | "scenes" | "characters");
            }}
          />

          <div className="sw-vertical-panel-gap">
            {selectedItem === "overview" ? (
              <WorkOverviewSection work={work} setWork={setWork} />
            ) : null}

            {selectedItem === "scenes" ? (
              <SceneListSection work={work} />
            ) : null}

            {selectedItem === "characters" ? (
              <CollectionListSection
                key={work.id}
                workId={work.id}
                collectionName="Characters"
                itemLabel="Character"
                template={characterTemplate as CollectionTemplate}
              />
            ) : null}
          </div>
        </div>
      </main>
    );
  }
}
