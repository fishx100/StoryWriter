"use client";

import { DraggableList } from "@/components/lists/draggable-list";
import { DraggableListItem } from "@/components/lists/draggable-list-item";
import type { CollectionItem } from "@/types/collection";
import StatusBadge from "@/components/ui/common/status-badge";

type CollectionItemListProps = {
  items: CollectionItem[];
  onRequestDelete: (item: CollectionItem) => void;
  onReorder: (order: string[]) => Promise<void>;
  onSelectItem?: (item: CollectionItem) => void;
};

function getItemId(item: CollectionItem): string {
  return item.id;
}

export function CollectionItemList({
  items,
  onRequestDelete,
  onReorder,
  onSelectItem,
}: CollectionItemListProps) {
  return (
    <DraggableList
      items={items}
      getId={getItemId}
      onRequestDelete={(id) => {
        const item = items.find((current) => current.id === id);
        if (item) onRequestDelete(item);
      }}
      onReorder={onReorder}
      onSelectItem={onSelectItem}
      customItem={(item) => (
        <DraggableListItem
          title={item.name}
          titleAccessory={
            <StatusBadge currentStatusTagId={item.status_tag_id ?? undefined} />
          }
          description={item.description}
        />
      )}
    />
  );
}
