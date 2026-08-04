"use client";

import { useId, type TextareaHTMLAttributes } from "react";

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
      <span className="text-sm text-slate-300">{label}</span>
      <textarea
        id={textareaId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`min-h-28 w-full rounded-2xl border border-slate-200/10 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300/50 ${className}`}
        {...props}
      />
    </label>
  );
}
