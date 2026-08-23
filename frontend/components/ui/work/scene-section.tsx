"use client";

import { EditorFieldContainer } from "@/components/layout/editor-field-container";
import { SectionPanel } from "@/components/layout/section-panel";
import { TextFieldContainer } from "@/components/layout/text-field-container";
import { useAutoSave } from "@/hooks/useAutoSave";
import { fetchJson } from "@/lib/api";
import { Scene } from "@/types/scene";
import React, { useCallback, useState, useEffect } from "react";

type SceneProps = {
  workId: string;
  sceneId: string;
  onBack?: (updatedScene?: Scene) => void;
};

export function SceneSection({ 
  workId, 
  sceneId, 
  onBack }: SceneProps) {
  const [scene, setScene] = useState<Scene | null>(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    const fetchScene = async () => {
      try {
        const fetched = await fetchJson<Scene>(`/api/works/${workId}/scenes/${sceneId}`);

        setScene(fetched);
        setTitle(fetched.title ?? "");
        setSummary(fetched.summary ?? "");
        setContent(fetched.content ?? "");

      } catch (error) {
        // @TODO: handle error (e.g., show notification)
        console.error("Failed to fetch scene:", error);
      }
    };
    fetchScene();
  }, []);

  useEffect(() => {
    setScene(getCurrentScene());
  }, [title, summary, content]);

  const updateScene = useCallback(async (updatedScene: Scene | null) => {
    try {
      if (!updatedScene) return;

      await fetchJson<Scene>(`/api/scenes/${sceneId}`, {
        method: "PATCH",
        body: JSON.stringify(updatedScene),
      });
    } catch (error) {
      // @TODO: Handle error (e.g., show a notification)
    }
  }, []);

  useAutoSave(
    `scene-${sceneId}`,
    scene,
    updateScene
  );

  function getCurrentScene(): Scene {
    return {
      id: scene?.id ?? sceneId,
      title,
      summary,
      content,
      status: scene?.status ?? "",
      order_index: scene?.order_index ?? 0,
      word_count: scene?.word_count ?? 0,
    };
  }

  return (
    <SectionPanel title={title || "Loading..."}>
      {onBack ? (
        <div className="mb-4">
          <button
            onClick={() => onBack?.(getCurrentScene())}
            className="sw-section-back-button"
          >
            ← Back to scene list
          </button>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 border-b border-slate-200/10 pb-5">
        <TextFieldContainer
          editable
          fieldName="Title"
          fieldValue={title}
          onChange={setTitle}
        />
        <TextFieldContainer
          editable
          fieldName="Summary"
          fieldValue={summary}
          onChange={setSummary}
        />
        <EditorFieldContainer
          fieldName="Content"
          fieldValue={content}
          onChange={setContent}
        />
      </div>
    </SectionPanel>
  );
}
