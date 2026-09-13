import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppLayout, type Panel } from "@/app/layout";
import { DashboardPanel } from "@/features/dashboard/DashboardPanel";
import { ApiReferencePanel } from "@/features/api-reference/ApiReferencePanel";

const queryClient = new QueryClient();

const panels: Panel[] = [
  { id: "dashboard", label: "Dashboard", content: <DashboardPanel /> },
  { id: "api-reference", label: "API Reference", content: <ApiReferencePanel /> },
];

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout panels={panels} />
    </QueryClientProvider>
  );
}
