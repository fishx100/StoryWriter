"use client";

import { useId, type InputHTMLAttributes } from "react";

/** A controlled input field component with a label.
 * @todo This component is very similar to the FieldContainer component. Consider refactoring to reduce duplication.
 */

type InputFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">;

export function InputField({
  label,
  value,
  onChange,
  className = "",
  id,
  ...props
}: InputFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <label className="block space-y-2" htmlFor={inputId}>
      <span className="sw-text-plain-small">{label}</span>
      <input
        id={inputId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`sw-input-field-input ${className}`}
        {...props}
      />
    </label>
  );
}
