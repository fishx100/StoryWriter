"use client";

import type { ReactNode } from "react";

type DraggableListItemProps = {
  title: string;
  titleAccessory?: ReactNode;
  description?: string;
};

export function DraggableListItem({
  title,
  titleAccessory,
  description,
}: DraggableListItemProps) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <h4 className="sw-text-bold-medium">{title}</h4>
        {titleAccessory}
      </div>
      {description?.trim() && (
        <p className="sw-draggable-list-description">{description}</p>
      )}
    </>
  );
}
