import type { ComponentProps, ReactNode } from "react";
import { cx } from "./cx.js";

export type ColumnInvertedProps = ComponentProps<"div"> & {
  children: ReactNode;
  className?: string;
};

export function ColumnInverted({ children, className, ...args }: ColumnInvertedProps) {
  return (
    <div className={cx("flex flex-col-reverse", className)} {...args}>
      {children}
    </div>
  );
}

export default ColumnInverted;
