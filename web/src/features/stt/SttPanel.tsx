import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { apiGet } from "@/lib/api-client";
import { LiveSttStream } from "./LiveSttStream";
import { UploadTranscribeCard } from "./UploadTranscribeCard";
import type { AudioHealthResponse } from "./types";

type Mode = "upload" | "live";

/** Top-level "STT" panel. Upload and Live were two always-visible, largely
 * redundant cards (both end in "audio in, transcript out") — merged into one
 * section with a mode toggle so only one is on screen at a time. */
export function SttPanel() {
  const [mode, setMode] = useState<Mode>("upload");
  const { data, isError } = useQuery({
    queryKey: ["stt-health-badge"],
    queryFn: () => apiGet<AudioHealthResponse>("/stt/health"),
    refetchInterval: 15_000,
    retry: false,
  });
  const hasModel = (data?.models_available ?? []).some((m) => m.startsWith("STT:"));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-medium">STT</h2>
        <Badge data-testid="stt-health-badge" variant={isError ? "destructive" : hasModel ? "default" : "secondary"}>
          {isError ? "STT unavailable" : hasModel ? "STT online" : data ? "no model loaded" : "checking…"}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        Transcribe an uploaded file via <code className="text-xs">POST /audio/transcribe</code>, or transcribe live
        via <code className="text-xs">GET /audio/ws</code>.
      </p>

      <div className="inline-flex w-fit gap-1 border border-border bg-card p-1" data-testid="stt-mode-toggle">
        <button
          type="button"
          data-testid="stt-mode-upload-btn"
          onClick={() => setMode("upload")}
          className={cn(
            "px-3 py-1 text-sm font-medium transition-colors",
            mode === "upload" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          Upload
        </button>
        <button
          type="button"
          data-testid="stt-mode-live-btn"
          onClick={() => setMode("live")}
          className={cn(
            "px-3 py-1 text-sm font-medium transition-colors",
            mode === "live" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          Live
        </button>
      </div>

      {mode === "upload" ? <UploadTranscribeCard /> : <LiveSttStream />}
    </div>
  );
}
