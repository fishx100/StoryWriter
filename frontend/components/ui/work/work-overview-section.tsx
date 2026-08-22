"use client";

import { TextFieldContainer } from "@/components/layout/text-field-container";
import { SectionPanel } from "@/components/layout/section-panel";
import { Work } from "@/types/work";
import StatusBadge from "./status-badge";
import { useState, useEffect, useCallback } from "react";
import { fetchJson } from "@/lib/api";
import { useAutoSave } from "@/hooks/useAutoSave";

type WorkOverviewSectionProps = {
  work: Work;
  setWork?: (work: Work) => void;
};

export function WorkOverviewSection({ work, setWork }: WorkOverviewSectionProps) {
  const [title, setTitle] = useState(work.title);
  const [premise, setPremise] = useState(work.premise || "");
  const [genre, setGenre] = useState(work.genre || "");

  const updateWork = useCallback(async (updatedWork: Work) => {
    try {
      await fetchJson<Work>(`/api/works/${work.id}`, {
        method: "PATCH",
        body: JSON.stringify(updatedWork),
      });
    } catch (error) {
      // @TODO: Handle error (e.g., show a notification)
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
    <SectionPanel title="Overview">
      <div className="flex flex-col gap-3 border-b border-slate-200/10 pb-5">
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
