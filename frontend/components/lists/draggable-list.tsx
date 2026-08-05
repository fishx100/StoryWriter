"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

type DraggableListProps<T> = {
  items: T[];
  getId: (item: T) => string;
  customItem?: (item: T) => ReactNode;
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
    <div className="space-y-3">
      {ordering.map((id, idx) => {
        const item = itemsById.get(id);
        if (!item) return null;

        return (
          <div
            key={id}
            tabIndex={0}
            draggable
            onDragStart={() => setDraggedId(id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => moveDraggedItem(id)}
            onKeyDown={(event) => {
              if (event.key === "ArrowUp") {
                event.preventDefault();
                move(idx, -1);
              }
              if (event.key === "ArrowDown") {
                event.preventDefault();
                move(idx, 1);
              }
            }}
            className="flex items-start justify-between rounded border border-slate-200/10 bg-slate-800 p-3 outline-none transition hover:border-amber-300/40 focus:ring-2 focus:ring-amber-300"
            aria-label={`List item ${idx + 1}. Use Arrow Up or Arrow Down to reorder.`}
          >
            <div className="min-w-0 flex-1">
              {onSelectItem ? (
                <button
                  type="button"
                  onClick={() => onSelectItem(item)}
                  className="min-w-0 flex-1 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-amber-300"
                >
                  {customItem ? customItem(item) : <div>{String(id)}</div>}
                </button>
              ) : (
                <div className="min-w-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300">
                  {customItem ? customItem(item) : <div>{String(id)}</div>}
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex gap-2">
                {idx > 0 ? (
                  <button
                    type="button"
                    onClick={() => move(idx, -1)}
                    className="rounded bg-slate-700 px-2 py-1"
                    aria-label="Move item up"
                  >
                    ↑
                  </button>
                ) : null}
                {idx < ordering.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => move(idx, 1)}
                    className="rounded bg-slate-700 px-2 py-1"
                    aria-label="Move item down"
                  >
                    ↓
                  </button>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => onRequestDelete && onRequestDelete(getId(item))}
                className="sw-delete-button"
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
