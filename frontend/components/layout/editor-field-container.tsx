"use client";

import React, { useRef, useState, useEffect } from "react";
import { FieldContainer } from "./field-container";

type EditorFieldContainerProps = {
  fieldName: string;
  fieldValue: string;
  onChange?: (newValue: string) => void;
};

export function EditorFieldContainer({
  fieldName,
  fieldValue,
  onChange,
}: EditorFieldContainerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(fieldValue);
  const initialRef = useRef(fieldValue);

  useEffect(() => {
    if (!isEditing) {
      setValue(fieldValue);
      initialRef.current = fieldValue;
    }
  }, [fieldValue, isEditing]);

  function handleContainerClick() {
    setIsEditing(true);
  }

  function endEdit(editEl: HTMLElement | null) {
    initialRef.current = value;
    setIsEditing(false);
    editEl?.blur?.();
  }

  function handleChange(newValue: string) {
    setValue(newValue);
    onChange?.(newValue);
  }

  return (
    <FieldContainer
      fieldName={fieldName}
      selectable
      showHover
      onSelect={handleContainerClick}
    >
      {!isEditing ? (
        <p className="sw-editor-field-value">{value}</p>
      ) : (
        <textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          rows={10}
          className="sw-field-value-editable"
          onBlur={(e) => endEdit(e.currentTarget)}
          autoFocus
        />
      )}
    </FieldContainer>
  );
}
