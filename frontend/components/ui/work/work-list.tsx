"use client";

import { useRouter } from "next/navigation";

import type { Work } from "@/types/work";
import { ConfirmDeleteModal } from "../../modals/confirm-delete-modal";
import { useModal } from "../../modals/modal-provider";
import { WorkItem } from "./work-item";

type WorkListProps = {
  works: Work[];
  onRequestDelete: (work: Work) => void;
  onStatusChange: (work: Work, tagId: string) => void;
  statusSaving: boolean;
};

export function WorkList({
  works, onRequestDelete, onStatusChange, statusSaving,
}: WorkListProps) {
  const router = useRouter();
  const { openModal, closeModal } = useModal();

  if (works.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200/10 bg-slate-950/40 p-8 text-slate-300">
        No works yet. Create your first project to get started.
      </div>
    );
  }

  const openDeleteModal = (work: Work) => {
    openModal(
      <ConfirmDeleteModal
        title={work.title}
        message={`Delete work ${work.title}? This will remove all scenes and characters.`}
        onClose={closeModal}
        onConfirm={async () => {
          onRequestDelete(work);
          closeModal();
        }}
      />,
    );
  };

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {works.map((work) => (
        <WorkItem
          key={work.id}
          work={work}
          onClick={(selectedWork) => router.push(`/works/${selectedWork.id}`)}
          onDelete={openDeleteModal}
          onStatusChange={onStatusChange}
          statusSaving={statusSaving}
        />
      ))}
    </div>
  );
}
