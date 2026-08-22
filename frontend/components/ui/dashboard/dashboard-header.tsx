"use client";

import { TextFieldContainer } from "@/components/layout/text-field-container";
import { SectionPanel } from "@/components/layout/section-panel";
import { SignIn } from "./sign-in";

type DashboardHeaderProps = {
  totalWorks: number;
};

export function DashboardHeader({ totalWorks }: DashboardHeaderProps) {
  return (
    <SectionPanel title="StoryWriter">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="sw-heading-big">Dashboard</h1>
          <p className="sw-text-plain-small">
            Mock authenticated workspace for planning and drafting stories.
          </p>
        </div>

        <SignIn />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <TextFieldContainer
          fieldName="Works"
          fieldValue={totalWorks.toString()}
        />
        <TextFieldContainer fieldName="PLACEHOLDER" fieldValue="PLACEHOLDER" />
        <TextFieldContainer fieldName="PLACEHOLDER" fieldValue="PLACEHOLDER" />
      </div>
    </SectionPanel>
  );
}
