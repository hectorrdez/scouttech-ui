import type { ComponentProps } from "react";
import { cx } from "./cx.js";

export type BadgeTone = "neutral" | "primary" | "success" | "warning" | "danger" | "info" | "custom";

export type BadgeProps = ComponentProps<"span"> & {
  /**
   * Semantic colour from the theme tokens. `custom` adds no colour: pass your own token classes
   * (e.g. an app's section or state colours) through `className`. Never hex.
   */
  tone?: BadgeTone;
};

// Full class names so Tailwind can detect them statically.
const toneClassNames: Record<BadgeTone, string> = {
  neutral: "bg-ui-surface-tonal text-ui-on-surface border border-ui-outline",
  primary: "bg-ui-primary-soft text-ui-primary-ink border border-transparent",
  success: "bg-ui-surface-tonal text-ui-success border border-ui-success",
  warning: "bg-ui-surface-tonal text-ui-warning border border-ui-warning",
  danger: "bg-ui-danger-soft text-ui-danger border border-ui-danger",
  info: "bg-ui-surface-tonal text-ui-info border border-ui-info",
  custom: "",
};

/** Badge classes, for app elements that must look like a Badge. */
export function badgeClassName(tone: BadgeTone = "neutral"): string {
  return cx(
    "inline-flex items-center rounded-ui-control px-2 py-0.5 text-xs font-medium",
    toneClassNames[tone],
  );
}

/** Small status/label pill. */
export function Badge({ tone = "neutral", className, ...args }: BadgeProps) {
  return <span data-tone={tone} className={cx(badgeClassName(tone), className)} {...args} />;
}

export default Badge;
