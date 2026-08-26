"use client";
import type { ReactNode } from "react";
import React from "react";
import { InlineMessage, InlineMessageProps } from "../ui/common/inline-message";

type SectionPanelProps = {
  title: ReactNode;
  inlineMessage?: InlineMessageProps | string;
  children: ReactNode;
};

export function SectionPanel({
  title,
  inlineMessage,
  children,
}: SectionPanelProps) {
  return (
    <section className="sw-section-panel">
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
