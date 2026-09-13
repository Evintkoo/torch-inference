import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppLayout, type Panel } from "@/app/layout";
import { DashboardPanel } from "@/features/dashboard/DashboardPanel";
import { TtsPanel } from "@/features/tts/TtsPanel";

const queryClient = new QueryClient();

const panels: Panel[] = [
  { id: "dashboard", label: "Dashboard", content: <DashboardPanel /> },
  { id: "tts", label: "TTS", content: <TtsPanel /> },
];

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout panels={panels} />
    </QueryClientProvider>
  );
}
