import Link from "next/link";

import type { Work } from "@/types/work";
import { ConfirmDeleteModal } from "./modals/confirm-delete-modal";
import { useModal } from "./modals/modal-provider";
import { StatusBadge } from "./ui/work/status-badge";

type WorkListProps = {
  works: Work[];
  onRequestDelete: (work: Work) => void;
};

export function WorkList({ works, onRequestDelete }: WorkListProps) {
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
        <article
          key={work.id}
          className="group rounded-3xl border border-slate-200/10 bg-slate-950 p-5 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:border-amber-300/40 hover:bg-slate-900"
        >
          <div className="flex items-start justify-between gap-4">
            <Link
              href={`/works/${work.id}`}
              className="min-w-0 flex-1 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              <StatusBadge
                status_tag_id={work.status_tag_id}
                workId={work.id}
              />
              <h3 className="mt-2 text-xl font-semibold text-slate-100 transition group-hover:text-amber-100">
                {work.title}
              </h3>
              <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-300">
                {work.premise || "No premise yet."}
              </p>
            </Link>

            <div className="flex flex-col items-end gap-3">
              <span className="sw-tag-label">
                {work.genre || "Unspecified"}
              </span>
              <button
                type="button"
                onClick={openDeleteModal.bind(null, work)}
                className="sw-delete-button"
              >
                Delete
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
