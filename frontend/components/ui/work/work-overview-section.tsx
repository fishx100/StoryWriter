"use client";

import { TextFieldContainer } from "@/components/layout/text-field-container";
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
        <StatusBadge status_tag_id={work.status_tag_id} workId={work.id} />
        <TextFieldContainer
          editable
          fieldName="Title"
          fieldValue={work.title}
        />
        <TextFieldContainer
          editable
          fieldName="Premise"
          fieldValue={work.premise || "No premise yet."}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextFieldContainer
          editable
          fieldName="Genre"
          fieldValue={work.genre || "Unspecified"}
        />
      </div>
    </SectionPanel>
  );
}
