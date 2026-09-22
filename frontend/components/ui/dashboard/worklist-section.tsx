"use client";

import { type Dispatch, type SetStateAction, useState } from "react";

import { WorkList } from "@/components/ui/work/work-list";
import { Work } from "@/types/work";
import { fetchJson } from "@/lib/api";
import { InlineMessage } from "../common/inline-message";

type WorklistSectionProps = {
  works: Work[];
  setWorks?: Dispatch<SetStateAction<Work[]>>;
};

export function WorklistSection({ works, setWorks }: WorklistSectionProps) {
  const [error, setError] = useState<string | null>(null);

  async function handleDeleteWork(work: Work) {
    setError(null);
    try {
      await fetchJson<void>(`/api/works/${work.id}`, {
        method: "DELETE",
      });

      setWorks?.((currentWorks) =>
        currentWorks.filter((w) => w.id !== work.id),
      );
    } catch {
      setError("Failed to delete");
    }
  }

  /* @todo handle loading state for delete operation */
  return (
    <section aria-labelledby="your-works-heading">
      <div className="sw-work-list-header">
        <h2 id="your-works-heading" className="sw-text-bold-medium">Your Works</h2>
      </div>

      {error ? <InlineMessage type="error" message={error} /> : null}

      <WorkList
        works={works}
        onRequestDelete={handleDeleteWork}
      />
    </section>
  );
}
