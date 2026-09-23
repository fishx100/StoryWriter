"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * A generic draggable list component that allows reordering of items via drag-and-drop.
 */

type DraggableListProps<T> = {
  items: T[];
  getId: (item: T) => string;
  // Replaces the full row contents, including selection and delete controls.
  customItem?: (item: T, index: number) => ReactNode;
  onRequestDelete?: (id: string) => void;
  onReorder?: (order: string[]) => Promise<void> | void;
  onSelectItem?: (item: T) => void;
};

export function DraggableList<T>({
  items,
  getId,
  customItem,
  onRequestDelete,
  onReorder,
  onSelectItem,
}: DraggableListProps<T>) {
  const [ordering, setOrdering] = useState<string[]>(() => items.map(getId));
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    setOrdering(items.map(getId));
  }, [items, getId]);

  const itemsById = useMemo(
    () => new Map(items.map((it) => [getId(it), it])),
    [items, getId],
  );

  async function commitOrder(nextOrder: string[]) {
    setOrdering(nextOrder);
    if (onReorder) {
      // allow onReorder to be sync or async
      await onReorder(nextOrder);
    }
  }

  function move(index: number, delta: number) {
    const nextIndex = index + delta;
    if (nextIndex < 0 || nextIndex >= ordering.length) return;

    const nextOrder = [...ordering];
    const [movedId] = nextOrder.splice(index, 1);
    nextOrder.splice(nextIndex, 0, movedId);
    void commitOrder(nextOrder);
  }

  function moveDraggedItem(targetId: string) {
    if (!draggedId || draggedId === targetId) return;

    const fromIndex = ordering.indexOf(draggedId);
    const toIndex = ordering.indexOf(targetId);
    if (fromIndex === -1 || toIndex === -1) return;

    const nextOrder = [...ordering];
    const [movedId] = nextOrder.splice(fromIndex, 1);
    nextOrder.splice(toIndex, 0, movedId);
    setDraggedId(null);
    void commitOrder(nextOrder);
  }

  return (
    <div className="sw-draggable-list-layout">
      {ordering.map((id, idx) => {
        const item = itemsById.get(id);
        if (!item) return null;

        return (
          <div
            key={id}
            tabIndex={0}
            draggable
            onDragStart={() => setDraggedId(id)}
            onDragEnd={() => setDraggedId(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => moveDraggedItem(id)}
            className={customItem == null ? "sw-draggable-list-item" : undefined}
            aria-label={`List item ${idx + 1}. Use Arrow Up or Arrow Down to reorder.`}
          >
            {customItem != null ? customItem(item, idx) : (
              <>
                <div className="min-w-0 flex-1">
                  {onSelectItem ? (
                    <button
                      type="button"
                      onClick={() => onSelectItem(item)}
                      className="sw-draggable-list-item-content"
                    >
                      <div>{String(id)}</div>
                    </button>
                  ) : (
                    /** @todo consider if we do have situation where there is no selection action */
                    <div className="sw-draggable-list-item-content">
                      <div>{String(id)}</div>
                    </div>
                  )}
                </div>

                <div className="items-end">
                  <button
                    type="button"
                    onClick={() => onRequestDelete && onRequestDelete(getId(item))}
                    className="sw-delete-button"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
