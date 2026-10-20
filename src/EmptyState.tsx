import { Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { cx } from "./cx.js";

export type EmptyStateProps = {
  title: ReactNode;
  description?: ReactNode;
  /** e.g. a Button. */
  action?: ReactNode;
  /** Replaces the default inbox icon. */
  icon?: ReactNode;
  className?: string;
};

/** Placeholder for a list or section with nothing to show. */
export function EmptyState({ title, description, action, icon, className }: EmptyStateProps) {
  return (
    <div
      className={cx(
        "flex flex-col items-center gap-2 rounded-ui-card border border-dashed border-ui-outline-strong bg-ui-surface-tonal p-8 text-center text-ui-on-surface",
        className,
      )}
    >
      <span className="text-ui-on-surface-muted">{icon ?? <Inbox aria-hidden="true" />}</span>
      <h3 className="text-base font-semibold">{title}</h3>
      {description ? <p className="text-sm text-ui-on-surface-muted">{description}</p> : null}
      {action}
    </div>
  );
}

export default EmptyState;
