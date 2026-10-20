import type { ComponentProps, ReactNode } from "react";
import { cx } from "./cx.js";

export type ColumnProps = ComponentProps<"div"> & {
  children: ReactNode;
  className?: string;
};

export function Column({ children, className, ...args }: ColumnProps) {
  return (
    <div className={cx("flex flex-col", className)} {...args}>
      {children}
    </div>
  );
}

export default Column;
