import { LiveTtsStream } from "./LiveTtsStream";
import { RestSynthesis } from "./RestSynthesis";

export function TtsPanel() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-medium">TTS</h2>
        <p className="text-sm text-muted-foreground">
          Low-latency streaming synthesis via <code>GET /audio/ws</code>.
        </p>
      </div>
      <LiveTtsStream />
      <RestSynthesis />
    </div>
  );
}
