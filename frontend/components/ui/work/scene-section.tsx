"use client";

import { EditorFieldContainer } from "@/components/layout/editor-field-container";
import { SectionPanel } from "@/components/layout/section-panel";
import { TextFieldContainer } from "@/components/layout/text-field-container";
import { useAutoSave } from "@/hooks/useAutoSave";
import { fetchJson } from "@/lib/api";
import { Scene } from "@/types/scene";
import React, { useCallback, useState, useEffect, useRef } from "react";
import { InlineMessageProps } from "../common/inline-message";
import { countWords } from "../../../utils/TextUtils";

type SceneProps = {
  workId: string;
  sceneId: string;
  onBack?: (updatedScene?: Scene) => void;
};

export function SceneSection({ workId, sceneId, onBack }: SceneProps) {
  const [scene, setScene] = useState<Scene | null>(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [inlineMessage, setInlineMessage] = useState<
    InlineMessageProps | undefined
  >(undefined);
  const previousSavedSceneRef = useRef<Scene | null>(null);

  useEffect(() => {
    const fetchScene = async () => {
      try {
        setInlineMessage({ type: "info", message: "Loading..." });

        const fetched = await fetchJson<Scene>(
          `/api/works/${workId}/scenes/${sceneId}`,
        );

        setInlineMessage(undefined);

        setTitle(fetched.title ?? "");
        setSummary(fetched.summary ?? "");
        setContent(fetched.content ?? "");
        setScene(fetched);

        previousSavedSceneRef.current = fetched;
      } catch (error) {
        setInlineMessage({ type: "error", message: "Failed to load scene." });
      }
    };
    fetchScene();
  }, []);

  useEffect(() => {
    setScene(getCurrentScene());
  }, [title, summary, content]);

  const updateScene = useCallback(async (updatedScene: Scene | null) => {
    if (!updatedScene) return;

    // @todo: temporary fix to prevent autosave when entering the page
    const prev = previousSavedSceneRef.current;
    if (
      prev &&
      prev.title === updatedScene.title &&
      prev.summary === updatedScene.summary &&
      prev.content === updatedScene.content
    )
      return;

    try {
      setInlineMessage({ type: "info", message: "Saving..." });

      await fetchJson<Scene>(`/api/scenes/${sceneId}`, {
        method: "PATCH",
        body: JSON.stringify(updatedScene),
      });

      previousSavedSceneRef.current = updatedScene;

      setInlineMessage({ type: "info", message: "Saved" });
    } catch (error) {
      setInlineMessage({ type: "error", message: "Failed to save." });
      // @todo: retry
    }
  }, []);

  useAutoSave(`scene-${sceneId}`, scene, updateScene);

  const wordCount = countWords(content);

  function getCurrentScene(): Scene {
    return {
      id: scene?.id ?? sceneId,
      title,
      summary,
      content,
      status: scene?.status ?? "",
      order_index: scene?.order_index ?? 0,
      word_count: wordCount,
    };
  }

  return (
    <SectionPanel title={title} inlineMessage={inlineMessage}>
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

      <div className="sw-section-layout">
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
        <p className="sw-text-plain-small text-right" aria-live="polite">
          {wordCount} {wordCount === 1 ? "word" : "words"}
        </p>
      </div>
    </SectionPanel>
  );
}
