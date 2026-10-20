// Copyright (c) 2026 Torviello.
import type { KeyboardEvent, ReactNode } from "react";

export type ButtonState = "idle" | "loading" | "error" | "empty";

export interface ButtonProps {
  children: ReactNode;
  state?: ButtonState;
  onActivate?: () => void;
}

export function Button({ children, state = "idle", onActivate }: ButtonProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onActivate?.();
    }
  };

  return (
    <button
      type="button"
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
