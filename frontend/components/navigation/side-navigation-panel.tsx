"use client";

import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/common/icon";

type SideNavigationPanelProps = {
  backLink: string;
  selectedItem: string;
  options: {
    id: string;
    label: string;
    icon: IconName;
  }[];
  onSelectOption: (optionId: string) => void;
};

export function SideNavigationPanel({
  backLink,
  selectedItem,
  options,
  onSelectOption,
}: SideNavigationPanelProps) {
  return (
    <aside className="sw-work-sidebar">
      <Link href={backLink} className="sw-sidebar-brand">STORYWRITER</Link>
      <nav className="sw-sidebar-navigation">
        <Link href={backLink} className="sw-sidebar-link">
          <Icon name="dashboard" size={18} />
          Dashboard
        </Link>
        {options.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectOption(item.id)}
            className={`${
              selectedItem === item.id
                ? "sw-sidebar-link-selected"
                : "sw-sidebar-link"
            }`}
          >
            <Icon name={item.icon} size={18} />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="sw-sidebar-footer">
        <Icon name="feather" size={30} />
        <p>Stories<br /><span className="sw-text-caption">a brighter tomorrow.</span></p>
      </div>
    </aside>
  );
}
