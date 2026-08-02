"use client";

import Link from "next/link";
import type { Scene } from "@/types/scene";
import { useEffect, useMemo, useState } from "react";

type Props = {
  workId: string;
  scenes: Scene[];
  onRequestDelete: (scene: Scene) => void;
  onReorder: (order: string[]) => Promise<void>;
  onSelectScene?: (scene: Scene) => void;
};

function normalizeStatus(status: string): "todo" | "in_progress" | "done" {
  if (status === "in_progress" || status === "planning") {
    return "in_progress";
  }
  if (status === "done" || status === "revising") {
    return "done";
  }
  return "todo";
}

function statusBadgeClass(status: string): string {
  const normalized = normalizeStatus(status);
  if (normalized === "done") {
    return "border-emerald-300/40 bg-emerald-400/10 text-emerald-200";
  }
  if (normalized === "in_progress") {
    return "border-amber-300/40 bg-amber-400/10 text-amber-100";
  }
  return "border-sky-300/40 bg-sky-400/10 text-sky-100";
}

function statusLabel(status: string): string {
  const normalized = normalizeStatus(status);
  if (normalized === "in_progress") {
    return "In progress";
  }
  if (normalized === "done") {
    return "Done";
  }
  return "Todo";
}

export function SceneList({
  workId,
  scenes,
  onRequestDelete,
  onReorder,
  onSelectScene,
}: Props) {
  const [ordering, setOrdering] = useState<string[]>(
    scenes.map((scene) => scene.id),
  );
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    setOrdering(scenes.map((scene) => scene.id));
  }, [scenes]);

  const scenesById = useMemo(
    () => new Map(scenes.map((scene) => [scene.id, scene])),
    [scenes],
  );

  async function commitOrder(nextOrder: string[]) {
    setOrdering(nextOrder);
    await onReorder(nextOrder);
  }

  function move(index: number, delta: number) {
    const nextIndex = index + delta;
    if (nextIndex < 0 || nextIndex >= ordering.length) {
      return;
    }

    const nextOrder = [...ordering];
    const [movedId] = nextOrder.splice(index, 1);
    nextOrder.splice(nextIndex, 0, movedId);
    void commitOrder(nextOrder);
  }

  function moveDraggedItem(targetId: string) {
    if (!draggedId || draggedId === targetId) {
      return;
    }

    const fromIndex = ordering.indexOf(draggedId);
    const toIndex = ordering.indexOf(targetId);

    if (fromIndex === -1 || toIndex === -1) {
      return;
    }

    const nextOrder = [...ordering];
    const [movedId] = nextOrder.splice(fromIndex, 1);
    nextOrder.splice(toIndex, 0, movedId);
    setDraggedId(null);
    void commitOrder(nextOrder);
  }

  return (
    <div className="space-y-3">
      {ordering.map((sceneId, idx) => {
        const scene = scenesById.get(sceneId);

        if (!scene) {
          return null;
        }

        return (
          <div
            key={scene.id}
            tabIndex={0}
            draggable
            onDragStart={() => setDraggedId(scene.id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => moveDraggedItem(scene.id)}
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
            aria-label={`Scene ${scene.title}. Use Arrow Up or Arrow Down to reorder.`}
          >
            {onSelectScene ? (
              <button
                type="button"
                onClick={() => onSelectScene(scene)}
                className="min-w-0 flex-1 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-amber-300"
              >
                <div>
                  <div
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusBadgeClass(scene.status)}`}
                  >
                    {statusLabel(scene.status)}
                  </div>
                  <h4 className="text-lg font-semibold text-white">
                    {scene.title}
                  </h4>
                  <p className="text-sm text-slate-400">{scene.summary}</p>
                </div>
              </button>
            ) : (
              <Link
                href={`/works/${workId}/scenes/${scene.id}`}
                className="min-w-0 flex-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
              >
                <div>
                  <div
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusBadgeClass(scene.status)}`}
                  >
                    {statusLabel(scene.status)}
                  </div>
                  <h4 className="text-lg font-semibold text-white">
                    {scene.title}
                  </h4>
                  <p className="text-sm text-slate-400">{scene.summary}</p>
                </div>
              </Link>
            )}
            <div className="flex flex-col items-end gap-2">
              <div className="flex gap-2">
                {idx > 0 ? (
                  <button
                    type="button"
                    onClick={() => move(idx, -1)}
                    className="rounded bg-slate-700 px-2 py-1"
                    aria-label="Move scene up"
                  >
                    ↑
                  </button>
                ) : null}
                {idx < ordering.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => move(idx, 1)}
                    className="rounded bg-slate-700 px-2 py-1"
                    aria-label="Move scene down"
                  >
                    ↓
                  </button>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => onRequestDelete(scene)}
                className="text-sm text-rose-400"
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
