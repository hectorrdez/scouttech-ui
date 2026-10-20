import { useId, type ComponentProps, type ReactNode } from "react";
import { cx } from "./cx.js";
import Field, {
  controlBorderClassName,
  controlClassName,
  controlErrorClassName,
  controlMandatoryClassName,
  fieldDescribedBy,
} from "./Field.js";

/** Input classes without the fixed 44px height, for a multi-line control. */
const textareaClassName = `${controlClassName.replace("h-11 ", "")} min-h-24 py-2 resize-y`;

export type TextareaProps = ComponentProps<"textarea"> & {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** Applied to the wrapping field, not to the <textarea>. */
  fieldClassName?: string;
  /** Visual marker only (amber bar on the control). Does not set `required` or `aria-required`. */
  mandatory?: boolean;
  /** Screen-reader suffix for the label, read after it when `mandatory` is set. Default " (obligatorio)". */
  mandatoryLabel?: ReactNode;
};

export function Textarea({
  label,
  hint,
  error,
  required,
  mandatory,
  mandatoryLabel,
  className,
  fieldClassName,
  id,
  "aria-describedby": userDescribedBy,
  ...args
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  return (
    <Field
      id={textareaId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      mandatory={mandatory}
      mandatoryLabel={mandatoryLabel}
      className={fieldClassName}
    >
      <textarea
        id={textareaId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={fieldDescribedBy(textareaId, { hint, error }, userDescribedBy)}
        className={cx(
          textareaClassName,
          error ? controlErrorClassName : controlBorderClassName,
          mandatory ? controlMandatoryClassName : false,
          className,
        )}
        {...args}
      />
    </Field>
  );
}

export default Textarea;
