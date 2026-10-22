import type { ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";
import { buttonClassName, type ButtonSize, type ButtonVariant } from "./Button.js";

export type ButtonLinkProps = Omit<LinkProps, "to" | "className"> & {
  /** Route path, or a full URL when `external` is set. Passed through unchanged. */
  to: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  /** Lets a long label wrap. Default keeps it on one line. */
  wrap?: boolean;
  className?: string;
  /** Renders a plain <a> instead of the router Link. */
  external?: boolean;
  target?: string;
};

/** The link itself is styled as a button (no <button> nested in <a>). */
export function ButtonLink({
  to,
  variant = "primary",
  size = "md",
  icon,
  wrap = false,
  className,
  external = false,
  target,
  children,
  ...args
}: ButtonLinkProps) {
  const classes = buttonClassName({ variant, size, wrap, className });
  const content = (
    <>
      {icon}
      {children}
    </>
  );

  if (external) {
    return (
      <a href={to} target={target} rel="noopener noreferrer" className={classes}>
        {content}
      </a>
    );
  }

  return (
    <Link to={to} target={target} className={classes} {...args}>
      {content}
    </Link>
  );
}

export default ButtonLink;
