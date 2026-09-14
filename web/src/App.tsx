import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppLayout, type Panel } from "@/app/layout";
import { StatusPanel } from "@/features/dashboard/StatusPanel";
import { MetricsPanel } from "@/features/dashboard/MetricsPanel";
import { MetricsStreamProvider } from "@/features/dashboard/MetricsStreamContext";
import { ConfigPanel } from "@/features/dashboard/ConfigPanel";
import { LogsPanel } from "@/features/logs/LogsPanel";
import { ClassifyPanel } from "@/features/classify/ClassifyPanel";
import { ChatPanel } from "@/features/chat/ChatPanel";
import { SttPanel } from "@/features/stt/SttPanel";
import { TtsPanel } from "@/features/tts/TtsPanel";
import { DetectPanel } from "@/features/detect/DetectPanel";
import { ApiReferencePanel } from "@/features/api-reference/ApiReferencePanel";

const queryClient = new QueryClient();

const panels: Panel[] = [
  { id: "tts", label: "TTS", icon: "ri-music-2-line", group: "Playground", content: <TtsPanel /> },
  { id: "classify", label: "Classify", icon: "ri-image-line", group: "Playground", content: <ClassifyPanel /> },
  { id: "stt", label: "STT", icon: "ri-mic-line", group: "Playground", content: <SttPanel /> },
  { id: "detect", label: "Detect", icon: "ri-focus-3-line", group: "Playground", content: <DetectPanel /> },
  { id: "chat", label: "Chat", icon: "ri-robot-2-line", group: "Playground", content: <ChatPanel /> },
  { id: "system-status", label: "Status", icon: "ri-dashboard-3-line", group: "System", content: <StatusPanel /> },
  { id: "system-metrics", label: "Metrics", icon: "ri-line-chart-line", group: "System", content: <MetricsPanel /> },
  { id: "logs", label: "Logs", icon: "ri-file-list-3-line", group: "System", content: <LogsPanel /> },
  { id: "system-config", label: "Config", icon: "ri-code-s-slash-line", group: "System", content: <ConfigPanel /> },
  {
    id: "api-reference",
    label: "API Reference",
    icon: "ri-link-m",
    group: "Reference",
    content: <ApiReferencePanel />,
  },
];

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MetricsStreamProvider>
        <AppLayout panels={panels} />
      </MetricsStreamProvider>
    </QueryClientProvider>
  );
}
