import { ChevronDown } from "lucide-react";
import { useId, type ComponentProps, type ReactNode } from "react";
import { cx } from "./cx.js";
import Field, {
  controlBorderClassName,
  controlClassName,
  controlErrorClassName,
  controlMandatoryClassName,
  fieldDescribedBy,
} from "./Field.js";

export type SelectProps = ComponentProps<"select"> & {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** Applied to the wrapping field, not to the <select>. */
  fieldClassName?: string;
  /** Visual marker only (amber bar on the control). Does not set `required` or `aria-required`. */
  mandatory?: boolean;
  /** Screen-reader suffix for the label, read after it when `mandatory` is set. Default " (obligatorio)". */
  mandatoryLabel?: ReactNode;
};

export function Select({
  label,
  hint,
  error,
  required,
  mandatory,
  mandatoryLabel,
  className,
  fieldClassName,
  id,
  children,
  "aria-describedby": userDescribedBy,
  ...args
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <Field
      id={selectId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      mandatory={mandatory}
      mandatoryLabel={mandatoryLabel}
      className={fieldClassName}
    >
      <div className="relative">
        <select
          id={selectId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={fieldDescribedBy(selectId, { hint, error }, userDescribedBy)}
          className={cx(
            controlClassName,
            "appearance-none pr-10",
            error ? controlErrorClassName : controlBorderClassName,
            mandatory ? controlMandatoryClassName : false,
            className,
          )}
          {...args}
        >
          {children}
        </select>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ui-on-surface-muted"
        />
      </div>
    </Field>
  );
}

export default Select;
