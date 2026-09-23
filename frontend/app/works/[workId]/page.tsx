"use client";

import { use, useEffect, useState } from "react";
import { LoadingPanel } from "@/components/ui/loading-panel";

import { fetchJson } from "@/lib/api";
import type { Work } from "@/types/work";
import { SideNavigationPanel } from "@/components/navigation/side-navigation-panel";
import { WorkOverviewSection } from "@/components/ui/work/work-overview-section";
import { CollectionListSection } from "@/components/ui/layout/collection-list-section";
import characterTemplate from "@/templates/character.json";
import sceneTemplate from "@/templates/scene.json";
import type { CollectionTemplate } from "@/types/collection";
import { SignIn } from "@/components/ui/dashboard/sign-in";

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
  const [selectedCollectionItemId, setSelectedCollectionItemId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadWork() {
      setLoading(true);
      setError(null);
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

  if (loading || error || !work) {
    return (
      <main className="sw-page-shell">
        <LoadingPanel hasError={error !== null} backline="/dashboard" />
      </main>
    );
  } else if (work) {
    return (
      <main className="sw-page-shell">
        <div className="sw-work-workspace">
          <SideNavigationPanel
            backLink="/dashboard"
            selectedItem={selectedItem}
            /* @todo: avoid hardcoding options */
            options={[
              { id: "overview" as const, label: "Overview", icon: "work" },
              { id: "scenes" as const, label: "Scenes", icon: "scenes" },
              { id: "characters" as const, label: "Characters", icon: "characters" },
            ]}
            onSelectOption={(optionId) => {
              setSelectedCollectionItemId(null);
              setSelectedItem(optionId as "overview" | "scenes" | "characters");
            }}
          />

          <div className="sw-work-main">
            <header className="sw-work-header">
              <SignIn />
            </header>
            <div className="sw-work-content">
              {selectedItem === "overview" ? (
                <WorkOverviewSection key={work.id} work={work} setWork={setWork} />
              ) : null}

              {selectedItem === "characters" ? (
                <CollectionListSection
                  key={work.id}
                  workId={work.id}
                  collectionName="Characters"
                  selectedItemId={selectedCollectionItemId}
                  onSelectItem={setSelectedCollectionItemId}
                  itemLabel="Character"
                  template={characterTemplate as CollectionTemplate}
                />
              ) : null}

              {selectedItem === "scenes" ? (
                <CollectionListSection
                  key={`scenes-${work.id}`}
                  workId={work.id}
                  collectionName="Scenes"
                  selectedItemId={selectedCollectionItemId}
                  onSelectItem={setSelectedCollectionItemId}
                  itemLabel="Scene"
                  template={sceneTemplate as CollectionTemplate}
                />
              ) : null}
            </div>
          </div>
        </div>
      </main>
    );
  }
}
