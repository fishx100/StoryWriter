"use client";

import { useEffect, useState } from "react";
import Popover from "@/components/modals/popover";
import useTagStore, { Tag } from "@/stores/tag-store";
import { fetchJson } from "@/lib/api";
import TagItem from "../common/tag-item";

type StatusPickerProps = {
  open: boolean;
  positionStyle?: React.CSSProperties;
  currentStatusTagId?: string;
  workId?: string;
  onChange: (tagId: string) => void;
  onClose: () => void;
};

export default function StatusPicker({
  open,
  positionStyle,
  currentStatusTagId,
  workId,
  onChange,
  onClose,
}: StatusPickerProps) {
  const [selectedTagId, setSelectedTagId] = useState<string | null>(
    currentStatusTagId ?? null,
  );
  const [saving, setSaving] = useState(false);
  // @todo: error is not shown
  const [error, setError] = useState<string | null>(null);

  const [tags, setTags] = useState<Tag[]>([]);
  const createTag = useTagStore((s) => s.createTag);
  const updateTag = useTagStore((s) => s.updateTag);
  const deleteTag = useTagStore((s) => s.deleteTag);

  useEffect(() => {
    // Refresh the list of status tags whenever the saving state changes (i.e. after a tag is created, updated, or deleted)
    const statusTags = useTagStore.getState().getTagsByCategory("status");
    setTags(statusTags);
  }, [saving]);

  async function handleSelectTag(tagId: string) {
    // If this picker is for a work, patch the work first
    try {
      if (workId) {
        await fetchJson(`/api/works/${workId}`, {
          method: "PATCH",
          body: JSON.stringify({ status_tag_id: tagId }),
        });
      }

      setSelectedTagId(tagId);
      onChange(tagId);
    } catch {
      setError("Failed to update");
      console.error(error);
      return;
    }
  }

  async function handleCreateNewTag() {
    const order = tags.length;

    // create an unnamed, grey placeholder and enter edit mode
    try {
      const newTag = await createTag({
        category: "status",
        name: "unnamed",
        color: "#888888",
        order,
      });
      if (newTag) {
        setTags((current) => [...current, newTag]);
      }
    } catch {
      setError("Could not create new status right now.");
      console.error(error);
    }
  }

  // @todo: parent status badge doesn't update when a tag is edited or deleted.
  // Need to trigger a refresh in the parent component when this happens.
  async function handleSaveEdit(
    tagId: string,
    newName: string,
    newColor: string,
  ) {
    setSaving(true);
    try {
      await updateTag({
        id: tagId,
        name: newName.trim(),
        color: newColor,
      });
    } catch {
      setError("Failed to save");
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteTag(tagId: string) {
    // @todo: show a confirmation modal instead of using window.confirm
    if (!confirm("Delete this status? This action cannot be undone.")) return;
    try {
      const ok = await deleteTag(tagId);
      if (ok) {
        // default to first tag if the deleted tag was selected
        if (selectedTagId === tagId) {
          const firstTag = tags.find((t) => t.id !== tagId);
          if (firstTag) await handleSelectTag(firstTag.id);
        }
      }
    } catch {
      setError("Could not delete status right now.");
    }
  }

  return (
    <Popover
      open={open}
      onClose={onClose}
      style={positionStyle}
      className="sw-status-picker"
    >
      <div className="sw-popover-panel">
        <h3 className="sw-text-bold-small mb-2">Status</h3>
        <div className="sw-tag-list-layout">
          {tags.map((t) => {
            return (
              <TagItem
                key={t.id}
                tag={t}
                onSelect={handleSelectTag}
                onSaveEdit={handleSaveEdit}
                onDelete={handleDeleteTag}
                selectedTagId={selectedTagId}
              />
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => handleCreateNewTag()}
          className="text-sm text-sky-400 mt-3"
        >
          + Create Status
        </button>
      </div>
    </Popover>
  );
}
