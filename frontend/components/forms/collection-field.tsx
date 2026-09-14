"use client";

import type { ItemField } from "@/types/collection";

type CollectionFieldProps = {
  field: ItemField;
  onChange: (value: unknown) => void;
};

export function CollectionField({ field, onChange }: CollectionFieldProps) {
  if (field.type !== "text" && field.type !== "textarea") {
    return null;
  }

  const value = String(field.value ?? "");

  return (
    <label className="block space-y-2">
      <span className="sw-text-plain-small">{field.label}</span>
      {field.type === "textarea" ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="sw-textarea-field-textarea"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="sw-input-field-input"
        />
      )}
    </label>
  );
}
