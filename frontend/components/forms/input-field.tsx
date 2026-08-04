"use client";

import { useId, type InputHTMLAttributes } from "react";

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
      <span className="text-sm text-slate-300">{label}</span>
      <input
        id={inputId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-2xl border border-slate-200/10 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300/50 ${className}`}
        {...props}
      />
    </label>
  );
}
