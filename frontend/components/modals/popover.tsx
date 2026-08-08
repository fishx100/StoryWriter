"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type PopoverProps = {
  open: boolean;
  onClose: () => void;
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
};

export default function Popover({
  open,
  onClose,
  className = "",
  children,
  style,
}: PopoverProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      className={className}
      style={style}
      onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling to parent links so the popover stays open
    >
      {children}
    </div>,
    document.body,
  );
}
