"use client";

import { useId, type SelectHTMLAttributes } from "react";

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
      <span className="text-sm text-slate-300">{label}</span>
      <select
        id={selectId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-2xl border border-slate-200/10 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-amber-300/50 ${className}`}
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
