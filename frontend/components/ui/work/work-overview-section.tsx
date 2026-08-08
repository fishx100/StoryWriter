"use client";

import { FieldContainer } from "@/components/layout/field-container";
import { SectionPanel } from "@/components/layout/section-panel";
import { Work } from "@/types/work";
import StatusBadge from "./status-badge";

type WorkOverviewSectionProps = {
  work: Work;
};

export function WorkOverviewSection({ work }: WorkOverviewSectionProps) {
  return (
    <SectionPanel title="Overview">
      <div className="flex flex-col gap-3 border-b border-slate-200/10 pb-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-100">
              {work.title}
            </h1>
          </div>
        </div>
        <p className="max-w-3xl text-sm leading-6 text-slate-300">
          {work.premise || "No premise yet."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldContainer
          fieldName="Genre"
          fieldValue={work.genre || "Unspecified"}
        />

        <div className="sw-field-container">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
            Status
          </p>
          <StatusBadge status_tag_id={work.status_tag_id} workId={work.id} />
        </div>
      </div>
    </SectionPanel>
  );
}
