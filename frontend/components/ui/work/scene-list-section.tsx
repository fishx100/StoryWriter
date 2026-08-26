"use client";

import { SectionPanel } from "@/components/layout/section-panel";
import { Work } from "@/types/work";
import { Scene } from "@/types/scene";
import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/api";
import { useModal } from "@/components/modals/modal-provider";
import { ConfirmDeleteModal } from "@/components/modals/confirm-delete-modal";
import { SceneList } from "@/components/ui/work/scene-list";
import { SceneSection } from "@/components/ui/work/scene-section";
import { CreateSceneModal } from "@/components/modals/create-scene-modal";
import { InlineMessage } from "../common/inline-message";

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
        setError("Unable to load scenes.");
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
        title={scene.title}
        message={`Delete scene ${scene.title}? This action cannot be undone.`}
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
            setError("Failed to create scene.");
            // @todo: show error popup with retry
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
      setError("Failed to delete scene.");
      // @todo: consider to show error popup
    } finally {
      setLoading(false);
    }
  }

  function exitSceneSection(updatedScene?: Scene) {
    if (updatedScene) {
      setScenes((current) =>
        current.map((s) => (s.id === updatedScene.id ? updatedScene : s)),
      );
    }

    setSelectedSceneId(null);
  }

  // Show the scene section if a scene is selected, otherwise show the list of scenes
  return selectedSceneId ? (
    <SceneSection
      sceneId={selectedSceneId}
      workId={work.id}
      onBack={exitSceneSection}
    />
  ) : (
    <SectionPanel title="Scenes">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="sw-text-bold-medium">Browse and manage story scenes</h2>

        <button onClick={openCreateWorkModal} className="sw-important-button">
          Create Scene
        </button>
      </div>

      {loading ? (
        <InlineMessage message="Loading scenes..." type="info" />
      ) : (
        <>
          {error ? <InlineMessage message={error} type="error" /> : null}
          <SceneList
            workId={work.id}
            scenes={scenes}
            onRequestDelete={openDeleteModal}
            onReorder={handleReorderScenes}
            onSelectScene={(scene) => {
              setSelectedSceneId(scene.id);
            }}
          />
        </>
      )}
    </SectionPanel>
  );
}
