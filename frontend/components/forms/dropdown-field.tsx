"use client";

import { useId, type SelectHTMLAttributes } from "react";

/** A controlled dropdown field component with a label.
 * @todo This component seems to overlap with the FieldContainer component. Consider refactoring to reduce duplication.
 */
type DropdownOption = {
  label: string;
  value: string;
};

type DropdownFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "value" | "onChange">;

export function DropdownField({
  label,
  value,
  onChange,
  options,
  className = "",
  id,
  children,
  ...props
}: DropdownFieldProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <label className="block space-y-2" htmlFor={selectId}>
      <span className="sw-text-plain-small">{label}</span>
      <select
        id={selectId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`sw-dropdown-field-select ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        {children}
      </select>
    </label>
  );
}
