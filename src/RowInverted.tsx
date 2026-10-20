import type { ComponentProps, ReactNode } from "react";
import { cx } from "./cx.js";

export type RowInvertedProps = ComponentProps<"div"> & {
  children: ReactNode;
  className?: string;
};

export function RowInverted({ children, className, ...args }: RowInvertedProps) {
  return (
    <div className={cx("flex flex-row-reverse", className)} {...args}>
      {children}
    </div>
  );
}

export default RowInverted;
