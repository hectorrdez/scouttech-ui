import { createContext, useContext, useId, type ComponentProps, type ReactNode } from "react";
import { cx } from "./cx.js";
import { errorId, FieldError, fieldDescribedBy, hintId } from "./Field.js";
import { optionInputClassName, optionLabelClassName } from "./Checkbox.js";

type RadioGroupContextValue = { name: string; required: boolean; disabled: boolean };
const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export type RadioProps = Omit<ComponentProps<"input">, "size" | "type"> & {
  /** Option text. */
  label?: ReactNode;
  /** Applied to the wrapping label, not to the <input>. */
  fieldClassName?: string;
};

/** One radio option. Inside a RadioGroup it takes the group's name, required and disabled. */
export function Radio({
  label,
  fieldClassName,
  className,
  id,
  name,
  required,
  disabled,
  ...args
}: RadioProps) {
  const generatedId = useId();
  const radioId = id ?? generatedId;
  const group = useContext(RadioGroupContext);

  return (
    <label htmlFor={radioId} className={cx(optionLabelClassName, fieldClassName)}>
      <input
        id={radioId}
        type="radio"
        name={name ?? group?.name}
        required={required ?? group?.required}
        disabled={disabled ?? group?.disabled}
        className={cx(optionInputClassName, "rounded-full", className)}
        {...args}
      />
      <span>{label}</span>
    </label>
  );
}

export type RadioGroupProps = {
  id?: string;
  /** Group legend, read as the group's accessible name. */
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** Sets `required` on every option (native validation). */
  required?: boolean;
  disabled?: boolean;
  /** Visual marker only (amber bar on the legend). Adds a screen-reader suffix to the label. */
  mandatory?: boolean;
  /** Screen-reader suffix for the label, read after it when `mandatory` is set. Default " (obligatorio)". */
  mandatoryLabel?: ReactNode;
  /** Shared `name` for every option. Generated when omitted. */
  name?: string;
  /** Applied to the wrapping field. */
  fieldClassName?: string;
  "aria-describedby"?: string;
  children: ReactNode;
};

export function RadioGroup({
  id,
  label,
  hint,
  error,
  required = false,
  disabled = false,
  mandatory = false,
  mandatoryLabel = " (obligatorio)",
  name,
  fieldClassName,
  "aria-describedby": userDescribedBy,
  children,
}: RadioGroupProps) {
  const generatedId = useId();
  const groupId = id ?? generatedId;
  const labelId = `${groupId}-label`;
  const groupName = name ?? `${groupId}-option`;

  return (
    <div className={cx("flex flex-col gap-2", fieldClassName)}>
      {label ? (
        <span
          id={labelId}
          className={cx(
            "text-sm font-medium text-ui-on-surface",
            mandatory ? "border-l-[3px] border-l-ui-warning pl-2" : false,
          )}
        >
          {label}
          {required ? (
            <span aria-hidden="true" className="ml-1 text-ui-danger">
              *
            </span>
          ) : null}
          {mandatory ? <span className="sr-only">{mandatoryLabel}</span> : null}
        </span>
      ) : null}
      <div
        role="radiogroup"
        aria-labelledby={label ? labelId : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={fieldDescribedBy(groupId, { hint, error }, userDescribedBy)}
        className="flex flex-col gap-3"
      >
        <RadioGroupContext.Provider value={{ name: groupName, required, disabled }}>
          {children}
        </RadioGroupContext.Provider>
      </div>
      {hint ? (
        <p id={hintId(groupId)} className="text-sm text-ui-on-surface-muted">
          {hint}
        </p>
      ) : null}
      {error ? <FieldError id={errorId(groupId)}>{error}</FieldError> : null}
    </div>
  );
}

export default Radio;
