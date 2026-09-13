import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppLayout, type Panel } from "@/app/layout";
import { DashboardPanel } from "@/features/dashboard/DashboardPanel";
import { ChatPanel } from "@/features/chat/ChatPanel";

const queryClient = new QueryClient();

const panels: Panel[] = [
  { id: "dashboard", label: "Dashboard", content: <DashboardPanel /> },
  { id: "chat", label: "Chat", content: <ChatPanel /> },
];

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout panels={panels} />
    </QueryClientProvider>
  );
}
