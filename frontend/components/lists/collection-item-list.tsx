"use client";

import type { CollectionItem } from "@/types/collection";
import StatusBadge from "@/components/ui/common/status-badge";
import { Icon } from "@/components/ui/common/icon";
import { DraggableList } from "./draggable-list";

type CollectionItemListProps = {
  items: CollectionItem[];
  onSelectItem: (item: CollectionItem) => void;
  onRequestDelete: (item: CollectionItem) => void;
  onReorder: (order: string[]) => Promise<void>;
};

type CollectionItemRowProps = Pick<CollectionItemListProps, "onSelectItem" | "onRequestDelete"> & {
  item: CollectionItem;
};

function getItemId(item: CollectionItem): string {
  return item.id;
}

function CollectionItemRow({ item, onSelectItem, onRequestDelete }: CollectionItemRowProps) {
  return (
    <div className="sw-collection-row">
      <button type="button" className="sw-collection-row-title" onClick={() => onSelectItem(item)} title={item.name}>
        {item.name}
      </button>
      <div className="sw-collection-row-status">
        <StatusBadge currentStatusTagId={item.status_tag_id ?? undefined} />
      </div>
      <p className="sw-collection-row-summary" title={item.description}>
        {item.description?.trim() || "No summary yet."}
      </p>
      <div className="sw-collection-row-actions">
        <button type="button" className="sw-collection-delete-button" onClick={() => onRequestDelete(item)} title={`Delete ${item.name}`}>
          <Icon name="delete" size={16} />
        </button>
      </div>
    </div>
  );
}

export function CollectionItemList({ items, onSelectItem, onRequestDelete, onReorder }: CollectionItemListProps) {
  return (
    <DraggableList
      items={items}
      getId={getItemId}
      onReorder={onReorder}
      customItem={(item) => (
        <CollectionItemRow
          item={item}
          onSelectItem={onSelectItem}
          onRequestDelete={onRequestDelete}
        />
      )}
    />
  );
}
