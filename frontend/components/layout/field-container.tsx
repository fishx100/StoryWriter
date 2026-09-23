"use client";

import React, { useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "@/components/ui/common/icon";

/**
 * A container component for a field with a title and children. It can be selectable and show hover effects.
 */

type FieldContainerProps = {
  fieldName: string;
  children: React.ReactNode;
  showHover?: boolean;
  selectable?: boolean;
  onSelect?: () => void;
  layout?: "panel" | "row";
  icon?: IconName;
};

export function FieldContainer({
  fieldName,
  children,
  selectable = false,
  showHover = false,
  onSelect,
  layout = "panel",
  icon,
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
    layout === "row" ? "sw-field-row" : "sw-field-container",
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
      <p className={layout === "row" ? "sw-field-row-label" : "sw-field-title"}>
        {icon && <Icon name={icon} size={16} />}
        {fieldName}
      </p>
      {children}
    </div>
  );
}
