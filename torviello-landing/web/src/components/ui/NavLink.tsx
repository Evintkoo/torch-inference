// Copyright (c) 2026 Torviello.
import type { AnchorHTMLAttributes, ReactNode } from "react";

export interface NavLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  /** Marks the section the visitor is currently viewing (sheet A3). */
  current?: boolean;
}

/** Sheet A3: top navigation item; focus and current-section states are token-driven. */
export function NavLink({ children, current = false, ...rest }: NavLinkProps) {
  return (
    <a
      className="tv-navlink"
      aria-current={current ? "true" : undefined}
      {...rest}
    >
      {children}
    </a>
  );
}
