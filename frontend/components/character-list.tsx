"use client";

import { Character } from "@/types/character";
import Link from "next/dist/client/link";
import { useEffect, useMemo, useState } from "react";

type Props = {
  workId: string;
  characters: Character[];
  onRequestDelete: (character: Character) => void;
  onReorder: (order: string[]) => Promise<void>;
  onSelectCharacter?: (character: Character) => void;
};

export function CharacterList({
  workId,
  characters,
  onRequestDelete,
  onReorder,
  onSelectCharacter,
}: Props) {
  const [ordering, setOrdering] = useState<string[]>(
    characters.map((character) => character.id),
  );
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    setOrdering(characters.map((character) => character.id));
  }, [characters]);

  const charactersById = useMemo(
    () => new Map(characters.map((character) => [character.id, character])),
    [characters],
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
      {ordering.map((characterId, idx) => {
        const character = charactersById.get(characterId);

        if (!character) {
          return null;
        }

        return (
          <div
            key={character.id}
            tabIndex={0}
            draggable
            onDragStart={() => setDraggedId(character.id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => moveDraggedItem(character.id)}
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
            aria-label={`Character ${character.name}. Use Arrow Up or Arrow Down to reorder.`}
          >
            {onSelectCharacter ? (
              <button
                type="button"
                onClick={() => onSelectCharacter(character)}
                className="min-w-0 flex-1 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-amber-300"
              >
                <div>
                  <h4 className="text-lg font-semibold text-white">
                    {character.name}
                  </h4>
                  <p className="text-sm text-slate-400">
                    {character.description}
                  </p>
                </div>
              </button>
            ) : (
              <Link
                href={`/works/${workId}/characters/${character.id}`}
                className="min-w-0 flex-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
              >
                <div>
                  <h4 className="text-lg font-semibold text-white">
                    {character.name}
                  </h4>
                  <p className="text-sm text-slate-400">
                    {character.description}
                  </p>
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
                    aria-label="Move character up"
                  >
                    ↑
                  </button>
                ) : null}
                {idx < ordering.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => move(idx, 1)}
                    className="rounded bg-slate-700 px-2 py-1"
                    aria-label="Move character down"
                  >
                    ↓
                  </button>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => onRequestDelete(character)}
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
