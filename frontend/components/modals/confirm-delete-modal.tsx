"use client";

type ConfirmDeleteModalProps = {
  title?: string;
  message?: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export function ConfirmDeleteModal({
  title = "Confirm deletion",
  message = "This action cannot be undone.",
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  return (
    <div className="sw-modal-panel">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.3em] text-rose-300">
          {title}
        </p>
        <h2 className="sw-text-bold-medium">{title}</h2>
        <p className="sw-text-plain-small">{message}</p>
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
          Delete
        </button>
      </div>
    </div>
  );
}
