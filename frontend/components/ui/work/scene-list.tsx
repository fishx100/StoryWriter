"use client";

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
      onReorder={onReorder}
      customItem={(scene) => {
        return (
          <div className="sw-draggable-list-item">
            <div className="sw-card-content">
              {onSelectScene ? (
                <button
                  type="button"
                  onClick={() => onSelectScene(scene)}
                  className="sw-draggable-list-item-content"
                >
                  <DraggableListItem title={scene.title} description={scene.summary} />
                </button>
              ) : (
                <div className="sw-draggable-list-item-content">
                  <DraggableListItem title={scene.title} description={scene.summary} />
                </div>
              )}
            </div>
            <button type="button" className="sw-delete-button" onClick={() => onRequestDelete(scene)}>
              Delete
            </button>
          </div>
        );
      }}
    />
  );
}
