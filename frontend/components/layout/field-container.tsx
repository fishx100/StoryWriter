"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * A container component for a field with a title and children. It can be selectable and show hover effects.
 */

type FieldContainerProps = {
  fieldName: string;
  children: React.ReactNode;
  showHover?: boolean;
  selectable?: boolean;
  onSelect?: () => void;
};

export function FieldContainer({
  fieldName,
  children,
  selectable = false,
  showHover = false,
  onSelect,
}: FieldContainerProps) {
  const [isSelected, setIsSelected] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectable) return;

    function handleDocumentClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsSelected(false);
      }
    }

    document.addEventListener("mousedown", handleDocumentClick);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, [selectable]);

  function handleContainerClick() {
    if (!selectable) return;

    setIsSelected(true);
    onSelect?.();
  }

  const containerClass = [
    "sw-field-container",
    showHover && !isSelected ? "sw-border-hover" : "",
    isSelected ? "sw-border-focus" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={containerRef}
      className={containerClass}
      onClick={handleContainerClick}
    >
      <p className="sw-field-title">{fieldName}</p>
      {children}
    </div>
  );
}
