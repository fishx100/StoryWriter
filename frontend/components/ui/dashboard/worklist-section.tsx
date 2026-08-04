"use client";

import { type Dispatch, type SetStateAction, useState } from "react";

import { CreateWorkModal } from "@/components/modals/create-work-modal";
import { useModal } from "@/components/modals/modal-provider";
import { WorkList } from "@/components/work-list";
import { Work } from "@/types/work";
import { fetchJson } from "@/lib/api";

type WorklistSectionProps = {
  works: Work[];
  setWorks?: Dispatch<SetStateAction<Work[]>>;
};

export function WorklistSection({ works, setWorks }: WorklistSectionProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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
      setError("Could not delete work right now.");
    }
  }

  /* @todo handle loading state for delete operation */

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
        <WorkList works={works} onRequestDelete={handleDeleteWork} />
      )}

      {error ? <p className="sw-text-warning">{error}</p> : null}
    </section>
  );
}
