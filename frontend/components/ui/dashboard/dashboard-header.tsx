"use client";

import { FieldContainer } from "@/components/layout/field-container";
import { SignIn } from "./sign-in";

type DashboardHeaderProps = {
  totalWorks: number;
};

export function DashboardHeader({ totalWorks }: DashboardHeaderProps) {
  return (
    <header className="sw-section-panel">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="sw-section-heading">StoryWriter</p>
          <h1 className="sw-heading-big">Dashboard</h1>
          <p className="sw-text-plain-small">
            Mock authenticated workspace for planning and drafting stories.
          </p>
        </div>

        <SignIn />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <FieldContainer fieldName="Works" fieldValue={totalWorks.toString()} />
        <FieldContainer fieldName="PLACEHOLDER" fieldValue="PLACEHOLDER" />
        <FieldContainer fieldName="PLACEHOLDER" fieldValue="PLACEHOLDER" />
      </div>
    </header>
  );
}
