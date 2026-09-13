import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppLayout, type Panel } from "@/app/layout";

const queryClient = new QueryClient();

const panels: Panel[] = [
  { id: "dashboard", label: "Dashboard", content: <div>Dashboard panel coming in Task 6</div> },
];

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout panels={panels} />
    </QueryClientProvider>
  );
}
