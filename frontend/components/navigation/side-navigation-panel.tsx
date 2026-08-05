"use client";

import Link from "next/dist/client/link";
import { useState } from "react";

type SideNavigationPanelProps = {
  backLink: string;
  options: {
    id: string;
    label: string;
  }[];
  onSelectOption: (optionId: string) => void;
};

export function SideNavigationPanel({
  backLink,
  options,
  onSelectOption,
}: SideNavigationPanelProps) {
  const [selectedItem, setSelectedItem] = useState(options[0]?.id); // Default to the first option if available

  return (
    <aside className="w-full rounded-[2rem] border border-slate-200/10 bg-slate-950/80 p-4 shadow-2xl shadow-black/20 backdrop-blur lg:w-72 lg:flex-none">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link
          href={backLink}
          className="rounded-full border border-slate-200/10 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-amber-300/40 hover:text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-300"
        >
          Back
        </Link>
      </div>

      <nav className="space-y-2">
        {options.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setSelectedItem(item.id);
              onSelectOption(item.id);
            }}
            className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
              selectedItem === item.id
                ? "bg-amber-300 text-slate-950"
                : "bg-slate-900 text-slate-200 hover:bg-slate-800"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
