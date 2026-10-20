import type { ComponentProps } from "react";
import { cx } from "./cx.js";

export type SkeletonProps = ComponentProps<"div">;

/** Loading placeholder. Size it with `className` (default `h-4 w-full`). Pulses only without reduced motion. */
export function Skeleton({ className, ...args }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      data-testid="skeleton"
      className={cx("rounded-ui-control bg-ui-outline motion-safe:animate-pulse", className ?? "h-4 w-full")}
      {...args}
    />
  );
}

export default Skeleton;
