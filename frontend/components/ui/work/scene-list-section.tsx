"use client";

import { SectionPanel } from "@/components/layout/section-panel";
import { Work } from "@/types/work";
import { Scene } from "@/types/scene";
import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/api";
import { useModal } from "@/components/modals/modal-provider";
import { ConfirmDeleteModal } from "@/components/modals/confirm-delete-modal";
import { SceneList } from "@/components/scene-list";
import { CreateSceneModal } from "@/components/create-scene-modal";

type SceneListSectionProps = {
  work: Work;
};

export function SceneListSection({ work }: SceneListSectionProps) {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchScenes() {
      setLoading(true);
      try {
        const data = await fetchJson<Scene[]>(`/api/works/${work.id}/scenes`);
        setScenes(data);
      } catch (error) {
        console.error("Failed to fetch scenes:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchScenes();
  }, [work.id]);

  const { openModal, closeModal } = useModal();

  function openDeleteModal(scene: Scene) {
    openModal(
      <ConfirmDeleteModal
        workTitle={scene.title}
        onClose={closeModal}
        onConfirm={async () => {
          await handleDeleteScene(scene);
          closeModal();
        }}
      />,
    );
  }

  function openCreateWorkModal() {
    openModal(
      <CreateSceneModal
        workId={work.id}
        onClose={closeModal}
        onSubmit={async (input) => {
          try {
            const s = await fetchJson<Scene>(`/api/works/${work.id}/scenes`, {
              method: "POST",
              body: JSON.stringify(input),
            });
            setScenes((current) => [...current, s]);
            closeModal();
            return s;
          } catch (e) {
            setError("Could not create scene.");
            throw e;
          }
        }}
      />,
    );
  }

  async function handleReorderScenes(order: string[]) {
    try {
      await fetchJson<void>(`/api/works/${work.id}/scenes/reorder`, {
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
      setError("Unable to reorder scenes.");
    }
  }

  async function handleDeleteScene(scene: Scene) {
    setLoading(true);

    try {
      await fetchJson<void>(`/api/scenes/${scene.id}`, {
        method: "DELETE",
      });
      setScenes((current) => current.filter((s) => s.id !== scene.id));
    } catch {
      setError("Unable to delete scene.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SectionPanel title="Scenes">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold">
          Browse and manage story scenes
        </h2>

        <button onClick={openCreateWorkModal} className="sw-important-button">
          Create Scene
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-[2rem] border border-dashed border-slate-200/10 bg-slate-900/50 p-8 text-slate-300">
          Loading scenes...
        </div>
      ) : (
        <>
          <SceneList
            workId={work.id}
            scenes={scenes}
            onRequestDelete={openDeleteModal}
            onReorder={handleReorderScenes}
            onSelectScene={(scene) => {
              setSelectedSceneId(scene.id);
            }}
          />
          {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        </>
      )}
    </SectionPanel>
  );
}
