import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cx } from "./cx.js";

export type DropdownItemDef = {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  /** Secondary line under the label, e.g. a role or a status. */
  description?: string;
  /** Rendered at the trailing edge, e.g. a badge. */
  endIcon?: ReactNode;
  /** Highlights the item as the current selection. */
  active?: boolean;
  testId?: string;
};

export type DropdownFloatingProps = {
  items: DropdownItemDef[];
  /** Trigger content. */
  children: ReactNode;
  /** Applied to the floating panel. */
  className?: string;
  panelTestId?: string;
  /** Accessible name of the menu. */
  label?: string;
};

type Coords = { top: number; left: number };
type MousePos = { x: number; y: number };

const GAP = 4;

/**
 * Opens below the trigger unless there is not enough room under the cursor, then flips above;
 * clamps to the viewport on both axes.
 */
function calcSafeCoords(trigger: HTMLElement, panel: HTMLElement, mouse: MousePos | null): Coords {
  const t = trigger.getBoundingClientRect();
  const p = panel.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const spaceBelow = vh - (mouse ? mouse.y : t.bottom);
  let top = spaceBelow >= p.height + GAP ? t.bottom + GAP : t.top - p.height - GAP;

  let left = t.left;
  if (left + p.width > vw - GAP) left = vw - p.width - GAP;

  if (top + p.height > vh - GAP) top = vh - p.height - GAP;
  if (top < GAP) top = GAP;
  if (left < GAP) left = GAP;

  return { top, left };
}

function DropdownFloatingItem({
  label,
  icon,
  onClick,
  disabled,
  description,
  endIcon,
  active,
  testId,
  onDone,
}: DropdownItemDef & { onDone: () => void }) {
  return (
    <button
      type="button"
      role="menuitem"
      data-testid={testId}
      aria-current={active || undefined}
      disabled={disabled}
      onClick={() => {
        onClick?.();
        onDone();
      }}
      className={cx(
        "flex w-full cursor-pointer items-center gap-2 rounded-ui-control px-3 py-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ui-focus disabled:cursor-not-allowed disabled:opacity-40",
        active ? "bg-ui-primary-soft text-ui-primary-ink" : "text-ui-on-surface hover:bg-ui-surface-hover",
      )}
    >
      {icon ? <span className="flex size-4 shrink-0 items-center justify-center">{icon}</span> : null}
      <span className="min-w-0 flex-1">
        <span className="block truncate">{label}</span>
        {description ? (
          <span className="block truncate text-xs text-ui-on-surface-muted">{description}</span>
        ) : null}
      </span>
      {endIcon ? <span className="flex shrink-0 items-center justify-center">{endIcon}</span> : null}
    </button>
  );
}

/**
 * Floating action menu in a portal. Opens on hover (desktop), and on click/Enter/Space or
 * ArrowDown from the keyboard; Escape or outside click closes it.
 */
export function DropdownFloating({ items, children, className, panelTestId, label }: DropdownFloatingProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<Coords>({ top: 0, left: 0 });

  const menuId = useId();
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<MousePos | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !panelRef.current) return;
    setCoords(calcSafeCoords(triggerRef.current, panelRef.current, mouseRef.current));
  }, []);

  useLayoutEffect(() => {
    if (open) updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.querySelector<HTMLElement>("button, a, [tabindex]")?.focus();
    };
    const onDown = (e: globalThis.MouseEvent) => {
      const target = e.target as Node;
      if (!triggerRef.current?.contains(target) && !panelRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  const handleEnter = (e: MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
    cancelClose();
    setOpen(true);
  };

  return (
    <>
      <div
        ref={triggerRef}
        className="inline-block"
        onMouseEnter={handleEnter}
        onMouseLeave={scheduleClose}
        onClick={() => {
          mouseRef.current = null;
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            mouseRef.current = null;
            setOpen(true);
          }
        }}
      >
        {children}
      </div>

      {open
        ? createPortal(
            <div
              ref={panelRef}
              id={menuId}
              role="menu"
              aria-label={label}
              data-testid={panelTestId}
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
              style={{ top: coords.top, left: coords.left }}
              className={cx(
                "fixed z-50 min-w-40 rounded-ui-card border border-ui-outline bg-ui-surface p-1 text-ui-on-surface shadow-ui-card-hover",
                className,
              )}
            >
              {items.map((item, i) => (
                <DropdownFloatingItem key={i} {...item} onDone={() => setOpen(false)} />
              ))}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

export default DropdownFloating;
