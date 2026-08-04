"use client";

type ConfirmDeleteModalProps = {
  workTitle: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export function ConfirmDeleteModal({
  workTitle,
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  return (
    <div className="sw-modal-panel">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.3em] text-rose-300">
          Confirm deletion
        </p>
        <h2 className="sw-text-bold-medium">{workTitle}</h2>
        <p className="sw-text-plain-small">
          Are you sure you want to delete this work and all of its scenes? This
          action cannot be undone.
        </p>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button type="button" onClick={onClose} className="sw-normal-button">
          Cancel
        </button>
        <button
          type="button"
          onClick={async () => {
            await onConfirm();
          }}
          className="sw-warning-button"
        >
          Delete work
        </button>
      </div>
    </div>
  );
}
