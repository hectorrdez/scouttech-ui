import type { ComponentProps } from "react";
import { cx } from "./cx.js";

export type ButtonToogleProps = Omit<ComponentProps<"button">, "onChange" | "value"> & {
  value: boolean;
  onChange?: (value: boolean) => void;
  /** Locked on/off (e.g. mandatory cookies): no toggling, aria-disabled. */
  cantInteract?: boolean;
};

/** On/off switch. Keeps the apps' original API (value / onChange / cantInteract). */
export function ButtonToogle({
  value,
  onChange,
  cantInteract = false,
  className,
  onClick,
  ...args
}: ButtonToogleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-disabled={cantInteract || undefined}
      onClick={(event) => {
        onClick?.(event);
        if (!cantInteract) onChange?.(!value);
      }}
      className={cx(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ui-focus",
        cantInteract ? "cursor-not-allowed" : "cursor-pointer",
        value ? "bg-ui-primary" : "bg-ui-outline-strong",
        className,
      )}
      {...args}
    >
      <span
        aria-hidden="true"
        className={cx(
          "pointer-events-none inline-block h-5 w-5 rounded-full bg-ui-surface transition-transform",
          value ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
}

/** Alias with the correct spelling. */
export const ButtonToggle = ButtonToogle;

export default ButtonToogle;
