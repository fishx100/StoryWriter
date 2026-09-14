"use client";

import type { CollectionItem } from "@/types/collection";
import { CollectionField } from "./collection-field";

type CollectionItemFormProps = {
  item: CollectionItem;
  onChange: (item: CollectionItem) => void;
};

export function CollectionItemForm({ item, onChange }: CollectionItemFormProps) {
  return (
    <div className="space-y-4">
      {item.fields.map((field) => (
        <CollectionField
          key={field.id}
          field={field}
          onChange={(value) => {
            const nextItem = {
              ...item,
              fields: item.fields.map((currentField) =>
                currentField.id === field.id
                  ? { ...currentField, value }
                  : currentField
              ),
            };

            onChange(nextItem);
          }}
        />
      ))}
    </div>
  );
}
