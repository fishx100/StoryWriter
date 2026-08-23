"use client";
import type { ReactNode } from "react";
import React from "react";
import { InlineMessage, InlineMessageProps } from "../ui/common/inline-message";

type SectionPanelProps = {
  color?: string;
  opacity?: number;
  title: ReactNode;
  inlineMessage?: InlineMessageProps | string;
  children: ReactNode;
};

export function SectionPanel({
  color = "slate-950",
  opacity = 0.8,
  title,
  inlineMessage,
  children,
}: SectionPanelProps) {
  return (
    <section
      className="rounded-3xl border border-slate-200/10 p-5"
      style={{ backgroundColor: color, opacity }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="sw-section-heading">{title}</p>
        {inlineMessage ? (
          <div className="ml-4 self-start">
            {typeof inlineMessage === "string" ? (
              <InlineMessage message={inlineMessage} type="info" />
            ) : (
              <InlineMessage {...inlineMessage} />
            )}
          </div>
        ) : null}
      </div>
      {children}
    </section>
  );
}
