"use client";

type DraggableListItemProps = {
  title: string;
  description?: string;
};

export function DraggableListItem({
  title,
  description,
}: DraggableListItemProps) {
  return (
    <>
      <h4 className="sw-text-bold-medium">{title}</h4>
      {description != null && (
        <p className="sw-draggable-list-description">{description}</p>
      )}
    </>
  );
}
