import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DetectFileUpload } from "./DetectFileUpload";
import { DetectLiveStream } from "./DetectLiveStream";

/**
 * Object Detection panel — parity with playground.html's `#panel-detect`: a File sub-tab
 * (`POST /yolo/detect`) and a Live Stream sub-tab (`GET /ws/detect`).
 */
export function DetectPanel() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-medium">Object Detection</h2>
        <p className="text-sm text-muted-foreground">
          YOLO object detection via <code>POST /yolo/detect</code> or live stream via{" "}
          <code>GET /ws/detect</code>.
        </p>
      </div>
      <Tabs defaultValue="file">
        <TabsList>
          <TabsTrigger value="file" id="det-tab-file" data-testid="det-tab-file">
            File
          </TabsTrigger>
          <TabsTrigger value="live" id="det-tab-live" data-testid="det-tab-live">
            Live Stream
          </TabsTrigger>
        </TabsList>
        <TabsContent value="file" data-testid="det-pane-file">
          <DetectFileUpload />
        </TabsContent>
        <TabsContent value="live" data-testid="det-pane-live">
          <DetectLiveStream />
        </TabsContent>
      </Tabs>
    </div>
  );
}
