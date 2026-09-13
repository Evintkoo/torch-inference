import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppLayout, type Panel } from "@/app/layout";
import { DashboardPanel } from "@/features/dashboard/DashboardPanel";
import { LogsPanel } from "@/features/logs/LogsPanel";
import { ClassifyPanel } from "@/features/classify/ClassifyPanel";
import { ChatPanel } from "@/features/chat/ChatPanel";
import { SttPanel } from "@/features/stt/SttPanel";
import { TtsPanel } from "@/features/tts/TtsPanel";
import { DetectPanel } from "@/features/detect/DetectPanel";
import { ApiReferencePanel } from "@/features/api-reference/ApiReferencePanel";

const queryClient = new QueryClient();

const panels: Panel[] = [
  { id: "dashboard", label: "Dashboard", content: <DashboardPanel /> },
  { id: "logs", label: "Logs", content: <LogsPanel /> },
  { id: "classify", label: "Classify", content: <ClassifyPanel /> },
  { id: "chat", label: "Chat", content: <ChatPanel /> },
  { id: "stt", label: "STT", content: <SttPanel /> },
  { id: "tts", label: "TTS", content: <TtsPanel /> },
  { id: "detect", label: "Detect", content: <DetectPanel /> },
  { id: "api-reference", label: "API Reference", content: <ApiReferencePanel /> },
];

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout panels={panels} />
    </QueryClientProvider>
  );
}
