import { Loader2 } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cx } from "./cx.js";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "danger-soft";
export type ButtonSize = "sm" | "md";

export type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner, sets aria-busy and blocks clicks. */
  loading?: boolean;
  /** Rendered before the label. */
  icon?: ReactNode;
};

export const buttonFocusClassName =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ui-focus";

const baseClassName =
  "inline-flex items-center justify-center rounded-ui-control font-medium transition-colors";

const variantClassNames: Record<ButtonVariant, string> = {
  primary:
    "bg-ui-primary text-ui-on-primary hover:bg-ui-primary-hover active:bg-ui-primary-active shadow-ui-control",
  secondary: "bg-ui-surface-hover text-ui-on-surface hover:bg-ui-surface-active",
  outline:
    "bg-ui-surface text-ui-on-surface border border-ui-outline-strong hover:bg-ui-surface-hover active:bg-ui-surface-active",
  ghost:
    "bg-transparent text-ui-on-surface hover:bg-ui-surface-hover active:bg-ui-surface-active",
  danger: "bg-ui-danger text-ui-on-danger hover:bg-ui-danger-hover shadow-ui-control",
  "danger-soft":
    "bg-ui-danger-soft text-ui-danger border border-ui-danger hover:bg-ui-danger-hover hover:text-ui-on-danger active:bg-ui-danger-hover active:text-ui-on-danger",
};

const sizeClassNames: Record<ButtonSize, string> = {
  sm: "min-h-8 px-3 gap-1.5 text-sm",
  md: "min-h-11 px-4 gap-2 text-base",
};

/** Classes for any element styled as a button (also used by ButtonLink). */
export function buttonClassName({
  variant = "primary",
  size = "md",
  blocked = false,
  loading = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Disabled or loading: drops the variant colours. */
  blocked?: boolean;
  loading?: boolean;
  className?: string;
}): string {
  return cx(
    baseClassName,
    sizeClassNames[size],
    blocked ? "bg-ui-disabled text-ui-on-disabled" : variantClassNames[variant],
    blocked ? (loading ? "cursor-wait" : "cursor-not-allowed") : "cursor-pointer",
    buttonFocusClassName,
    className,
  );
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  disabled,
  children,
  className,
  type = "button",
  ...args
}: ButtonProps) {
  const blocked = Boolean(disabled) || loading;

  return (
    <button
      type={type}
      className={buttonClassName({ variant, size, blocked, loading, className })}
      disabled={blocked}
      aria-busy={loading || undefined}
      {...args}
    >
      {loading ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : icon}
      {children}
    </button>
  );
}

export default Button;
