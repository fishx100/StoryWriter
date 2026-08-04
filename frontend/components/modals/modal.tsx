"use client";

import { createPortal } from "react-dom";

export function Modal({
  open,
  children,
  onClose,
}: {
  open: boolean;
  children: React.ReactNode;
  onClose?: () => void;
}) {
  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="sw-modal-overlay" role="dialog" aria-modal="true">
      {children}
    </div>,
    document.body,
  );
}
