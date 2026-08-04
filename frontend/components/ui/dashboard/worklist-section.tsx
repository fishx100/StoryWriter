"use client";

import { type Dispatch, type SetStateAction, useState } from "react";

import { CreateWorkModal } from "@/components/create-work-modal";
import { useModal } from "@/components/modals/modal-provider";
import { WorkList } from "@/components/work-list";
import { Work } from "@/types/work";

type WorklistSectionProps = {
  works: Work[];
  setWorks?: Dispatch<SetStateAction<Work[]>>;
  loading: boolean;
  error: string | null;
  setDeleteTarget?: (work: Work | null) => void;
};

export function WorklistSection({
  works,
  setWorks,
  loading,
  error,
  setDeleteTarget,
}: WorklistSectionProps) {
  const { openModal, closeModal } = useModal();

  const openCreateWorkModal = () => {
    openModal(
      <CreateWorkModal
        onClose={closeModal}
        onWorkCreated={(work) => {
          setWorks?.((currentWorks) => [...currentWorks, work]);
        }}
      />,
    );
  };

  return (
    <section className="sw-section-panel">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="sw-section-heading">Your Works</p>
          <h2 className="mt-2 text-2xl font-semibold">
            Browse and manage story projects
          </h2>
        </div>
        <button onClick={openCreateWorkModal} className="sw-important-button">
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

      {error ? <p className="sw-text-warning">{error}</p> : null}
    </section>
  );
}
