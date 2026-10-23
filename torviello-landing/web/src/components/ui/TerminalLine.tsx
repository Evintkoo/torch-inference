// Copyright (c) 2026 Torviello.
import type { ReactNode } from "react";

export interface TerminalLineProps {
  children: ReactNode;
  /** "prompt" renders a $ marker; "status" renders a teal bullet marker (sheet A6). */
  kind?: "prompt" | "status";
}

/** Sheet A6: one line of the terminal transcript; real selectable text, not an image. */
export function TerminalLine({ children, kind = "prompt" }: TerminalLineProps) {
  return (
    <div className={`tv-terminal-line tv-terminal-line--${kind}`}>
      <span className="tv-terminal-line__marker" aria-hidden="true">
        {kind === "prompt" ? "$" : "•"}
      </span>
      <span className="tv-terminal-line__text">{children}</span>
    </div>
  );
}
