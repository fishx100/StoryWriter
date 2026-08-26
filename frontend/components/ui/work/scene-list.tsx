"use client";

import Link from "next/link";
import type { Scene } from "@/types/scene";
import { DraggableList } from "@/components/lists/draggable-list";
import { DraggableListItem } from "@/components/lists/draggable-list-item";

type Props = {
  workId: string;
  scenes: Scene[];
  onRequestDelete: (scene: Scene) => void;
  onReorder: (order: string[]) => Promise<void>;
  onSelectScene?: (scene: Scene) => void;
};

export function SceneList({
  workId,
  scenes,
  onRequestDelete,
  onReorder,
  onSelectScene,
}: Props) {
  return (
    <DraggableList
      items={scenes}
      getId={(s) => s.id}
      onRequestDelete={(id: string) => {
        const s = scenes.find((sc) => sc.id === id);
        if (s) onRequestDelete(s);
      }}
      onReorder={onReorder}
      onSelectItem={onSelectScene ?? undefined}
      customItem={(scene) => {
        return (
          <DraggableListItem title={scene.title} description={scene.summary} />
        );
      }}
    />
  );
}
