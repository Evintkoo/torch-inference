import { useState } from "react";
import { cn } from "@/lib/utils";
import { DetectFileUpload } from "./DetectFileUpload";
import { DetectLiveStream } from "./DetectLiveStream";

type Mode = "file" | "live";

/**
 * Object Detection panel — a File mode (`POST /yolo/detect`) and a Live
 * Stream mode (`GET /ws/detect`), switched with the same compact toggle used
 * by the Chat/TTS/STT panels rather than a full shadcn Tabs bar, so only one
 * input method is ever on screen.
 */
export function DetectPanel() {
  const [mode, setMode] = useState<Mode>("file");

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-medium">Object Detection</h2>
        <p className="text-sm text-muted-foreground">
          YOLO object detection via <code>POST /yolo/detect</code> or live stream via{" "}
          <code>GET /ws/detect</code>.
        </p>
      </div>

      <div className="inline-flex w-fit gap-1 border border-border bg-card p-1" data-testid="det-mode-toggle">
        <button
          type="button"
          data-testid="det-tab-file"
          onClick={() => setMode("file")}
          className={cn(
            "px-3 py-1 text-sm font-medium transition-colors",
            mode === "file" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          File
        </button>
        <button
          type="button"
          data-testid="det-tab-live"
          onClick={() => setMode("live")}
          className={cn(
            "px-3 py-1 text-sm font-medium transition-colors",
            mode === "live" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          Live Stream
        </button>
      </div>

      {mode === "file" ? (
        <div data-testid="det-pane-file">
          <DetectFileUpload />
        </div>
      ) : (
        <div data-testid="det-pane-live">
          <DetectLiveStream />
        </div>
      )}
    </div>
  );
}
