import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { apiGet } from "@/lib/api-client";
import { LiveTtsStream } from "./LiveTtsStream";
import type { TtsHealth } from "./types";

/** Mirrors STT's health badge (`SttPanel`) — same `apiGet` + `Badge` pattern
 * against this engine's own `GET /tts/health`. */
export function TtsPanel() {
  const { data, isError } = useQuery({
    queryKey: ["tts-health-badge"],
    queryFn: () => apiGet<TtsHealth>("/tts/health"),
    refetchInterval: 15_000,
    retry: false,
  });
  const engineCount = data?.engines_loaded ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-medium">TTS</h2>
        <Badge data-testid="tts-health-badge" variant={isError ? "destructive" : engineCount > 0 ? "default" : "secondary"}>
          {isError ? "TTS unavailable" : engineCount > 0 ? "TTS online" : data ? "no engine loaded" : "checking…"}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        Low-latency streaming synthesis via <code>GET /audio/ws</code>.
      </p>
      <LiveTtsStream />
    </div>
  );
}
