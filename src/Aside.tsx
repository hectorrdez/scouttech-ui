import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cx } from "./cx.js";

export type AsideItem = {
  label: string;
  /** Route path, matched with react-router NavLink. */
  to: string;
  /** Decorative icon element (e.g. a lucide-react icon). Shown alone in the collapsed rail. */
  icon?: ReactNode;
  /** Match the route exactly (NavLink `end`). */
  end?: boolean;
  /** Trailing count or status, e.g. a `Badge`. Hidden in the rail. */
  badge?: ReactNode;
  /** Renders a non-link span with `aria-disabled`. */
  disabled?: boolean;
  /** Shown as `title` on a disabled item (and on the rail item). */
  disabledReason?: string;
};

export type AsideSection = {
  /** Visible heading. Hidden in the rail; the group keeps it as its accessible name. */
  title?: string;
  items: AsideItem[];
};

export type AsideProps = {
  /** Brand or group switcher, shown when expanded. */
  header?: ReactNode;
  /** Flat list of items. Rendered before `sections`. */
  items?: AsideItem[];
  /** Grouped items with optional titles. */
  sections?: AsideSection[];
  /** Product widget at the bottom, shown when expanded. */
  footer?: ReactNode;
  /** Links pinned to the bottom of the navigation (e.g. settings, help). Icons stay visible in the rail. */
  footerItems?: AsideItem[];
  /** Accessible name of the navigation landmark. Default "Navegación principal". */
  "aria-label"?: string;
  /** Controlled collapsed (icon rail) state. Pair with `onToggle`. */
  collapsed?: boolean;
  /** Initial collapsed state when uncontrolled. Default false. */
  defaultCollapsed?: boolean;
  /** Called with the next collapsed value when the toggle is pressed. */
  onToggle?: (collapsed: boolean) => void;
  /** Toggle label while expanded (collapses). Default "Contraer". */
  collapseLabel?: string;
  /** Toggle label while collapsed (expands). Default "Expandir". */
  expandLabel?: string;
  /**
   * Controlled mobile drawer state. When set, below `md` the Aside is an off-canvas drawer with a
   * backdrop. Closes via `onCloseMobile` on backdrop click, Escape and navigation.
   */
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  /** Top offset for sticky/fixed placement (CSS length, e.g. "64px"). Also sets the height. */
  topOffset?: string;
  /** Applied to the aside. Use it to override placement, e.g. `!static !h-full` inside a demo box. */
  className?: string;
};

const linkBase =
  "relative flex min-h-[44px] items-center gap-3 rounded-ui-control px-3 text-sm font-medium text-ui-on-surface-muted transition-colors hover:bg-ui-surface-hover hover:text-ui-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ui-focus";
const linkActive = "bg-ui-primary-soft font-semibold text-ui-primary-ink hover:bg-ui-primary-soft hover:text-ui-primary-ink";
const linkDisabled = "cursor-not-allowed text-ui-disabled hover:bg-transparent hover:text-ui-disabled";
const toggleClassName =
  "size-9 shrink-0 items-center justify-center rounded-ui-control text-ui-on-surface-muted transition-colors hover:bg-ui-surface-hover hover:text-ui-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ui-focus";

function AsideItemView({ item, rail }: { item: AsideItem; rail: boolean }) {
  const { label, to, icon, end, badge, disabled, disabledReason } = item;
  const body = (
    <>
      {icon && (
        <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center [&>svg]:size-5">
          {icon}
        </span>
      )}
      {rail && !icon && <span className="truncate text-xs">{label}</span>}
      {!rail && <span className="min-w-0 flex-1 truncate">{label}</span>}
      {!rail && badge}
    </>
  );

  if (disabled) {
    return (
      <span
        aria-disabled="true"
        tabIndex={0}
        aria-label={rail ? label : undefined}
        title={rail ? (disabledReason ?? label) : disabledReason}
        className={cx(linkBase, linkDisabled, rail && "justify-center px-0")}
      >
        {body}
      </span>
    );
  }

  return (
    <NavLink
      to={to}
      end={end}
      aria-label={rail ? label : undefined}
      title={rail ? label : undefined}
      className={({ isActive }) =>
        cx(linkBase, isActive && linkActive, rail && "justify-center px-0")
      }
    >
      {body}
    </NavLink>
  );
}

