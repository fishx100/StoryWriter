"use client";

import { useState, useRef, useLayoutEffect, useEffect } from "react";
import StatusPicker from "./status-picker";
import useTagStore from "@/stores/tag-store";

type StatusBadgeProps = {
  currentStatusTagId?: string;
  onChange?: (tagId: string) => void;
  disabled?: boolean;
};

const defaultStatusColor = "#888888";

export function StatusBadge({
  currentStatusTagId,
  onChange,
  disabled = false,
}: StatusBadgeProps) {

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [popoverPositionStyle, setPopoverPositionStyle] = useState<
    React.CSSProperties | undefined
  >();

  const currentTag = useTagStore((state) =>
    state.tags.find((tag) => tag.id === currentStatusTagId),
  );
  const currentLabel = currentTag?.name ?? "Unknown";
  const currentColor = currentTag?.color ?? defaultStatusColor;

  useEffect(() => useTagStore.subscribe(
    (state) => state.deletionVersion,
    () => {
      const { lastDeletedTagId, tags } = useTagStore.getState();
      if (lastDeletedTagId !== currentStatusTagId) return;
      const defaultTag = tags.find((tag) => tag.category === "status" && tag.is_default);
      if (defaultTag) onChange?.(defaultTag.id);
    },
  ), [currentStatusTagId, onChange]);

  useLayoutEffect(() => {
    if (!isPickerOpen || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPopoverPositionStyle({
      position: "absolute",
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      zIndex: 9999,
    });
  }, [isPickerOpen]);

  if (!onChange) {
    return (
      <span className="sw-tag-label" style={{ borderColor: currentColor }}>
        {currentLabel}
      </span>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsPickerOpen(true);
        }}
        className="sw-tag-label"
        style={{
          borderColor: currentColor,
        }}
        aria-expanded={isPickerOpen}
        aria-haspopup="dialog"
      >
        {currentLabel}
      </button>

      {isPickerOpen && (
        <StatusPicker
          positionStyle={popoverPositionStyle}
          onChange={onChange}
          currentStatusTagId={currentStatusTagId}
          open={isPickerOpen}
          onClose={() => setIsPickerOpen(false)}
          disabled={disabled}
        />
      )}
    </div>
  );
}

export default StatusBadge;
