// Copyright (c) 2026 Torviello.
import type { ReactNode } from "react";

export interface SectionLabelProps {
  children: ReactNode;
  /** Accent variant for eyebrows on the dark hero (sheet A4). */
  accent?: boolean;
  id?: string;
}

/** Sheet A4: small all-caps eyebrow above headings ("AI-NATIVE INFERENCE ENGINE"). */
export function SectionLabel({ children, accent = false, id }: SectionLabelProps) {
  return (
    <p id={id} className={accent ? "tv-section-label tv-section-label--accent" : "tv-section-label"}>
      {children}
    </p>
  );
}
