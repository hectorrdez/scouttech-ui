import type { ReactNode } from "react";
import { cx } from "./cx.js";

/** Id of the hint paragraph rendered for a field. */
export const hintId = (id: string) => `${id}-hint`;
/** Id of the error paragraph rendered for a field. */
export const errorId = (id: string) => `${id}-error`;

/** aria-describedby listing only the hint/error elements that are actually rendered. */
export function fieldDescribedBy(
  id: string,
  { hint, error }: { hint?: ReactNode; error?: ReactNode },
  userDescribedBy?: string,
): string | undefined {
  const ids = [
    userDescribedBy,
    hint ? hintId(id) : undefined,
    error ? errorId(id) : undefined,
  ].filter(Boolean);
  return ids.length > 0 ? ids.join(" ") : undefined;
}

/** Shared control classes for Input and Select. */
export const controlClassName =
  "h-11 w-full rounded-ui-control bg-ui-surface px-3 text-ui-on-surface placeholder:text-ui-on-surface-muted disabled:cursor-not-allowed disabled:bg-ui-disabled disabled:text-ui-on-disabled focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ui-focus";

export const controlBorderClassName = "border border-ui-outline";
export const controlErrorClassName = "border border-ui-danger bg-ui-danger-soft";

export function FieldError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} role="alert" className="text-sm text-ui-danger">
      {children}
    </p>
  );
}

type FieldProps = {
  id: string;
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  className?: string;
  children: ReactNode;
};

/** Label, control and messages. Internal wrapper used by Input and Select. */
export default function Field({
  id,
  label,
  hint,
  error,
  required = false,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cx("flex flex-col gap-2", className)}>
      {label ? (
        <label htmlFor={id} className="text-sm font-medium text-ui-on-surface">
          {label}
          {required ? (
            <span aria-hidden="true" className="ml-1 text-ui-danger">
              *
            </span>
          ) : null}
        </label>
      ) : null}
      {children}
      {hint ? (
        <p id={hintId(id)} className="text-sm text-ui-on-surface-muted">
          {hint}
        </p>
      ) : null}
      {error ? <FieldError id={errorId(id)}>{error}</FieldError> : null}
    </div>
  );
}
