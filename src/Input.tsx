import { useId, type ComponentProps, type ReactNode } from "react";
import { cx } from "./cx.js";
import Field, {
  controlBorderClassName,
  controlClassName,
  controlErrorClassName,
  fieldDescribedBy,
} from "./Field.js";

export type InputProps = Omit<ComponentProps<"input">, "size"> & {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** Icon painted inside the field, on the left. */
  icon?: ReactNode;
  /** Applied to the wrapping field, not to the <input>. */
  fieldClassName?: string;
};

export function Input({
  label,
  hint,
  error,
  icon,
  required,
  className,
  fieldClassName,
  id,
  "aria-describedby": userDescribedBy,
  ...args
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <Field
      id={inputId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={fieldClassName}
    >
      <div className="relative">
        {icon ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ui-on-surface-muted"
          >
            {icon}
          </span>
        ) : null}
        <input
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={fieldDescribedBy(inputId, { hint, error }, userDescribedBy)}
          className={cx(
            controlClassName,
            error ? controlErrorClassName : controlBorderClassName,
            icon ? "pl-10" : false,
            className,
          )}
          {...args}
        />
      </div>
    </Field>
  );
}

export default Input;
