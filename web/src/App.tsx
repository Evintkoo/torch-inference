import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppLayout, type Panel } from "@/app/layout";
import { DashboardPanel } from "@/features/dashboard/DashboardPanel";
import { LogsPanel } from "@/features/logs/LogsPanel";

const queryClient = new QueryClient();

const panels: Panel[] = [
  { id: "dashboard", label: "Dashboard", content: <DashboardPanel /> },
  { id: "logs", label: "Logs", content: <LogsPanel /> },
];

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout panels={panels} />
    </QueryClientProvider>
  );
}
