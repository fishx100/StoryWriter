"use client";

import { TextFieldContainer } from "@/components/layout/text-field-container";
import Link from "next/link";
import { Icon } from "../common/icon";
import { Work } from "@/types/work";
import StatusBadge from "../common/status-badge";
import { type Dispatch, type SetStateAction, useState, useEffect, useCallback, useRef } from "react";
import { fetchJson } from "@/lib/api";
import { useAutoSave } from "@/hooks/useAutoSave";
import { InlineMessage, type InlineMessageProps } from "../common/inline-message";

type WorkOverviewSectionProps = {
  work: Work;
  setWork: Dispatch<SetStateAction<Work | null>>;
};

export function WorkOverviewSection({
  work,
  setWork,
}: WorkOverviewSectionProps) {
  const [title, setTitle] = useState(work.title);
  const [premise, setPremise] = useState(work.premise || "");
  const [genre, setGenre] = useState(work.genre || "");
  const [statusSaving, setStatusSaving] = useState(false);
  const [inlineMessage, setInlineMessage] = useState<
    InlineMessageProps | undefined
  >(undefined);
  const previousSavedWorkRef = useRef<Work | null>(work);

  const updateWork = useCallback(async (updatedWork: Work) => {
    // @todo: temporary fix to prevent autosave when entering the page
    const prev = previousSavedWorkRef.current;
    if (
      prev &&
      updatedWork.title === prev.title &&
      updatedWork.premise === prev.premise &&
      updatedWork.genre === prev.genre
    )
      return;

    try {
      setInlineMessage({ type: "info", message: "Saving..." });
      await fetchJson<Work>(`/api/works/${updatedWork.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: updatedWork.title,
          premise: updatedWork.premise,
          genre: updatedWork.genre,
        }),
      });

      previousSavedWorkRef.current = updatedWork;

      setInlineMessage({ type: "info", message: "Saved" });
    } catch (error) {
      setInlineMessage({ type: "error", message: "Failed to save." });
      // @todo: retry
    }
  }, []);

  useAutoSave(`work-${work.id}-overview`, work, updateWork);

  async function handleStatusChange(tagId: string) {
    setStatusSaving(true);
    setInlineMessage({ type: "info", message: "Saving..." });
    try {
      const updated = await fetchJson<Work>(`/api/works/${work.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status_tag_id: tagId }),
      });
      setWork((current) => current?.id === work.id
        ? { ...current, status_tag_id: updated.status_tag_id }
        : current);
      setInlineMessage({ type: "info", message: "Saved" });
    } catch {
      setInlineMessage({ type: "error", message: "Failed to update status." });
    } finally {
      setStatusSaving(false);
    }
  }

  useEffect(() => {
      setWork((current) => current?.id === work.id ? {
        ...current,
        title,
        premise,
        genre,
      } : current);
  }, [title, premise, genre]);

  return (
    <section className="sw-work-overview">
      <div className="sw-work-hero">
        <div className="sw-work-cover-placeholder">
          <Icon name="feather" size={44} />
          <span className="sw-cover-placeholder-label">Cover<br />placeholder</span>
        </div>
        <div className="sw-work-hero-content">
          <h1 className="sw-work-title">{title || "Untitled work"}</h1>
          <p className="sw-work-premise">{premise || "Add a premise below to introduce your story."}</p>
          <div className="sw-work-metadata">
            <StatusBadge
              currentStatusTagId={work.status_tag_id}
              onChange={handleStatusChange}
              disabled={statusSaving}
            />
            <span className="sw-work-genre" title={genre || "Unspecified"}>{genre || "Unspecified"}</span>
          </div>
        </div>
      </div>

      <div>
        <div className="sw-work-details-heading">
          <h2 className="sw-text-bold-medium">Work Details</h2>
          {inlineMessage && <InlineMessage {...inlineMessage} />}
        </div>
        <p className="sw-work-edit-hint">Click a field to edit. Changes save automatically.</p>
        <div className="sw-work-details">
          <TextFieldContainer
            editable
            layout="row"
            icon="work"
            fieldName="Title"
            fieldValue={title}
            onChange={setTitle}
          />
          <TextFieldContainer
            editable
            multiline
            layout="row"
            icon="summary"
            fieldName="Premise"
            fieldValue={premise}
            onChange={setPremise}
          />
          <TextFieldContainer
            editable
            layout="row"
            icon="genre"
            fieldName="Genre"
            fieldValue={genre}
            onChange={setGenre}
          />
        </div>
      </div>
    </section>
  );
}
