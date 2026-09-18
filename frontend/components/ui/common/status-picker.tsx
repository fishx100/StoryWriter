"use client";

import { useState } from "react";
import Popover from "@/components/modals/popover";
import useTagStore from "@/stores/tag-store";
import TagItem from "./tag-item";
import { InlineMessage } from "./inline-message";

type StatusPickerProps = {
  open: boolean;
  positionStyle?: React.CSSProperties;
  currentStatusTagId?: string;
  disabled?: boolean;
  onChange: (tagId: string) => void;
  onClose: () => void;
};

export default function StatusPicker({
  open,
  positionStyle,
  currentStatusTagId,
  disabled = false,
  onChange,
  onClose,
}: StatusPickerProps) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const allTags = useTagStore((s) => s.tags);
  const tags = allTags.filter((tag) => tag.category === "status");
  const createTag = useTagStore((s) => s.createTag);
  const updateTag = useTagStore((s) => s.updateTag);
  const deleteTag = useTagStore((s) => s.deleteTag);
  const setDefaultTag = useTagStore((s) => s.setDefaultTag);

  function handleSelectTag(tagId: string) {
    if (!disabled && !busy) onChange(tagId);
  }

  async function handleSetDefault(tagId: string) {
    setBusy(true);
    setError(null);
    try {
      if (!await setDefaultTag(tagId, "status")) {
        setError("Could not set the default status. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateNewTag() {
    setError(null);

    // create an unnamed, grey placeholder and enter edit mode
    try {
      const newTag = await createTag({
        category: "status",
        name: "unnamed",
        color: "#888888",
      });
      if (!newTag) setError("Could not create new status right now.");
    } catch {
      setError("Could not create new status right now.");
    }
  }

  async function handleSaveEdit(
    tagId: string,
    newName: string,
    newColor: string,
  ) {
    setError(null);
    try {
      const updated = await updateTag({
        id: tagId,
        name: newName.trim(),
        color: newColor,
      });
      if (!updated) setError("Failed to save");
    } catch {
      setError("Failed to save");
    }
  }

  async function handleDeleteTag(tagId: string) {
    // @todo: show a confirmation modal instead of using window.confirm
    if (!confirm("Delete this status? This action cannot be undone.")) return;
    setBusy(true);
    setError(null);
    try {
      const ok = await deleteTag(tagId);
      if (!ok) {
        setError(useTagStore.getState().error ?? "Could not delete status right now.");
      }
    } catch {
      setError("Could not delete status right now.");
    } finally {
      setBusy(false);
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
        {error && <InlineMessage type="error" message={error} />}
        <fieldset disabled={disabled || busy} className="sw-tag-list-layout">
          {tags.map((t) => {
            return (
              <TagItem
                key={t.id}
                tag={t}
                onSelect={handleSelectTag}
                onSaveEdit={handleSaveEdit}
                onDelete={handleDeleteTag}
                onSetDefault={handleSetDefault}
                deleteDisabled={t.is_default}
                selectedTagId={currentStatusTagId}
              />
            );
          })}
        </fieldset>

        <button
          type="button"
          disabled={disabled || busy}
          onClick={() => handleCreateNewTag()}
          className="text-sm text-sky-400 mt-3"
        >
          + Create Status
        </button>
      </div>
    </Popover>
  );
}
