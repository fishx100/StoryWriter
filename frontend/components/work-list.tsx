import Link from "next/link";

import type { Work } from "@/types/work";
import { ConfirmDeleteModal } from "./modals/confirm-delete-modal";
import { useModal } from "./modals/modal-provider";

type WorkListProps = {
  works: Work[];
  onRequestDelete: (work: Work) => void;
};

function normalizeStatus(status: string): "todo" | "in_progress" | "done" {
  if (status === "in_progress" || status === "planning") {
    return "in_progress";
  }
  if (status === "done" || status === "revising") {
    return "done";
  }
  return "todo";
}

function statusBadgeClass(status: string): string {
  const normalized = normalizeStatus(status);
  if (normalized === "done") {
    return "border-emerald-300/40 bg-emerald-400/10 text-emerald-200";
  }
  if (normalized === "in_progress") {
    return "border-amber-300/40 bg-amber-400/10 text-amber-100";
  }
  return "border-sky-300/40 bg-sky-400/10 text-sky-100";
}

function statusLabel(status: string): string {
  const normalized = normalizeStatus(status);
  if (normalized === "in_progress") {
    return "In progress";
  }
  if (normalized === "done") {
    return "Done";
  }
  return "Todo";
}

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
        workTitle={work.title}
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
              <p className={`sw-tag-label ${statusBadgeClass(work.status)}`}>
                {statusLabel(work.status)}
              </p>
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
