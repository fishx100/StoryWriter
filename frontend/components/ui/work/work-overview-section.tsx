"use client";

import { TextFieldContainer } from "@/components/layout/text-field-container";
import { SectionPanel } from "@/components/layout/section-panel";
import { Work } from "@/types/work";
import StatusBadge from "./status-badge";
import { useState, useEffect, useCallback, useRef } from "react";
import { fetchJson } from "@/lib/api";
import { useAutoSave } from "@/hooks/useAutoSave";
import { InlineMessageProps } from "../common/inline-message";

type WorkOverviewSectionProps = {
  work: Work;
  setWork?: (work: Work) => void;
};

export function WorkOverviewSection({
  work,
  setWork,
}: WorkOverviewSectionProps) {
  const [title, setTitle] = useState(work.title);
  const [premise, setPremise] = useState(work.premise || "");
  const [genre, setGenre] = useState(work.genre || "");
  const [inlineMessage, setInlineMessage] = useState<InlineMessageProps | undefined>(undefined);
  const previousSavedWorkRef = useRef<Work | null>(work);

  const updateWork = useCallback(async (updatedWork: Work) => {
    // @todo: temporary fix to prevent autosave when entering the page
    const prev = previousSavedWorkRef.current;
    if (prev &&
      updatedWork.title === prev.title &&
      updatedWork.premise === prev.premise &&
      updatedWork.genre === prev.genre
    ) return;

    try {
      setInlineMessage({ type: "info", message: "Saving..." });
      await fetchJson<Work>(`/api/works/${updatedWork.id}`, {
        method: "PATCH",
        body: JSON.stringify(updatedWork),
      });

      previousSavedWorkRef.current = updatedWork;

      setInlineMessage({ type: "info", message: "Saved" });
    } catch (error) {
      setInlineMessage({ type: "error", message: "Failed to save." });
      // @todo: retry
    }
  }, []);

  useAutoSave(
    `work-${work.id}-overview`,
    work,
    updateWork
  );

  useEffect(() => {
    if (setWork) {
      setWork({
        ...work,
        title,
        premise,
        genre,
      });
    }
  }, [title, premise, genre]);

  return (
    <SectionPanel title="Overview" inlineMessage={inlineMessage}>
      <div className="sw-section-layout">
        <StatusBadge status_tag_id={work.status_tag_id} workId={work.id} />
        <TextFieldContainer
          editable
          fieldName="Title"
          fieldValue={title}
          onChange={setTitle}
        />
        <TextFieldContainer
          editable
          fieldName="Premise"
          fieldValue={premise}
          onChange={setPremise}
        />
        <TextFieldContainer
          editable
          fieldName="Genre"
          fieldValue={genre}
          onChange={setGenre}
        />
      </div>
    </SectionPanel>
  );
}
