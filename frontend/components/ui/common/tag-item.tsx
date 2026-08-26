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
      setEditName(tag.name);
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
        className="sw-tag-item-layout"
        role="button"
        tabIndex={0}
      >
        {/* Color picker */}
        {!isEditing ? (
          <span
            className="sw-tag-item-color"
            style={{ background: editColor }}
          />
        ) : (
          <button
            type="button"
            aria-label={`Change color for ${tag.name}`}
            onClick={handleColorClick}
            className="sw-tag-item-color"
            style={{ background: editColor }}
          />
        )}

        {/* Tag name / edit input */}
        {!isEditing ? (
          <span className="sw-tag-item-name">{tag.name}</span>
        ) : (
          <input
            ref={editInputRef}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleEditInputKeyDown}
            className="sw-tag-input"
          />
        )}

        {/* Selected indicator */}
        {tag.id === selectedTagId && (
          <span className="sw-tag-selector" aria-label="Selected">
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
      <div className="flex items-center gap-2 shrink-0">
        {!isEditing ? (
          <>
            <button
              type="button"
              onClick={handleEditClick}
              className="sw-plain-button"
            >
              Edit
            </button>

            <button
              type="button"
              onClick={handleDeleteClick}
              className="sw-delete-button-plain"
            >
              Delete
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
              className="sw-save-button-plain"
            >
              Save
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCancel();
              }}
              className="sw-plain-button"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
