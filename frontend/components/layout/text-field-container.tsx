"use client";

import React, { useRef, useState } from "react";
import { FieldContainer } from "./field-container";

type TextFieldContainerProps = {
  fieldName: string;
  fieldValue: string;
  editable?: boolean;
};

export function TextFieldContainer({
  fieldName,
  fieldValue,
  editable = false,
}: TextFieldContainerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(fieldValue);
  const initialRef = useRef(fieldValue);

  function handleContainerClick() {
    if (!editable) return;
    setIsEditing(true);
  }

  function handleSave(editEl: HTMLElement | null) {
    initialRef.current = value;
    setIsEditing(false);
    editEl?.blur?.();
  }

  const isMultiline = value.includes("\n");

  return (
    <FieldContainer
      fieldName={fieldName}
      selectable={editable}
      showHover={editable}
      onSelect={handleContainerClick}
    >
      {!editable || !isEditing ? (
        <p className="sw-field-value">{value}</p>
      ) : isMultiline ? (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={4}
          className="sw-field-value-editable"
          onBlur={(e) => handleSave(e.currentTarget)}
          autoFocus
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="sw-field-value-editable"
          onBlur={(e) => handleSave(e.currentTarget)}
          autoFocus
        />
      )}
    </FieldContainer>
  );
}
