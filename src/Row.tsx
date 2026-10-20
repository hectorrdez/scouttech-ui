import type { ComponentProps, ReactNode } from "react";
import { cx } from "./cx.js";

export type RowProps = ComponentProps<"div"> & {
  children: ReactNode;
  className?: string;
};

export function Row({ children, className, ...args }: RowProps) {
  return (
    <div className={cx("flex flex-row", className)} {...args}>
      {children}
    </div>
  );
}

export default Row;
