"use client";

import { useState, useRef, useLayoutEffect, useEffect } from "react";
import StatusPicker from "./status-picker";
import useTagStore from "@/stores/tag-store";

type StatusBadgeProps = {
  status_tag_id: string;
  workId?: string;
};

export function StatusBadge({ status_tag_id, workId }: StatusBadgeProps) {
  const [currentTagId, setCurrentTagId] = useState(status_tag_id);
  const [currentLabel, setCurrentLabel] = useState("Todo");
  const [currentColor, setCurrentColor] = useState("#888888");

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [popoverPositionStyle, setPopoverPositionStyle] = useState<
    React.CSSProperties | undefined
  >();

  const getTag = useTagStore((s) => s.getTag);

  useEffect(() => {
    const tag = getTag(currentTagId);
    if (tag) {
      setCurrentLabel(tag.name);
      setCurrentColor(tag.color || "#888888");
    }
    console.log("StatusBadge: currentTagId changed", currentTagId, tag);
  }, [currentTagId]);

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

  async function handleOnChange(tagId: string) {
    setCurrentTagId(tagId);
    const tag = getTag?.(tagId);
    if (tag?.name) setCurrentLabel(tag.name);
    if (tag?.color) setCurrentColor(tag.color);
  }

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
        className={`sw-tag-label`}
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
          onChange={handleOnChange}
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
