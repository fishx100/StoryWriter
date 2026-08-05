"use client";

import Link from "next/link";
import type { Scene } from "@/types/scene";
import { DraggableList } from "@/components/lists/draggable-list";
import { StatusBadge } from "@/components/ui/work/status-badge";

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
        const inner = (
          <>
            <StatusBadge status={scene.status} />
            <h4 className="text-lg font-semibold text-white">{scene.title}</h4>
            <p className="text-sm text-slate-400">{scene.summary}</p>
          </>
        );

        if (onSelectScene) {
          return inner;
        }

        return (
          <Link
            href={`/works/${workId}/scenes/${scene.id}`}
            className="min-w-0 flex-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            {inner}
          </Link>
        );
      }}
    />
  );
}
