"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type Side = "start" | "end" | "bottom";

const sideClasses: Record<Side, string> = {
  start: "inset-y-0 start-0 h-full w-full max-w-sm border-e",
  end: "inset-y-0 end-0 h-full w-full max-w-sm border-s",
  bottom: "inset-x-0 bottom-0 max-h-[85vh] w-full rounded-t-[var(--radius-lg)] border-t",
};

const enterClasses: Record<Side, string> = {
  start: "animate-[slide-in-start_200ms_ease]",
  end: "animate-[slide-in-end_200ms_ease]",
  bottom: "animate-[slide-in-bottom_220ms_ease]",
};

export function Sheet({
  open,
  onClose,
  side = "end",
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  side?: Side;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
          onClick={onClose}
          aria-hidden
        />
      )}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          tabIndex={-1}
          className={cn(
            "fixed z-50 flex flex-col bg-[var(--surface)] border-[var(--border)] shadow-xl outline-none",
            sideClasses[side],
            enterClasses[side]
          )}
        >
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">{children}</div>
          {footer && <div className="border-t border-[var(--border)] p-4">{footer}</div>}
        </div>
      )}
    </>,
    document.body
  );
}
