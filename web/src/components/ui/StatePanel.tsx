// Copyright (c) 2026 Torviello.
export type PanelState = "loading" | "error" | "empty" | "ready";

export interface StatePanelProps {
  state: PanelState;
  message?: string;
}

export function StatePanel({ state, message }: StatePanelProps) {
  const label = state === "loading" ? "Loading" : state === "error" ? "Error" : "No results";

  return (
    <section role="status" aria-live="polite" aria-label="Inference state">
      <p>{state === "ready" ? "Ready" : label}</p>
      {message ? <p>{message}</p> : null}
      <button type="button" tabIndex={0} onKeyDown={() => undefined} aria-label="Retry loading">
        Retry
      </button>
    </section>
  );
}
