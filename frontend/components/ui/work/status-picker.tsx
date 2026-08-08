"use client";

import { useEffect, useState, useRef } from "react";
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
  const [error, setError] = useState<string | null>(null);

  const [tags, setTags] = useState<Tag[]>([]);
  const createTag = useTagStore((s) => s.createTag);
  const updateTag = useTagStore((s) => s.updateTag);
  const deleteTag = useTagStore((s) => s.deleteTag);

  useEffect(() => {
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
      setError("Could not update work status right now.");
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
    }
  }

  async function handleSaveEdit(
    tagId: string,
    newName: string,
    newColor: string,
  ) {
    setSaving(true);
    try {
      const saved = await updateTag({
        id: tagId,
        name: newName.trim(),
        color: newColor,
      });
    } catch {
      setError("Could not save changes right now.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteTag(tagId: string) {
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
      <div className="p-3 w-72 bg-zinc-900 rounded border border-zinc-700">
        <div className="mb-2">
          <h3 className="text-sm font-semibold">Status</h3>
          <p className="text-xs text-slate-400">
            Assign a status to this work.
          </p>
        </div>

        <div className="divide-y divide-zinc-800 max-h-56 overflow-auto">
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

        <div className="mt-3">
          <button
            type="button"
            onClick={() => handleCreateNewTag()}
            className="text-sm text-sky-400"
          >
            + Create Status
          </button>
        </div>
      </div>
    </Popover>
  );
}
