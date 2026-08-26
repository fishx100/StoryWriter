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
    <aside className="sw-section-panel w-full lg:w-72 lg:flex-none">
      <Link href={backLink} className="sw-normal-button mb-4 inline-flex">
        Back
      </Link>

      <nav className="space-y-2">
        {options.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setSelectedItem(item.id);
              onSelectOption(item.id);
            }}
            className={`${
              selectedItem === item.id
                ? "sw-side-panel-item-selected"
                : "sw-side-panel-item-normal"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
