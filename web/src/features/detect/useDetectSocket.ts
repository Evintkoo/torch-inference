import { useCallback, useEffect, useRef, useState } from "react";
import type { DetectConfig, DetectStats, LiveDetection, ServerMessage } from "./types";

/**
 * Safety net for a lost reply: if the server never answers a sent frame, the gate would stay
 * shut forever without this. Matches playground.html's `detFrameWatchdog` timeout.
 */
const FRAME_WATCHDOG_MS = 4000;

export interface UseDetectSocketResult {
  connected: boolean;
  detections: LiveDetection[];
  stats: DetectStats;
  connect: () => void;
  disconnect: () => void;
  /** Synchronous connection check (reads the live WebSocket, not React state) — safe to call from timers/closures. */
  isConnected: () => boolean;
  sendConfig: (cfg: DetectConfig) => void;
  /** True only when connected AND no frame is currently in flight. Check this before doing any capture work. */
  canSendFrame: () => boolean;
  /** Marks a frame as in-flight and arms the loss watchdog. Call immediately before encoding a frame. */
  beginFrameSend: () => void;
  /** Finalizes a frame started with beginFrameSend: sends it if still connected, else clears the gate. */
  sendFrame: (blob: Blob | null) => void;
}

/**
 * Wraps `GET /ws/detect` (see src/api/ws_infer.rs): binary JPEG frames in, JSON detection
 * replies out.
 *
 * The backpressure gate (canSendFrame / beginFrameSend / sendFrame) is the fix from
 * fix/detect-live-stream-backpressure — at most one frame may be in flight at a time. Without it
 * a fixed-rate capture timer against a slow backend queues unacknowledged frames without bound
 * (reproduced: 261 frames in flight after 20s against a 150ms/frame mock backend). The watchdog
 * ensures a lost reply can never wedge the gate shut permanently.
 */
export function useDetectSocket(): UseDetectSocketResult {
  const wsRef = useRef<WebSocket | null>(null);
  const inFlightRef = useRef(false);
  const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fpsTrackerRef = useRef({ count: 0, last: 0 });

  const [connected, setConnected] = useState(false);
  const [detections, setDetections] = useState<LiveDetection[]>([]);
  const [stats, setStats] = useState<DetectStats>({ frame: 0, ms: null, count: 0, fps: 0 });

  const clearFrameGate = useCallback(() => {
    inFlightRef.current = false;
    if (watchdogRef.current !== null) {
      clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }
  }, []);

  const disconnect = useCallback(() => {
    clearFrameGate();
    const ws = wsRef.current;
    wsRef.current = null;
    if (ws && ws.readyState < WebSocket.CLOSING) {
      ws.close();
    }
    setConnected(false);
  }, [clearFrameGate]);

  const connect = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${proto}://${window.location.host}/ws/detect`);
    ws.binaryType = "arraybuffer";

    ws.onopen = () => {
      setConnected(true);
      clearFrameGate();
    };
    ws.onclose = () => {
      setConnected(false);
      clearFrameGate();
    };
    ws.onerror = () => {
      setConnected(false);
      clearFrameGate();
    };
    ws.onmessage = (ev: MessageEvent) => {
      if (typeof ev.data !== "string") return;
      let msg: ServerMessage;
      try {
        msg = JSON.parse(ev.data);
      } catch {
        return;
      }
      if (msg.type === "detect") {
        clearFrameGate();
        setDetections(msg.detections ?? []);
        const tracker = fpsTrackerRef.current;
        tracker.count++;
        const now = performance.now();
        setStats((prev) => {
          let fps = prev.fps;
          if (now - tracker.last >= 1000) {
            fps = tracker.count;
            tracker.count = 0;
            tracker.last = now;
          }
          return { frame: msg.frame, ms: msg.ms, count: msg.count, fps };
        });
      } else if (msg.type === "error") {
        clearFrameGate();
        setStats((prev) => ({ ...prev, ms: "err" }));
      }
    };

    wsRef.current = ws;
  }, [clearFrameGate]);

  const isConnected = useCallback(() => wsRef.current?.readyState === WebSocket.OPEN, []);

  const sendConfig = useCallback((cfg: DetectConfig) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: "config", ...cfg }));
  }, []);

  const canSendFrame = useCallback(() => {
    const ws = wsRef.current;
    return !!ws && ws.readyState === WebSocket.OPEN && !inFlightRef.current;
  }, []);

  const beginFrameSend = useCallback(() => {
    inFlightRef.current = true;
    watchdogRef.current = setTimeout(() => {
      watchdogRef.current = null;
      inFlightRef.current = false;
    }, FRAME_WATCHDOG_MS);
  }, []);

  const sendFrame = useCallback(
    (blob: Blob | null) => {
      const ws = wsRef.current;
      if (!blob || !ws || ws.readyState !== WebSocket.OPEN) {
        clearFrameGate();
        return;
      }
      blob
        .arrayBuffer()
        .then((buf) => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(buf);
          } else {
            clearFrameGate();
          }
        })
        .catch(() => clearFrameGate());
    },
    [clearFrameGate],
  );

  // Close the socket on unmount only — deliberately not depending on `disconnect`'s identity so
  // this doesn't tear down/reconnect on every render.
  useEffect(() => {
    return () => disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    connected,
    detections,
    stats,
    connect,
    disconnect,
    isConnected,
    sendConfig,
    canSendFrame,
    beginFrameSend,
    sendFrame,
  };
}
