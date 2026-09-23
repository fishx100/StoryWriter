"use client";

import React, { useRef, useState, useEffect } from "react";
import { FieldContainer } from "./field-container";
import type { IconName } from "@/components/ui/common/icon";

type TextFieldContainerProps = {
  fieldName: string;
  fieldValue: string;
  editable?: boolean;
  multiline?: boolean;
  onChange?: (newValue: string) => void;
  layout?: "panel" | "row";
  icon?: IconName;
};

export function TextFieldContainer({
  fieldName,
  fieldValue,
  editable = false,
  multiline,
  onChange,
  layout,
  icon,
}: TextFieldContainerProps) {
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
    if (!editable) return;
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

  const isMultiline = multiline ?? value.includes("\n");

  return (
    <FieldContainer
      fieldName={fieldName}
      layout={layout}
      icon={icon}
      selectable={editable}
      showHover={editable}
      onSelect={handleContainerClick}
    >
      {!editable || !isEditing ? (
        <p className="sw-field-value">{value}</p>
      ) : isMultiline ? (
        <textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          rows={4}
          className="sw-field-value-editable"
          onBlur={(e) => endEdit(e.currentTarget)}
          autoFocus
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className="sw-field-value-editable"
          onBlur={(e) => endEdit(e.currentTarget)}
          autoFocus
        />
      )}
    </FieldContainer>
  );
}
