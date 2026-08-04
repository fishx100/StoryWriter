"use client";
import type { ReactNode } from "react";

type SectionPanelProps = {
  color?: string;
  opacity?: number;
  title?: ReactNode;
  children: ReactNode;
};

export function SectionPanel({
  color = "slate-950",
  opacity = 0.8,
  title,
  children,
}: SectionPanelProps) {
  return (
    <section
      className="rounded-3xl border border-slate-200/10 p-5"
      style={{ backgroundColor: color, opacity }}
    >
      {title ? <p className="sw-section-heading mb-3">{title}</p> : null}
      {children}
    </section>
  );
}
