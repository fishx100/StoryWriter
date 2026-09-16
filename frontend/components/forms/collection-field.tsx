"use client";

import type { ItemField } from "@/types/collection";
import { EditorFieldContainer } from "@/components/layout/editor-field-container";
import { TextFieldContainer } from "@/components/layout/text-field-container";

type CollectionFieldProps = {
  field: ItemField;
  onChange: (value: unknown) => void;
};

export function CollectionField({ field, onChange }: CollectionFieldProps) {
  if (field.type !== "text" && field.type !== "textarea") {
    return null;
  }

  const value = String(field.value ?? "");

  if (field.type === "textarea") {
    return (
      <EditorFieldContainer
        fieldName={field.label}
        fieldValue={value}
        onChange={onChange}
      />
    );
  }

  return (
    <TextFieldContainer
      fieldName={field.label}
      fieldValue={value}
      editable
      multiline={false}
      onChange={onChange}
    />
  );
}
