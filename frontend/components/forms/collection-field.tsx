"use client";

import type { ItemField } from "@/types/collection";
import { EditorFieldContainer } from "@/components/layout/editor-field-container";
import { TextFieldContainer } from "@/components/layout/text-field-container";

type CollectionFieldProps = {
  field: ItemField;
  onChange: (value: unknown) => void;
};

export function CollectionField({ field, onChange }: CollectionFieldProps) {
  if (field.type !== "text" && field.type !== "textarea" && field.type !== "editor") {
    return null;
  }

  const value = String(field.value ?? "");

  if (field.type === "editor") {
    return (
      <EditorFieldContainer
        fieldName={field.label}
        fieldValue={value}
        onChange={onChange}
        showWordCount
      />
    );
  }

    if (field.type === "text") {
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
  
  if (field.type === "textarea") {
    return (
      <TextFieldContainer
        fieldName={field.label}
        fieldValue={value}
        editable
        multiline
        onChange={onChange}
      />
    );
  }
  
  console.log("CollectionField: Unsupported field type", field.type);
  return null;
}
