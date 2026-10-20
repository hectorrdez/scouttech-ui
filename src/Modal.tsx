import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { cx } from "./cx.js";

export type ModalSize = "sm" | "md" | "lg";

export type ModalProps = {
  /** Heading, also the dialog's accessible name. */
  title: ReactNode;
  /** Called on Escape, scrim click and the close button. */
  onClose: () => void;
  children: ReactNode;
  size?: ModalSize;
  /** Accessible name of the close button and the scrim. Default "Cerrar". */
  closeLabel?: string;
  /** Applied to the dialog panel. */
  className?: string;
};

const sizeClassNames: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-3xl",
};

const focusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Centered dialog with scrim. Mount it to open, unmount to close. Escape, scrim click and the
 * close button call `onClose`; Tab is trapped inside; focus moves in on mount and returns to the
 * previously focused element (the trigger) on unmount.
 */
export function Modal({
  title,
  onClose,
  children,
  size = "md",
  closeLabel = "Cerrar",
  className,
}: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panelRef.current?.focus();
    return () => previous?.focus();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(focusableSelector));
      if (items.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const first = items[0]!;
      const last = items[items.length - 1]!;
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === panel || !panel.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !panel.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={closeLabel}
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ui-overlay"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cx(
          "relative max-h-[calc(100dvh-2rem)] w-full overflow-y-auto rounded-ui-card border border-ui-outline bg-ui-surface p-ui-card text-ui-on-surface shadow-ui-card-hover outline-none",
          sizeClassNames[size],
          className,
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-xl font-semibold break-words">
            {title}
          </h2>
          <button
            type="button"
            aria-label={closeLabel}
            onClick={onClose}
            className="rounded-ui-control p-1 text-ui-on-surface-muted hover:bg-ui-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ui-focus"
          >
            <X size={18} aria-hidden />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default Modal;
