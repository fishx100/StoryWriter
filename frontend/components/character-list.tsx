"use client";

import { Character } from "@/types/character";
import Link from "next/link";
import { DraggableList } from "@/components/lists/draggable-list";

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
  return (
    <DraggableList
      items={characters}
      getId={(c) => c.id}
      onRequestDelete={(id: string) => {
        const c = characters.find((ch) => ch.id === id);
        if (c) onRequestDelete(c);
      }}
      onReorder={onReorder}
      onSelectItem={onSelectCharacter ?? undefined}
      customItem={(character) => {
        const inner = (
          <>
            <h4 className="text-lg font-semibold text-white">
              {character.name}
            </h4>
            <p className="text-sm text-slate-400">{character.description}</p>
          </>
        );

        if (onSelectCharacter) return inner;

        return (
          <Link
            href={`/works/${workId}/characters/${character.id}`}
            className="min-w-0 flex-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            {inner}
          </Link>
        );
      }}
    />
  );
}
