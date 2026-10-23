// Copyright (c) 2026 Torviello.
import type { KeyboardEvent, ReactNode } from "react";

export type ButtonState = "idle" | "loading" | "error" | "empty";
export type ButtonVariant = "primary" | "ghost";

export interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  state?: ButtonState;
  onActivate?: () => void;
}

/** Sheet A1/A2: one primary action per view; ghost is the secondary pairing. */
export function Button({
  children,
  variant = "primary",
  state = "idle",
  onActivate,
}: ButtonProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onActivate?.();
    }
  };

  return (
    <button
      type="button"
      className={`tv-button tv-button--${variant}`}
      aria-busy={state === "loading"}
      aria-disabled={state === "loading"}
      data-state={state}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={onActivate}
    >
      {children}
    </button>
  );
}
