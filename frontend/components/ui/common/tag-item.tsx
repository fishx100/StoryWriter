"use client";

import React, { useEffect, useRef, useState } from "react";
import type { Tag } from "@/stores/tag-store";

type Props = {
  tag: Tag;
  onSelect: (id: string) => void;
  onSaveEdit: (id: string, newName: string, newColor: string) => void;
  onDelete: (id: string) => void;
  selectedTagId?: string | null;
};

export default function TagItem({
  tag,
  onSelect,
  onSaveEdit,
  onDelete,
  selectedTagId,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(tag.name);
  const [editColor, setEditColor] = useState(tag.color ?? "#888888");

  const editInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  // Keep local edit state in sync if the tag changes externally.
  useEffect(() => {
    if (isEditing) return;

    setEditName(tag.name);
    setEditColor(tag.color ?? "#888888");
  }, [tag.name, tag.color, isEditing]);

  // Focus and select the input when editing starts.
  useEffect(() => {
    if (!isEditing) return;

    editInputRef.current?.focus();
    editInputRef.current?.select();
  }, [isEditing]);

  const handleRowKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Enter" && e.key !== " ") return;

    e.preventDefault();
    onSelect(tag.id);
  };

  const handleColorClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    colorInputRef.current?.click();
  };

  const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onDelete(tag.id);
  };

  const handleSave = () => {
    const trimmedName = editName.trim();

    if (!trimmedName) {
      return;
    }

    setIsEditing(false);
    onSaveEdit(tag.id, trimmedName, editColor);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditName(tag.name);
    setEditColor(tag.color ?? "#888888");
  };

  const handleEditInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleSave();
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      handleCancel();
    }
  };

  return (
    <div className="flex items-center min-w-0">
      {/* Clickable tag row */}
      <div
        onClick={() => onSelect(tag.id)}
        onKeyDown={handleRowKeyDown}
        className="flex-1 min-w-0 flex items-center gap-3 text-left cursor-pointer"
        role="button"
        tabIndex={0}
      >
        {/* Color picker */}
        {!isEditing ? (
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ background: editColor }}
          />
        ) : (
          <button
            type="button"
            aria-label={`Change color for ${tag.name}`}
            onClick={handleColorClick}
            className="w-3 h-3 rounded-full shrink-0"
            style={{ background: editColor }}
          />
        )}

        {/* Tag name / edit input */}
        {!isEditing ? (
          <span className="flex-1 min-w-0 truncate">{tag.name}</span>
        ) : (
          <input
            ref={editInputRef}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleEditInputKeyDown}
            className="flex-1 min-w-0 p-1 bg-zinc-800 rounded"
          />
        )}

        {/* Selected indicator */}
        {tag.id === selectedTagId && (
          <span className="text-amber-400 shrink-0" aria-label="Selected">
            ✓
          </span>
        )}
      </div>

      {/* Hidden color input */}
      <input
        ref={colorInputRef}
        type="color"
        value={editColor}
        onChange={(e) => setEditColor(e.target.value)}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      {/* Actions */}
      {!isEditing ? (
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleEditClick}
            className="px-2 text-xs text-slate-300 hover:text-white"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={handleDeleteClick}
            className="px-2 text-xs text-red-500 hover:text-red-400"
          >
            Delete
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSave();
            }}
            className="px-2 text-xs text-sky-400"
          >
            Save
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCancel();
            }}
            className="px-2 text-xs text-slate-300"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
