"use client";

type ConfirmDeleteModalProps = {
  open: boolean;
  title: string;
  message: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export function ConfirmDeleteModal({
  open,
  title,
  message,
  loading,
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200/10 bg-slate-950 p-6 text-slate-100 shadow-2xl shadow-black/40">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.3em] text-rose-300">
            Confirm deletion
          </p>
          <h2 className="mt-2 text-2xl font-semibold">{title}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-900"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={async () => {
              await onConfirm();
            }}
            disabled={loading}
            className="rounded-full bg-rose-400 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-rose-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Deleting..." : "Delete work"}
          </button>
        </div>
      </div>
    </div>
  );
}
