import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { apiGet } from "@/lib/api-client";
import { LiveSttStream } from "./LiveSttStream";
import { UploadTranscribeCard } from "./UploadTranscribeCard";
import type { AudioHealthResponse } from "./types";

/** Top-level "STT" panel — parity with playground.html's `#panel-audio` section. */
export function SttPanel() {
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
        Upload audio and transcribe via <code className="text-xs">POST /audio/transcribe</code> · live stream via{" "}
        <code className="text-xs">GET /audio/ws</code>.
      </p>
      <UploadTranscribeCard />
      <LiveSttStream />
    </div>
  );
}
