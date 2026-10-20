import type { ReactNode } from "react";
import { Card, type CardProps } from "./Card.js";
import { cx } from "./cx.js";

export type StatCardProps = Omit<CardProps, "children"> & {
  label: ReactNode;
  value: ReactNode;
  /** Short qualifier under the figure: freshness, source, scope. */
  description?: ReactNode;
  /** Small pill in the top-right, e.g. "+4,2 % mes". */
  delta?: ReactNode;
  /** Decorative icon in the top-right (rendered aria-hidden). */
  icon?: ReactNode;
  /** Footer row: content on the left (e.g. a link), meta on the right. */
  footer?: ReactNode;
  footerMeta?: ReactNode;
  /** data-testid on the card; the figure gets `${testId}-value`. */
  testId?: string;
};

/** KPI tile: label, figure, optional delta, icon, description and footer. Built on Card. */
export function StatCard({
  label,
  value,
  description,
  delta,
  icon,
  footer,
  footerMeta,
  testId,
  className,
  ...args
}: StatCardProps) {
  return (
    <Card data-testid={testId} className={cx("flex flex-col", className)} {...args}>
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-medium text-ui-on-surface-muted">{label}</span>
        {(delta || icon) && (
          <div className="flex shrink-0 items-center gap-2">
            {delta && (
              <span className="rounded-ui-control border border-ui-primary px-2 py-0.5 text-xs font-medium text-ui-primary-ink">
                {delta}
              </span>
            )}
            {icon && (
              <span aria-hidden="true" className="text-ui-on-surface-muted">
                {icon}
              </span>
            )}
          </div>
        )}
      </div>
      <div
        data-testid={testId ? `${testId}-value` : undefined}
        className="mt-2 text-3xl font-semibold tabular-nums text-ui-on-surface"
      >
        {value}
      </div>
      {description && <p className="mt-1 text-sm text-ui-on-surface-muted">{description}</p>}
      {(footer || footerMeta) && (
        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between gap-3 border-t border-ui-outline pt-4 text-sm">
            <span className="font-medium text-ui-primary-ink">{footer}</span>
            <span className="text-xs text-ui-on-surface-muted">{footerMeta}</span>
          </div>
        </div>
      )}
    </Card>
  );
}

export default StatCard;
