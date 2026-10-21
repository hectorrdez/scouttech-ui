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
  /** Uses NavLink and adds the active style on the current route. */
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
        className={cx("inline-flex items-center gap-1", focusClassName, className)}
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
          cx(
            focusClassName,
            "border-b-2",
            isActive ? "border-ui-primary font-semibold" : "border-transparent hover:border-ui-outline-strong",
            className,
          )
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
