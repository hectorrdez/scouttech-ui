import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { cx } from "./cx.js";

export type ShellLinkDef = {
  label: string;
  /** Route path, or a full URL when `external` is set. */
  to: string;
  external?: boolean;
};

const focusClassName =
  "rounded-ui-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ui-focus";

/** Rest, hover and underline animation for the header nav. The underline grows on hover and never shifts the layout. */
const navClassName = [
  "relative inline-block py-1 text-ui-on-surface-muted transition-colors duration-200 hover:text-ui-on-surface",
  "after:absolute after:-bottom-0.5 after:left-0 after:right-0 after:h-0.5 after:rounded-full",
  "after:origin-left after:scale-x-0 after:bg-ui-primary after:transition-transform after:duration-200",
  "hover:after:scale-x-100 motion-reduce:transition-none motion-reduce:after:transition-none",
].join(" ");

const navActiveClassName = "text-ui-primary-ink font-medium after:scale-x-100";

/** Internal-or-external link shared by PublicHeader, PublicFooter and LegalLayout. Not exported from the package. */
export function ShellLink({
  link,
  className,
  active = false,
  onNavigate,
  children,
}: {
  link: ShellLinkDef;
  className?: string;
  /** Header nav style (underline, hover, current route). Uses NavLink so the current route gets `aria-current`. */
  active?: boolean;
  onNavigate?: () => void;
  children?: ReactNode;
}) {
  const content = children ?? link.label;
  if (link.external) {
    return (
      <a
        href={link.to}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onNavigate}
        className={cx(
          "inline-flex items-center gap-1",
          focusClassName,
          active && navClassName,
          className,
        )}
      >
        {content}
        <ExternalLink size={12} aria-hidden />
        <span className="sr-only">(se abre en otra pestaña)</span>
      </a>
    );
  }
  if (active) {
    return (
      <NavLink
        to={link.to}
        onClick={onNavigate}
        className={({ isActive }) =>
          cx(focusClassName, navClassName, isActive && navActiveClassName, className)
        }
      >
        {content}
      </NavLink>
    );
  }
  return (
    <Link to={link.to} onClick={onNavigate} className={cx(focusClassName, className)}>
      {content}
    </Link>
  );
}
