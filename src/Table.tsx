import type { ComponentProps, ReactNode } from "react";
import { cx } from "./cx.js";

export type TableProps = ComponentProps<"table"> & {
  /** Card header above the table: title on the left. */
  title?: ReactNode;
  /** Card header, right side. */
  meta?: ReactNode;
  /** Applied to the surrounding card, not to the <table>. */
  containerClassName?: string;
};

/**
 * Data table on its own card. Horizontal scroll lives inside the card, so a wide table never
 * makes the page scroll sideways. Compose with `THead`, `TBody`, `TR`, `TH`, `TD`.
 */
export function Table({ title, meta, children, className, containerClassName, ...args }: TableProps) {
  return (
    <div
      className={cx(
        "overflow-hidden rounded-ui-card bg-ui-surface text-ui-on-surface shadow-ui-card",
        containerClassName,
      )}
    >
      {title || meta ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ui-outline p-4">
          {title ? <h3 className="text-lg font-semibold text-ui-on-surface">{title}</h3> : null}
          {meta ? <span className="text-sm text-ui-on-surface-muted">{meta}</span> : null}
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <table className={cx("w-full border-collapse text-left", className)} {...args}>
          {children}
        </table>
      </div>
    </div>
  );
}

export function THead({ className, ...args }: ComponentProps<"thead">) {
  return <thead className={cx("bg-ui-surface-tonal text-ui-on-surface-muted", className)} {...args} />;
}

export function TBody({ className, ...args }: ComponentProps<"tbody">) {
  return <tbody className={cx("divide-y divide-ui-outline text-sm text-ui-on-surface", className)} {...args} />;
}

export type TRProps = ComponentProps<"tr"> & {
  /** Highlights the row as the current selection. */
  selected?: boolean;
};

export function TR({ selected = false, className, ...args }: TRProps) {
  return (
    <tr
      aria-selected={selected || undefined}
      className={cx(
        "transition-colors hover:bg-ui-surface-hover",
        selected && "bg-ui-primary-soft",
        className,
      )}
      {...args}
    />
  );
}

export function TH({ className, ...args }: ComponentProps<"th">) {
  return (
    <th
      scope="col"
      className={cx("p-4 text-xs font-medium tracking-wider uppercase", className)}
      {...args}
    />
  );
}

export function TD({ className, ...args }: ComponentProps<"td">) {
  return <td className={cx("p-4", className)} {...args} />;
}

export default Table;
