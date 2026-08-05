"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";

import { ConfirmDeleteModal } from "@/components/modals/confirm-delete-modal";
import { CreateWorkModal } from "@/components/modals/create-work-modal";
import { CharacterList } from "@/components/character-list";
import { fetchJson } from "@/lib/api";
import { SceneList } from "@/components/scene-list";
import type { Character } from "@/types/character";
import type { Work } from "@/types/work";
import type { Scene } from "@/types/scene";
import type { UpdateWorkInput } from "@/types/work";
import { FieldContainer } from "@/components/layout/field-container";
import { SideNavigationPanel } from "@/components/navigation/side-navigation-panel";
import { WorkOverviewSection } from "@/components/ui/work/work-overview-section";
import { SceneListSection } from "@/components/ui/work/scene-list-section";

type WorkPageProps = {
  params: Promise<{ workId: string }>;
};

function normalizeStatus(status: string): "todo" | "in_progress" | "done" {
  if (status === "in_progress" || status === "planning") {
    return "in_progress";
  }
  if (status === "done" || status === "revising") {
    return "done";
  }
  return "todo";
}

export default function WorkPage({ params }: WorkPageProps) {
  const { workId } = use(params);
  const [work, setWork] = useState<Work | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [scenesLoaded, setScenesLoaded] = useState(false);
  const [scenesLoading, setScenesLoading] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [charactersLoaded, setCharactersLoaded] = useState(false);
  const [charactersLoading, setCharactersLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<
    "overview" | "scenes" | "characters"
  >("overview");
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [sceneEditing, setSceneEditing] = useState(false);
  const [sceneContent, setSceneContent] = useState("");
  const [sceneSaving, setSceneSaving] = useState(false);
  const [workError, setWorkError] = useState<string | null>(null);
  const [sceneError, setSceneError] = useState<string | null>(null);
  const [characterError, setCharacterError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Scene | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editWorkOpen, setEditWorkOpen] = useState(false);
  const [editingWork, setEditingWork] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadWork() {
      try {
        const workData = await fetchJson<Work>(`/api/works/${workId}`);
        if (active) {
          setWork(workData);
          setWorkError(null);
        }
      } catch {
        if (active) {
          setWorkError("Unable to load work.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadWork();

    return () => {
      active = false;
    };
  }, [workId]);

  async function loadScenesOnce() {
    if (scenesLoaded || scenesLoading || !work) {
      return;
    }

    setScenesLoading(true);
    try {
      const data = await fetchJson<Scene[]>(`/api/works/${workId}/scenes`);
      setScenes(data);
      setScenesLoaded(true);
      setSceneError(null);
    } catch {
      setSceneError("Unable to load scenes.");
    } finally {
      setScenesLoading(false);
    }
  }

  async function loadCharactersOnce() {
    if (charactersLoaded || charactersLoading || !work) {
      return;
    }

    setCharactersLoading(true);
    try {
      const data = await fetchJson<Character[]>(
        `/api/works/${workId}/characters`,
      );
      setCharacters(data);
      setCharactersLoaded(true);
      setCharacterError(null);
    } catch {
      setCharacterError("Unable to load characters.");
    } finally {
      setCharactersLoading(false);
    }
  }

  const statusSummary = useMemo(() => {
    if (!work) {
      return "Todo";
    }
    return normalizeStatusLabel(work.status);
  }, [work]);

  const selectedScene = useMemo(
    () => scenes.find((scene) => scene.id === selectedSceneId) ?? null,
    [scenes, selectedSceneId],
  );

  const sceneWordCount = useMemo(
    () => sceneContent.trim().split(/\s+/).filter(Boolean).length,
    [sceneContent],
  );
  const selectedSceneWordCount = sceneEditing
    ? sceneWordCount
    : (selectedScene?.word_count ?? 0);

  useEffect(() => {
    if (selectedScene) {
      setSceneContent(selectedScene.content);
      setSceneEditing(false);
    }
  }, [selectedScene]);

  async function handleStatusChange(status: string) {
    if (!work) {
      return;
    }

    try {
      const updated = await fetchJson<Work>(`/api/works/${work.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setWork(updated);
      setWorkError(null);
    } catch {
      setWorkError("Unable to update work status.");
    }
  }

  async function handleSaveWork(input: {
    title: string;
    premise: string;
    genre: string;
    status: string;
  }) {
    if (!work) {
      return;
    }

    setEditingWork(true);
    setWorkError(null);

    try {
      const updated = await fetchJson<Work>(`/api/works/${work.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: input.title,
          premise: input.premise,
          genre: input.genre,
          status: input.status,
        }),
      });
      setWork(updated);
      setEditWorkOpen(false);
    } catch {
      setWorkError("Unable to update work details.");
    } finally {
      setEditingWork(false);
    }
  }

  async function handleDeleteScene() {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    try {
      await fetchJson<void>(`/api/scenes/${deleteTarget.id}`, {
        method: "DELETE",
      });
      setScenes((current) =>
        current.filter((scene) => scene.id !== deleteTarget.id),
      );
      if (selectedSceneId === deleteTarget.id) {
        setSelectedSceneId(null);
        setSceneEditing(false);
        setSceneContent("");
      }
      setDeleteTarget(null);
    } catch {
      setSceneError("Unable to delete scene.");
    } finally {
      setDeleting(false);
    }
  }

  async function handleReorderScenes(order: string[]) {
    try {
      await fetchJson<void>(`/api/works/${workId}/scenes/reorder`, {
        method: "POST",
        body: JSON.stringify({ order }),
      });
      setScenes((current) => {
        const map = new Map(current.map((scene) => [scene.id, scene]));
        return order
          .map((id) => map.get(id))
          .filter((scene): scene is Scene => scene !== undefined);
      });
    } catch {
      setSceneError("Unable to reorder scenes.");
    }
  }

  async function handleUpdateSceneStatus(sceneId: string, status: string) {
    try {
      const updated = await fetchJson<Scene>(`/api/scenes/${sceneId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setScenes((current) =>
        current.map((scene) => (scene.id === updated.id ? updated : scene)),
      );
    } catch {
      setSceneError("Unable to update scene status.");
    }
  }

  async function handleSaveSceneContent() {
    if (!selectedScene) {
      return;
    }

    setSceneSaving(true);
    setSceneError(null);

    try {
      const updated = await fetchJson<Scene>(
        `/api/scenes/${selectedScene.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ content: sceneContent }),
        },
      );
      setScenes((current) =>
        current.map((scene) => (scene.id === updated.id ? updated : scene)),
      );
      setSceneContent(updated.content);
      setSceneEditing(false);
    } catch {
      setSceneError("Unable to save scene content.");
    } finally {
      setSceneSaving(false);
    }
  }

  function normalizeStatusLabel(status: string): string {
    if (status === "in_progress" || status === "planning") {
      return "In progress";
    }
    if (status === "done" || status === "revising") {
      return "Done";
    }
    return "Todo";
  }

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
          <Link
            href="/dashboard"
            className="mt-4 inline-block rounded-full border border-slate-200/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-900"
          >
            Back to dashboard
          </Link>
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
            if (optionId === "scenes") {
              setSelectedSceneId(null);
              setSceneEditing(false);
              setSceneContent("");
              void loadScenesOnce();
            }
            if (optionId === "characters") {
              void loadCharactersOnce();
            }
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
      </div>
    </main>
  );
}
