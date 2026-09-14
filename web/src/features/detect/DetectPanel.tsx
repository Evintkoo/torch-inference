import { DetectFileUpload } from "./DetectFileUpload";

/**
 * Object Detection panel — a single view (`POST /yolo/detect`), upload a
 * file or capture one from the camera. The separate Live Stream WS tab was
 * dropped in favor of this single-view pattern (matches STT/TTS/Classify).
 */
export function DetectPanel() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-medium">Object Detection</h2>
        <p className="text-sm text-muted-foreground">
          YOLO object detection via <code>POST /yolo/detect</code>.
        </p>
      </div>

      <DetectFileUpload />
    </div>
  );
}
