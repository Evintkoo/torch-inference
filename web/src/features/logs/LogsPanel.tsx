import { useState } from "react";
import { LogFileList } from "./LogFileList";
import { LogViewer } from "./LogViewer";

export function LogsPanel() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-medium">Log Viewer</h2>
        <p className="text-sm text-muted-foreground">
          Browse and inspect server log files via <code className="font-mono text-xs">GET /logs</code>.
        </p>
      </div>
      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-[240px_1fr]">
        <LogFileList
          selectedFile={selectedFile}
          onSelect={setSelectedFile}
          onCleared={(name) => {
            // Mirrors playground.html: clearing the file currently being viewed
            // resets the viewer back to its empty "select a file" state rather
            // than refetching (the file now only contains a "cleared at" marker
            // line, which isn't useful to show as a "log").
            if (name === selectedFile) {
              setSelectedFile(null);
            }
          }}
        />
        <LogViewer fileName={selectedFile} />
      </div>
    </div>
  );
}
