import { useId, type ChangeEvent, type ComponentProps, type ReactNode } from "react";
import { cx } from "./cx.js";
import Field, {
  controlBorderClassName,
  controlErrorClassName,
  fieldDescribedBy,
} from "./Field.js";

export type FileInputProps = Omit<ComponentProps<"input">, "type" | "size" | "value"> & {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** Called with the chosen files (empty array when cleared). */
  onFilesChange?: (files: File[]) => void;
  /** Applied to the wrapping field, not to the <input>. */
  fieldClassName?: string;
};

/** Native file picker styled with tokens; keeps browser file-name text and keyboard behaviour. */
export function FileInput({
  label,
  hint,
  error,
  required,
  className,
  fieldClassName,
  id,
  onChange,
  onFilesChange,
  "aria-describedby": userDescribedBy,
  ...args
}: FileInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    onFilesChange?.(Array.from(e.target.files ?? []));
  };

  return (
    <Field id={inputId} label={label} hint={hint} error={error} required={required} className={fieldClassName}>
      <input
        id={inputId}
        type="file"
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={fieldDescribedBy(inputId, { hint, error }, userDescribedBy)}
        onChange={handleChange}
        className={cx(
          "w-full rounded-ui-control bg-ui-surface p-1.5 text-sm text-ui-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ui-focus disabled:cursor-not-allowed disabled:bg-ui-disabled disabled:text-ui-on-disabled",
          "file:mr-3 file:cursor-pointer file:rounded-ui-control file:border-0 file:bg-ui-surface-tonal file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ui-on-surface hover:file:bg-ui-surface-hover disabled:file:cursor-not-allowed",
          error ? controlErrorClassName : controlBorderClassName,
          className,
        )}
        {...args}
      />
    </Field>
  );
}

export default FileInput;
