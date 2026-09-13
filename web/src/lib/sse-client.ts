import { useEffect, useState } from "react";

export interface SseState<T> {
  data: T | null;
  connected: boolean;
  error: string | null;
}

export function useEventSource<T>(path: string, enabled = true): SseState<T> {
  const [state, setState] = useState<SseState<T>>({
    data: null,
    connected: false,
    error: null,
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const source = new EventSource(path);

    source.onopen = () => {
      setState((prev) => ({ ...prev, connected: true, error: null }));
    };

    source.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as T;
        setState({ data: parsed, connected: true, error: null });
      } catch {
        setState((prev) => ({ ...prev, error: "failed to parse SSE payload" }));
      }
    };

    source.onerror = () => {
      setState((prev) => ({ ...prev, connected: false }));
    };

    return () => {
      source.close();
    };
  }, [path, enabled]);

  return state;
}
