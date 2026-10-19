import type { ComponentProps } from "react";
import { cx } from "./cx.js";

export type CardVariant = "elevated" | "tonal" | "outlined";

export type CardProps = ComponentProps<"div"> & {
  variant?: CardVariant;
  /** Subtle hover lift (shadow) and pointer cursor, for clickable cards. */
  interactive?: boolean;
};

const variantClassNames: Record<CardVariant, string> = {
  elevated: "bg-ui-surface text-ui-on-surface shadow-ui-card",
  tonal: "bg-ui-surface-tonal text-ui-on-surface",
  outlined: "bg-ui-surface text-ui-on-surface border border-ui-outline",
};

/** Card container classes, for app elements (e.g. a link) that must look like a Card. */
export function cardClassName({
  variant = "elevated",
  interactive = false,
}: { variant?: CardVariant; interactive?: boolean } = {}): string {
  return cx(
    "rounded-ui-card p-ui-card",
    variantClassNames[variant],
    interactive && "cursor-pointer transition-shadow hover:shadow-ui-card-hover",
  );
}

/** Modular container. Forwards ref, className, style and data-* (apps add their own entrance animation). */
export function Card({ variant = "elevated", interactive = false, className, ...args }: CardProps) {
  return (
    <div
      data-variant={variant}
      className={cx(cardClassName({ variant, interactive }), className)}
      {...args}
    />
  );
}

export default Card;
