import { useId, type ComponentProps, type ReactNode } from "react";
import { cx } from "./cx.js";
import { errorId, FieldError, fieldDescribedBy, hintId } from "./Field.js";

/** Native box sized to a 24px hit area. Accent from tokens; disabled uses `ui-disabled`. */
export const optionInputClassName =
  "size-6 shrink-0 cursor-pointer accent-ui-primary disabled:cursor-not-allowed disabled:accent-ui-disabled focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ui-focus";
/** Option label row (checkbox and radio). */
export const optionLabelClassName =
  "inline-flex min-h-6 cursor-pointer items-start gap-3 text-sm font-medium text-ui-on-surface has-disabled:cursor-not-allowed has-disabled:text-ui-on-disabled";

export type CheckboxProps = Omit<ComponentProps<"input">, "size" | "type"> & {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** Applied to the wrapping field, not to the <input>. */
  fieldClassName?: string;
  /** Visual marker only (amber bar beside the label). Does not set `required` or `aria-required`. */
  mandatory?: boolean;
  /** Screen-reader suffix for the label, read after it when `mandatory` is set. Default " (obligatorio)". */
  mandatoryLabel?: ReactNode;
};

export function Checkbox({
  label,
  hint,
  error,
  required,
  mandatory,
  mandatoryLabel = " (obligatorio)",
  className,
  fieldClassName,
  id,
  "aria-describedby": userDescribedBy,
  ...args
}: CheckboxProps) {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;

  return (
    <div className={cx("flex flex-col gap-2", fieldClassName)}>
      <label
        htmlFor={checkboxId}
        className={cx(
          optionLabelClassName,
          mandatory ? "border-l-[3px] border-l-ui-warning pl-2" : false,
        )}
      >
        <input
          id={checkboxId}
          type="checkbox"
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={fieldDescribedBy(checkboxId, { hint, error }, userDescribedBy)}
          className={cx(optionInputClassName, error ? "accent-ui-danger" : false, className)}
          {...args}
        />
        <span>
          {label}
          {required ? (
            <span aria-hidden="true" className="ml-1 text-ui-danger">
              *
            </span>
          ) : null}
          {mandatory ? <span className="sr-only">{mandatoryLabel}</span> : null}
        </span>
      </label>
      {hint ? (
        <p id={hintId(checkboxId)} className="text-sm text-ui-on-surface-muted">
          {hint}
        </p>
      ) : null}
      {error ? <FieldError id={errorId(checkboxId)}>{error}</FieldError> : null}
    </div>
  );
}

export default Checkbox;
