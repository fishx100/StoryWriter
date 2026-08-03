"use client";

import { WorkList } from "@/components/work-list";
import { Work } from "@/types/work";
import { useState } from "react";

type WorklistSectionProps = {
  works: Work[];
  loading: boolean;
  error: string | null;
  setCreateOpen?: (open: boolean) => void;
  setDeleteTarget?: (work: Work | null) => void;
};

export function WorklistSection({
  works,
  loading,
  error,
  setCreateOpen,
  setDeleteTarget,
}: WorklistSectionProps) {
  return (
    <section className="sw-section-panel">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="sw-section-heading">Your Works</p>
          <h2 className="mt-2 text-2xl font-semibold">
            Browse and manage story projects
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen && setCreateOpen(true)}
          className="sw-important-button"
        >
          Create Work
        </button>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-dashed border-slate-200/10 p-8 text-slate-300">
          Loading works...
        </div>
      ) : (
        <WorkList
          works={works}
          onRequestDelete={setDeleteTarget || (() => {})}
        />
      )}

      {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
    </section>
  );
}
