import { HealthBadge } from "./HealthBadge";
import { SystemInfoCard } from "./SystemInfoCard";

export function DashboardPanel() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-medium">Status</h2>
        <HealthBadge />
      </div>
      <SystemInfoCard />
    </div>
  );
}
