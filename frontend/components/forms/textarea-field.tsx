"use client";

import { useId, type TextareaHTMLAttributes } from "react";

/* A controlled textarea field component with a label.
 * @todo This component seems to overlap with the FieldContainer component. Consider refactoring to reduce duplication.
 */

type TextareaFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange">;

export function TextareaField({
  label,
  value,
  onChange,
  className = "",
  id,
  ...props
}: TextareaFieldProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  return (
    <label className="block space-y-2" htmlFor={textareaId}>
      <span className="sw-text-plain-small">{label}</span>
      <textarea
        id={textareaId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`sw-textarea-field-textarea ${className}`}
        {...props}
      />
    </label>
  );
}
