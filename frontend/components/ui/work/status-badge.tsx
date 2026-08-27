"use client";

import { useState, useRef, useLayoutEffect } from "react";
import StatusPicker from "./status-picker";
import useTagStore from "@/stores/tag-store";

type StatusBadgeProps = {
  status_tag_id: string;
  workId?: string;
};

const defaultStatusColor = "#888888";

export function StatusBadge({ status_tag_id, workId }: StatusBadgeProps) {
  const [currentTagId, setCurrentTagId] = useState(status_tag_id);

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [popoverPositionStyle, setPopoverPositionStyle] = useState<
    React.CSSProperties | undefined
  >();

  const currentTag = useTagStore((state) =>
    state.tags.find((tag) => tag.id === currentTagId),
  );
  const currentLabel = currentTag?.name ?? "Unknown";
  const currentColor = currentTag?.color ?? defaultStatusColor;

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

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
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
          onChange={setCurrentTagId}
          currentStatusTagId={currentTagId}
          open={isPickerOpen}
          onClose={() => setIsPickerOpen(false)}
          workId={workId}
        />
      )}
    </div>
  );
}

export default StatusBadge;
