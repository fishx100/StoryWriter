"use client";

import { type Dispatch, type SetStateAction, useState } from "react";

import { CreateWorkModal } from "@/components/modals/create-work-modal";
import { useModal } from "@/components/modals/modal-provider";
import { WorkList } from "@/components/ui/work/work-list";
import { Work } from "@/types/work";
import { fetchJson } from "@/lib/api";
import { SectionPanel } from "@/components/layout/section-panel";
import { InlineMessage } from "../common/inline-message";

type WorklistSectionProps = {
  works: Work[];
  setWorks?: Dispatch<SetStateAction<Work[]>>;
};

export function WorklistSection({ works, setWorks }: WorklistSectionProps) {
  const [error, setError] = useState<string | null>(null);
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
      setError("Failed to delete");
    }
  }

  /* @todo handle loading state for delete operation */
  return (
    <SectionPanel title="Your Works">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="sw-text-bold-medium">
          Browse and manage story projects
        </h2>

        <button onClick={openCreateWorkModal} className="sw-important-button">
          Create Work
        </button>
      </div>

      {error ? <InlineMessage type="error" message={error} /> : null}

      <WorkList
        works={works}
        onRequestDelete={handleDeleteWork}
      />
    </SectionPanel>
  );
}