function ItemList({ items, rail }: { items: AsideItem[]; rail: boolean }) {
  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => (
        <li key={`${item.to}-${item.label}`}>
          <AsideItemView item={item} rail={rail} />
        </li>
      ))}
    </ul>
  );
}

/**
 * Sidebar navigation. Expanded (w-64) or collapsed to an icon rail (w-16) with a toggle. Below
 * `md` it becomes an off-canvas drawer when `mobileOpen` is controlled. Styled only with `ui-*`
 * tokens. Items are react-router NavLinks, so the active route gets `aria-current="page"`.
 * Must render inside a router.
 */
export function Aside({
  header,
  items,
  sections,
  footer,
  footerItems,
  "aria-label": ariaLabel = "Navegación principal",
  collapsed,
  defaultCollapsed = false,
  onToggle,
  collapseLabel = "Contraer",
  expandLabel = "Expandir",
  mobileOpen,
  onCloseMobile,
  topOffset,
  className,
}: AsideProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const isCollapsed = collapsed ?? internalCollapsed;
  const drawer = mobileOpen !== undefined;
  const drawerOpen = drawer && mobileOpen === true;
  const rail = isCollapsed && !drawerOpen;

  const location = useLocation();
  const onCloseRef = useRef(onCloseMobile);
  onCloseRef.current = onCloseMobile;
  const lastKey = useRef(location.key);

  useEffect(() => {
    if (lastKey.current === location.key) return;
    lastKey.current = location.key;
    if (drawerOpen) onCloseRef.current?.();
  }, [location.key, drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const toggle = () => {
    const next = !isCollapsed;
    if (collapsed === undefined) setInternalCollapsed(next);
    onToggle?.(next);
  };

  const toggleLabel = isCollapsed ? expandLabel : collapseLabel;
  const style: CSSProperties | undefined = topOffset
    ? { top: topOffset, height: `calc(100dvh - ${topOffset})` }
    : undefined;

  return (
    <>
      {drawerOpen && (
        <button
          type="button"
          tabIndex={-1}
          aria-label="Cerrar menú"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 cursor-default bg-ui-overlay md:hidden"
        />
      )}
      <aside
        style={style}
        className={cx(
          "flex h-screen w-64 max-w-[85vw] flex-col gap-4 overflow-hidden border-r border-ui-outline bg-ui-surface p-2 text-ui-on-surface",
          rail ? "md:w-16" : "md:w-64",
          drawer
            ? cx(
                "fixed inset-y-0 left-0 z-50 transition-transform duration-200 motion-reduce:transition-none md:sticky md:top-0 md:z-auto",
                mobileOpen ? "translate-x-0" : "-translate-x-full invisible md:visible md:translate-x-0",
              )
            : "sticky top-0",
          className,
        )}
      >
        <div className={cx("flex items-center gap-2", rail && "justify-center")}>
          {!rail && <div className="min-w-0 flex-1">{header}</div>}
          <button
            type="button"
            onClick={toggle}
            aria-expanded={!isCollapsed}
            aria-label={toggleLabel}
            title={toggleLabel}
            className={cx(toggleClassName, drawer ? "hidden md:inline-flex" : "inline-flex")}
          >
            {isCollapsed ? (
              <PanelLeftOpen size={18} aria-hidden />
            ) : (
              <PanelLeftClose size={18} aria-hidden />
            )}
          </button>
        </div>

        <nav
          aria-label={ariaLabel}
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden"
        >
          {items && items.length > 0 && <ItemList items={items} rail={rail} />}
          {sections?.map((section, index) => (
            <div
              key={section.title ?? `section-${index}`}
              role="group"
              aria-label={section.title}
              className={cx(
                "flex flex-col gap-1",
                rail && index > 0 && "border-t border-ui-outline pt-2",
              )}
            >
              {section.title && !rail && (
                <p className="px-3 text-xs font-semibold uppercase tracking-wide text-ui-on-surface-muted">
                  {section.title}
                </p>
              )}
              <ItemList items={section.items} rail={rail} />
            </div>
          ))}
          {footerItems && footerItems.length > 0 && (
            <div className="mt-auto">
              <ItemList items={footerItems} rail={rail} />
            </div>
          )}
        </nav>

        {!rail && footer && <div className="border-t border-ui-outline pt-2">{footer}</div>}
      </aside>
    </>
  );
}

export default Aside;
