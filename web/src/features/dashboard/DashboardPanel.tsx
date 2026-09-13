import { MetricsChart } from "./MetricsChart";
import { StatusStatGrid } from "./StatusStatGrid";
import { SystemInfoCard } from "./SystemInfoCard";

export function DashboardPanel() {
  return (
    <div className="space-y-5">
      <StatusStatGrid />
      <SystemInfoCard />
      <MetricsChart />
    </div>
  );
}
