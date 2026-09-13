import { useCallback, useEffect, useRef, useState } from "react";

export interface WebSocketStreamState<T> {
  data: T | null;
  connected: boolean;
  error: string | null;
  /** Number of reconnect attempts made since the last successful `open`, 0 while connected. */
  reconnectAttempt: number;
}

export interface UseWebSocketStreamOptions<T> {
  /** Set false to tear down (or avoid opening) the connection. Default true. */
  enabled?: boolean;
  /** Matches WebSocket.binaryType; default "arraybuffer" (most binary streams in this app are PCM frames). */
  binaryType?: BinaryType;
  /** Auto-reconnect with backoff after an unexpected close. Default true. */
  reconnect?: boolean;
  /** Base delay for exponential backoff (ms). Default 500. */
  baseDelayMs?: number;
  /** Backoff cap (ms). Default 10000. */
  maxDelayMs?: number;
  /** Give up reconnecting after this many consecutive attempts. Default Infinity. */
  maxReconnectAttempts?: number;
  /** Optional WebSocket sub-protocol(s). */
  protocols?: string | string[];
  /** Called for binary frames (ArrayBuffer or Blob depending on `binaryType`) instead of touching `data`. */
  onBinaryMessage?: (payload: ArrayBuffer | Blob) => void;
  /** Called after each successful open. */
  onOpen?: () => void;
  /** Called after each close (including ones this hook will reconnect from). */
  onClose?: (event: CloseEvent) => void;
  /** Override how a text frame is turned into `data`; defaults to JSON.parse. */
  parseMessage?: (raw: string) => T;
}

export interface UseWebSocketStreamResult<T> extends WebSocketStreamState<T> {
  /** Send a frame on the live socket; no-ops silently if not currently connected. */
  send: (data: Parameters<WebSocket["send"]>[0]) => void;
  /** Close the connection and cancel any pending reconnect (does not reopen while `enabled` stays true). */
  close: () => void;
}

const DEFAULT_BASE_DELAY_MS = 500;
const DEFAULT_MAX_DELAY_MS = 10_000;

function resolveWsUrl(path: string): string {
  if (/^wss?:\/\//i.test(path)) {
    return path;
  }
  const proto = location.protocol === "https:" ? "wss" : "ws";
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${proto}://${location.host}${suffix}`;
}

/**
 * Reusable WebSocket hook generalized from playground.html's ad hoc `new WebSocket(...)`
 * call sites (STT `/audio/ws`, detect `/ws/detect`, classify `/ws/classify`): connect on
 * mount, parse JSON text frames into `data`, hand binary frames to `onBinaryMessage`, and
 * reconnect with exponential backoff after an unexpected close.
 */
export function useWebSocketStream<T = unknown>(
  path: string,
  options: UseWebSocketStreamOptions<T> = {},
): UseWebSocketStreamResult<T> {
  const {
    enabled = true,
    binaryType = "arraybuffer",
    reconnect = true,
    baseDelayMs = DEFAULT_BASE_DELAY_MS,
    maxDelayMs = DEFAULT_MAX_DELAY_MS,
    maxReconnectAttempts = Infinity,
    protocols,
    onBinaryMessage,
    onOpen,
    onClose,
    parseMessage,
  } = options;

  const [state, setState] = useState<WebSocketStreamState<T>>({
    data: null,
    connected: false,
    error: null,
    reconnectAttempt: 0,
  });

  const socketRef = useRef<WebSocket | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptRef = useRef(0);
  const stoppedRef = useRef(false);

  // Latest callbacks in a ref so the connection effect doesn't need to reconnect just
  // because a caller passed a fresh inline function this render.
  const callbacksRef = useRef({ onBinaryMessage, onOpen, onClose, parseMessage });
  callbacksRef.current = { onBinaryMessage, onOpen, onClose, parseMessage };

  useEffect(() => {
    if (!enabled) {
      return;
    }

    stoppedRef.current = false;

    const connect = () => {
      const socket = new WebSocket(resolveWsUrl(path), protocols);
      socket.binaryType = binaryType;
      socketRef.current = socket;

      socket.onopen = () => {
        attemptRef.current = 0;
        setState((prev) => ({ ...prev, connected: true, error: null, reconnectAttempt: 0 }));
        callbacksRef.current.onOpen?.();
      };

      socket.onmessage = (event: MessageEvent) => {
        if (typeof event.data === "string") {
          try {
            const parsed = callbacksRef.current.parseMessage
              ? callbacksRef.current.parseMessage(event.data)
              : (JSON.parse(event.data) as T);
            setState((prev) => ({ ...prev, data: parsed, error: null }));
          } catch {
            setState((prev) => ({ ...prev, error: "failed to parse websocket payload" }));
          }
        } else {
          callbacksRef.current.onBinaryMessage?.(event.data as ArrayBuffer | Blob);
        }
      };

      socket.onerror = () => {
        setState((prev) => ({ ...prev, error: "connection error" }));
      };

      socket.onclose = (event) => {
        setState((prev) => ({ ...prev, connected: false }));
        callbacksRef.current.onClose?.(event);
        socketRef.current = null;

        if (stoppedRef.current || !reconnect) {
          return;
        }
        if (attemptRef.current >= maxReconnectAttempts) {
          setState((prev) => ({ ...prev, error: "max reconnect attempts reached" }));
          return;
        }

        const attempt = attemptRef.current + 1;
        attemptRef.current = attempt;
        const delay = Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs);
        setState((prev) => ({ ...prev, reconnectAttempt: attempt }));
        timeoutRef.current = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      stoppedRef.current = true;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      const socket = socketRef.current;
      socketRef.current = null;
      if (socket) {
        socket.onopen = null;
        socket.onmessage = null;
        socket.onerror = null;
        socket.onclose = null;
        socket.close();
      }
    };
    // path/enabled/reconnect + the backoff tuning knobs are the only things that should
    // tear down and reopen the socket; callbacks flow through callbacksRef instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, enabled, reconnect, baseDelayMs, maxDelayMs, maxReconnectAttempts, binaryType, protocols]);

  const send = useCallback((data: Parameters<WebSocket["send"]>[0]) => {
    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(data);
    }
  }, []);

  const close = useCallback(() => {
    stoppedRef.current = true;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    socketRef.current?.close();
  }, []);

  return { ...state, send, close };
}
