import { ChevronDown } from "lucide-react";
import { useId, type ComponentProps, type ReactNode } from "react";
import { cx } from "./cx.js";
import Field, {
  controlBorderClassName,
  controlClassName,
  controlErrorClassName,
  fieldDescribedBy,
} from "./Field.js";

export type SelectProps = ComponentProps<"select"> & {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** Applied to the wrapping field, not to the <select>. */
  fieldClassName?: string;
};

export function Select({
  label,
  hint,
  error,
  required,
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
