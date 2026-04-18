"use client";

import {
  useEffect,
  useRef,
  type ReactNode,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "md" | "lg";
};

export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => closeRef.current?.focus(), 0);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  const onBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return createPortal(
    <div
      className="ui-modal-backdrop"
      role="presentation"
      onClick={onBackdropClick}
    >
      <div
        className={`ui-modal ${size === "lg" ? "ui-modal--lg" : ""}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "ui-modal-title" : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ui-modal__head">
          {title ? (
            <h2
              id="ui-modal-title"
              className="m-0 font-display text-lg font-semibold text-[var(--ink2)]"
            >
              {title}
            </h2>
          ) : (
            <span />
          )}
          <button
            type="button"
            ref={closeRef}
            className="ui-modal__close"
            onClick={onClose}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>
        <div className="ui-modal__body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
