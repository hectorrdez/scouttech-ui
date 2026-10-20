import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "./cx.js";

export type TabDef = { id: string; label: ReactNode; badge?: ReactNode };

export type TabsProps = {
  tabs: TabDef[];
  /** Id of the selected tab. */
  active: string;
  onChange: (id: string) => void;
  /** Accessible name of the tablist. */
  label: string;
  /** Prefix for tab/panel ids; set it when several Tabs share a page. Default none (`tab-<id>`). */
  idPrefix?: string;
  className?: string;
};

export function tabId(id: string, idPrefix?: string): string {
  return `${idPrefix ? `${idPrefix}-` : ""}tab-${id}`;
}
export function panelId(id: string, idPrefix?: string): string {
  return `${idPrefix ? `${idPrefix}-` : ""}panel-${id}`;
}

/**
 * Accessible tab strip with roving tabindex: ArrowLeft/Right move and select (wrapping), Home/End jump.
 * The caller renders the matching panel, e.g. with `TabPanel`.
 */
export function Tabs({ tabs, active, onChange, label, idPrefix, className }: TabsProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = tabs.findIndex((t) => t.id === active);
    let next = -1;
    if (event.key === "ArrowRight") next = (current + 1) % tabs.length;
    else if (event.key === "ArrowLeft") next = (current - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    if (next < 0) return;
    event.preventDefault();
    onChange(tabs[next]!.id);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cx(
        "flex gap-1 overflow-x-auto rounded-ui-card border border-ui-outline bg-ui-surface-tonal p-1",
        className,
      )}
    >
      {tabs.map((t, index) => {
        const selected = t.id === active;
        return (
          <button
            key={t.id}
            ref={(node) => {
              refs.current[index] = node;
            }}
            role="tab"
            type="button"
            id={tabId(t.id, idPrefix)}
            aria-selected={selected}
            aria-controls={panelId(t.id, idPrefix)}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(t.id)}
            className={cx(
              "flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-ui-control px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ui-focus",
              selected
                ? "bg-ui-surface text-ui-on-surface shadow-ui-control"
                : "text-ui-on-surface-muted hover:text-ui-on-surface",
            )}
          >
            {t.label}
            {t.badge}
          </button>
        );
      })}
    </div>
  );
}

export type TabPanelProps = {
  /** Id of the tab this panel belongs to. */
  id: string;
  idPrefix?: string;
  className?: string;
  children: ReactNode;
};

/** Panel for the selected tab. Render it only for the active tab. */
export function TabPanel({ id, idPrefix, className, children }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      id={panelId(id, idPrefix)}
      aria-labelledby={tabId(id, idPrefix)}
      tabIndex={0}
      className={cx("focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ui-focus", className)}
    >
      {children}
    </div>
  );
}

export default Tabs;
